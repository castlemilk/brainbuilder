import { ALL_CARDS, DISCOVER_CARDS, PATH_CARDS, QUESTIONS, QUESTION_IDS, type ContentId, type QuestionId } from "./content";

export const STORAGE_KEY = "brainbuilder.scroll-learning.v1";
export type PracticeMode = "private" | "draft" | "choice";
export interface Attempt {
  choiceId: string;
  correct: boolean;
  assisted: boolean;
  context: "try-first" | "after-instruction" | "with-help";
  exposureIds: ContentId[];
  sequence: number;
}
export interface PracticeState {
  mode: PracticeMode;
  draft: string;
  choiceId: string | null;
  privateReflection: boolean;
  helpRevealed: boolean;
  answerRevealed: boolean;
  skipped: boolean;
  attempt: Attempt | null;
}
interface Exposure {
  id: ContentId;
  kind: "instruction" | "source" | "hint" | "answer";
  questionId: QuestionId | null;
  sequence: number;
}
export interface ScrollState {
  version: 1;
  view: "discover" | "path";
  navigation: "scroll" | "buttons";
  discoverIndex: number;
  pathIndex: number;
  savedIds: ContentId[];
  viewedIds: ContentId[];
  sequence: number;
  exposures: Exposure[];
  practice: Record<QuestionId, PracticeState>;
}
export type ScrollAction =
  | { type: "visit" }
  | { type: "view"; view: ScrollState["view"] }
  | { type: "open"; view: ScrollState["view"]; index: number }
  | { type: "navigate"; index: number }
  | { type: "navigation"; navigation: ScrollState["navigation"] }
  | { type: "toggle-save" | "source"; id: ContentId }
  | { type: "mode"; questionId: QuestionId; mode: PracticeMode }
  | { type: "draft"; questionId: QuestionId; value: string }
  | { type: "select"; questionId: QuestionId; choiceId: string }
  | { type: "private" | "hint" | "reveal" | "skip" | "submit"; questionId: QuestionId };

const questionCard = (id: QuestionId): ContentId => id === "try-first" ? "path-try" : "path-fresh";
const isQuestion = (id: unknown): id is QuestionId => QUESTION_IDS.some((known) => known === id);
const isContent = (id: unknown): id is ContentId => ALL_CARDS.some((card) => card.id === id);
const cardFor = (id: ContentId) => ALL_CARDS.find((card) => card.id === id)!;
const exposureKey = (item: Exposure) => `${item.id}:${item.kind}:${item.questionId ?? "all"}`;
const freshPractice = (): PracticeState => ({ mode: "private", draft: "", choiceId: null, privateReflection: false, helpRevealed: false, answerRevealed: false, skipped: false, attempt: null });
export function createInitialState(): ScrollState {
  return { version: 1, view: "discover", navigation: "scroll", discoverIndex: 0, pathIndex: 0, savedIds: [], viewedIds: [], sequence: 0, exposures: [], practice: { "try-first": freshPractice(), "fresh-case": freshPractice() } };
}

function markViewed(state: ScrollState, id: ContentId) {
  if (!state.viewedIds.includes(id)) state.viewedIds.push(id);
}
function expose(state: ScrollState, id: ContentId, kind: Exposure["kind"], questionId: QuestionId | null = null) {
  const item: Exposure = { id, kind, questionId, sequence: 0 };
  markViewed(state, id);
  if (!state.exposures.some((existing) => exposureKey(existing) === exposureKey(item))) {
    state.exposures.push({ ...item, sequence: ++state.sequence });
  }
}
function viewCard(state: ScrollState, id: ContentId) {
  const card = cardFor(id);
  markViewed(state, card.id);
  if (["idea", "explanation", "feedback"].includes(card.kind)) expose(state, card.id, "instruction");
}
function visit(state: ScrollState) {
  viewCard(state, state.view === "discover" ? DISCOVER_CARDS[state.discoverIndex].id : PATH_CARDS[state.pathIndex].id);
}
function evidence(state: ScrollState, questionId: QuestionId, before = Infinity) {
  const relevant = state.exposures.filter((item) => item.sequence < before && cardFor(item.id).concept === "binary-search");
  return {
    assisted: relevant.length > 0,
    context: relevant.some((item) => item.questionId === questionId) ? "with-help" as const : relevant.length ? "after-instruction" as const : "try-first" as const,
    exposureIds: [...new Set(relevant.map((item) => item.id))]
  };
}

