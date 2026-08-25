import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { buildAlgorithmsDataStructuresCourse, type QuizBlock } from "@brainbuilder/courseware";

async function goToMain(page: Page, testInfo: TestInfo, label: "Browse" | "Feed" | "Play" | "Library" | "You") {
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: `${label} tab` }).click();
    return;
  }
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const main = document.querySelector("main");
    return {
      html: document.documentElement.scrollWidth > window.innerWidth + 1,
      main: Boolean(main && main.scrollWidth > main.clientWidth + 1)
    };
  });
  expect(overflow).toEqual({ html: false, main: false });
}

function durationToMs(value: string) {
  const first = value.split(",")[0]?.trim() ?? "0s";
  if (first.endsWith("ms")) return Number.parseFloat(first);
  if (first.endsWith("s")) return Number.parseFloat(first) * 1000;
  return Number.parseFloat(first);
}

test("feed training flow awards XP and carries the result into progress", async ({ page }, testInfo) => {
  await page.goto("/feed");

  await expect(page.getByRole("heading", { name: /learning feed/i })).toBeVisible();
  await expect(page.getByText(/which is faster on sorted data/i)).toBeVisible();

  await page.getByRole("button", { name: /^Binary search$/ }).click();
  await expect(page.getByText(/nice.*10 xp/i)).toBeVisible();

  await goToMain(page, testInfo, "You");
  await expect(page.getByRole("heading", { name: /your learning momentum/i })).toBeVisible();
  await expect(page.getByText("1,250").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("binary search lesson training flow covers diagram, trace, quiz, and lab feedback", async ({ page }) => {
  await page.goto("/courses/algorithms-data-structures/lessons/binary-search-invariants");

  await expect(page.getByRole("heading", { name: /plain-english model/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /worked example/i })).toBeVisible();

  const searchDiagram = page.locator("[data-animated-diagram='binary-search']");
  await expect(searchDiagram).toHaveAttribute("data-step", "0");
  await expect(page.getByText("Step 1 of 4", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /play full search walkthrough/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /next search step/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /previous search step/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /reset search/i })).toBeVisible();

  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(searchDiagram).toHaveAttribute("data-playing", "true");
  await expect(searchDiagram).toHaveAttribute("data-step", "1");
  await expect(page.getByText(/compare mid value 16/i)).toBeVisible();
  await page.getByRole("button", { name: /previous search step/i }).click();
  await expect(searchDiagram).toHaveAttribute("data-step", "0");
  await page.getByRole("button", { name: /play full search walkthrough/i }).click();
  await expect(searchDiagram).toHaveAttribute("data-step", "3", { timeout: 5000 });
  await expect(page.getByText(/only 20 remains/i)).toBeVisible();

  const traceStage = page.locator("[data-animated-stage='binary-search-trace']");
  await expect(traceStage).toHaveAttribute("data-stage-step", "0");
  await expect(page.getByRole("button", { name: /play trace walkthrough/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /next trace step/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /previous trace step/i })).toBeVisible();
  await page.getByRole("button", { name: /next trace step/i }).click();
  await expect(traceStage).toHaveAttribute("data-stage-step", "1");
  await expect(page.getByText(/trace state 2/i)).toBeVisible();

  const wrongAnswer = page.getByRole("button", { name: /scan the structure from the left every time/i });
  await wrongAnswer.click();
  await expect(wrongAnswer).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/not yet.*invariant/i)).toBeVisible();

  const correctAnswer = page.getByRole("button", { name: /keep the target inside the remaining sorted window/i });
  await correctAnswer.click();
  await expect(correctAnswer).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/right.*remaining sorted window/i)).toBeVisible();

  const labStage = page.locator("[data-animated-stage='binary-search-lab']");
  await expect(labStage).toHaveAttribute("data-stage-step", "0");
  await expect(page.getByRole("button", { name: /play stage walkthrough/i })).toBeVisible();
  await page.getByRole("button", { name: /next stage/i }).click();
  await expect(labStage).toHaveAttribute("data-stage-step", "1");
  await expect(page.getByText(/compare the middle or boundary value/i)).toBeVisible();
  await page.getByRole("button", { name: /reset stage/i }).last().click();
  await expect(labStage).toHaveAttribute("data-stage-step", "0");

  await expectNoHorizontalOverflow(page);
});

