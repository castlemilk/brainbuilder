import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildAlgorithmsDataStructuresCourse } from "@brainbuilder/courseware";
import { buildLearningHome } from "@brainbuilder/learning-model";
import App from "./App";

describe("Brainbuilder web app", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("renders the dashboard, feed, path, and play surfaces from the wireframes", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /good morning, alex/i })).toBeInTheDocument();
    expect(screen.getByText(/why binary search is o\(log n\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/algorithms 101/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sort it: bubble sort/i)).toBeInTheDocument();
    expect(screen.getByText(/diamond league/i)).toBeInTheDocument();
  });

  it("navigates as a SPA into browse search and topic drilldown pages", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(screen.getByRole("navigation", { name: /^main$/i })).getByRole("link", { name: /browse/i }));
    expect(window.location.pathname).toBe("/browse");
    expect(screen.getByRole("heading", { name: /browse learning/i })).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: /search all learning/i }), "tree");
    expect(screen.getByText(/3 results for "tree"/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /open data structures/i }));
    expect(window.location.pathname).toBe("/topics/data-structures");
    expect(screen.getByRole("heading", { level: 1, name: /^data structures$/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /trees module/i }));
    expect(screen.getByText(/micro lesson queue/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /practice trace tree height/i })).toHaveAttribute("href", "/play?lab=tree-height-lab");
  });

  it("keeps feed, practice, library, and progress as isolated routed surfaces", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: /^feed$/i }));
    expect(window.location.pathname).toBe("/feed");
    expect(screen.getByRole("heading", { name: /learning feed/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /browse learning/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /^play$/i }));
    expect(window.location.pathname).toBe("/play");
    expect(screen.getByRole("heading", { name: /practice arcade/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /library/i }));
    expect(window.location.pathname).toBe("/library");
    expect(screen.getByRole("heading", { name: /multimodal library/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /you/i }));
    expect(window.location.pathname).toBe("/progress");
    expect(screen.getByRole("heading", { name: /your learning momentum/i })).toBeInTheDocument();
  });

  it("opens a full course framework with lesson drilldowns and renderer capabilities", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(screen.getByRole("navigation", { name: /^main$/i })).getByRole("link", { name: /browse/i }));
    await user.click(screen.getByRole("link", { name: /open algorithms & data structures course/i }));

    expect(window.location.pathname).toBe("/courses/algorithms-data-structures");
    expect(screen.getByRole("heading", { level: 1, name: /algorithms & data structures/i })).toBeInTheDocument();
    expect(screen.getByText(/8 units/i)).toBeInTheDocument();
    expect(screen.getByText(/24 micro lessons/i)).toBeInTheDocument();
    expect(screen.getByText(/d3/i)).toBeInTheDocument();
    expect(screen.getByText(/three/i)).toBeInTheDocument();
    expect(screen.getByText(/skia/i)).toBeInTheDocument();
    expect(screen.getByText(/anime/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /binary search invariants/i }));
    expect(window.location.pathname).toBe("/courses/algorithms-data-structures/lessons/binary-search-invariants");
    expect(screen.getByRole("heading", { level: 1, name: /binary search invariants/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /d3 binary search window/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /learning loop/i })).toBeInTheDocument();
    expect(screen.getByText(/the sorted window is the contract/i)).toBeInTheDocument();
    expect(screen.getByText(/say why the discarded half cannot contain the target/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /keep the target inside/i }));
    expect(screen.getByText(/right.*remaining sorted window/i)).toBeInTheDocument();
  });

  it("renders advanced interactive course blocks for three-dimensional and grid practice", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures/lessons/tree-rotations");
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: /tree rotations/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /three tree rotation scene/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /rotate left/i }));
    expect(screen.getByText(/inorder preserved/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /dp grid fill/i }));
    expect(screen.getByRole("img", { name: /dp grid fill/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /fill next cell/i }));
    expect(screen.getByText(/dependencies satisfied/i)).toBeInTheDocument();
  });

  it("renders an animated teaching stage for every algorithms lesson", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const lessons = course.units.flatMap((unit) => unit.lessons);

    for (const lesson of lessons) {
      window.history.pushState({}, "", `/courses/algorithms-data-structures/lessons/${lesson.id}`);
      const view = render(<App />);

      const stage = document.querySelector("[data-animated-stage], [data-animated-diagram]");
      expect(stage, `${lesson.id} should expose a stateful animated learning stage`).not.toBeNull();

      view.unmount();
    }
  });

  it("makes generic course stages interactive instead of renderer placeholders", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures/lessons/hash-table-load");
    render(<App />);

    const hashStage = document.querySelector("[data-animated-stage='hash-collision-motion']");
    expect(hashStage).not.toBeNull();
    expect(hashStage).toHaveAttribute("data-stage-step", "0");
    const article = hashStage?.closest("article");
    expect(article).not.toBeNull();

    await user.click(within(article as HTMLElement).getByRole("button", { name: /^next stage$/i }));
    expect(hashStage).toHaveAttribute("data-stage-step", "1");
    expect(screen.getAllByText(/collision pressure/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("hash-collision-timeline")).not.toBeInTheDocument();
  });

  it("deduplicates shared controls inside generic animated stages", () => {
    window.history.pushState({}, "", "/courses/algorithms-data-structures/lessons/linked-list-pointers");
    render(<App />);

    const labStage = document.querySelector("[data-animated-stage='linked-list-lab']");
    expect(labStage).not.toBeNull();
    const article = labStage?.closest("article");
    expect(article).not.toBeNull();

    expect(within(article as HTMLElement).getAllByRole("button", { name: /^reset stage$/i })).toHaveLength(1);
  });

  it("exposes selected state for quiz answers and tactile sorting choices", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures/lessons/big-o-as-shape");
    const lessonView = render(<App />);

    const wrongAnswer = screen.getByRole("button", { name: /the exact runtime on your laptop/i });
    await user.click(wrongAnswer);
    expect(wrongAnswer).toHaveAttribute("aria-pressed", "true");
    lessonView.unmount();

    window.history.pushState({}, "", "/play");
    render(<App />);
    const firstBar = screen.getByRole("button", { name: /select bar 1/i });
    await user.click(firstBar);
    expect(firstBar).toHaveAttribute("aria-pressed", "true");
  });

  it("gives immediate quiz feedback without leaving the feed", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/feed");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /binary search/i }));

    expect(screen.getByText(/nice.*10 xp/i)).toBeInTheDocument();
  });

  it("shows live loading state and hydrates learner data from the API", async () => {
    vi.stubEnv("VITE_API_URL", "http://api.test");
    const liveHome = buildLearningHome("taylor");
    liveHome.user.name = "Taylor";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => liveHome
      })
    );

    render(<App />);

    expect(screen.getByText(/syncing live learning data/i)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /good morning, taylor/i })).toBeInTheDocument();
    expect(screen.getByText("Synced to API")).toBeInTheDocument();
  });

  it("filters learning surfaces through search and lets learners toggle topics", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/browse");
    render(<App />);

    await user.type(screen.getByRole("searchbox", { name: /search all learning/i }), "tree");

    expect(screen.getByText(/3 results for "tree"/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open data structures/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open algorithms 101/i })).not.toBeInTheDocument();

    const spaceTopic = screen.getByRole("button", { name: /space topic/i });
    await user.click(spaceTopic);

    expect(spaceTopic).toHaveAttribute("aria-pressed", "true");
  });

  it("uses topic chips as real browse filters instead of visual toggles", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/browse");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /space topic/i }));
    expect(await screen.findByText(/0 results for topic space/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open algorithms 101/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /algorithms topic/i }));

    expect(await screen.findByText(/3 results for topics (space \+ algorithms|algorithms \+ space)/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open algorithms 101/i })).toBeInTheDocument();
  });

  it("builds a custom book path with a lesson, quiz, and tactile lab", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/browse");
    render(<App />);

    await user.type(screen.getByRole("textbox", { name: /custom learning goal/i }), "Atomic Habits");
    await user.click(screen.getByRole("button", { name: /book/i }));
    await user.click(screen.getByRole("button", { name: /build custom path/i }));

    expect(window.location.pathname).toBe("/topics/custom-atomic-habits");
    expect(screen.getByRole("heading", { level: 1, name: /^atomic habits$/i })).toBeInTheDocument();
    expect(screen.getByText(/custom book path/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /practice loop module/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /open micro lesson/i }));
    expect(window.location.pathname).toBe("/feed");
    expect(window.location.search).toBe("?bite=custom-atomic-habits-bite");
    expect(screen.getByRole("heading", { name: /atomic habits in one focused sprint/i })).toBeInTheDocument();
    expect(screen.getByText(/what is the best next step for atomic habits/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /teach it back with one example/i }));
    expect(await screen.findByText(/nice.*8 xp/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /browse/i }));
    await user.click(screen.getByRole("link", { name: /open atomic habits/i }));
    await user.click(screen.getByRole("link", { name: /practice build atomic habits recall loop/i }));
    expect(window.location.pathname).toBe("/play");
    expect(screen.getByRole("heading", { name: /build atomic habits recall loop/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fill next practice card/i }));
    expect(screen.getByText(/cue ready/i)).toBeInTheDocument();
  });

  it("carries saved feed bites into the library and opens them from there", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/feed?bite=trees-bite");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /save bite/i }));
    await user.click(screen.getByRole("link", { name: /library/i }));

    expect(screen.getByRole("heading", { name: /saved for later/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open binary trees in one commute stop/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /open binary trees in one commute stop/i }));
    expect(window.location.pathname).toBe("/feed");
    expect(window.location.search).toBe("?bite=trees-bite");
  });

  it("awards course check XP once and reflects it on the progress surface", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures/lessons/binary-search-invariants");
    render(<App />);

    const correctAnswer = screen.getByRole("button", { name: /keep the target inside/i });
    await user.click(correctAnswer);
    await user.click(correctAnswer);
    await user.click(screen.getByRole("link", { name: /you/i }));

    expect(screen.getByText("1,252")).toBeInTheDocument();
    expect(screen.queryByText("1,264")).not.toBeInTheDocument();
  });

  it("turns feed and library controls into stateful learning actions", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/feed");
    render(<App />);

    expect(screen.getByRole("button", { name: /save bite/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/saved for later/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /like bite/i }));
    expect(screen.getByRole("button", { name: /like bite/i })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /play audio lesson/i }));
    expect(screen.getByText(/audio playing/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /library/i }));
    await user.click(screen.getByRole("button", { name: /watch/i }));
    expect(screen.getByText(/visual walkthrough ready/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /check tree height/i }));
    expect(screen.getByText(/tree height is 3/i)).toBeInTheDocument();
  });

  it("loads bite-specific feed quizzes and advances through the bite queue", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/feed");
    render(<App />);

    await user.click(screen.getByRole("link", { name: /binary trees in one commute stop/i }));

    expect(window.location.pathname).toBe("/feed");
    expect(window.location.search).toBe("?bite=trees-bite");
    expect(screen.getByRole("heading", { name: /binary trees in one commute stop/i })).toBeInTheDocument();
    expect(screen.getByText(/what controls the longest tree search path/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^tree height$/i }));
    expect(screen.getByText(/nice.*8 xp/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /next bite/i }));
    expect(window.location.search).toBe("?bite=binary-search-bite");
    expect(screen.getByText(/which is faster on sorted data/i)).toBeInTheDocument();
  });

  it("lets a new learner sign in, choose objectives, and get a personalized browse plan", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/signin");
    render(<App />);

    await user.type(screen.getByLabelText(/name/i), "Jordan");
    await user.type(screen.getByLabelText(/email/i), "jordan@example.com");
    await user.click(screen.getByRole("button", { name: /algorithms and data structures objective/i }));
    await user.click(screen.getByRole("button", { name: /interview prep objective/i }));
    await user.click(screen.getByRole("button", { name: /build learning plan/i }));

    expect(window.location.pathname).toBe("/browse");
    expect(screen.getByText(/learning plan for jordan/i)).toBeInTheDocument();
    expect(screen.getByText(/algorithms and data structures/i)).toBeInTheDocument();
    expect(screen.getByText(/interview prep/i)).toBeInTheDocument();
  });

  it("supports course enrollment, lesson completion, and progress tracking", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /enroll in course/i }));
    expect(screen.getByText(/enrolled/i)).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: /start first lesson/i }));

    expect(window.location.pathname).toBe("/courses/algorithms-data-structures/lessons/big-o-as-shape");
    expect(screen.getByText(/0\/24 lessons complete/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /name the invariant and preserve it/i }));
    await user.click(screen.getByRole("button", { name: /complete lesson/i }));

    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next lesson/i })).toHaveAttribute("href", "/courses/algorithms-data-structures/lessons/loops-and-growth");

    await user.click(screen.getByRole("link", { name: /you/i }));
    expect(screen.getByText(/algorithms & data structures/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/24 lessons complete/i)).toBeInTheDocument();
  });

  it("marks the course complete from the capstone and reflects completion on progress", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/courses/algorithms-data-structures");
    render(<App />);

    await user.click(screen.getByRole("button", { name: /enroll in course/i }));
    await user.click(screen.getByRole("link", { name: /capstone arcade/i }));

    expect(screen.getByRole("heading", { level: 1, name: /capstone arcade/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /complete course/i }));

    expect(screen.getByText(/course complete/i)).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: /you/i }));
    expect(screen.getByText(/course complete/i)).toBeInTheDocument();
    expect(screen.getByText(/certificate ready/i)).toBeInTheDocument();
  });
});