/** Pure, copy-on-transition state. A selection is only checked on explicit submit. */
export function transition(previous: ScrollState, action: ScrollAction): ScrollState {
  const state = structuredClone(previous);
  if (action.type === "visit") visit(state);
  else if (action.type === "view" && ["discover", "path"].includes(action.view)) { state.view = action.view; visit(state); }
  else if ((action.type === "navigate" || action.type === "open") && Number.isInteger(action.index)) {
    if (action.type === "open") {
      if (!["discover", "path"].includes(action.view)) return state;
      state.view = action.view;
    }
    if (state.view === "discover") state.discoverIndex = Math.max(0, Math.min(DISCOVER_CARDS.length - 1, action.index));
    else state.pathIndex = Math.max(0, Math.min(PATH_CARDS.length - 1, action.index));
    visit(state);
  } else if (action.type === "navigation" && ["scroll", "buttons"].includes(action.navigation)) state.navigation = action.navigation;
  else if ((action.type === "toggle-save" || action.type === "source") && isContent(action.id)) {
    if (action.type === "source") expose(state, action.id, "source");
    else { viewCard(state, action.id); state.savedIds = state.savedIds.includes(action.id) ? state.savedIds.filter((id) => id !== action.id) : [...state.savedIds, action.id]; }
  } else if ("questionId" in action && isQuestion(action.questionId)) {
    const id = action.questionId, practice = state.practice[id];
    markViewed(state, questionCard(id));
    if (action.type === "mode" && ["private", "draft", "choice"].includes(action.mode)) practice.mode = action.mode;
    if (action.type === "draft" && typeof action.value === "string") practice.draft = action.value.slice(0, 2000);
    if (action.type === "select" && !practice.attempt && QUESTIONS[id].options.some((option) => option.id === action.choiceId)) practice.choiceId = action.choiceId;
    if (action.type === "private") practice.privateReflection = true;
    if (action.type === "skip") practice.skipped = true;
    if (action.type === "hint" || action.type === "reveal") {
      if (action.type === "hint") practice.helpRevealed = true;
      else practice.answerRevealed = true;
      expose(state, questionCard(id), action.type === "hint" ? "hint" : "answer", id);
    }
    if (action.type === "submit" && practice.mode === "choice" && practice.choiceId !== null && !practice.attempt) {
      practice.attempt = { choiceId: practice.choiceId, correct: practice.choiceId === QUESTIONS[id].correctOptionId, ...evidence(state, id), sequence: ++state.sequence };
      // The UI shows checked feedback on submit. Keep it after the immutable observation.
      practice.answerRevealed = true;
      expose(state, questionCard(id), "answer", id);
    }
  }
  return state;
}

export function summarize(state: ScrollState) {
  const practices = QUESTION_IDS.map((id) => state.practice[id]);
  const attempts = practices.flatMap((practice) => practice.attempt ? [practice.attempt] : []);
  return {
    viewed: state.viewedIds.length, exposed: new Set(state.exposures.map((item) => item.id)).size, saved: state.savedIds.length,
    submitted: attempts.length, correct: attempts.filter((attempt) => attempt.correct).length, assisted: attempts.filter((attempt) => attempt.assisted).length,
    privateReflections: practices.filter((practice) => practice.privateReflection).length,
    drafts: practices.filter((practice) => practice.draft.trim()).length,
    skipped: practices.filter((practice) => practice.skipped && !practice.attempt).length,
    unanswered: practices.filter((practice) => !practice.attempt).length,
    reachedEnd: state.viewedIds.includes("path-close"), laterChecks: 0 as const
  };
}

