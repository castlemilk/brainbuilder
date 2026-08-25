import { describe, expect, it } from "vitest";
import {
  buildAlgorithmsDataStructuresCourse,
  buildRendererManifest,
  computeCourseCoverage,
  type CourseBlock,
  findInteractiveBlocks,
  findLesson,
  getLessonLearningGuide,
  scoreCourseCheck,
  validateCourse
} from "./index";

function expectSubstantialGuideField(value: string, label: string) {
  expect(value.trim(), label).toBeTruthy();
  expect(value.trim().split(/\s+/).length, label).toBeGreaterThanOrEqual(8);
}

describe("courseware framework", () => {
  it("builds a complete algorithms and data structures course with exhaustive content modalities", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const coverage = computeCourseCoverage(course);

    expect(course.id).toBe("algorithms-data-structures");
    expect(course.units.map((unit) => unit.title)).toEqual([
      "Mental Models & Complexity",
      "Arrays, Strings & Linked Lists",
      "Stacks, Queues & Hash Tables",
      "Trees & Heaps",
      "Graphs",
      "Sorting, Searching & Selection",
      "Dynamic Programming & Greedy Strategy",
      "Capstone Interview Arcade",
      "Sorting Algorithms in Practice",
      "Searching Algorithms in Practice",
      "Binary Search Trees",
      "Graphs & Dynamic Programming",
      "Coding Challenges"
    ]);
    expect(coverage.lessonCount).toBeGreaterThanOrEqual(24);
    expect(coverage.blockKinds).toEqual(expect.arrayContaining(["text", "audio", "diagram", "simulation", "code-trace", "quiz", "lab", "reflection", "project"]));
    expect(coverage.rendererFamilies).toEqual(expect.arrayContaining(["svg", "d3", "three", "skia", "anime"]));
    expect(coverage.assessmentCount).toBeGreaterThanOrEqual(12);
  });

  it("validates authoring rules for micro lessons and renderer fallbacks", () => {
    const course = buildAlgorithmsDataStructuresCourse();

    expect(validateCourse(course)).toEqual({
      valid: true,
      errors: [],
      warnings: []
    });
  });

  it("finds lessons and interactive blocks by stable ids for routed drilldowns", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const lesson = findLesson(course, "binary-search-invariants");
    const interactions = findInteractiveBlocks(course);

    expect(lesson?.title).toBe("Binary Search Invariants");
    expect(lesson?.blocks.some((block) => block.kind === "diagram" && block.renderer.family === "d3")).toBe(true);
    expect(interactions.map((block) => block.id)).toEqual(expect.arrayContaining(["binary-search-window", "tree-rotation-3d", "dp-grid-fill"]));
  });

  it("scores embedded checks with feedback and xp for course progress", () => {
    const course = buildAlgorithmsDataStructuresCourse();

    expect(scoreCourseCheck(course, "binary-search-check", "halve-space")).toEqual({
      correct: true,
      xpAwarded: 12,
      feedback: "Right. The invariant keeps the answer inside the remaining sorted window.",
      nextBlockId: "binary-search-window"
    });
    expect(scoreCourseCheck(course, "binary-search-check", "scan-left")).toMatchObject({
      correct: false,
      xpAwarded: 0
    });
  });

  it("builds a renderer manifest for web, native, motion, and fallback planning", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const manifest = buildRendererManifest(course);

    expect(manifest.map((entry) => entry.family)).toEqual(["anime", "d3", "skia", "svg", "three"]);
    expect(manifest.find((entry) => entry.family === "d3")).toMatchObject({
      webReady: true,
      mobileReady: false,
      fallbackReady: true
    });
    expect(manifest.find((entry) => entry.family === "skia")).toMatchObject({
      webReady: false,
      mobileReady: true,
      fallbackReady: true
    });
    expect(manifest.every((entry) => entry.blockCount > 0)).toBe(true);
  });

  it("provides a deep learning guide for every lesson in the path", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const lessons = course.units.flatMap((unit) => unit.lessons);

    for (const lesson of lessons) {
      const guide = getLessonLearningGuide(lesson);
      expectSubstantialGuideField(guide.why, `${lesson.id} has a why`);
      expectSubstantialGuideField(guide.mentalModel, `${lesson.id} has a mental model`);
      expectSubstantialGuideField(guide.workedExample, `${lesson.id} has a worked example`);
      expectSubstantialGuideField(guide.commonTrap, `${lesson.id} has a common trap`);
      expectSubstantialGuideField(guide.practicePrompt, `${lesson.id} has a practice prompt`);
      expectSubstantialGuideField(guide.explainBack, `${lesson.id} has an explain-back prompt`);
    }

    expect(getLessonLearningGuide(findLesson(course, "binary-search-invariants")!).mentalModel).toMatch(/sorted window/i);
    expect(getLessonLearningGuide(findLesson(course, "tree-rotations")!).workedExample).toMatch(/inorder/i);
    expect(getLessonLearningGuide(findLesson(course, "dp-table-fill")!).practicePrompt).toMatch(/dependency/i);
  });

  it("keeps concept lessons specific enough to teach, not generic placeholders", () => {
    const course = buildAlgorithmsDataStructuresCourse();
    const lessons = course.units.flatMap((unit) => unit.lessons);
    const conceptLessons = lessons.filter((lesson) => lesson.blocks.some((block) => block.kind === "diagram" && block.renderer.component === "concept-map"));

    expect(conceptLessons.length).toBeGreaterThanOrEqual(12);

    for (const lesson of conceptLessons) {
      const textBlock = lesson.blocks.find((block): block is Extract<CourseBlock, { kind: "text" }> => block.kind === "text");
      const audioBlock = lesson.blocks.find((block): block is Extract<CourseBlock, { kind: "audio" }> => block.kind === "audio");
      const diagramBlock = lesson.blocks.find((block): block is Extract<CourseBlock, { kind: "diagram" }> => block.kind === "diagram" && block.renderer.component === "concept-map");
      const quizBlock = lesson.blocks.find((block): block is Extract<CourseBlock, { kind: "quiz" }> => block.kind === "quiz");

      expect(textBlock?.body.join(" ").split(/\s+/).length, `${lesson.id} has enough written explanation`).toBeGreaterThanOrEqual(38);
      expect(audioBlock?.script.split(/\s+/).length, `${lesson.id} has enough audio explanation`).toBeGreaterThanOrEqual(25);

      expect(diagramBlock && "nodes" in diagramBlock.data ? diagramBlock.data.nodes : undefined, `${lesson.id} has specific stage labels`).not.toEqual(["input", "state", "operation", "output"]);
      expect(diagramBlock && "feedback" in diagramBlock.data && Array.isArray(diagramBlock.data.feedback) ? diagramBlock.data.feedback.length : 0, `${lesson.id} has stage feedback`).toBeGreaterThanOrEqual(4);
      expect(diagramBlock && "invariant" in diagramBlock.data ? String(diagramBlock.data.invariant).trim().length : 0, `${lesson.id} names the visual invariant`).toBeGreaterThan(30);

      expect(quizBlock?.question, `${lesson.id} has a specific quiz question`).not.toMatch(/^What keeps .* reliable\?$/);
      expect(quizBlock?.feedback, `${lesson.id} has specific quiz feedback`).not.toBe("Right. The operation works because the invariant survives each step.");
    }
  });
});
