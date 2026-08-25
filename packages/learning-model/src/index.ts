export type LearningMode = "audio" | "text" | "visual" | "interactive";

export type Learner = {
  id: string;
  name: string;
  level: number;
  archetype: string;
};

export type LearnerStats = {
  streakDays: number;
  bestStreakDays: number;
  xp: number;
  dailyGoalCompleted: number;
  dailyGoalTarget: number;
  hearts: number;
};

export type Topic = {
  id: string;
  label: string;
  selected: boolean;
};

export type FeedBite = {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  durationSeconds: number;
  modes: LearningMode[];
  saved: boolean;
};

export type Quiz = {
  id: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
  }>;
  correctOptionId: string;
  feedback: string;
};

export type PathModule = {
  id: string;
  title: string;
  status: "complete" | "current" | "locked";
  progress: number;
};

export type LearningPath = {
  id: string;
  title: string;
  subtitle: string;
  accent: "ember" | "violet" | "teal";
  progress: number;
  modules: PathModule[];
};

export type Playground = {
  id: string;
  title: string;
  concept: string;
  interaction: "swap-bars" | "trace-tree" | "fill-table";
  description: string;
  xpReward: number;
};

export type Quest = {
  id: string;
  label: string;
  completed: number;
  target: number;
};

export type LeagueEntry = {
  rank: number;
  name: string;
  xp: number;
  self?: boolean;
};

export type LearningHome = {
  user: Learner;
  stats: LearnerStats;
  topics: Topic[];
  feed: FeedBite[];
  quizzes: Quiz[];
  paths: LearningPath[];
  playgrounds: Playground[];
  quests: Quest[];
  league: LeagueEntry[];
};

export type QuizResult = {
  correct: boolean;
  xpAwarded: number;
  feedback: string;
  streakSafe: boolean;
};

const binarySearchQuiz: Quiz = {
  id: "binary-search-sorted",
  question: "Which is faster on sorted data?",
  options: [
    { id: "binary-search", label: "Binary search" },
    { id: "linear-scan", label: "Linear scan" }
  ],
  correctOptionId: "binary-search",
  feedback: "Binary search wins on sorted data because it halves the search space each step."
};

const treeHeightQuiz: Quiz = {
  id: "tree-height-choice",
  question: "What controls the longest tree search path?",
  options: [
    { id: "tree-height", label: "Tree height" },
    { id: "leaf-color", label: "Leaf color" },
    { id: "node-labels", label: "The exact node labels" }
  ],
  correctOptionId: "tree-height",
  feedback: "Tree height controls the longest root-to-leaf search path, so balanced trees keep lookups short."
};

const feedQuizIds: Record<string, string> = {
  "binary-search-bite": binarySearchQuiz.id,
  "trees-bite": treeHeightQuiz.id
};

