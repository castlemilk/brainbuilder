import { describe, expect, it, vi } from "vitest";
import { answerQuiz, fetchLearningHome } from "./lib/api";

describe("fetchLearningHome", () => {
  it("calls the Connect endpoint with JSON and maps the learning home response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: "alex", name: "Alex", level: 7, archetype: "Curious mind" },
        stats: { streakDays: 12, bestStreakDays: 21, xp: 1240, dailyGoalCompleted: 3, dailyGoalTarget: 5, hearts: 5 },
        topics: [],
        feed: [{ id: "bite", topic: "Algorithms", title: "Binary search", prompt: "Split", durationSeconds: 30, modes: ["audio"], saved: false }],
        quizzes: [],
        paths: [],
        playgrounds: [],
        quests: [],
        league: []
      })
    });

    const home = await fetchLearningHome("http://api.test", "alex", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/brainbuilder.learning.v1.LearningService/GetLearningHome",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ userId: "alex" })
      })
    );
    expect(home.user.name).toBe("Alex");
    expect(home.feed[0]?.modes).toContain("audio");
  });

  it("submits quiz answers to the Connect endpoint and returns scored feedback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        correct: true,
        xpAwarded: 10,
        feedback: "Binary search wins.",
        streakSafe: true
      })
    });

    const result = await answerQuiz("http://api.test", "binary-search-sorted", "binary-search", fetchMock);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/brainbuilder.learning.v1.LearningService/AnswerQuiz",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ quizId: "binary-search-sorted", selectedOptionId: "binary-search" })
      })
    );
    expect(result).toEqual({
      correct: true,
      xpAwarded: 10,
      feedback: "Binary search wins.",
      streakSafe: true
    });
  });
});
