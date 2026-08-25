import { expect, test, type Page } from "@playwright/test";
import { buildAlgorithmsDataStructuresCourse } from "@brainbuilder/courseware";

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
  const mainHasHorizontalOverflow = await page.evaluate(() => {
    const main = document.querySelector("main");
    return Boolean(main && main.scrollWidth > main.clientWidth + 1);
  });
  expect(mainHasHorizontalOverflow).toBe(false);
}

test("course framework renders responsively with complete lesson coverage", async ({ page }) => {
  await page.goto("/courses/algorithms-data-structures");

  await expect(page.getByRole("heading", { level: 1, name: /algorithms & data structures/i })).toBeVisible();
  await expect(page.getByText(/8 units/i)).toBeVisible();
  await expect(page.getByText(/24 micro lessons/i)).toBeVisible();
  await expect(page.getByText(/d3/i)).toBeVisible();
  await expect(page.getByText(/three/i)).toBeVisible();
  await expect(page.getByText(/skia/i)).toBeVisible();
  await expect(page.getByText(/anime/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /binary search invariants/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /tree rotations/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /dp grid fill/i })).toBeVisible();

  const firstViewportHasCourseWork = await page.evaluate(() => {
    const main = document.querySelector("main")?.getBoundingClientRect();
    const firstLessonLink = Array.from(document.querySelectorAll("a")).find((link) => link.textContent?.includes("Big-O as Shape"))?.getBoundingClientRect();
    return Boolean(main && firstLessonLink && main.top < window.innerHeight && firstLessonLink.top < window.innerHeight);
  });
  expect(firstViewportHasCourseWork).toBe(true);
  await expectNoHorizontalOverflow(page);
});

test("course renderer surfaces stay live, interactive, and nonblank", async ({ page }) => {
  await page.goto("/courses/algorithms-data-structures/lessons/binary-search-invariants");

  const d3Diagram = page.getByRole("img", { name: /d3 binary search window/i });
  await expect(d3Diagram).toBeVisible();
  await expect(page.locator("svg[aria-label='D3 binary search window'] circle")).toHaveCount(7);
  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(page.locator("svg[aria-label='D3 binary search window'] circle[data-active='true']")).toHaveCount(4);
  await page.getByRole("button", { name: /keep the target inside/i }).click();
  await expect(page.getByText(/right.*remaining sorted window/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/courses/algorithms-data-structures/lessons/tree-rotations");
  const threeCanvas = page.getByRole("img", { name: /three tree rotation scene/i });
  await expect(threeCanvas).toBeVisible();
  const canvasDataUrlLength = await page.locator("canvas[data-renderer='three']").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL("image/png").length);
  expect(canvasDataUrlLength).toBeGreaterThan(1000);
  await page.getByRole("button", { name: /rotate left/i }).click();
  await expect(page.getByText(/inorder preserved/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/courses/algorithms-data-structures/lessons/dp-table-fill");
  await expect(page.getByRole("img", { name: /dp grid fill/i })).toBeVisible();
  await expect(page.locator("svg[aria-label='DP grid fill'] rect")).toHaveCount(20);
  await page.getByRole("button", { name: /fill next cell/i }).click();
  await page.getByRole("button", { name: /fill next cell/i }).click();
  await expect(page.locator("svg[aria-label='DP grid fill'] rect[data-filled='true']")).toHaveCount(2);
  await expect(page.getByText(/dependencies satisfied for 2 cell/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("algorithm lessons teach with animated, worked diagrams instead of static placeholders", async ({ page }) => {
  await page.goto("/courses/algorithms-data-structures/lessons/binary-search-invariants");

  await expect(page.getByRole("heading", { name: /plain-english model/i })).toBeVisible();
  await expect(page.getByText(/binary search only works because the answer is never allowed to leave the active window/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /worked example/i })).toBeVisible();
  await expect(page.getByText(/we compare against 16, discard the left half, then keep 20 inside the remaining window/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /mistake to avoid/i })).toBeVisible();

  const animatedDiagram = page.locator("[data-animated-diagram='binary-search']");
  await expect(animatedDiagram).toBeVisible();
  await expect(animatedDiagram).toHaveAttribute("data-step", "0");
  const initialAnimationName = await animatedDiagram.evaluate((element) => getComputedStyle(element).animationName);
  expect(initialAnimationName).not.toBe("none");

  await expect(page.getByText("Step 1 of 4", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(animatedDiagram).toHaveAttribute("data-playing", "true");
  await expect(animatedDiagram).toHaveAttribute("data-step", "1");
  await expect(page.getByText(/compare mid value 16/i)).toBeVisible();

  await page.goto("/courses/algorithms-data-structures/lessons/tree-rotations");
  await expect(page.getByRole("heading", { name: /what rotation preserves/i })).toBeVisible();
  await page.getByRole("button", { name: /rotate left/i }).click();
  await expect(page.locator("[data-animated-diagram='tree-rotation']")).toHaveAttribute("data-rotation", "1");
  await expect(page.getByText(/rotation applied.*sorted order still reads 1, 2, 3, 4, 5/i)).toBeVisible();
  await page.getByRole("button", { name: /reset rotation/i }).click();
  await expect(page.locator("[data-animated-diagram='tree-rotation']")).toHaveAttribute("data-rotation", "0");

  await page.goto("/courses/algorithms-data-structures/lessons/dp-table-fill");
  await expect(page.getByRole("heading", { name: /dependency rule/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /back one cell/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /reset grid/i })).toBeVisible();
  await page.getByRole("button", { name: /play fill wave/i }).click();
  await expect(page.locator("[data-animated-diagram='dp-grid']")).toHaveAttribute("data-wave", "1");
  await expect(page.getByText(/a cell is ready only when the cells it depends on are already solved/i)).toBeVisible();
  await page.getByRole("button", { name: /back one cell/i }).click();
  await expect(page.getByText(/dependencies satisfied for 4 cells/i)).toBeVisible();
  await page.getByRole("button", { name: /reset grid/i }).click();
  await expect(page.locator("[data-animated-diagram='dp-grid'] rect[data-filled='true']")).toHaveCount(0);
});

test("every algorithms lesson exposes a live animated learning stage", async ({ page }) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessons = course.units.flatMap((unit) => unit.lessons);

  for (const lesson of lessons) {
    await page.goto(`/courses/algorithms-data-structures/lessons/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
    await expect(page.locator("[data-animated-stage], [data-animated-diagram]").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("generic animated stages expose semantic state and feedback", async ({ page }) => {
  await page.goto("/courses/algorithms-data-structures/lessons/hash-table-load");

  const hashStage = page.locator("[data-animated-stage='hash-collision-motion']");
  await expect(hashStage).toBeVisible();
  await expect(hashStage).toHaveAttribute("data-stage-step", "0");

  await hashStage.locator("xpath=ancestor::article[1]").getByRole("button", { name: /^next stage$/i }).click();

  await expect(hashStage).toHaveAttribute("data-stage-step", "1");
  await expect(page.getByText(/collision pressure is now visible/i)).toBeVisible();
  await expect(page.getByText(/hash-collision-timeline/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