export function buildLearningHome(userId: string): LearningHome {
  const learnerName = userId.trim().toLowerCase() === "alex" ? "Alex" : "Curious learner";

  return {
    user: {
      id: userId,
      name: learnerName,
      level: 7,
      archetype: "Curious mind"
    },
    stats: {
      streakDays: 12,
      bestStreakDays: 21,
      xp: 1240,
      dailyGoalCompleted: 3,
      dailyGoalTarget: 5,
      hearts: 5
    },
    topics: [
      { id: "algorithms", label: "Algorithms", selected: true },
      { id: "space", label: "Space", selected: false },
      { id: "finance", label: "Finance", selected: true },
      { id: "design", label: "Design", selected: false },
      { id: "history", label: "History", selected: false },
      { id: "biology", label: "Biology", selected: true }
    ],
    feed: [
      {
        id: "binary-search-bite",
        topic: "Algorithms",
        title: "Why binary search is O(log n)",
        prompt: "Picture the split: each answer cuts the remaining search space in half.",
        durationSeconds: 30,
        modes: ["audio", "text", "visual"],
        saved: true
      },
      {
        id: "trees-bite",
        topic: "Data Structures",
        title: "Binary trees in one commute stop",
        prompt: "Tap each node to hear why tree height controls the search path.",
        durationSeconds: 72,
        modes: ["audio", "visual", "interactive"],
        saved: false
      }
    ],
    quizzes: [binarySearchQuiz, treeHeightQuiz],
    paths: [
      {
        id: "algorithms-101",
        title: "Algorithms 101",
        subtitle: "18 levels · beginner-friendly",
        accent: "violet",
        progress: 0.4,
        modules: [
          { id: "big-o", title: "Big-O basics", status: "complete", progress: 1 },
          { id: "searching", title: "Searching", status: "complete", progress: 1 },
          { id: "sorting", title: "Sorting", status: "current", progress: 0.35 },
          { id: "recursion", title: "Recursion", status: "locked", progress: 0 }
        ]
      },
      {
        id: "data-structures",
        title: "Data Structures",
        subtitle: "8 modules · 3.5 hours · curated",
        accent: "teal",
        progress: 0.55,
        modules: [
          { id: "arrays", title: "Arrays", status: "complete", progress: 1 },
          { id: "linked-lists", title: "Linked lists", status: "complete", progress: 1 },
          { id: "trees", title: "Trees", status: "current", progress: 0.6 },
          { id: "graphs", title: "Graphs", status: "locked", progress: 0 },
          { id: "hashing", title: "Hashing", status: "locked", progress: 0 }
        ]
      }
    ],
    playgrounds: [
      {
        id: "bubble-sort-lab",
        title: "Sort it: bubble sort",
        concept: "sorting",
        interaction: "swap-bars",
        description: "Drag or tap two bars, compare them, and watch the sequence settle.",
        xpReward: 15
      },
      {
        id: "tree-height-lab",
        title: "Trace tree height",
        concept: "trees",
        interaction: "trace-tree",
        description: "Follow a search path through a tree and feel why height matters.",
        xpReward: 12
      }
    ],
    quests: [
      { id: "daily-lessons", label: "Finish 3 lessons", completed: 2, target: 3 },
      { id: "quiz-check", label: "Keep your quiz streak alive", completed: 1, target: 1 }
    ],
    league: [
      { rank: 1, name: "Sam", xp: 920 },
      { rank: 2, name: "Priya", xp: 880 },
      { rank: 3, name: "You", xp: 815, self: true },
      { rank: 4, name: "Leo", xp: 790 },
      { rank: 5, name: "Mei", xp: 760 }
    ]
  };
}

export function quizForBite(home: LearningHome, biteId: string | undefined): Quiz | undefined {
  const selectedBite = home.feed.find((bite) => bite.id === biteId) ?? home.feed[0];
  const generatedQuizId = selectedBite?.id.endsWith("-bite") ? selectedBite.id.replace(/-bite$/, "-quiz") : undefined;
  const quizId = selectedBite ? feedQuizIds[selectedBite.id] ?? generatedQuizId : undefined;
  return home.quizzes.find((quiz) => quiz.id === quizId) ?? home.quizzes[0];
}

export function scoreQuizAnswer(quizId: string, selectedOptionId: string): QuizResult {
  const quiz = [binarySearchQuiz, treeHeightQuiz].find((item) => item.id === quizId);
  if (!quiz) {
    throw new Error(`Unknown quiz: ${quizId}`);
  }

  const correct = selectedOptionId === quiz.correctOptionId;
  return {
    correct,
    xpAwarded: correct ? xpForQuiz(quiz.id) : 0,
    feedback: correct ? quiz.feedback : incorrectFeedbackForQuiz(quiz.id),
    streakSafe: correct
  };
}

export function scoreLearningQuiz(home: LearningHome, quizId: string, selectedOptionId: string): QuizResult {
  const quiz = home.quizzes.find((item) => item.id === quizId);
  if (!quiz) {
    return scoreQuizAnswer(quizId, selectedOptionId);
  }

  const correct = selectedOptionId === quiz.correctOptionId;
  return {
    correct,
    xpAwarded: correct ? xpForQuiz(quiz.id) : 0,
    feedback: correct ? quiz.feedback : incorrectFeedbackForQuiz(quiz.id),
    streakSafe: correct
  };
}

function xpForQuiz(quizId: string) {
  if (quizId === treeHeightQuiz.id || quizId.startsWith("custom-")) {
    return 8;
  }
  return 10;
}

function incorrectFeedbackForQuiz(quizId: string) {
  if (quizId === treeHeightQuiz.id) {
    return "Not yet. Count the longest root-to-leaf path; that height is what bounds tree search work.";
  }
  if (quizId.startsWith("custom-")) {
    return "Not yet. Pick the move that turns the idea into a concrete explanation, then try again.";
  }
  return "Linear scan checks items one by one. On sorted data, binary search can skip half the list after every comparison.";
}