export type CheckpointResult = { status: "empty" } | { status: "ready"; state: ScrollState } | { status: "invalid" | "unsupported" | "unavailable"; error: string };
const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const keys = (value: unknown, expected: string[]): value is Record<string, unknown> => object(value) && Object.keys(value).length === expected.length && expected.every((key) => Object.hasOwn(value, key));
const unique = (values: unknown[]) => new Set(values).size === values.length;
const contentList = (value: unknown): value is ContentId[] => Array.isArray(value) && value.length <= ALL_CARDS.length && value.every(isContent) && unique(value);
const integer = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function validCheckpoint(value: unknown): value is ScrollState {
  if (!keys(value, ["version", "view", "navigation", "discoverIndex", "pathIndex", "savedIds", "viewedIds", "sequence", "exposures", "practice"])) return false;
  if (value.version !== 1 || !["discover", "path"].includes(value.view as string) || !["scroll", "buttons"].includes(value.navigation as string)) return false;
  if (!integer(value.discoverIndex, 0, DISCOVER_CARDS.length - 1) || !integer(value.pathIndex, 0, PATH_CARDS.length - 1) || !integer(value.sequence, 0, 40)) return false;
  if (!contentList(value.savedIds) || !contentList(value.viewedIds)) return false;
  const viewedIds = value.viewedIds;
  if (value.savedIds.some((id) => !viewedIds.includes(id))) return false;
  if (!Array.isArray(value.exposures) || value.exposures.length > 24 || !keys(value.practice, [...QUESTION_IDS])) return false;
  for (const item of value.exposures) {
    if (!keys(item, ["id", "kind", "questionId", "sequence"]) || !isContent(item.id) || !value.viewedIds.includes(item.id) || !integer(item.sequence, 1, value.sequence)) return false;
    if (item.kind === "hint" || item.kind === "answer") { if (!isQuestion(item.questionId) || questionCard(item.questionId) !== item.id) return false; }
    else if ((item.kind !== "source" && item.kind !== "instruction") || item.questionId !== null) return false;
    if (item.kind === "instruction" && !["idea", "explanation", "feedback"].includes(cardFor(item.id).kind)) return false;
  }
  const state = value as unknown as ScrollState;
  if (!unique(state.exposures.map(exposureKey)) || state.exposures.some((item, i) => i > 0 && item.sequence <= state.exposures[i - 1].sequence)) return false;
  const sequences = state.exposures.map((item) => item.sequence);
  for (const id of QUESTION_IDS) {
    const practice = value.practice[id];
    if (!keys(practice, ["mode", "draft", "choiceId", "privateReflection", "helpRevealed", "answerRevealed", "skipped", "attempt"])) return false;
    if (!["private", "draft", "choice"].includes(practice.mode as string) || typeof practice.draft !== "string" || practice.draft.length > 2000) return false;
    if (practice.choiceId !== null && !QUESTIONS[id].options.some((option) => option.id === practice.choiceId)) return false;
    if (![practice.privateReflection, practice.helpRevealed, practice.answerRevealed, practice.skipped].every((flag) => typeof flag === "boolean")) return false;
    if (practice.helpRevealed !== state.exposures.some((item) => item.kind === "hint" && item.questionId === id) || practice.answerRevealed !== state.exposures.some((item) => item.kind === "answer" && item.questionId === id)) return false;
    if (!same(practice, freshPractice()) && !state.viewedIds.includes(questionCard(id))) return false;
    const attempt = practice.attempt;
    if (attempt !== null) {
      if (!keys(attempt, ["choiceId", "correct", "assisted", "context", "exposureIds", "sequence"]) || !integer(attempt.sequence, 1, state.sequence) || attempt.choiceId !== practice.choiceId || !QUESTIONS[id].options.some((option) => option.id === attempt.choiceId)) return false;
      const expected = evidence(state, id, attempt.sequence);
      if (attempt.correct !== (attempt.choiceId === QUESTIONS[id].correctOptionId) || attempt.assisted !== expected.assisted || attempt.context !== expected.context || !same(attempt.exposureIds, expected.exposureIds)) return false;
      sequences.push(attempt.sequence);
    }
  }
  // Every instructional view has an exposure; chronological evidence cannot be dropped on restore.
  if (state.viewedIds.some((id) => ["idea", "explanation", "feedback"].includes(cardFor(id).kind) && !state.exposures.some((item) => item.id === id))) return false;
  if (sequences.length !== state.sequence || !unique(sequences) || sequences.some((number) => number > sequences.length)) return false;
  return true;
}

/** No legacy inference: an unsupported checkpoint stays untouched until explicit user recovery. */
export function parseCheckpoint(raw: string | null): CheckpointResult {
  if (raw === null) return { status: "empty" };
  try {
    if (raw.length > 64000) throw new Error("Checkpoint is too large.");
    const value: unknown = JSON.parse(raw);
    if (object(value) && typeof value.version === "number" && value.version !== 1) return { status: "unsupported", error: "This saved session uses an unsupported version. It has been left untouched." };
    if (!validCheckpoint(value)) throw new Error("Checkpoint does not match the learning evidence contract.");
    return { status: "ready", state: structuredClone(value) };
  } catch {
    return { status: "invalid", error: "The saved session could not be validated. It has been left untouched." };
  }
}
export function loadCheckpoint(storage: Pick<Storage, "getItem">): CheckpointResult {
  try { return parseCheckpoint(storage.getItem(STORAGE_KEY)); }
  catch { return { status: "unavailable", error: "Saved progress could not be read on this device." }; }
}
type SaveResult = { ok: true } | { ok: false; error: string };
/** Call only after the learner explicitly chooses to replace the previous checkpoint.
 * A single localStorage setItem preserves the old value if the replacement fails. */
export function replaceCheckpoint(storage: Pick<Storage, "setItem">, state: ScrollState): SaveResult {
  try {
    if (!validCheckpoint(state)) return { ok: false, error: "This session could not be validated and was not saved." };
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch { return { ok: false, error: "Progress could not be saved on this device. Keep this tab open to continue this session." }; }
}
export function saveCheckpoint(storage: Pick<Storage, "getItem" | "setItem">, state: ScrollState): SaveResult {
  const existing = loadCheckpoint(storage);
  if (existing.status !== "empty" && existing.status !== "ready") return { ok: false, error: existing.error };
  return replaceCheckpoint(storage, state);
}
