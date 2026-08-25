import { describe, expect, it } from "vitest";
import { buildLearningHome, quizForBite, scoreLearningQuiz, scoreQuizAnswer } from "./index";

describe("learning home model", () => {
  it("builds a multimodal microlearning home with feed, path, quiz, and play surfaces", () => {
    const home = buildLearningHome("alex");

    expect(home.user.name).toBe("Alex");
    expect(home.stats.streakDays).toBeGreaterThanOrEqual(12);
    expect(home.feed.some((bite) => bite.modes.includes("audio") && bite.modes.includes("visual"))).toBe(true);
    expect(home.paths[0]?.modules.map((module) => module.title)).toContain("Sorting");
    expect(home.playgrounds.some((game) => game.concept === "sorting" && game.interaction === "swap-bars")).toBe(true);
  });

  it("scores quiz answers with feedback and keeps streak state explicit", () => {
    expect(scoreQuizAnswer("binary-search-sorted", "binary-search")).toEqual({
      correct: true,
      xpAwarded: 10,
      feedback: "Binary search wins on sorted data because it halves the search space each step.",
      streakSafe: true
    });

    expect(scoreQuizAnswer("binary-search-sorted", "linear-scan")).toMatchObject({
      correct: false,
      xpAwarded: 0,
      streakSafe: false
    });
  });

  it("pairs each feed bite with a contextual quiz", () => {
    const home = buildLearningHome("alex");

    expect(quizForBite(home, "binary-search-bite")?.question).toMatch(/sorted data/i);
    expect(quizForBite(home, "trees-bite")?.question).toMatch(/tree search path/i);
    expect(scoreQuizAnswer("tree-height-choice", "tree-height")).toEqual({
      correct: true,
      xpAwarded: 8,
      feedback: "Tree height controls the longest root-to-leaf search path, so balanced trees keep lookups short.",
      streakSafe: true
    });
  });

  it("resolves and scores learner-created feed quizzes from generated content", () => {
    const home = buildLearningHome("alex");
    home.feed.push({
      id: "custom-atomic-habits-bite",
      topic: "Atomic Habits",
      title: "Atomic Habits in one focused sprint",
      prompt: "Turn the book into a cue, action, reward loop you can practice today.",
      durationSeconds: 55,
      modes: ["text", "audio", "visual", "interactive"],
      saved: true
    });
    home.quizzes.push({
      id: "custom-atomic-habits-quiz",
      question: "What is the best next step for Atomic Habits?",
      options: [
        { id: "teach-back", label: "Teach it back with one example" },
        { id: "collect-quotes", label: "Collect more quotes before acting" }
      ],
      correctOptionId: "teach-back",
      feedback: "Right. Teaching it back turns the idea into a usable habit loop."
    });

    expect(quizForBite(home, "custom-atomic-habits-bite")?.id).toBe("custom-atomic-habits-quiz");
    expect(scoreLearningQuiz(home, "custom-atomic-habits-quiz", "teach-back")).toEqual({
      correct: true,
      xpAwarded: 8,
      feedback: "Right. Teaching it back turns the idea into a usable habit loop.",
      streakSafe: true
    });
    expect(scoreLearningQuiz(home, "custom-atomic-habits-quiz", "collect-quotes")).toMatchObject({
      correct: false,
      xpAwarded: 0,
      streakSafe: false
    });
  });
});
