import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    html: document.documentElement.scrollWidth > window.innerWidth + 1,
    body: document.body.scrollWidth > window.innerWidth + 1
  }));
  expect(overflow).toEqual({ html: false, body: false });
}

async function expectNoConsoleErrors(page: Page, action: () => Promise<void>) {
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
  page.off("console", onConsole);
  page.off("pageerror", onPageError);

  expect({ consoleErrors, pageErrors }).toEqual({ consoleErrors: [], pageErrors: [] });
}

async function tapTab(page: Page, label: "Home" | "Browse" | "Feed" | "Play" | "Library" | "You") {
  await page.getByRole("button", { name: `${label} tab` }).click();
}

test("Expo mobile app completes the new learner course journey on phone and tablet", async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto("/");
    await expect(page.getByText(/build your learning plan/i)).toBeVisible();
  });

  await page.getByLabel("Name").fill("Mina");
  await page.getByLabel("Email").fill("mina@example.com");
  await page.getByRole("button", { name: /interview prep objective/i }).click();
  await page.getByRole("button", { name: /build learning plan/i }).click();

  await expect(page.getByText(/plan active for mina/i)).toBeVisible();
  await expect(page.getByText(/interview prep/i)).toBeVisible();

  await tapTab(page, "Browse");
  await expect(page.getByText(/course framework/i)).toBeVisible();
  await expect(page.getByText(/24 micro lessons/i)).toBeVisible();
  await expect(page.getByText(/^skia$/i)).toBeVisible();
  await page.getByRole("button", { name: /enroll in course/i }).click();
  await expect(page.getByText(/enrolled/i)).toBeVisible();
  await expect(page.getByText(/0\/24 lessons complete/i)).toBeVisible();

  await page.getByRole("button", { name: /name the invariant and preserve it/i }).first().click();
  await expect(page.getByText(/right.*operation works because the invariant survives/i)).toBeVisible();
  await page.getByRole("button", { name: /complete lesson/i }).click();
  await expect(page.getByText(/lesson complete/i)).toBeVisible();
  await expect(page.getByText(/1\/24 lessons complete/i)).toBeVisible();

  await page.getByRole("button", { name: /binary search invariants/i }).click();
  await expect(page.getByLabel(/native binary search window/i)).toBeVisible();
  await page.getByRole("button", { name: /next search step/i }).click();
  await expect(page.getByText(/window 4-7/i)).toBeVisible();

  await page.getByRole("button", { name: /tree rotations/i }).click();
  await expect(page.getByLabel(/native tree rotation surface/i)).toBeVisible();
  await page.getByRole("button", { name: /rotate left/i }).click();
  await expect(page.getByText(/inorder preserved/i)).toBeVisible();

  await page.getByRole("button", { name: /dp grid fill/i }).click();
  await expect(page.getByLabel(/native dp grid fill/i)).toBeVisible();
  await page.getByRole("button", { name: /fill next cell/i }).click();
  await page.getByRole("button", { name: /fill next cell/i }).click();
  await expect(page.getByText(/dependencies satisfied for 2 cells/i)).toBeVisible();

  await page.getByRole("button", { name: /capstone arcade/i }).click();
  await expect(page.getByText(/sorting arcade/i)).toBeVisible();
  await expect(page.getByText(/graph route arcade/i)).toBeVisible();
  await page.getByRole("button", { name: /complete course/i }).click();
  await expect(page.getByText(/course complete/i)).toBeVisible();

  await tapTab(page, "You");
  await expect(page.getByText(/24\/24 lessons complete/i)).toBeVisible();
  await expect(page.getByText(/certificate ready/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Expo mobile tabs, games, audio, and library remain responsive and interactive", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/good morning, alex/i)).toBeVisible();

  const tabExpectations = {
    Home: /journey map/i,
    Browse: /course framework/i,
    Feed: /quick check/i,
    Play: /practice arcade/i,
    Library: /multimodal library/i,
    You: /alex's streak/i
  } as const;

  for (const [label, expectedText] of Object.entries(tabExpectations) as Array<[keyof typeof tabExpectations, RegExp]>) {
    await tapTab(page, label);
    await expect(page.getByText(expectedText).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }

  await tapTab(page, "Feed");
  await page.getByRole("button", { name: /binary trees in one commute stop/i }).click();
  await page.getByRole("button", { name: /play audio lesson/i }).click();
  await expect(page.getByText(/audio playing/i)).toBeVisible();
  await page.getByRole("button", { name: /save bite/i }).click();
  await expect(page.getByText(/saved for later/i)).toBeVisible();

  await tapTab(page, "Library");
  await expect(page.getByText(/multimodal library/i)).toBeVisible();
  await page.getByRole("button", { name: /binary trees in one commute stop/i }).click();
  await expect(page.getByText(/what controls the longest tree search path/i)).toBeVisible();

  await tapTab(page, "Play");
  await page.getByRole("button", { name: /select bar 1/i }).click();
  await page.getByRole("button", { name: /select bar 2/i }).click();
  await expect(page.getByText(/swaps: 1/i)).toBeVisible();

  await page.getByRole("button", { name: /trace tree height/i }).click();
  await page.getByRole("button", { name: /tree node 8/i }).click();
  await page.getByRole("button", { name: /tree node 12/i }).click();
  await page.getByRole("button", { name: /tree node 14/i }).click();
  await page.getByRole("button", { name: /check path/i }).click();
  await expect(page.getByText(/that path has height 3/i)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
