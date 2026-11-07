import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Bookmark, BookOpen, Brain, Check, CheckCircle2, ChevronRight, Circle, Info, Pause, Play, RotateCcw, X, AlertCircle } from "lucide-react";
import { ALL_CARDS, DISCOVER_CARDS, PATH_CARDS, QUESTIONS, type LearningCard, type QuestionId } from "./content";
import { createInitialState, loadCheckpoint, replaceCheckpoint as replaceStoredCheckpoint, saveCheckpoint, summarize, transition, type Attempt, type PracticeState, type ScrollAction, type ScrollState } from "./model";
import "./scroll-learning.css";

interface ScrollingLearningPageProps {
  onExit: () => void;
  onOpenCourse: () => void;
}

type Panel = "source" | "why" | "saved" | "activity" | "recovery" | "leave";
type SaveState = { status: "saving" | "saved" | "error"; message: string };
const plural = (n: number, singular: string, many = `${singular}s`) => `${n} ${n === 1 ? singular : many}`;

function readSession() {
  let loaded: ReturnType<typeof loadCheckpoint>;
  try { loaded = loadCheckpoint(window.localStorage); }
  catch { loaded = { status: "unavailable", error: "Saved progress could not be read on this device." }; }
  let state = loaded.status === "ready" ? loaded.state : createInitialState();
  const navigation = new URLSearchParams(window.location.search).get("navigation");
  if (navigation === "buttons" || navigation === "scroll") state = transition(state, { type: "navigation", navigation });
  state = transition(state, { type: "visit" });
  return { state, restored: loaded.status === "ready", blocked: loaded.status === "invalid" || loaded.status === "unsupported", error: "error" in loaded ? loaded.error : null };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function ArrayStrip({ values, middle, low = 0, high = values.length - 1, found = false }: { values: readonly number[]; middle?: number; low?: number; high?: number; found?: boolean }) {
  return <ol className="sl-array" aria-label="Values in order">
    {values.map((value, index) => <li key={`${index}-${value}`} className={["sl-value", index < low || index > high ? "is-discarded" : "", middle === index ? "is-middle" : "", middle === index && found ? "is-found" : ""].join(" ")} aria-label={`${value}${middle === index ? found ? ", found" : ", current comparison" : ""}${index < low || index > high ? ", ruled out" : ""}`}>
      <span>{value}</span>{middle === index && found && <Check aria-hidden="true" size={13} />}
    </li>)}
  </ol>;
}

function searchFrames(card: LearningCard) {
  if (card.diagram === "scan") {
    const match = card.values.indexOf(card.target);
    return card.values.slice(0, match + 1).map((value, index) => ({ low: index, high: card.values.length - 1, middle: index, found: value === card.target, text: value === card.target ? `${value} matches. Found after ${index + 1} comparisons.` : `Check ${value}. It is not ${card.target}, so move one place along.` }));
  }
  const frames: { low: number; high: number; middle: number; found: boolean; text: string }[] = [];
  let low = 0, high = card.values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2), value = card.values[middle];
    const prefix = frames.length ? "Keep the remaining candidates. " : "Start with the middle. ";
    frames.push({ low, high, middle, found: false, text: `${prefix}Compare ${value} with the target, ${card.target}.` });
    if (value === card.target) {
      frames.push({ low: middle, high: middle, middle, found: true, text: `${value} matches. Found after ${frames.length} comparisons; the other values were ruled out.` });
      break;
    }
    if (value < card.target) low = middle + 1;
    else high = middle - 1;
  }
  return frames;
}

