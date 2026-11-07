import { expect, test, type Locator, type Page } from "@playwright/test";

const checkpointKey = "brainbuilder.scroll-learning.v1";
const card = (page: Page) => page.getByTestId("learning-card");

async function expectCard(page: Page, id: string) {
  await expect(card(page)).toHaveAttribute("data-card-id", id);
}

async function startPath(page: Page) {
  await page.getByRole("tab", { name: "My path", exact: true }).click();
  await expectCard(page, "path-try");
}

async function nextCard(page: Page, expectedId: string) {
  await page.getByRole("button", { name: "Next card", exact: true }).click();
  await expectCard(page, expectedId);
}

async function activity(page: Page) {
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Activity", exact: true });
  await expect(dialog).toBeVisible();
  return dialog.getByTestId("session-summary");
}

async function closePanel(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const activeCard = document.querySelector("[data-testid='learning-card']");
    return {
      document: document.documentElement.scrollWidth > window.innerWidth + 1,
      body: document.body.scrollWidth > window.innerWidth + 1,
      card: Boolean(activeCard && activeCard.scrollWidth > activeCard.clientWidth + 1)
    };
  });
  expect(overflow).toEqual({ document: false, body: false, card: false });
}

async function wheelOn(page: Page, target: Locator, deltaY = 600) {
  await target.scrollIntoViewIfNeeded();
  await target.hover();
  await page.mouse.wheel(0, deltaY);
}

// Playwright's touchscreen exposes taps, so send a real Chromium touch sequence
// through CDP to exercise scrolling, touch cancellation, and the gesture handler.
async function swipeUp(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const bounds = await target.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width / 2;
  const y = Math.min(bounds!.y + bounds!.height / 2, page.viewportSize()!.height - 80);
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - 75 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - 150 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally {
    await cdp.detach();
  }
}

test("home opens a finite learning session and skipping never becomes a checked answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open scrolling lessons", exact: true }).click();
  await expect(page).toHaveURL(/\/learn(?:\?.*)?$/);
  await expectCard(page, "discover-linear");

  await startPath(page);
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await expectCard(page, "path-explain");
  await nextCard(page, "path-fresh");
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await expectCard(page, "path-feedback");
  await nextCard(page, "path-close");

  const summary = page.getByTestId("session-summary");
  await expect(summary).toContainText("0 choices checked");
  await expect(summary).toContainText("0 correct choices");
  await expect(summary).toContainText("0 private reflections");
  await expect(card(page)).toContainText(/no later check yet/i);
  await expect(page.getByRole("button", { name: "Next card", exact: true })).toBeDisabled();
  await card(page).getByRole("button", { name: "Save and leave", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Open scrolling lessons", exact: true }).click();
  await expectCard(page, "path-close");
  await page.getByRole("button", { name: "Open the full course", exact: true }).click();
  await expect(page).toHaveURL(/\/courses\/algorithms-data-structures$/);
});

