import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function goToMain(page: Page, testInfo: TestInfo, label: "Browse" | "Feed" | "Play" | "Library" | "You") {
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: `${label} tab` }).click();
    return;
  }
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
}

test("learner can navigate the SPA, drill into topics, study, and practice", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /good morning, alex/i })).toBeVisible();
  await expect(page.getByText(/today's learning rail/i)).toBeVisible();
  await expect(page.getByText(/sort it: bubble sort/i)).toBeVisible();

  if (testInfo.project.name.includes("desktop")) {
    await expect(page.getByText("Synced to API")).toBeVisible();
  }
  if (testInfo.project.name.includes("mobile")) {
    const mobileNavLeavesMainVisible = await page.evaluate(() => {
      const main = document.querySelector("main")?.getBoundingClientRect();
      const nav = document.querySelector("nav[aria-label='Mobile main']")?.getBoundingClientRect();
      return Boolean(main && nav && main.bottom <= nav.top);
    });
    expect(mobileNavLeavesMainVisible).toBe(true);
    const mobileNavFitsViewport = await page.evaluate(() =>
      Array.from(document.querySelectorAll("nav[aria-label='Mobile main'] button")).every((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= window.innerWidth && rect.width >= 44;
      })
    );
    expect(mobileNavFitsViewport).toBe(true);
  }

  await goToMain(page, testInfo, "Browse");
  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.getByRole("heading", { name: /browse learning/i })).toBeVisible();
  if (testInfo.project.name.includes("mobile")) {
    const searchTarget = await page.getByRole("searchbox", { name: /search all learning/i }).boundingBox();
    expect(searchTarget?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await page.getByRole("link", { name: /open algorithms & data structures course/i }).click();
  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures$/);
  await expect(page.getByRole("heading", { level: 1, name: /algorithms & data structures/i })).toBeVisible();
  await expect(page.getByText(/8 units/i)).toBeVisible();
  await expect(page.getByText(/24 micro lessons/i)).toBeVisible();
  await expect(page.getByText(/^three$/i)).toBeVisible();
  await expect(page.getByText(/^skia$/i)).toBeVisible();

  await page.getByRole("link", { name: /binary search invariants/i }).click();
  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures\/lessons\/binary-search-invariants$/);
  await expect(page.getByRole("img", { name: /d3 binary search window/i })).toBeVisible();
  await page.getByRole("button", { name: /next search step/i }).click();
  await page.getByRole("button", { name: /keep the target inside/i }).click();
  await expect(page.getByText(/right.*remaining sorted window/i)).toBeVisible();

  await page.getByRole("link", { name: /tree rotations/i }).click();
  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures\/lessons\/tree-rotations$/);
  await expect(page.getByRole("img", { name: /three tree rotation scene/i })).toBeVisible();
  await page.getByRole("button", { name: /rotate left/i }).click();
  await expect(page.getByText(/inorder preserved/i)).toBeVisible();
  const threeCanvasHasPixels = await page.locator("canvas[data-renderer='three']").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL("image/png").length > 1000);
  expect(threeCanvasHasPixels).toBe(true);

  await page.getByRole("link", { name: /dp grid fill/i }).click();
  await expect(page.getByRole("img", { name: /dp grid fill/i })).toBeVisible();
  await page.getByRole("button", { name: /fill next cell/i }).click();
  await expect(page.getByText(/dependencies satisfied/i)).toBeVisible();

  await goToMain(page, testInfo, "Browse");
  await expect(page).toHaveURL(/\/browse$/);
  await page.getByRole("searchbox", { name: /search all learning/i }).fill("tree");
  await expect(page.getByText(/3 results for "tree"/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /open algorithms 101/i })).toHaveCount(0);

  await page.getByRole("link", { name: /open data structures/i }).click();
  await expect(page).toHaveURL(/\/topics\/data-structures$/);
  await expect(page.getByRole("heading", { level: 1, name: /^data structures$/i })).toBeVisible();

  await page.getByRole("button", { name: /trees module/i }).click();
  await expect(page.getByText(/micro lesson queue/i)).toBeVisible();
  await expect(page.getByText(/mode ready: visual/i)).toBeVisible();
  await page.getByRole("button", { name: /^interactive$/i }).click();
  await expect(page.getByText(/mode ready: interactive/i)).toBeVisible();

  await page.getByRole("link", { name: /practice trace tree height/i }).click();
  await expect(page).toHaveURL(/\/play\?lab=tree-height-lab$/);
  await expect(page.getByRole("heading", { name: /practice arcade/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /trace tree height/i })).toBeVisible();
  await page.getByRole("button", { name: "8" }).click();
  await page.getByRole("button", { name: "12" }).click();
  await page.getByRole("button", { name: "14" }).click();
  await page.getByRole("button", { name: /check traced tree path/i }).click();
  await expect(page.getByText(/that path has height 3/i)).toBeVisible();

  await goToMain(page, testInfo, "Feed");
  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByRole("heading", { name: /learning feed/i })).toBeVisible();
  await page.getByRole("button", { name: "Like bite" }).click();
  await expect(page.getByRole("button", { name: "Like bite" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Play audio lesson" }).click();
  await expect(page.getByText(/audio playing/i)).toBeVisible();
  await page.getByRole("button", { name: "Binary search" }).click();
  await expect(page.getByText(/nice.*10 xp/i)).toBeVisible();

  await goToMain(page, testInfo, "Library");
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole("heading", { name: /multimodal library/i })).toBeVisible();
  await page.getByRole("button", { name: "Watch" }).click();
  await expect(page.getByText(/visual walkthrough ready/i)).toBeVisible();
  await page.getByRole("button", { name: "Check tree height" }).click();
  await expect(page.getByText(/tree height is 3/i)).toBeVisible();

  await goToMain(page, testInfo, "You");
  await expect(page).toHaveURL(/\/progress$/);
  await expect(page.getByRole("heading", { name: /your learning momentum/i })).toBeVisible();

  await goToMain(page, testInfo, "Play");
  await expect(page).toHaveURL(/\/play$/);
  await page.getByRole("link", { name: /sort it: bubble sort/i }).click();
  await page.getByRole("button", { name: "Select bar 1" }).click();
  await page.getByRole("button", { name: "Select bar 2" }).click();
  await expect(page.getByText("swaps: 1")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
});
