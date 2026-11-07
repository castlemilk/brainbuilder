import { describe, expect, it, vi } from "vitest";
import { ALL_CARDS, DISCOVER_CARDS, PATH_CARDS, type QuestionId } from "./content";
import { STORAGE_KEY, createInitialState, loadCheckpoint, parseCheckpoint, replaceCheckpoint, saveCheckpoint, summarize, transition, type ScrollAction, type ScrollState } from "./model";

const run = (state: ScrollState, ...actions: ScrollAction[]) => actions.reduce(transition, state);
const path = () => transition(createInitialState(), { type: "view", view: "path" });
const choose = (state: ScrollState, questionId: QuestionId = "try-first", choiceId = "right") => run(state,
  { type: "mode", questionId, mode: "choice" }, { type: "select", questionId, choiceId });
const roundTrip = (state: ScrollState): ScrollState => {
  const restored = parseCheckpoint(JSON.stringify(state));
  expect(restored.status).toBe("ready");
  if (restored.status !== "ready") throw new Error("Expected a valid checkpoint");
  return restored.state;
};

describe("scroll learning evidence", () => {
  it("starts with no observed activity, fabricated answers, XP, or later checks", () => {
    const state = createInitialState();
    expect(summarize(state)).toMatchObject({ viewed: 0, exposed: 0, submitted: 0, correct: 0, unanswered: 2, reachedEnd: false, laterChecks: 0 });
    expect(state.practice["try-first"].mode).toBe("private");
    expect(state).not.toHaveProperty("xp");
    expect(roundTrip(state)).toEqual(state);
  });

  it("keeps a new question unrevealed and only checks an explicit submitted choice", () => {
    const state = choose(path());
    expect(state.practice["try-first"].answerRevealed).toBe(false);
    expect(summarize(state).submitted).toBe(0);
    const checked = transition(state, { type: "submit", questionId: "try-first" });
    expect(checked.practice["try-first"].attempt).toMatchObject({ choiceId: "right", correct: true, assisted: false, context: "try-first", exposureIds: [] });
    expect(checked.practice["try-first"].answerRevealed).toBe(true);
    expect(checked.exposures[0].sequence).toBeGreaterThan(checked.practice["try-first"].attempt!.sequence);
    expect(roundTrip(checked)).toEqual(checked);
  });

  it("never grades a private self-report, a draft, or a hidden choice in a different mode", () => {
    const state = run(choose(path()),
      { type: "mode", questionId: "try-first", mode: "private" }, { type: "private", questionId: "try-first" },
      { type: "mode", questionId: "try-first", mode: "draft" }, { type: "draft", questionId: "try-first", value: "19, 23, 30 — the right half" },
      { type: "submit", questionId: "try-first" });
    expect(summarize(state)).toMatchObject({ submitted: 0, correct: 0, privateReflections: 1, drafts: 1, unanswered: 2 });
    expect(roundTrip(state).practice["try-first"].choiceId).toBe("right");
    expect(transition(path(), { type: "submit", questionId: "try-first" }).practice["try-first"].attempt).toBeNull();
  });

  it("records skip as unanswered and preserves a draft when navigating away and back", () => {
    const state = run(path(), { type: "draft", questionId: "try-first", value: "A thought to return to" },
      { type: "skip", questionId: "try-first" }, { type: "navigate", index: 1 }, { type: "navigate", index: 0 });
    expect(summarize(state)).toMatchObject({ submitted: 0, correct: 0, skipped: 1, unanswered: 2 });
    expect(roundTrip(state).practice["try-first"].draft).toBe("A thought to return to");
  });

  it.each(["hint", "reveal"] as const)("keeps %s assistance through back, refresh, and a later submit", (type) => {
    const helped = run(path(), { type, questionId: "try-first" }, { type: "navigate", index: 1 }, { type: "navigate", index: 0 });
    const checked = transition(choose(roundTrip(helped)), { type: "submit", questionId: "try-first" });
    expect(checked.practice["try-first"].attempt).toMatchObject({ correct: true, assisted: true, context: "with-help" });
    expect(roundTrip(checked)).toEqual(checked);
  });

  it.each([
    [{ type: "navigate", index: 1 }, { type: "view", view: "path" }],
    [{ type: "view", view: "path" }, { type: "navigate", index: 1 }, { type: "navigate", index: 0 }],
    [{ type: "view", view: "path" }, { type: "source", id: "path-try" }]
  ] satisfies ScrollAction[][])("labels prior binary concept, explanation, or source exposure as instruction", (...actions) => {
    const state = run(createInitialState(), ...actions);
    const checked = transition(choose(state), { type: "submit", questionId: "try-first" });
    expect(checked.practice["try-first"].attempt).toMatchObject({ assisted: true, context: "after-instruction" });
    expect(roundTrip(checked)).toEqual(checked);
  });

  it("does not treat unrelated linear-search exposure as binary-search help", () => {
    const state = run(createInitialState(), { type: "visit" }, { type: "view", view: "path" });
    const checked = transition(choose(state), { type: "submit", questionId: "try-first" });
    expect(checked.practice["try-first"].attempt?.assisted).toBe(false);
  });

  it("keeps the first wrong observation immutable across resubmits, new selections, and future help", () => {
    const checked = transition(choose(path(), "try-first", "left"), { type: "submit", questionId: "try-first" });
    const first = structuredClone(checked.practice["try-first"].attempt);
    const repeated = run(checked, { type: "select", questionId: "try-first", choiceId: "right" },
      { type: "submit", questionId: "try-first" }, { type: "hint", questionId: "try-first" }, { type: "submit", questionId: "try-first" });
    expect(repeated.practice["try-first"].attempt).toEqual(first);
    expect(summarize(repeated)).toMatchObject({ submitted: 1, correct: 0, assisted: 0 });
    expect(roundTrip(repeated).practice["try-first"].attempt).toEqual(first);
  });

  it("labels the next fresh comparison after checked feedback as after-instruction", () => {
    const first = transition(choose(path()), { type: "submit", questionId: "try-first" });
    const fresh = transition(choose(first, "fresh-case"), { type: "submit", questionId: "fresh-case" });
    expect(fresh.practice["fresh-case"].attempt).toMatchObject({ correct: true, context: "after-instruction", assisted: true, exposureIds: ["path-try"] });
    expect(summarize(fresh)).toMatchObject({ submitted: 2, correct: 2, assisted: 1, laterChecks: 0 });
  });

  it("counts unique content views/exposures, persists saves, and clamps the finite endpoint", () => {
    let state = transition(createInitialState(), { type: "visit" });
    state = run(state, { type: "visit" }, { type: "source", id: "discover-linear" }, { type: "source", id: "discover-linear" },
      { type: "toggle-save", id: "discover-linear" }, { type: "view", view: "path" }, { type: "navigate", index: 99 });
    expect(state.pathIndex).toBe(PATH_CARDS.length - 1);
    expect(summarize(state)).toMatchObject({ viewed: 3, exposed: 1, saved: 1, reachedEnd: true, submitted: 0 });
    expect(roundTrip(state).savedIds).toEqual(["discover-linear"]);
    expect(transition(state, { type: "navigate", index: 6 })).toEqual(state);
    expect(summarize(transition(state, { type: "toggle-save", id: "discover-linear" })).saved).toBe(0);
  });

  it("uses identical content and observations for scroll and buttons navigation", () => {
    const scroll = run(path(), { type: "navigate", index: 1 }, { type: "navigate", index: 2 });
    const buttons = run(path(), { type: "navigation", navigation: "buttons" }, { type: "navigate", index: 1 }, { type: "navigate", index: 2 });
    expect({ ...buttons, navigation: "scroll" }).toEqual(scroll);
    expect(DISCOVER_CARDS).toHaveLength(3);
    expect(PATH_CARDS).toHaveLength(5);
    expect(new Set(ALL_CARDS.map((card) => card.id)).size).toBe(8);
  });

  it("opens a saved card atomically without recording an intermediate view", () => {
    const state = transition(createInitialState(), { type: "toggle-save", id: "path-fresh" });
    const opened = transition(state, { type: "open", view: "path", index: 2 });
    expect(opened.viewedIds).toEqual(["path-fresh"]);
    expect(opened.pathIndex).toBe(2);
    expect(roundTrip(opened)).toEqual(opened);
  });

  it("never shares mutable nested snapshots with earlier transitions or restored states", () => {
    const original = transition(choose(path()), { type: "submit", questionId: "try-first" });
    const serialized = JSON.stringify(original);
    const next = transition(original, { type: "visit" });
    next.practice["try-first"].attempt!.exposureIds.push("path-feedback");
    next.exposures[0].sequence = 99;
    next.savedIds.push("path-close");
    const restored = roundTrip(original);
    restored.practice["try-first"].draft = "Changed only here";
    expect(JSON.stringify(original)).toBe(serialized);
    expect(createInitialState().practice["fresh-case"].draft).toBe("");
  });
});