test("a local checkpoint restores drafts, private reflection, and revealed help without grading them", async ({ page }) => {
  await page.goto("/learn");
  await startPath(page);
  await page.getByRole("button", { name: "Type an answer", exact: true }).click();
  const thinking = "The target is larger than the middle, so I can keep the values on the right.";
  await page.getByRole("textbox", { name: "Your thinking", exact: true }).fill(thinking);
  await page.getByRole("button", { name: "Show hint", exact: true }).click();
  await expect(page.getByTestId("checkpoint-status")).toContainText("Saved on this device");

  await page.reload();
  await expectCard(page, "path-try");
  await expect(page.getByRole("button", { name: "Type an answer", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("textbox", { name: "Your thinking", exact: true })).toHaveValue(thinking);
  await expect(card(page)).toContainText("The values are sorted. Can any value at or below 12 equal 19?");
  await page.getByRole("button", { name: "Reveal explanation", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your thinking", exact: true })).toHaveValue(thinking);
  await expect(card(page)).toContainText("19 is greater than 12.");

  await page.getByRole("button", { name: "Think privately", exact: true }).click();
  await page.getByRole("button", { name: "I thought it through", exact: true }).click();
  await page.reload();
  await expectCard(page, "path-try");
  await expect(page.getByRole("button", { name: "Think privately", exact: true })).toHaveAttribute("aria-pressed", "true");
  const summary = await activity(page);
  await expect(summary).toContainText("1 private reflection");
  await expect(summary).toContainText("1 written draft");
  await expect(summary).toContainText("0 choices checked");
  await expect(summary).toContainText("0 correct choices");
});

test("only explicit submissions are checked and an earlier answer retains its original context", async ({ page }) => {
  await page.goto("/learn");
  await startPath(page);
  await page.getByRole("button", { name: "Choose an answer", exact: true }).click();
  await page.getByRole("radio", { name: "19, 23, 30", exact: true }).check();
  const before = await activity(page);
  await expect(before).toContainText("0 choices checked");
  await closePanel(page);

  await page.getByRole("radio", { name: "2, 5, 8", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("radio", { name: "19, 23, 30", exact: true })).toBeDisabled();
  const firstAttempt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).practice["try-first"].attempt, checkpointKey);
  expect(firstAttempt).toMatchObject({ choiceId: "left", correct: false, assisted: false, context: "try-first" });

  await nextCard(page, "path-explain");
  await page.getByRole("button", { name: "Previous card", exact: true }).click();
  await page.reload();
  await expectCard(page, "path-try");
  await expect(page.getByRole("radio", { name: "2, 5, 8", exact: true })).toBeChecked();
  const restoredAttempt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).practice["try-first"].attempt, checkpointKey);
  expect(restoredAttempt, "Later instruction must not rewrite the earlier submitted evidence").toEqual(firstAttempt);

  await nextCard(page, "path-explain");
  await nextCard(page, "path-fresh");
  await page.getByRole("button", { name: "Choose an answer", exact: true }).click();
  await page.getByRole("radio", { name: "18, 21, 24, 27", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const freshAttempt = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).practice["fresh-case"].attempt, checkpointKey);
  expect(freshAttempt).toMatchObject({ correct: true, assisted: true, context: "after-instruction" });
  const summary = await activity(page);
  await expect(summary).toContainText("2 choices checked");
  await expect(summary).toContainText("1 correct choice");
});

test("details trap focus, isolate scrolling, and return focus to their trigger", async ({ page }) => {
  await page.goto("/learn");
  const source = page.getByRole("button", { name: "Source", exact: true });
  await source.click();
  const dialog = page.getByRole("dialog", { name: "Source", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveAttribute("href", /github\.com\/castlemilk\/brainbuilder\/blob\//);

  await dialog.getByRole("button", { name: "Close panel", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Read the course source", exact: true })).toBeFocused();
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Tab");
    await expect(dialog.locator(":focus")).toHaveCount(1);
  }
  await page.keyboard.press("PageDown");
  await wheelOn(page, dialog, 1200);
  await expectCard(page, "discover-linear");
  await closePanel(page);
  await expect(source).toBeFocused();
  await expectCard(page, "discover-linear");

  await page.getByRole("button", { name: "Why this?", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Why this?", exact: true })).toBeVisible();
  await closePanel(page);
  await expect(page.getByRole("button", { name: "Why this?", exact: true })).toBeFocused();
});

test("a scroll gesture advances one card while typing and interactive controls keep their position", async ({ page }, testInfo) => {
  await page.goto("/learn");
  const heading = card(page).getByRole("heading", { level: 1 });
  const demo = page.getByRole("region", { name: "Linear search demonstration", exact: true });
  const step = demo.getByRole("button", { name: "Next demonstration step", exact: true });
  await step.click();
  await expect(demo).toContainText("Check 5. It is not 19");
  await step.press("ArrowDown");
  if (testInfo.project.name.includes("mobile")) await swipeUp(page, step);
  else await wheelOn(page, step);
  await expectCard(page, "discover-linear");

  await heading.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
  });
  await wheelOn(page, heading);
  await expectCard(page, "discover-linear");
  await page.evaluate(() => window.getSelection()?.removeAllRanges());

  if (testInfo.project.name.includes("mobile")) {
    await swipeUp(page, heading);
  } else {
    await heading.hover();
    // Consecutive wheel events from one physical gesture must not skip a card.
    await page.mouse.wheel(0, 350);
    await page.mouse.wheel(0, 350);
    await page.mouse.wheel(0, 350);
  }
  await expectCard(page, "discover-binary");

  await startPath(page);
  await page.getByRole("button", { name: "Type an answer", exact: true }).click();
  const thinking = page.getByRole("textbox", { name: "Your thinking", exact: true });
  await thinking.fill("A first line.\nA second line.\nI am still thinking.");
  await thinking.press("ArrowDown");
  await thinking.press("PageDown");
  await wheelOn(page, thinking);
  await expectCard(page, "path-try");
  await page.getByRole("button", { name: "Choose an answer", exact: true }).click();
  const option = page.getByRole("radio", { name: "2, 5, 8", exact: true });
  await option.focus();
  await option.press("ArrowDown");
  await expectCard(page, "path-try");
});

test("a failed local save stays explicit, preserves the draft, and can be retried", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("scroll-test-storage-restored") === "yes") return;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === "brainbuilder.scroll-learning.v1") throw new DOMException("Test device storage is full", "QuotaExceededError");
      return original.call(this, key, value);
    };
    (window as Window & { restoreScrollTestStorage?: () => void }).restoreScrollTestStorage = () => {
      Storage.prototype.setItem = original;
      sessionStorage.setItem("scroll-test-storage-restored", "yes");
    };
  });
  await page.goto("/learn");
  await startPath(page);
  await page.getByRole("button", { name: "Type an answer", exact: true }).click();
  await page.getByRole("textbox", { name: "Your thinking", exact: true }).fill("Please preserve this unsaved draft.");
  const status = page.getByTestId("checkpoint-status");
  await expect(status).toContainText(/could not be saved|not saved|couldn.t save/i);
  await expect(status).not.toContainText("Saved on this device");
  await page.getByRole("button", { name: "Save and leave", exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  const leaveDialog = page.getByRole("dialog", { name: "Your place is not saved yet", exact: true });
  await expect(leaveDialog).toBeVisible();
  await leaveDialog.getByRole("button", { name: "Keep learning", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your thinking", exact: true })).toHaveValue("Please preserve this unsaved draft.");

  await page.evaluate(() => (window as Window & { restoreScrollTestStorage?: () => void }).restoreScrollTestStorage?.());
  await page.getByRole("button", { name: "Retry saving", exact: true }).click();
  await expect(status).toContainText("Saved on this device");
  await page.reload();
  await expectCard(page, "path-try");
  await expect(page.getByRole("textbox", { name: "Your thinking", exact: true })).toHaveValue("Please preserve this unsaved draft.");
});

test("enlarged text remains readable with reachable controls and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn");
  await startPath(page);
  const description = card(page).locator(".sl-card-description");
  const originalSize = await description.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await expect.poll(() => description.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)), {
    message: "The prompt must actually grow with the requested 200% root font size"
  }).toBeGreaterThanOrEqual(originalSize * 1.9);
  await assertNoHorizontalOverflow(page);
  const bodySize = await card(page).evaluate((element) => ({ content: element.scrollHeight, viewport: element.clientHeight }));
  expect(bodySize.content, "Large type should use the card's reading scroll area").toBeGreaterThan(bodySize.viewport);
  await wheelOn(page, description, 400);
  await expect.poll(() => card(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expectCard(page, "path-try");
  await page.getByRole("button", { name: "Type an answer", exact: true }).click();
  await page.getByRole("textbox", { name: "Your thinking", exact: true }).fill("The full answer field is still reachable.");
  await page.getByRole("button", { name: "Reveal explanation", exact: true }).click();
  await expect(card(page)).toContainText("19 is greater than 12.");
  await assertNoHorizontalOverflow(page);

  const animated = await card(page).evaluate((element) => [element, ...element.querySelectorAll("*")].filter((node) => {
    const style = getComputedStyle(node);
    const activeAnimation = style.animationName !== "none" && style.animationDuration.split(",").some((duration) => Number.parseFloat(duration) > 0.01);
    const activeTransition = style.transitionDuration.split(",").some((duration) => Number.parseFloat(duration) > 0.01);
    return activeAnimation || activeTransition;
  }).map((node) => node.tagName));
  expect(animated, "Reduced motion must remove continuous card motion and transitions").toEqual([]);
  await nextCard(page, "path-explain");
  await expect(page.getByRole("button", { name: "Play demonstration", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Next demonstration step", exact: true }).click();
  await expectCard(page, "path-explain");
  await assertNoHorizontalOverflow(page);
});

test("scroll and button variants keep the same content and saved ideas reopen the selected card", async ({ page }) => {
  async function collectDiscover() {
    const cards: { id: string | null; title: string }[] = [];
    for (let index = 0; index < 3; index += 1) {
      cards.push({ id: await card(page).getAttribute("data-card-id"), title: await card(page).getByRole("heading", { level: 1 }).innerText() });
      if (index < 2) await page.getByRole("button", { name: "Next card", exact: true }).click();
    }
    return cards;
  }

  await page.goto("/learn");
  const scrollCards = await collectDiscover();
  await page.evaluate((key) => localStorage.removeItem(key), checkpointKey);
  await page.goto("/learn?navigation=buttons");
  await expectCard(page, "discover-linear");
  await wheelOn(page, card(page).getByRole("heading", { level: 1 }), 1200);
  await expectCard(page, "discover-linear");
  const buttonCards = await collectDiscover();
  expect(buttonCards).toEqual(scrollCards);
  await page.getByRole("button", { name: "Save idea", exact: true }).click();
  await page.getByRole("button", { name: "Previous card", exact: true }).click();
  await page.getByRole("button", { name: "Saved ideas", exact: true }).click();
  const saved = page.getByRole("dialog", { name: "Saved ideas", exact: true });
  await saved.getByRole("button").filter({ has: page.getByText(buttonCards[2].title, { exact: true }) }).click();
  await expect(saved).not.toBeVisible();
  await expectCard(page, buttonCards[2].id!);
});