function SearchDemo({ card, suspended, reduced }: { card: LearningCard; suspended: boolean; reduced: boolean }) {
  const frames = searchFrames(card);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = frames[Math.min(step, frames.length - 1)];
  useEffect(() => {
    if (reduced || suspended) setPlaying(false);
  }, [reduced, suspended]);
  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  useEffect(() => {
    if (!playing || suspended || reduced) return;
    if (step === frames.length - 1) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStep((value) => Math.min(value + 1, frames.length - 1)), 1750);
    return () => window.clearTimeout(timer);
  }, [playing, suspended, reduced, step, frames.length]);
  return <section className="sl-demo" aria-label={card.diagram === "scan" ? "Linear search demonstration" : "Binary search demonstration"} data-gesture-lock>
    <div className="sl-demo-label"><span>Find <strong>{card.target}</strong></span><span>{card.diagram === "scan" ? "Unsorted values" : "Sorted values"}</span></div>
    <ArrayStrip values={card.values} {...current} />
    <p className="sl-demo-caption" aria-live={playing ? "off" : "polite"}>{current.text}</p>
    <div className="sl-demo-controls">
      <button className="sl-icon-button" type="button" aria-label={playing ? "Pause demonstration" : step === frames.length - 1 ? "Replay demonstration" : "Play demonstration"} disabled={reduced} onClick={() => { if (step === frames.length - 1) setStep(0); setPlaying((value) => !value); }}>
        {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <div className="sl-step-dots" aria-label={`Demonstration step ${step + 1} of ${frames.length}`}>{frames.map((_, i) => <span key={i} className={i <= step ? "is-filled" : ""} />)}</div>
      <button className="sl-text-button" type="button" disabled={step === frames.length - 1} onClick={() => { setPlaying(false); setStep((value) => Math.min(value + 1, frames.length - 1)); }} aria-label="Next demonstration step">Step <ChevronRight size={16} aria-hidden="true" /></button>
      <button className="sl-icon-button" type="button" aria-label="Restart demonstration" onClick={() => { setPlaying(false); setStep(0); }}><RotateCcw size={16} aria-hidden="true" /></button>
    </div>
    {reduced && <p className="sl-small sl-demo-note">Reduced motion is on. Use Step to explore.</p>}
  </section>;
}

function StackDemo() {
  const [mode, setMode] = useState<"stack" | "queue">("stack");
  const [taken, setTaken] = useState<number[]>([]);
  const remaining = [1, 2, 3].filter((value) => !taken.includes(value));
  const next = mode === "stack" ? remaining.at(-1) : remaining[0];
  return <section className="sl-demo sl-stack-demo" data-gesture-lock aria-label="Stack and queue demonstration">
    <div className="sl-mini-switch" aria-label="Item order">
      <button type="button" aria-pressed={mode === "stack"} onClick={() => { setMode("stack"); setTaken([]); }}>Stack</button>
      <button type="button" aria-pressed={mode === "queue"} onClick={() => { setMode("queue"); setTaken([]); }}>Queue</button>
    </div>
    <div className="sl-stack-visual" aria-label={`Items arrived in order 1, 2, 3. ${taken.length ? `Taken: ${taken.join(", ")}.` : "None taken yet."}`}>
      {[1, 2, 3].map((value) => <div key={value} className={`sl-ticket ${taken.includes(value) ? "is-taken" : ""} ${next === value ? "is-next" : ""}`}><span>ITEM</span><strong>0{value}</strong><small>{value === 1 ? "oldest" : value === 3 ? "newest" : "waiting"}</small></div>)}
    </div>
    <p className="sl-demo-caption" aria-live="polite">{taken.length ? `Took item ${taken.at(-1)}. ` : ""}{mode === "stack" ? "Newest goes first. Think Undo." : "Oldest goes first. Think print queue."}</p>
    <div className="sl-demo-controls"><button className="sl-text-button" type="button" disabled={next === undefined} onClick={() => { if (next !== undefined) setTaken([...taken, next]); }}>Take next item <ArrowRight size={16} aria-hidden="true" /></button><button className="sl-icon-button" type="button" aria-label="Restart demonstration" onClick={() => setTaken([])}><RotateCcw size={16} aria-hidden="true" /></button></div>
  </section>;
}

function AttemptResult({ attempt, questionId }: { attempt: Attempt; questionId: QuestionId }) {
  const context = attempt.context === "try-first" ? "First try" : attempt.context === "with-help" ? "With help" : "After instruction";
  return <div className={`sl-result ${attempt.correct ? "is-correct" : "is-review"}`} data-testid="checked-result" role="status">
    <div className="sl-result-heading">{attempt.correct ? <CheckCircle2 size={19} aria-hidden="true" /> : <Info size={19} aria-hidden="true" />}<strong>{attempt.correct ? "Your choice matches." : "Let’s look at that comparison."}</strong></div>
    <p>{attempt.correct ? QUESTIONS[questionId].explanation : `You chose ${QUESTIONS[questionId].options.find((option) => option.id === attempt.choiceId)?.label}. ${QUESTIONS[questionId].explanation}`}</p>
    <span className="sl-evidence-label">Checked choice · {context}</span>
  </div>;
}

