import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function goToMain(page: Page, testInfo: TestInfo, label: "Browse" | "Feed" | "Play" | "Library" | "You") {
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: `${label} tab` }).click();
    return;
  }
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label }).click();
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(hasHorizontalOverflow).toBe(false);
}

test("learner builds a custom book path and completes its generated lesson, quiz, lab, and library loop", async ({ page }, testInfo) => {
  await page.goto("/browse");

  await page.getByRole("textbox", { name: /custom learning goal/i }).fill("Atomic Habits");
  await page.getByRole("button", { name: /^book$/i }).click();
  await page.getByRole("button", { name: /build custom path/i }).click();

  await expect(page).toHaveURL(/\/topics\/custom-atomic-habits$/);
  await expect(page.getByRole("heading", { level: 1, name: /^atomic habits$/i })).toBeVisible();
  await expect(page.getByText(/custom book path/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /practice loop module/i })).toBeVisible();

  await page.getByRole("link", { name: /open micro lesson/i }).click();
  await expect(page).toHaveURL(/\/feed\?bite=custom-atomic-habits-bite$/);
  await expect(page.getByRole("heading", { name: /atomic habits in one focused sprint/i })).toBeVisible();
  await expect(page.getByText(/what is the best next step for atomic habits/i)).toBeVisible();

  await page.getByRole("button", { name: /teach it back with one example/i }).click();
  await expect(page.getByText(/nice.*8 xp/i)).toBeVisible();

  await goToMain(page, testInfo, "Browse");
  await page.getByRole("link", { name: /open atomic habits/i }).click();
  await page.getByRole("link", { name: /practice build atomic habits recall loop/i }).click();
  await expect(page).toHaveURL(/\/play\?lab=custom-atomic-habits-lab$/);
  await expect(page.getByRole("heading", { name: /build atomic habits recall loop/i })).toBeVisible();

  await page.getByRole("button", { name: /fill next practice card/i }).click();
  await expect(page.getByText(/^Cue ready$/i)).toBeVisible();

  await goToMain(page, testInfo, "Library");
  await expect(page.getByRole("heading", { name: /saved for later/i })).toBeVisible();
  await page.getByRole("link", { name: /open atomic habits in one focused sprint/i }).click();
  await expect(page).toHaveURL(/\/feed\?bite=custom-atomic-habits-bite$/);

  await expectNoHorizontalOverflow(page);
});
