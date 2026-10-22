import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { buildAlgorithmsDataStructuresCourse, type CourseBlock, type QuizBlock } from "@brainbuilder/courseware";
import { buildLearningHome } from "@brainbuilder/learning-model";
import MobileApp from "./MobileApp";

type RenderedMobileApp = Awaited<ReturnType<typeof render>>;
type NativeJsonElement = {
  props: Record<string, unknown>;
  children?: NativeJsonNode[];
};
type NativeJsonNode = NativeJsonElement | string;
type NativeJsonTree = NativeJsonElement | NativeJsonElement[] | null;

function textContent(node: NativeJsonNode): string {
  if (typeof node === "string") {
    return node;
  }
  return (node.children ?? [])
    .map((child) => {
      return textContent(child);
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectJsonNodes(tree: NativeJsonTree): NativeJsonElement[] {
  const roots = Array.isArray(tree) ? tree : tree ? [tree] : [];
  return roots.flatMap((node) => [
    node,
    ...(node.children ?? [])
      .filter((child): child is NativeJsonElement => typeof child !== "string")
      .flatMap((child) => collectJsonNodes(child))
  ]);
}

function numericStyle(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function resolvedStyle(node: NativeJsonElement) {
  return (StyleSheet.flatten(node.props.style) ?? {}) as Record<string, unknown>;
}

function expectNativeButtonsAccessible(app: RenderedMobileApp, surface: string) {
  const buttons = collectJsonNodes(app.toJSON()).filter((node) => node.props.accessibilityRole === "button");
  expect(buttons.length).toBeGreaterThan(0);

  const unnamed = buttons
    .map((button) => ({
      label: button.props.accessibilityLabel ?? textContent(button),
      text: textContent(button)
    }))
    .filter((button) => !button.label);
  expect(unnamed).toEqual([]);

  const smallTargets = buttons
    .map((button) => {
      const style = resolvedStyle(button);
      const width = numericStyle(style.width) ?? numericStyle(style.minWidth);
      const height = numericStyle(style.height) ?? numericStyle(style.minHeight);
      return {
        label: button.props.accessibilityLabel ?? textContent(button),
        width,
        height,
        flex: style.flex
      };
    })
    .filter((button) => (button.width !== undefined && button.width < 40) || (button.height ?? 0) < 40);
  expect(smallTargets).toEqual([]);
}

function expectNativeText(app: RenderedMobileApp, matcher: string | RegExp) {
  expect(app.getAllByText(matcher).length).toBeGreaterThan(0);
}

async function pressNativeText(app: RenderedMobileApp, matcher: string | RegExp) {
  const target = app.getAllByText(matcher)[0];
  expect(target).toBeTruthy();
  await fireEvent.press(target);
}

function nativeVisualLabelForBlock(block: CourseBlock) {
  if (block.id === "binary-search-window") return /Native binary search window/i;
  if (block.id === "dp-grid-fill") return "Native DP grid fill";
  if (block.id === "tree-rotation-3d") return "Native tree rotation surface";
  if (block.kind === "diagram" || block.kind === "simulation" || block.kind === "lab") return `Native animated stage ${block.title}`;
  return null;
}

async function answerNativeCourseQuiz(app: RenderedMobileApp, block: QuizBlock) {
  const wrongOption = block.options.find((option) => option.id !== block.correctOptionId);
  const correctOption = block.options.find((option) => option.id === block.correctOptionId);

  expect(wrongOption).toBeTruthy();
  expect(correctOption).toBeTruthy();

  await pressNativeText(app, wrongOption!.label);
  expectNativeText(app, block.incorrectFeedback);

  await pressNativeText(app, correctOption!.label);
  expectNativeText(app, block.feedback);
}

async function expectNativeCourseBlock(app: RenderedMobileApp, block: CourseBlock) {
  if (block.kind === "text") {
    expectNativeText(app, block.title);
    expectNativeText(app, block.body[0]);
    return;
  }
  if (block.kind === "audio") {
    expectNativeText(app, block.title);
    expectNativeText(app, `${block.durationSeconds}s brief`);
    return;
  }
  if (block.kind === "quiz") {
    expectNativeText(app, block.question);
    await answerNativeCourseQuiz(app, block);
    return;
  }
  if (block.kind === "code-trace") {
    expectNativeText(app, block.title);
    expectNativeText(app, block.code);
    expectNativeText(app, `1. ${block.tracePoints[0]}`);
    await pressNativeText(app, "Next trace step");
    expectNativeText(app, new RegExp(`Trace state 2: ${block.tracePoints[1]}`, "i"));
    return;
  }
  if (block.kind === "project") {
    expectNativeText(app, block.title);
    expectNativeText(app, block.brief);
    expectNativeText(app, `1. ${block.deliverables[0]}`);
    await pressNativeText(app, "Advance project stage");
    expectNativeText(app, new RegExp(`Project stage 2: ${block.deliverables[1]}`, "i"));
    return;
  }
  if (block.kind === "reflection") {
    expectNativeText(app, block.title);
    expectNativeText(app, block.prompt);
    return;
  }

  expectNativeText(app, block.title);
  const visualLabel = nativeVisualLabelForBlock(block);
  if (visualLabel) {
    expect(app.getByLabelText(visualLabel)).toBeTruthy();
  }
}

describe("Brainbuilder mobile app", () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.restoreAllMocks();
  });

  it("renders the commute-first learning flow", async () => {
    const app = await render(<MobileApp />);

    expect(app.getByText(/good morning, alex/i)).toBeTruthy();
    expect(app.getAllByText(/why binary search is o\(log n\)/i).length).toBeGreaterThan(0);
    expect(app.getByText(/algorithms 101/i)).toBeTruthy();
    expect(app.getByText(/sort it: bubble sort/i)).toBeTruthy();
  });

  it("gives immediate quiz feedback in the feed", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByText("Binary search"));

    expect(app.getByText(/nice.*10 xp/i)).toBeTruthy();
  });

  it("hydrates learner data from the configured API", async () => {
    process.env.EXPO_PUBLIC_API_URL = "http://api.test";
    const liveHome = buildLearningHome("taylor");
    liveHome.user.name = "Taylor";
    let resolveFetch: (response: Response) => void = () => undefined;
    jest.spyOn(global, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const app = await render(<MobileApp />);

    expect(app.getByText(/syncing live learning data/i)).toBeTruthy();
    resolveFetch({
      ok: true,
      json: async () => liveHome
    } as Response);
    await waitFor(() => expect(app.getByText(/good morning, taylor/i)).toBeTruthy());
    expect(app.getByText(/synced to api/i)).toBeTruthy();
  });

  it("uses bottom tabs to focus commute-sized surfaces", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Play tab"));
    expect(app.getAllByText(/sort it: bubble sort/i).length).toBeGreaterThan(0);

    await fireEvent.press(app.getByLabelText("Feed tab"));
    expect(app.getAllByText(/why binary search is o\(log n\)/i).length).toBeGreaterThan(0);
    expect(app.queryByText(/sort it: bubble sort/i)).toBeNull();
  });

  it("keeps feed actions stateful on mobile", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Like bite"));

    expect(app.getByText(/liked/i)).toBeTruthy();
    expect(app.getByText(/saved for later/i)).toBeTruthy();
  });

  it("opens saved commute lessons from a native library tab", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Feed tab"));
    await fireEvent.press(app.getByText("Binary trees in one commute stop"));
    await fireEvent.press(app.getByLabelText("Save bite"));
    await fireEvent.press(app.getByLabelText("Library tab"));

    expect(app.getByText(/multimodal library/i)).toBeTruthy();
    expect(app.getByText(/saved for later/i)).toBeTruthy();
    expect(app.getByText("Binary trees in one commute stop")).toBeTruthy();

    await fireEvent.press(app.getByText("Binary trees in one commute stop"));
    expect(app.getByText(/what controls the longest tree search path/i)).toBeTruthy();
  });

  it("renders the shared algorithms course on the native browse surface", async () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const lessonCount = course.units.flatMap((unit) => unit.lessons).length;
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Browse tab"));

    expect(app.getByText(/algorithms & data structures/i)).toBeTruthy();
    expect(app.getByText(`${course.units.length} units`)).toBeTruthy();
    expect(app.getByText(`${lessonCount} micro lessons`)).toBeTruthy();
    expect(app.getByText(/^skia$/i)).toBeTruthy();
    expect(app.getByText(/^three$/i)).toBeTruthy();

    await fireEvent.press(app.getByText("Binary Search Invariants"));
    expect(app.getByText(/native lesson/i)).toBeTruthy();
    expect(app.getByText(/learning loop/i)).toBeTruthy();
    expect(app.getByText(/the sorted window is the contract/i)).toBeTruthy();
    expect(app.getByLabelText(/Native binary search window/i)).toBeTruthy();

    expect(app.getByText(/Search step 1 of 4/i)).toBeTruthy();
    expect(app.getByText("Play mobile search")).toBeTruthy();
    expect(app.getByText("Next search step")).toBeTruthy();
    expect(app.getByText("Previous search step")).toBeTruthy();
    expect(app.getByText("Reset search")).toBeTruthy();

    await fireEvent.press(app.getByText("Next search step"));
    expect(app.getByText(/window 4-7/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Previous search step"));
    expect(app.getByText(/window 1-7/i)).toBeTruthy();

    await fireEvent.press(app.getByText("Keep the target inside the remaining sorted window"));
    expect(app.getByText(/right.*remaining sorted window/i)).toBeTruthy();
  });

  it("keeps native course activities tactile across advanced lessons", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Browse tab"));
    await fireEvent.press(app.getByText("Tree Rotations"));
    expect(app.getByLabelText("Native tree rotation surface")).toBeTruthy();

    await fireEvent.press(app.getByText("Rotate left"));
    expect(app.getByText(/inorder preserved/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Reset rotation"));
    expect(app.queryByText(/inorder preserved/i)).toBeNull();

    await fireEvent.press(app.getByText("DP Grid Fill"));
    expect(app.getByLabelText("Native DP grid fill")).toBeTruthy();

    await fireEvent.press(app.getByText("Fill next cell"));
    await fireEvent.press(app.getByText("Fill next cell"));
    expect(app.getByText(/dependencies satisfied for 2 cells/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Back one cell"));
    expect(app.getByText(/dependencies satisfied for 1 cell/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Reset grid"));
    expect(app.queryByText(/dependencies satisfied/i)).toBeNull();
  });

  it("renders specific course stages as tactile native animations", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Browse tab"));
    await fireEvent.press(app.getAllByText("Big-O as Shape")[0]);

    expect(app.getByLabelText("Native animated stage Big-O as Shape map")).toBeTruthy();
    expect(app.getByText(/Stage 1 of 4/i)).toBeTruthy();

    expect(app.getByText("Play native stage")).toBeTruthy();
    expect(app.getByText("Next native stage")).toBeTruthy();
    expect(app.getByText("Previous native stage")).toBeTruthy();
    expect(app.getByText("Reset native stage")).toBeTruthy();

    await fireEvent.press(app.getByText("Next native stage"));

    expect(app.getByText(/Stage 2 of 4/i)).toBeTruthy();
    expect(app.getByText(/Logarithmic work grows by extra decisions/i)).toBeTruthy();
  });

  it("exposes every course lesson on the native browse surface", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Browse tab"));

    expect(app.getAllByText("Big-O as Shape").length).toBeGreaterThan(0);
    expect(app.getByText("BFS and DFS Frontiers")).toBeTruthy();
    expect(app.getByText("Capstone Arcade")).toBeTruthy();

    await fireEvent.press(app.getByText("Capstone Arcade"));

    expect(app.getByText(/native lesson/i)).toBeTruthy();
    expect(app.getByText(/sorting arcade/i)).toBeTruthy();
    expect(app.getByText(/graph route arcade/i)).toBeTruthy();
  });

  it("keeps every native route-equivalent surface accessible and touch sized", async () => {
    const app = await render(<MobileApp />);

    expectNativeButtonsAccessible(app, "Home");

    for (const tab of ["Browse", "Feed", "Play", "Library", "You"] as const) {
      await fireEvent.press(app.getByLabelText(`${tab} tab`));
      await waitFor(() => expect(app.getByLabelText(`${tab} tab`).props.accessibilityState).toMatchObject({ selected: true }));
      expectNativeButtonsAccessible(app, tab);
    }
  });

  it("deeply renders every native course lesson block with interactive checks and stages", async () => {
    const app = await render(<MobileApp />);
    const course = buildAlgorithmsDataStructuresCourse();
    const lessons = course.units.flatMap((unit) => unit.lessons);

    await fireEvent.press(app.getByLabelText("Browse tab"));

    for (const lesson of lessons) {
      await pressNativeText(app, lesson.title);
      await waitFor(() => expectNativeText(app, lesson.summary));
      expectNativeText(app, /native lesson/i);
      expectNativeText(app, lesson.outcomes[0]);

      for (const block of lesson.blocks) {
        await expectNativeCourseBlock(app, block);
      }
    }
  });

  it("keeps mobile feed audio and both play labs stateful", async () => {
    const app = await render(<MobileApp />);

    await fireEvent.press(app.getByLabelText("Feed tab"));
    await fireEvent.press(app.getByLabelText("Play audio lesson"));
    expect(app.getByText(/audio playing/i)).toBeTruthy();

    await fireEvent.press(app.getByText("Binary trees in one commute stop"));
    expect(app.getByText(/what controls the longest tree search path/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Tree height"));
    expect(app.getByText(/nice.*8 xp/i)).toBeTruthy();

    await fireEvent.press(app.getByLabelText("Play tab"));
    await fireEvent.press(app.getByText("Trace tree height"));
    await fireEvent.press(app.getByLabelText("Tree node 8"));
    await fireEvent.press(app.getByLabelText("Tree node 12"));
    await fireEvent.press(app.getByLabelText("Tree node 14"));
    await fireEvent.press(app.getByText("Check path"));

    expect(app.getByText(/that path has height 3/i)).toBeTruthy();
  });

  it("supports the native new learner, enrollment, lesson progress, and completion flow", async () => {
    const lessonCount = buildAlgorithmsDataStructuresCourse().units.flatMap((unit) => unit.lessons).length;
    const app = await render(<MobileApp />);

    expect(app.getByText(/build your learning plan/i)).toBeTruthy();
    await fireEvent.changeText(app.getByLabelText("Name"), "Mina");
    await fireEvent.changeText(app.getByLabelText("Email"), "mina@example.com");
    await fireEvent.press(app.getByLabelText("Algorithms and Data Structures objective"));
    await fireEvent.press(app.getByLabelText("Interview prep objective"));
    await fireEvent.press(app.getByTestId("build-learning-plan"));

    await waitFor(() => expect(app.getByText(/plan active for mina/i)).toBeTruthy());
    expect(app.getByText(/algorithms and data structures/i)).toBeTruthy();

    await fireEvent.press(app.getByLabelText("Browse tab"));
    await waitFor(() => expect(app.getByText(/course framework/i)).toBeTruthy());
    await fireEvent.press(app.getByText("Enroll in course"));
    await waitFor(() => expect(app.getByText(/enrolled/i)).toBeTruthy());
    expect(app.getByText(`0/${lessonCount} lessons complete`)).toBeTruthy();

    await fireEvent.press(app.getAllByText("Name the invariant and preserve it")[0]);
    await fireEvent.press(app.getByText("Complete lesson"));
    await waitFor(() => expect(app.getByText(/lesson complete/i)).toBeTruthy());
    expect(app.getByText(`1/${lessonCount} lessons complete`)).toBeTruthy();

    await fireEvent.press(app.getByText("Capstone Arcade"));
    await fireEvent.press(app.getAllByText("Next native stage")[0]);
    expect(app.getByText(/Stage 2 of 4/i)).toBeTruthy();
    await fireEvent.press(app.getByText("Complete course"));
    await waitFor(() => expect(app.getByText(/course complete/i)).toBeTruthy());

    await fireEvent.press(app.getByLabelText("You tab"));
    expect(app.getByText(`${lessonCount}/${lessonCount} lessons complete`)).toBeTruthy();
    expect(app.getByText(/certificate ready/i)).toBeTruthy();
  });
});