function Practice({ card, practice, dispatch, onSkip }: { card: LearningCard; practice: PracticeState; dispatch: (action: ScrollAction) => void; onSkip: () => void }) {
  const questionId = card.questionId!, question = QUESTIONS[questionId];
  const act = (type: "private" | "hint" | "reveal" | "submit") => dispatch({ type, questionId });
  return <div className="sl-practice" data-gesture-lock>
    <div className="sl-question-array"><div className="sl-demo-label"><span>Target <strong>{card.target}</strong></span><span>Middle <strong>{card.values[card.midIndex!]}</strong></span></div><ArrayStrip values={card.values} middle={card.midIndex} /></div>
    <p className="sl-question-prompt" id="sl-question-prompt">{question.prompt}</p>
    <div className="sl-practice-modes" aria-label="How would you like to respond?">
      <button type="button" aria-pressed={practice.mode === "private"} onClick={() => dispatch({ type: "mode", questionId, mode: "private" })}>Think privately</button>
      <button type="button" aria-pressed={practice.mode === "draft"} onClick={() => dispatch({ type: "mode", questionId, mode: "draft" })}>Type an answer</button>
      <button type="button" aria-pressed={practice.mode === "choice"} onClick={() => dispatch({ type: "mode", questionId, mode: "choice" })}>Choose an answer</button>
    </div>
    {practice.mode === "private" && <div className="sl-private-response">
      {practice.privateReflection ? <p className="sl-response-note" role="status"><Check size={18} aria-hidden="true" /><span>Reflection recorded. Your answer stays with you; this is self-reported, not checked.</span></p> : <><p>Take a moment to form your answer.</p><button type="button" className="sl-outline-button" onClick={() => act("private")}>I thought it through <Check size={16} aria-hidden="true" /></button></>}
    </div>}
    {practice.mode === "draft" && <div className="sl-draft-response"><label htmlFor="sl-answer">Your thinking</label><textarea id="sl-answer" rows={3} maxLength={2000} value={practice.draft} placeholder="What could you safely rule out, and why?" onChange={(event) => dispatch({ type: "draft", questionId, value: event.target.value })} /><p className="sl-small">{practice.draft.trim() ? "Written draft · Not checked. Kept in your local session." : "A few words is enough. You can also move on."}</p></div>}
    {practice.mode === "choice" && <fieldset className="sl-choices" aria-describedby="sl-question-prompt"><legend className="sl-sr-only">Choose the remaining values</legend>
      {question.options.map((option) => <label key={option.id} className={practice.choiceId === option.id ? "is-selected" : ""}><input type="radio" name={`choice-${questionId}`} value={option.id} checked={practice.choiceId === option.id} disabled={Boolean(practice.attempt)} onChange={() => dispatch({ type: "select", questionId, choiceId: option.id })} /><span>{option.label}</span></label>)}
      {!practice.attempt && <button type="button" className="sl-primary-button" disabled={!practice.choiceId} onClick={() => act("submit")}>Check answer <ArrowRight size={17} aria-hidden="true" /></button>}
    </fieldset>}
    {practice.attempt && <AttemptResult attempt={practice.attempt} questionId={questionId} />}
    {practice.helpRevealed && !practice.answerRevealed && !practice.attempt && <div className="sl-hint" role="status"><span className="sl-kicker">A small hint</span><p>{question.hint}</p></div>}
    {practice.answerRevealed && !practice.attempt && <div className="sl-result" role="status"><span className="sl-kicker">Explanation revealed</span><p>{question.explanation}</p><span className="sl-evidence-label">{practice.privateReflection ? "Private reflection · Self-reported" : practice.draft.trim() ? "Written draft · Not checked" : "No answer checked"}</span></div>}
    <div className="sl-practice-actions">
      {!practice.helpRevealed && !practice.answerRevealed && !practice.attempt && <button type="button" className="sl-text-button" onClick={() => act("hint")}>Show hint</button>}
      {!practice.answerRevealed && !practice.attempt && <button type="button" className="sl-text-button" onClick={() => act("reveal")}>Reveal explanation <ChevronRight size={16} aria-hidden="true" /></button>}
      {!practice.attempt && <button type="button" className="sl-text-button sl-skip" onClick={onSkip}>Skip for now</button>}
    </div>
  </div>;
}

