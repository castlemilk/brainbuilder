export type QuestionId = "try-first" | "fresh-case";
export type ContentId = "discover-linear" | "discover-binary" | "discover-stack" | "path-try" | "path-explain" | "path-fresh" | "path-feedback" | "path-close";

export interface LearningCard {
  id: ContentId;
  kind: "idea" | "question" | "explanation" | "feedback" | "close";
  eyebrow: string;
  title: string;
  body: string;
  concept: "linear-search" | "binary-search" | "stack-queue";
  diagram: "scan" | "binary" | "stack";
  values: readonly number[];
  target: number;
  midIndex?: number;
  questionId?: QuestionId;
  source: { label: string; href: string };
}

const sourceFile = "https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts";
const binarySource = { label: "Brainbuilder course · Binary Search", href: `${sourceFile}#L51-L90` };
const firstValues = [2, 5, 8, 12, 19, 23, 30];
const freshValues = [3, 6, 9, 12, 15, 18, 21, 24, 27];

export const DISCOVER_CARDS: readonly LearningCard[] = [
  {
    id: "discover-linear", kind: "idea", eyebrow: "01 / Search", title: "One step can be enough.",
    body: "Linear search checks one item at a time. It works even when the items are unsorted, and stops as soon as it finds a match.",
    concept: "linear-search", diagram: "scan", values: [12, 5, 23, 8, 19, 2, 30], target: 19,
    source: { label: "Brainbuilder course · Linear Search", href: `${sourceFile}#L16-L50` }
  },
  {
    id: "discover-binary", kind: "idea", eyebrow: "02 / Search", title: "Leave half the work behind.",
    body: "On sorted data, compare the middle item with your target. The ordering tells you which half cannot contain it. Keep only the possible candidates.",
    concept: "binary-search", diagram: "binary", values: firstValues, target: 19, midIndex: 3, source: binarySource
  },
  {
    id: "discover-stack", kind: "idea", eyebrow: "03 / Data structures", title: "What should happen next?",
    body: "A stack returns the newest item first, like Undo. A queue returns the oldest waiting item first, like a print queue. Choose the order that matches the job.",
    concept: "stack-queue", diagram: "stack", values: [1, 2, 3], target: 3,
    source: { label: "Brainbuilder course · Stack and Queue Contracts", href: "https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L520-L545" }
  }
];

export interface LearningQuestion {
  prompt: string;
  options: readonly { id: string; label: string }[];
  correctOptionId: string;
  hint: string;
  explanation: string;
}

export const QUESTIONS: Record<QuestionId, LearningQuestion> = {
  "try-first": {
    prompt: "The target is 19. The middle value is 12. Which values still need checking?",
    options: [
      { id: "left", label: "2, 5, 8" },
      { id: "right", label: "19, 23, 30" },
      { id: "all", label: "All seven values" }
    ],
    correctOptionId: "right",
    hint: "The values are sorted. Can any value at or below 12 equal 19?",
    explanation: "19 is greater than 12. Sorted order rules out 12 and everything to its left. The remaining candidates are 19, 23 and 30."
  },
  "fresh-case": {
    prompt: "A new array: the target is 21 and the middle value is 15. Which values still need checking?",
    options: [
      { id: "left", label: "3, 6, 9, 12" },
      { id: "right", label: "18, 21, 24, 27" },
      { id: "all", label: "All nine values" }
    ],
    correctOptionId: "right",
    hint: "Compare the target with 15. Which side could still contain 21?",
    explanation: "21 is greater than 15. Discard 15 and the smaller values. Keep 18, 21, 24 and 27: all remain possible until the next comparison."
  }
};

export const PATH_CARDS: readonly LearningCard[] = [
  {
    id: "path-try", kind: "question", eyebrow: "01 / Try first", title: "What can you rule out?",
    body: "Start with your own thinking. You can think privately, keep a draft, choose an answer, or move on.",
    concept: "binary-search", diagram: "binary", values: firstValues, target: 19, midIndex: 3, questionId: "try-first", source: binarySource
  },
  {
    id: "path-explain", kind: "explanation", eyebrow: "02 / See why", title: "The order does the work.",
    body: QUESTIONS["try-first"].explanation,
    concept: "binary-search", diagram: "binary", values: firstValues, target: 19, midIndex: 3, source: binarySource
  },
  {
    id: "path-fresh", kind: "question", eyebrow: "03 / A fresh case", title: "Same idea. New numbers.",
    body: "Try another comparison now. This is immediate practice; it does not show what you will remember later.",
    concept: "binary-search", diagram: "binary", values: freshValues, target: 21, midIndex: 4, questionId: "fresh-case", source: binarySource
  },
  {
    id: "path-feedback", kind: "feedback", eyebrow: "04 / Look back", title: "Keep every possible candidate.",
    body: QUESTIONS["fresh-case"].explanation,
    concept: "binary-search", diagram: "binary", values: freshValues, target: 21, midIndex: 4, questionId: "fresh-case", source: binarySource
  },
  {
    id: "path-close", kind: "close", eyebrow: "05 / A good place to stop", title: "Small session. Clear stopping point.",
    body: "Review what you actually did. Your saved position lets you come back when you choose. No later check yet.",
    concept: "binary-search", diagram: "binary", values: [], target: 19, source: binarySource
  }
];

export const ALL_CARDS = [...DISCOVER_CARDS, ...PATH_CARDS];
export const QUESTION_IDS: readonly QuestionId[] = ["try-first", "fresh-case"];