describe("checkpoint validation and storage", () => {
  it.each(["", "null", "[]", "{", '{"version":1,"__proto__":{"polluted":true}}', JSON.stringify({ ...createInitialState(), savedIds: ["__proto__"] }), JSON.stringify({ ...createInitialState(), viewedIds: ["path-try", "path-try"] })])("rejects malformed or unrecognized state: %s", (raw) => {
    expect(parseCheckpoint(raw).status).toBe("invalid");
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("rejects forged correctness, removed assistance, impossible chronology, and oversized drafts", () => {
    const checked = transition(choose(run(path(), { type: "hint", questionId: "try-first" })), { type: "submit", questionId: "try-first" });
    const mutations: ((state: ScrollState) => void)[] = [
      (state) => { state.practice["try-first"].attempt!.correct = false; },
      (state) => { state.practice["try-first"].attempt!.assisted = false; },
      (state) => { state.practice["try-first"].attempt!.exposureIds = []; },
      (state) => { state.practice["try-first"].helpRevealed = false; },
      (state) => { state.sequence += 1; },
      (state) => { state.exposures[0].sequence = state.practice["try-first"].attempt!.sequence; },
      (state) => { state.practice["fresh-case"].draft = "x".repeat(2001); }
    ];
    for (const mutate of mutations) {
      const invalid = structuredClone(checked);
      mutate(invalid);
      expect(parseCheckpoint(JSON.stringify(invalid)).status).toBe("invalid");
    }
  });

  it("restores the complete position, variant, drafts, saves, and exposure evidence", () => {
    const state = run(path(), { type: "navigation", navigation: "buttons" }, { type: "draft", questionId: "try-first", value: "Keep the right side" },
      { type: "private", questionId: "try-first" }, { type: "hint", questionId: "try-first" }, { type: "toggle-save", id: "path-try" }, { type: "navigate", index: 2 });
    let raw: string | null = null;
    const storage = { getItem: vi.fn(() => raw), setItem: vi.fn((_key: string, value: string) => { raw = value; }) };
    expect(loadCheckpoint(storage)).toEqual({ status: "empty" });
    expect(saveCheckpoint(storage, state)).toEqual({ ok: true });
    expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state));
    expect(loadCheckpoint(storage)).toEqual({ status: "ready", state });
  });

  it.each(["{bad", '{"version":0}', '{"version":2}'])("preserves unreadable/unsupported existing data instead of overwriting: %s", (raw) => {
    const storage = { getItem: vi.fn(() => raw), setItem: vi.fn() };
    expect(saveCheckpoint(storage, createInitialState()).ok).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(loadCheckpoint(storage).status).toBe(raw === "{bad" ? "invalid" : "unsupported");
  });

  it("surfaces read and write failures and never writes after a failed read", () => {
    const inaccessible = { getItem: vi.fn(() => { throw new Error("Blocked"); }), setItem: vi.fn() };
    expect(loadCheckpoint(inaccessible).status).toBe("unavailable");
    expect(saveCheckpoint(inaccessible, createInitialState()).ok).toBe(false);
    expect(inaccessible.setItem).not.toHaveBeenCalled();
    const full = { getItem: () => null, setItem: () => { throw new Error("Quota exceeded"); } };
    expect(saveCheckpoint(full, createInitialState())).toMatchObject({ ok: false, error: expect.stringContaining("could not be saved") });
  });

  it("replaces invalid data only on explicit recovery, using a validated atomic write", () => {
    let raw = "{previous invalid data";
    const storage = { getItem: () => raw, setItem: vi.fn((_key: string, value: string) => { raw = value; }) };
    expect(saveCheckpoint(storage, createInitialState()).ok).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(replaceCheckpoint(storage, createInitialState()).ok).toBe(true);
    expect(parseCheckpoint(raw).status).toBe("ready");
    const valid = raw;
    const invalid = { ...createInitialState(), sequence: 99 };
    expect(replaceCheckpoint(storage, invalid).ok).toBe(false);
    expect(raw).toBe(valid);
  });

  it("retains the previous raw checkpoint when an explicit replacement fails", () => {
    const raw = '{"version":2}';
    const storage = { getItem: () => raw, setItem: () => { throw new Error("Quota exceeded"); } };
    expect(replaceCheckpoint(storage, path()).ok).toBe(false);
    expect(storage.getItem()).toBe(raw);
  });
});