function SessionSummary({ state }: { state: ScrollState }) {
  const summary = summarize(state);
  return <div className="sl-session-summary" data-testid="session-summary">
    <div className="sl-summary-row"><BookOpen size={19} aria-hidden="true" /><span>{plural(summary.viewed, "card opened", "cards opened")}</span></div>
    <div className="sl-summary-row"><CheckCircle2 size={19} aria-hidden="true" /><span>{plural(summary.submitted, "choice checked", "choices checked")}<small>{plural(summary.correct, "correct choice")}{summary.assisted > 0 ? ` · ${summary.assisted} after instruction or help` : ""}</small></span></div>
    <div className="sl-summary-row"><Circle size={19} aria-hidden="true" /><span>{plural(summary.privateReflections, "private reflection")}<small>Self-reported; no answer checked</small></span></div>
    <div className="sl-summary-row"><BookOpen size={19} aria-hidden="true" /><span>{plural(summary.drafts, "written draft")}<small>Your wording is kept; it has not been graded</small></span></div>
    <p className="sl-summary-footnote">Later recall has not been checked. Opening cards and immediate practice do not establish lasting recall.</p>
  </div>;
}

function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current, previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="sl-sheet" aria-labelledby="sl-sheet-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => {
    if (event.key !== "Tab") return;
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable.at(-1), active = document.activeElement;
    if (!first || !last) { event.preventDefault(); return; }
    if (event.shiftKey && (active === first || !event.currentTarget.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (active === last || !event.currentTarget.contains(active))) { event.preventDefault(); first.focus(); }
  }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <div className="sl-sheet-header"><h2 id="sl-sheet-title">{title}</h2><button type="button" className="sl-icon-button" aria-label="Close panel" onClick={onClose}><X size={21} aria-hidden="true" /></button></div>
    <div className="sl-sheet-body">{children}</div>
  </dialog>;
}