test("every course quiz check accepts correct answers and shows incorrect feedback first", async ({ page }) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessons = course.units.flatMap((unit) => unit.lessons);
  const lessonsWithQuizzes = lessons
    .map((lesson) => ({
      lesson,
      quizzes: lesson.blocks.filter((block): block is QuizBlock => block.kind === "quiz")
    }))
    .filter((entry) => entry.quizzes.length > 0);

  for (const { lesson, quizzes } of lessonsWithQuizzes) {
    await page.goto(`/courses/${course.id}/lessons/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();

    for (const quiz of quizzes) {
      const wrongOption = quiz.options.find((option) => option.id !== quiz.correctOptionId);
      const correctOption = quiz.options.find((option) => option.id === quiz.correctOptionId);
      expect(wrongOption, `${quiz.id} should have an incorrect option`).toBeTruthy();
      expect(correctOption, `${quiz.id} should have a correct option`).toBeTruthy();

      const wrongButton = page.getByRole("button", { name: wrongOption!.label }).first();
      await wrongButton.click();
      await expect(wrongButton).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText(quiz.incorrectFeedback).first()).toBeVisible();

      const correctButton = page.getByRole("button", { name: correctOption!.label }).first();
      await correctButton.click();
      await expect(correctButton).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByText(quiz.feedback).first()).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  }
});

test("all animation families preserve teaching state under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.goto("/courses/algorithms-data-structures/lessons/binary-search-invariants");
  const diagram = page.locator("[data-animated-diagram='binary-search']");
  const reducedDuration = await diagram.evaluate((element) => getComputedStyle(element).animationDuration);
  expect(durationToMs(reducedDuration)).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(diagram).toHaveAttribute("data-step", "1");
  await expect(page.getByText(/compare mid value 16/i)).toBeVisible();

  const traceStage = page.locator("[data-animated-stage='binary-search-trace']");
  await page.getByRole("button", { name: /next trace step/i }).click();
  await expect(traceStage).toHaveAttribute("data-stage-step", "1");

  await page.goto("/courses/algorithms-data-structures/lessons/dp-table-fill");
  await page.getByRole("button", { name: /play fill wave/i }).click();
  await expect(page.locator("[data-animated-diagram='dp-grid']")).toHaveAttribute("data-wave", "1");
  await expect(page.locator("svg[aria-label='DP grid fill'] rect[data-filled='true']")).toHaveCount(5);
  await expect(page.getByText(/dependencies satisfied for 5 cells/i)).toBeVisible();

  await page.goto("/courses/algorithms-data-structures/lessons/tree-rotations");
  await expect(page.getByRole("img", { name: /three tree rotation scene/i })).toBeVisible();
  const canvasDataUrlLength = await page.locator("canvas[data-renderer='three']").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL("image/png").length);
  expect(canvasDataUrlLength).toBeGreaterThan(1000);
  await page.getByRole("button", { name: /rotate left/i }).click();
  await expect(page.locator("[data-animated-diagram='tree-rotation']")).toHaveAttribute("data-rotation", "1");
  await expect(page.getByText(/inorder preserved/i)).toBeVisible();

  await page.goto("/courses/algorithms-data-structures/lessons/hash-table-load");
  const animeStage = page.locator("[data-animated-stage='hash-collision-motion']");
  await animeStage.locator("xpath=ancestor::article[1]").getByRole("button", { name: /^next stage$/i }).click();
  await expect(animeStage).toHaveAttribute("data-stage-step", "1");
  await expect(page.getByText(/collision pressure is now visible/i)).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test("mobile course lesson shows learning content before course map and keeps animations in viewport", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile layout gate only applies to mobile project");

  await page.goto("/courses/algorithms-data-structures/lessons/binary-search-invariants");
  await expect(page.getByRole("heading", { level: 1, name: /binary search invariants/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /d3 binary search window/i })).toBeVisible();

  const layout = await page.evaluate(() => {
    const teaching = document.querySelector("section[aria-label='Lesson teaching notes']")?.getBoundingClientRect();
    const courseMap = Array.from(document.querySelectorAll("h2")).find((heading) => heading.textContent?.includes("Course map"))?.getBoundingClientRect();
    const firstAnimation = document.querySelector("[data-animated-stage], [data-animated-diagram]")?.getBoundingClientRect();
    const main = document.querySelector("main");
    return {
      teachingBeforeMap: Boolean(teaching && courseMap && teaching.top < courseMap.top),
      teachingStartsInViewport: Boolean(teaching && teaching.top < window.innerHeight),
      animationBeforeMap: Boolean(firstAnimation && courseMap && firstAnimation.top < courseMap.top),
      animationFitsViewportWidth: Boolean(firstAnimation && firstAnimation.left >= 0 && firstAnimation.right <= window.innerWidth + 1),
      mainOverflow: Boolean(main && main.scrollWidth > main.clientWidth + 1),
      htmlOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  expect(layout).toEqual({
    teachingBeforeMap: true,
    teachingStartsInViewport: true,
    animationBeforeMap: true,
    animationFitsViewportWidth: true,
    mainOverflow: false,
    htmlOverflow: false
  });

  await page.locator("[data-animated-diagram='binary-search']").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-animated-diagram='binary-search']")).toBeVisible();
  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(page.locator("[data-animated-diagram='binary-search']")).toHaveAttribute("data-step", "1");
});
