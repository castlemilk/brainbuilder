import { expect, test, type Page, type TestInfo } from "@playwright/test";

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

test("new learner completes the algorithms learning program lifecycle", async ({ page }, testInfo) => {
  await page.goto("/signin");

  await expect(page.getByRole("heading", { name: /build your learning plan/i })).toBeVisible();
  await page.getByLabel("Name").fill("Jordan");
  await page.getByLabel("Email").fill("jordan@example.com");
  await page.getByRole("button", { name: /algorithms and data structures objective/i }).click();
  await page.getByRole("button", { name: /interview prep objective/i }).click();
  await page.getByRole("button", { name: /build learning plan/i }).click();

  await expect(page).toHaveURL(/\/browse$/);
  await expect(page.getByText(/learning plan for jordan/i)).toBeVisible();
  await expect(page.getByText(/algorithms and data structures/i)).toBeVisible();

  await page.getByRole("searchbox", { name: /search all learning/i }).fill("algorithm");
  await expect(page.getByRole("link", { name: /open algorithms & data structures course/i })).toBeVisible();
  await page.getByRole("link", { name: /open algorithms & data structures course/i }).click();

  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures$/);
  await page.getByRole("button", { name: /enroll in course/i }).click();
  await expect(page.getByText(/enrolled/i)).toBeVisible();
  await page.getByRole("link", { name: /start first lesson/i }).click();

  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures\/lessons\/big-o-as-shape$/);
  await expect(page.getByRole("heading", { level: 1, name: /big-o as shape/i })).toBeVisible();
  await expect(page.getByText(/what to notice/i).first()).toBeVisible();
  await expect(page.locator("[data-animated-stage], [data-animated-diagram]").first()).toBeVisible();
  await page.locator("[data-animated-stage]").first().locator("xpath=ancestor::article[1]").getByRole("button", { name: /next stage/i }).click();
  await expect(page.locator("[data-animated-stage]").first()).toHaveAttribute("data-stage-step", "1");

  await page.getByRole("button", { name: /name the invariant and preserve it/i }).click();
  await expect(page.getByText(/right|nice|correct|invariant/i).first()).toBeVisible();
  await page.getByRole("button", { name: /complete lesson/i }).click();
  await expect(page.getByText(/lesson complete/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /next lesson/i })).toHaveAttribute("href", "/courses/algorithms-data-structures/lessons/loops-and-growth");

  await goToMain(page, testInfo, "Play");
  await expect(page.getByRole("heading", { name: /practice arcade/i })).toBeVisible();
  await page.getByRole("link", { name: /sort it: bubble sort/i }).click();
  await page.getByRole("button", { name: "Select bar 1" }).click();
  await page.getByRole("button", { name: "Select bar 2" }).click();
  await expect(page.getByText("swaps: 1")).toBeVisible();

  await page.goto("/courses/algorithms-data-structures/lessons/capstone-arcade");
  await expect(page.getByRole("heading", { level: 1, name: /capstone arcade/i })).toBeVisible();
  await expect(page.locator("[data-animated-stage='capstone-sort-lab']")).toBeVisible();
  await page.locator("[data-animated-stage='capstone-sort-lab']").locator("xpath=ancestor::article[1]").getByRole("button", { name: /next stage/i }).click();
  await expect(page.locator("[data-animated-stage='capstone-sort-lab']")).toHaveAttribute("data-stage-step", "1");
  await page.getByRole("button", { name: /complete course/i }).click();
  await expect(page.getByText(/course complete/i)).toBeVisible();

  await goToMain(page, testInfo, "You");
  await expect(page.getByRole("heading", { name: /your learning momentum/i })).toBeVisible();
  await expect(page.getByText(/course complete/i)).toBeVisible();
  await expect(page.getByText(/certificate ready/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