export default function ScrollingLearningPage({ onExit, onOpenCourse }: ScrollingLearningPageProps) {
  const [boot] = useState(readSession);
  const [state, setState] = useState(boot.state);
  const [saveState, setSaveState] = useState<SaveState>({ status: boot.error ? "error" : "saving", message: boot.error ?? "Saving your place…" });
  const [panel, setPanel] = useState<Panel | null>(null);
  const [blocked, setBlocked] = useState(boot.blocked);
  const cardRef = useRef<HTMLElement>(null);
  const wheelBurst = useRef({ accumulated: 0, lastWheel: 0, lastAdvance: 0, consumed: false });
  const leaveRef = useRef(onExit);
  const reduced = useReducedMotion();
  const cards = state.view === "discover" ? DISCOVER_CARDS : PATH_CARDS;
  const index = state.view === "discover" ? state.discoverIndex : state.pathIndex;
  const card = cards[index];
  const saved = state.savedIds.includes(card.id);
  const dispatch = useCallback((action: ScrollAction) => {
    setSaveState({ status: "saving", message: "Saving your place…" });
    setState((previous) => transition(previous, action));
  }, []);
  const persist = useCallback((snapshot: ScrollState) => {
    let result: ReturnType<typeof saveCheckpoint>;
    try { result = saveCheckpoint(window.localStorage, snapshot); }
    catch { result = { ok: false, error: "Progress could not be saved on this device. Keep this tab open to continue this session." }; }
    setSaveState(result.ok ? { status: "saved", message: "Saved on this device" } : { status: "error", message: result.error });
    return result.ok;
  }, []);
  useEffect(() => { persist(state); }, [state, persist]);
  useEffect(() => { if (cardRef.current) cardRef.current.scrollTop = 0; }, [card.id]);
  const navigate = useCallback((direction: number) => dispatch({ type: "navigate", index: index + direction }), [dispatch, index]);

  useEffect(() => {
    const element = cardRef.current;
    if (!element || state.navigation === "buttons" || panel) return;
    const isBlocked = (target: EventTarget | null) => {
      const targetElement = target instanceof Element ? target : null;
      return Boolean(targetElement?.closest("button,a,input,textarea,select,[contenteditable=true],[data-gesture-lock]") || window.getSelection()?.toString() || element.scrollHeight > element.clientHeight + 3);
    };
    const wheel = (event: WheelEvent) => {
      if (isBlocked(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      const burst = wheelBurst.current;
      if (now - burst.lastWheel > 220 && now - burst.lastAdvance > 700) { burst.accumulated = 0; burst.consumed = false; }
      burst.lastWheel = now;
      if (burst.consumed) return;
      if (Math.sign(burst.accumulated) !== Math.sign(event.deltaY)) burst.accumulated = 0;
      burst.accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      if (Math.abs(burst.accumulated) > 65) { navigate(burst.accumulated > 0 ? 1 : -1); burst.consumed = true; burst.lastAdvance = now; }
    };
    let touch: { x: number; y: number; time: number; target: EventTarget | null } | null = null;
    const touchStart = (event: TouchEvent) => { touch = event.touches.length === 1 && !isBlocked(event.target) ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: performance.now(), target: event.target } : null; };
    const touchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1 || performance.now() - touch.time > 650 || isBlocked(touch.target)) return;
      const x = event.touches[0].clientX - touch.x, y = event.touches[0].clientY - touch.y;
      if (Math.abs(y) > 15 && Math.abs(y) > Math.abs(x) * 1.3) event.preventDefault();
    };
    const touchEnd = (event: TouchEvent) => {
      if (!touch) return;
      const start = touch; touch = null;
      if (!event.changedTouches.length || performance.now() - start.time > 1100 || isBlocked(start.target)) return;
      const x = event.changedTouches[0].clientX - start.x, y = event.changedTouches[0].clientY - start.y;
      if (Math.abs(y) > 60 && Math.abs(y) > Math.abs(x) * 1.5) navigate(y < 0 ? 1 : -1);
    };
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isBlocked(event.target)) return;
      if (["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); navigate(event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1); }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("touchstart", touchStart, { passive: true });
    element.addEventListener("touchmove", touchMove, { passive: false });
    element.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("keydown", key);
    return () => { element.removeEventListener("wheel", wheel); element.removeEventListener("touchstart", touchStart); element.removeEventListener("touchmove", touchMove); element.removeEventListener("touchend", touchEnd); window.removeEventListener("keydown", key); };
  }, [card.id, state.navigation, panel, navigate]);

  const requestLeave = (destination: () => void) => { leaveRef.current = destination; if (persist(state)) destination(); else setPanel("leave"); };
  const openSource = () => { dispatch({ type: "source", id: card.id }); setPanel("source"); };
  const switchView = (view: ScrollState["view"]) => dispatch({ type: "view", view });
  const toggleNavigation = () => {
    const navigation = state.navigation === "scroll" ? "buttons" : "scroll";
    const url = new URL(window.location.href); url.searchParams.set("navigation", navigation);
    window.history.replaceState(window.history.state, "", url);
    dispatch({ type: "navigation", navigation });
  };
  const followPath = () => switchView("path");
  const openSaved = (item: LearningCard) => {
    const view = item.id.startsWith("discover-") ? "discover" : "path";
    dispatch({ type: "open", view, index: (view === "discover" ? DISCOVER_CARDS : PATH_CARDS).findIndex((entry) => entry.id === item.id) });
    setPanel(null);
  };
  const replaceCheckpoint = () => {
    try {
      const result = replaceStoredCheckpoint(window.localStorage, state);
      setSaveState(result.ok ? { status: "saved", message: "Saved on this device" } : { status: "error", message: result.error });
      if (result.ok) { setBlocked(false); setPanel(null); }
    }
    catch { setSaveState({ status: "error", message: "The previous checkpoint could not be replaced. Your open session is still here." }); }
  };
  const panelTitle: Record<Panel, string> = { source: "Source", why: "Why this?", saved: "Saved ideas", activity: "Activity", recovery: "Start a new checkpoint?", leave: "Your place is not saved yet" };

  return <div className="sl-page">
    <a className="sl-skip-link" href="#sl-active-card">Skip to the learning card</a>
    <header className="sl-header">
      <div className="sl-brand"><button type="button" className="sl-icon-button sl-back" aria-label="Save and leave" onClick={() => requestLeave(onExit)}><ArrowLeft size={20} aria-hidden="true" /></button><span className="sl-brand-symbol" aria-hidden="true"><Brain size={24} /></span><span>brain<wbr />builder<span className="sl-brand-subtitle">A little, often.</span></span></div>
      <div className="sl-tabs" role="tablist" aria-label="Learning view"><button type="button" role="tab" aria-selected={state.view === "discover"} aria-controls="sl-active-card" onClick={() => switchView("discover")}>Discover</button><button type="button" role="tab" aria-selected={state.view === "path"} aria-controls="sl-active-card" onClick={() => switchView("path")}>My path</button></div>
      <div className="sl-header-actions"><button type="button" className="sl-icon-button" aria-label="Saved ideas" onClick={() => setPanel("saved")}><Bookmark size={20} aria-hidden="true" /><span className="sl-desktop-label">Saved</span>{state.savedIds.length > 0 && <span className="sl-count">{state.savedIds.length}</span>}</button><button type="button" className="sl-icon-button" aria-label="Activity" onClick={() => setPanel("activity")}><Activity size={20} aria-hidden="true" /><span className="sl-desktop-label">Activity</span></button></div>
    </header>

    <main className="sl-workspace">
      <aside className="sl-context" aria-label="Session overview">
        <span className="sl-kicker">LEARNING, IN SMALL MOMENTS</span>
        <h2>{state.view === "discover" ? <>Room for<br /><em>one new idea.</em></> : <>One idea.<br /><em>A little deeper.</em></>}</h2>
        <p>{state.view === "discover" ? "A few useful ideas to carry into your day. Explore at your own pace." : "Why sorted data lets you leave half the work behind. Think, explore, then try a fresh case."}</p>
        <div className="sl-session-line"><span className="sl-line-marker" /><span>{state.view === "discover" ? "3 ideas" : "5 short cards"} <span aria-hidden="true">·</span> A clear place to stop</span></div>
        <nav className="sl-outline-nav" aria-label={state.view === "discover" ? "Ideas in this session" : "Cards in this path"}>{cards.map((item, position) => <button key={item.id} type="button" aria-current={position === index ? "step" : undefined} onClick={() => dispatch({ type: "navigate", index: position })}><span className={`sl-outline-number ${state.viewedIds.includes(item.id) ? "is-seen" : ""}`}>{String(position + 1).padStart(2, "0")}</span><span>{state.view === "discover" ? item.concept === "linear-search" ? "One at a time" : item.concept === "binary-search" ? "Halve the search" : "Choose the order" : item.eyebrow.split(" / ")[1]}</span>{position === index && <ArrowRight size={16} aria-hidden="true" />}</button>)}</nav>
        <div className="sl-context-bottom"><span className="sl-tiny-grid" aria-hidden="true">✦</span><p>Curiosity sets the pace.<br />You choose when to stop.</p></div>
      </aside>

      <section className="sl-stage" aria-label="Learning feed">
        <div className="sl-stage-heading"><span>{state.view === "discover" ? "YOUR DAILY CURIOSITY" : "BINARY SEARCH · YOUR PATH"}</span><span>{String(index + 1).padStart(2, "0")} <span className="sl-muted">/ {String(cards.length).padStart(2, "0")}</span></span></div>
        <article ref={cardRef} id="sl-active-card" className={`sl-card sl-${card.kind} ${state.view === "discover" ? `sl-tone-${card.diagram}` : "sl-tone-paper"}`} tabIndex={-1} aria-labelledby="sl-card-title" data-testid="learning-card" data-card-id={card.id}>
          <div className="sl-card-content" key={card.id}>
            <div className="sl-card-topline"><span className="sl-kicker">{card.eyebrow}</span><span className="sl-content-type">{card.kind === "idea" ? "ONE USEFUL IDEA" : card.kind === "question" ? "OPTIONAL PRACTICE" : card.kind === "close" ? "SESSION END" : "CONNECT THE DOTS"}</span></div>
            <div className="sl-card-copy"><h1 id="sl-card-title">{card.title}</h1><p className="sl-card-description">{card.body}</p></div>

            {card.kind === "idea" && <><div className="sl-discovery-visual">{card.diagram === "stack" ? <StackDemo /> : <SearchDemo key={card.id} card={card} suspended={Boolean(panel)} reduced={reduced} />}</div><div className="sl-discovery-cta"><button type="button" className="sl-primary-button" onClick={followPath}>{state.pathIndex > 0 ? "Continue my path" : "Try binary search"}<ArrowUpRight size={18} aria-hidden="true" /></button><span className="sl-small">5 cards · Think it through</span></div>{index === cards.length - 1 && <p className="sl-end-note">That’s the last of these three ideas. A good moment to pause.</p>}</>}

            {card.kind === "question" && <Practice card={card} practice={state.practice[card.questionId!]} dispatch={dispatch} onSkip={() => { dispatch({ type: "skip", questionId: card.questionId! }); navigate(1); }} />}

            {card.kind === "explanation" && <><SearchDemo key={card.id} card={card} suspended={Boolean(panel)} reduced={reduced} /><div className="sl-takeaway"><span className="sl-kicker">TAKE IT WITH YOU</span><p>Every comparison keeps the possible, and rules out the impossible.</p></div></>}

            {card.kind === "feedback" && <><div className="sl-question-array"><div className="sl-demo-label"><span>Target <strong>{card.target}</strong></span><span>Keep these candidates</span></div><ArrayStrip values={card.values} low={card.midIndex! + 1} /></div>{state.practice["fresh-case"].attempt ? <AttemptResult attempt={state.practice["fresh-case"].attempt!} questionId="fresh-case" /> : <div className="sl-result"><span className="sl-kicker">YOUR FRESH CASE</span><p>{state.practice["fresh-case"].privateReflection ? "You recorded a private reflection." : state.practice["fresh-case"].draft.trim() ? "You kept a written draft." : "No answer was submitted for checking."}</p><span className="sl-evidence-label">{state.practice["fresh-case"].privateReflection ? "Self-reported · Not checked" : "Not checked"}</span></div>}<div className="sl-takeaway"><span className="sl-kicker">THE REUSABLE IDEA</span><p>Sorted order makes ruling out half safe. On unsorted data, that shortcut can lose the answer.</p></div></>}

            {card.kind === "close" && <><div className="sl-finish-mark" aria-hidden="true"><Check size={31} /></div><SessionSummary state={state} /><div className="sl-finish-actions"><button type="button" className="sl-primary-button" onClick={() => requestLeave(onExit)}>Save and leave <Check size={18} aria-hidden="true" /></button><button type="button" className="sl-outline-button" onClick={() => requestLeave(onOpenCourse)}>Open the full course <ArrowUpRight size={18} aria-hidden="true" /></button></div><p className="sl-small">Your place, drafts and first checked choices stay on this device.</p></>}

            {card.kind !== "close" && <footer className="sl-card-footer"><button type="button" className="sl-card-action" aria-label={saved ? "Unsave idea" : "Save idea"} aria-pressed={saved} onClick={() => dispatch({ type: "toggle-save", id: card.id })}><Bookmark size={18} fill={saved ? "currentColor" : "none"} aria-hidden="true" />{saved ? "Saved" : "Save"}</button><button type="button" className="sl-card-action" onClick={openSource}><BookOpen size={18} aria-hidden="true" />Source</button><button type="button" className="sl-card-action" onClick={() => setPanel("why")}><Info size={18} aria-hidden="true" />Why this?</button></footer>}
          </div>
        </article>
        <div className="sl-feed-navigation"><button type="button" className="sl-nav-button" aria-label="Previous card" disabled={index === 0} onClick={() => navigate(-1)}><ArrowUp size={18} aria-hidden="true" /><span>Previous</span></button><span className="sl-navigation-hint">{index === cards.length - 1 ? "A good place to stop" : state.navigation === "buttons" ? "One card at a time" : "Scroll, swipe or tap"}</span><button type="button" className="sl-nav-button" aria-label="Next card" disabled={index === cards.length - 1} onClick={() => navigate(1)}><span>Next</span><ArrowDown size={18} aria-hidden="true" /></button></div>
      </section>
    </main>

    <footer className={`sl-page-footer ${saveState.status === "error" ? "has-error" : ""}`}>
      <div className="sl-checkpoint" data-testid="checkpoint-status" role="status">{saveState.status === "error" ? <AlertCircle size={15} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}<span>{saveState.status === "error" ? saveState.message : `${boot.restored ? "Place restored · " : ""}${saveState.message}`}</span>{saveState.status === "error" && <button type="button" onClick={() => persist(state)}>Retry saving</button>}{blocked && <button type="button" onClick={() => setPanel("recovery")}>Recovery options</button>}</div>
      <button type="button" className="sl-mode-control" aria-label={`Navigation mode: ${state.navigation === "buttons" ? "Buttons only" : "Scroll and buttons"}. Switch mode`} onClick={toggleNavigation}><span className="sl-mode-dot" />{state.navigation === "buttons" ? "Buttons only" : "Scroll + buttons"}</button>
    </footer>
    <div className="sl-sr-only" aria-live="polite" aria-atomic="true">{card.eyebrow}. {card.title}</div>

    {panel && <Sheet title={panelTitle[panel]} onClose={() => setPanel(null)}>
      {panel === "source" && <><span className="sl-kicker">WHERE THIS IDEA COMES FROM</span><h3>{card.source.label}</h3><p>{card.concept === "binary-search" ? "The course explains why binary search requires sorted input, how midpoint comparisons shrink the search, and how to keep the bounds correct." : card.concept === "linear-search" ? "The course introduces scanning each item in order, stopping at a match, and the trade-offs of a linear scan." : "The course defines the stack’s last-in, first-out order and the queue’s first-in, first-out order."}</p><a className="sl-primary-button" href={card.source.href} target="_blank" rel="noreferrer">Read the course source <ArrowUpRight size={17} aria-hidden="true" /></a><p className="sl-small">Opens the source lesson in a new tab. If you answer after reviewing this explanation, that context is kept with your checked choice.</p><div className="sl-takeaway"><span className="sl-kicker">TEXT EQUIVALENT</span><p>{card.body}</p>{card.diagram !== "stack" && <p>{card.kind === "question" ? QUESTIONS[card.questionId!].explanation : card.concept === "binary-search" ? "Compare the target with the middle of the sorted values. A greater target leaves the values to the right; a smaller target leaves those to the left. Repeat until a match is found or no candidates remain." : "Start with the first value. Compare it with the target, then move to the next value if it does not match. Stop at the first match or after checking every value."}</p>}</div></>}
      {panel === "why" && <><span className="sl-kicker">A SMALL, DELIBERATE SEQUENCE</span><h3>{state.view === "discover" ? "A useful way to think about search." : "Build on one idea, one step at a time."}</h3><p>{state.view === "discover" ? "These three ideas introduce different ways to search and order information. The sequence is curated and stays the same when you switch navigation modes." : "This five-card path invites an initial thought, explains the idea, offers a fresh example, and finishes with a record of what you did."}</p><p>There is no personalised ranking here. Opening a card is recorded as a view. Only an answer you explicitly submit is checked.</p><div className="sl-takeaway"><span className="sl-kicker">YOUR PACE</span><p>You can skip a practice, save an idea, or leave at any time. Nothing advances automatically.</p></div></>}
      {panel === "saved" && <>{state.savedIds.length ? <><p>{plural(state.savedIds.length, "saved idea")} {saveState.status === "saved" ? "on this device." : "in this open session. Checkpoint saving is not confirmed."}</p><ul className="sl-saved-list">{state.savedIds.map((id) => { const item = ALL_CARDS.find((entry) => entry.id === id)!; return <li key={id}><button type="button" aria-label={item.title} onClick={() => openSaved(item)}><span><small>{item.eyebrow}</small><strong>{item.title}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></button><button type="button" className="sl-icon-button" aria-label={`Unsave ${item.title}`} onClick={() => dispatch({ type: "toggle-save", id })}><X size={18} aria-hidden="true" /></button></li>; })}</ul></> : <div className="sl-empty-state"><Bookmark size={30} aria-hidden="true" /><h3>Keep an idea for later.</h3><p>Tap Save on a card. Your collection will be here when you return on this device.</p></div>}</>}
      {panel === "activity" && <><p>A record of this local session, including earlier visits to these cards.</p><SessionSummary state={state} /><p className="sl-small">The first submitted choice for each practice is kept. Reviewing an explanation later does not change that recorded result.</p></>}
      {panel === "recovery" && <><p>The previous saved data could not be read safely. It has been left untouched, and you can continue in this tab.</p><p>Replacing it will remove that previous local checkpoint and save the session currently open. It will not affect your other Brainbuilder course data.</p><div className="sl-sheet-actions"><button type="button" className="sl-primary-button" onClick={replaceCheckpoint}>Replace saved checkpoint</button><button type="button" className="sl-outline-button" onClick={() => setPanel(null)}>Keep previous data</button></div></>}
      {panel === "leave" && <><p>{saveState.message}</p><p>Your current work is still available in this tab. Try saving again before you leave.</p><div className="sl-sheet-actions"><button type="button" className="sl-primary-button" onClick={() => { if (persist(state)) leaveRef.current(); }}>Retry saving and leave</button><button type="button" className="sl-outline-button" onClick={() => setPanel(null)}>Keep learning</button><button type="button" className="sl-text-button" onClick={() => leaveRef.current()}>Leave without saving</button></div></>}
    </Sheet>}
  </div>;
}
