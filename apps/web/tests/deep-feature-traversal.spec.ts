import { expect, test, type Page } from "@playwright/test";
import { buildAlgorithmsDataStructuresCourse } from "@brainbuilder/courseware";

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
}

test("all course lesson route links open real lesson content and an interactive stage", async ({ page }) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessons = course.units.flatMap((unit) => unit.lessons);

  await page.goto(`/courses/${course.id}`);

  for (const lesson of lessons) {
    await page.getByRole("link", { name: lesson.title }).first().click();
    await expect(page).toHaveURL(new RegExp(`/courses/${course.id}/lessons/${lesson.id}$`));
    await expect(page.getByRole("heading", { level: 1, name: lesson.title })).toBeVisible();
    await expect(page.locator("[data-animated-stage], [data-animated-diagram]").first()).toBeVisible();
    await expect(page.getByText(/what to notice|plain-english model|what rotation preserves|dependency rule/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("feed queue changes content, quiz, audio, and saved state from real data", async ({ page }) => {
  await page.goto("/feed");

  await page.getByRole("link", { name: /binary trees in one commute stop/i }).click();
  await expect(page).toHaveURL(/\/feed\?bite=trees-bite$/);
  await expect(page.getByRole("heading", { name: /binary trees in one commute stop/i })).toBeVisible();
  await expect(page.getByText(/what controls the longest tree search path/i)).toBeVisible();

  await page.getByRole("button", { name: "Save bite" }).click();
  await expect(page.getByText(/saved for later/i)).toBeVisible();
  await page.getByRole("button", { name: "Play audio lesson" }).click();
  await expect(page.getByText(/audio playing/i)).toBeVisible();
  await page.getByRole("button", { name: /^Tree height$/ }).click();
  await expect(page.getByText(/nice.*8 xp/i)).toBeVisible();

  await page.getByRole("link", { name: /next bite/i }).click();
  await expect(page).toHaveURL(/\/feed\?bite=binary-search-bite$/);
  await expect(page.getByText(/which is faster on sorted data/i)).toBeVisible();
});

test("every generic animated stage can advance, go back, and reset", async ({ page }) => {
  const course = buildAlgorithmsDataStructuresCourse();
  const lessons = course.units.flatMap((unit) => unit.lessons);

  for (const lesson of lessons) {
    await page.goto(`/courses/${course.id}/lessons/${lesson.id}`);
    const stages = await page.locator("[data-animated-stage]").evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.getAttribute("data-animated-stage"),
        step: element.getAttribute("data-stage-step")
      }))
    );

    for (const stage of stages) {
      if (!stage.id) {
        continue;
      }
      const stageLocator = page.locator(`[data-animated-stage='${stage.id}']`).first();
      const article = stageLocator.locator("xpath=ancestor::article[1]");
      const firstStep = stage.step ?? "0";

      const advance = article.getByRole("button", { name: /next stage|next trace step/i }).first();
      await advance.click();
      await expect(stageLocator).not.toHaveAttribute("data-stage-step", firstStep);

      const reset = article.getByRole("button", { name: /reset (stage|trace)/i }).first();
      await reset.click();
      await expect(stageLocator).toHaveAttribute("data-stage-step", "0");
    }
  }
});
