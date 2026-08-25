import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { buildAlgorithmsDataStructuresCourse, type CourseBlock } from "@brainbuilder/courseware";

const coreRoutes = ["/", "/signin", "/browse", "/feed", "/play", "/library", "/progress", "/courses/algorithms-data-structures"] as const;

function routeLabel(path: string, testInfo: TestInfo) {
  return `${testInfo.project.name} ${path}`;
}

async function expectNoConsoleOrPageErrors(page: Page, action: () => Promise<unknown>, label: string) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const onConsole = (message: { type: () => string; text: () => string }) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  };
  const onPageError = (error: Error) => pageErrors.push(error.message);

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  await action();
  await page.waitForLoadState("networkidle");
  page.off("console", onConsole);
  page.off("pageerror", onPageError);

  expect({ consoleErrors, pageErrors }, label).toEqual({ consoleErrors: [], pageErrors: [] });
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const main = document.querySelector("main");
    return {
      html: document.documentElement.scrollWidth > window.innerWidth + 1,
      body: document.body.scrollWidth > window.innerWidth + 1,
      main: Boolean(main && main.scrollWidth > main.clientWidth + 1)
    };
  });

  expect(overflow, label).toEqual({ html: false, body: false, main: false });
}

async function expectInteractiveElementsNamed(page: Page, label: string) {
  const unnamed = await page.evaluate(() => {
    function isVisible(element: Element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    function accessibleName(element: Element) {
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      if (ariaLabel) return ariaLabel;

      const labelledBy = element.getAttribute("aria-labelledby");
      if (labelledBy) {
        const labelText = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent?.trim())
          .filter(Boolean)
          .join(" ");
        if (labelText) return labelText;
      }

      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        const label = element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent?.trim() : "";
        const placeholder = element instanceof HTMLSelectElement ? "" : element.placeholder;
        return label || placeholder || element.value;
      }

      const text = element.textContent?.replace(/\s+/g, " ").trim();
      if (text) return text;

      return element.getAttribute("title")?.trim() || element.querySelector("img")?.getAttribute("alt")?.trim() || "";
    }

    return Array.from(document.querySelectorAll("button, a, input, textarea, select, [role='button'], [role='link']"))
      .filter(isVisible)
      .filter((element) => !accessibleName(element))
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role"),
        html: element.outerHTML.slice(0, 160)
      }));
  });

  expect(unnamed, label).toEqual([]);
}

async function expectMobileTouchTargets(page: Page, label: string) {
  const tooSmall = await page.evaluate(() => {
    function isVisible(element: Element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    return Array.from(document.querySelectorAll("button, a, input, textarea, select, [role='button'], [role='link']"))
      .filter(isVisible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const text = element.getAttribute("aria-label") || element.textContent?.replace(/\s+/g, " ").trim() || element.tagName.toLowerCase();
        return {
          text: text.slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      })
      .filter((item) => item.width < 40 || item.height < 40);
  });

  expect(tooSmall, label).toEqual([]);
}

async function expectRouteQuality(page: Page, path: string, testInfo: TestInfo) {
  const label = routeLabel(path, testInfo);
  await expectNoConsoleOrPageErrors(page, () => page.goto(path), label);
  await expect(page.locator("main h1").first(), `${label} has a visible page heading`).toBeVisible();
  await expect(page.locator("main"), `${label} has meaningful rendered content`).toContainText(/[A-Za-z0-9].{120,}/);
  await expect(page.getByText(/lesson not found|course lesson unavailable|not implemented|coming soon/i), label).toHaveCount(0);
  await expectNoHorizontalOverflow(page, label);
  await expectInteractiveElementsNamed(page, label);

  if (testInfo.project.name.includes("mobile")) {
    await expectMobileTouchTargets(page, label);
  }
}

function blockTeachesMaterial(block: CourseBlock) {
  if (block.kind === "text") return block.body.join(" ").trim().length > 60;
  if (block.kind === "audio") return block.script.trim().length > 20 && block.durationSeconds > 0;
  if (block.kind === "diagram") return block.prompt.trim().length > 20 && Boolean(block.renderer.fallback.trim());
  if (block.kind === "simulation") return block.controls.length > 0 && block.successCriteria.trim().length > 20;
  if (block.kind === "code-trace") return block.code.trim().length > 10 && block.tracePoints.length >= 3;
  if (block.kind === "quiz") return block.options.length >= 3 && block.feedback.trim().length > 20 && block.incorrectFeedback.trim().length > 20;
  if (block.kind === "lab") return block.task.trim().length > 20 && block.successCriteria.trim().length > 20 && block.xp > 0;
  if (block.kind === "reflection") return block.prompt.trim().length > 20;
  return block.brief.trim().length > 20 && block.deliverables.length >= 3 && block.xp > 0;
}

function visibleBlockAnchor(block: CourseBlock) {
  if (block.kind === "quiz") return block.question;
  if (block.kind === "reflection") return block.prompt;
  if (block.kind === "project") return block.title;
  return block.title;
}

test("learning platform routes are navigable, responsive, accessible, and error-free", async ({ page }, testInfo) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessonRoutes = course.units.flatMap((unit) => unit.lessons.map((lesson) => `/courses/${course.id}/lessons/${lesson.id}`));

  for (const path of [...coreRoutes, ...lessonRoutes]) {
    await expectRouteQuality(page, path, testInfo);

    if (path.includes("/lessons/")) {
      await expect(page.locator("[data-animated-stage], [data-animated-diagram]").first(), routeLabel(path, testInfo)).toBeVisible();
      await expect(page.locator("section[aria-label='Lesson teaching notes']").first(), routeLabel(path, testInfo)).toBeVisible();
    }
  }
});

test("algorithms course inventory contains real multimodal learning material for every lesson", async ({ page }) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessons = course.units.flatMap((unit) => unit.lessons);

  expect(course.units, "course has enough scaffold for a full learning path").toHaveLength(8);
  expect(lessons, "course exposes 24 micro lessons").toHaveLength(24);

  for (const lesson of lessons) {
    const blockKinds = new Set(lesson.blocks.map((block) => block.kind));
    const modalities = new Set(lesson.blocks.map((block) => block.modality));

    expect(lesson.summary.length, `${lesson.title} has explanatory summary`).toBeGreaterThan(40);
    expect(lesson.outcomes.length, `${lesson.title} has objectives`).toBeGreaterThanOrEqual(2);
    expect(lesson.blocks.every(blockTeachesMaterial), `${lesson.title} blocks contain substantive content`).toBe(true);
    expect(blockKinds.has("text"), `${lesson.title} has text material`).toBe(true);
    expect([...blockKinds].some((kind) => ["diagram", "simulation", "code-trace", "lab", "project"].includes(kind)), `${lesson.title} has a visual or interactive block`).toBe(true);
    expect([...blockKinds].some((kind) => ["quiz", "lab", "project"].includes(kind)), `${lesson.title} has reinforcement`).toBe(true);
    expect(modalities.size, `${lesson.title} uses multiple modalities`).toBeGreaterThanOrEqual(3);

    await page.goto(`/courses/${course.id}/lessons/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
    await expect(page.getByText(lesson.summary).first()).toBeVisible();
    for (const block of lesson.blocks) {
      const visibleAnchor = visibleBlockAnchor(block);
      await expect(page.getByText(visibleAnchor).first(), `${lesson.title} renders ${visibleAnchor}`).toBeVisible();
    }
  }
});
