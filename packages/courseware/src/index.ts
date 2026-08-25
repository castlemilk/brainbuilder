import { sortingLessons } from "./content/sorting";
import { searchingLessons } from "./content/searching";
import { treesLessons } from "./content/trees";
import { graphsDpLessons } from "./content/graphs-dp";
import { challengeLessons } from "./content/challenges";

export type RendererFamily = "svg" | "d3" | "three" | "skia" | "anime";
export type ContentModality = "read" | "listen" | "watch" | "interact" | "practice" | "reflect";

export type RendererSpec = {
  family: RendererFamily;
  component: string;
  fallback: string;
  nativeTarget?: "web" | "mobile" | "both";
};

type BaseBlock = {
  id: string;
  title: string;
  modality: ContentModality;
};

export type TextBlock = BaseBlock & {
  kind: "text";
  body: string[];
};

export type AudioBlock = BaseBlock & {
  kind: "audio";
  durationSeconds: number;
  script: string;
};

export type DiagramBlock = BaseBlock & {
  kind: "diagram";
  renderer: RendererSpec;
  prompt: string;
  data: Record<string, unknown>;
};

export type SimulationBlock = BaseBlock & {
  kind: "simulation";
  renderer: RendererSpec;
  controls: string[];
  successCriteria: string;
};

export type CodeTraceBlock = BaseBlock & {
  kind: "code-trace";
  language: "typescript" | "python" | "go";
  code: string;
  tracePoints: string[];
};

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizBlock = BaseBlock & {
  kind: "quiz";
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  feedback: string;
  incorrectFeedback: string;
  xp: number;
  nextBlockId?: string;
};

export type LabBlock = BaseBlock & {
  kind: "lab";
  renderer: RendererSpec;
  task: string;
  successCriteria: string;
  xp: number;
};

export type ReflectionBlock = BaseBlock & {
  kind: "reflection";
  prompt: string;
};

export type ProjectBlock = BaseBlock & {
  kind: "project";
  brief: string;
  deliverables: string[];
  xp: number;
};

export type CourseBlock =
  | TextBlock
  | AudioBlock
  | DiagramBlock
  | SimulationBlock
  | CodeTraceBlock
  | QuizBlock
  | LabBlock
  | ReflectionBlock
  | ProjectBlock;

export type CourseLesson = {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  outcomes: string[];
  blocks: CourseBlock[];
};

export type CourseUnit = {
  id: string;
  title: string;
  summary: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  level: "beginner" | "intermediate" | "advanced";
  outcomes: string[];
  rendererCapabilities: RendererSpec[];
  units: CourseUnit[];
};

export type LessonLearningGuide = {
  why: string;
  mentalModel: string;
  workedExample: string;
  commonTrap: string;
  practicePrompt: string;
  explainBack: string;
};

export type CourseCoverage = {
  unitCount: number;
  lessonCount: number;
  blockCount: number;
  blockKinds: CourseBlock["kind"][];
  rendererFamilies: RendererFamily[];
  assessmentCount: number;
};

export type RendererManifestEntry = {
  family: RendererFamily;
  components: string[];
  blockCount: number;
  webReady: boolean;
  mobileReady: boolean;
  fallbackReady: boolean;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type CourseCheckResult = {
  correct: boolean;
  xpAwarded: number;
  feedback: string;
  nextBlockId?: string;
};

const rendererCapabilities: RendererSpec[] = [
  {
    family: "svg",
    component: "concept-map",
    fallback: "Static accessible SVG diagram with labeled steps.",
    nativeTarget: "both"
  },
  {
    family: "d3",
    component: "data-driven-state-graph",
    fallback: "Ordered table of states and transitions.",
    nativeTarget: "web"
  },
  {
    family: "three",
    component: "spatial-structure-scene",
    fallback: "Layered 2D projection of the same structure.",
    nativeTarget: "web"
  },
  {
    family: "skia",
    component: "native-canvas-manipulative",
    fallback: "SVG/canvas manipulative when native Skia is unavailable.",
    nativeTarget: "mobile"
  },
  {
    family: "anime",
    component: "timeline-transition",
    fallback: "Step controls with reduced-motion state labels.",
    nativeTarget: "both"
  }
];

function text(id: string, title: string, body: string[]): TextBlock {
  return {
    id,
    title,
    kind: "text",
    modality: "read",
    body
  };
}

function audio(id: string, title: string, script: string, durationSeconds = 75): AudioBlock {
  return {
    id,
    title,
    kind: "audio",
    modality: "listen",
    durationSeconds,
    script
  };
}

function quiz(
  id: string,
  question: string,
  correctOptionId: string,
  nextBlockId?: string,
  overrides: Partial<Pick<QuizBlock, "question" | "options" | "feedback" | "incorrectFeedback">> = {}
): QuizBlock {
  return {
    id,
    title: "Quick check",
    kind: "quiz",
    modality: "practice",
    question: overrides.question ?? question,
    options: overrides.options ?? [
      { id: correctOptionId, label: defaultCorrectLabel(correctOptionId) },
      { id: "scan-left", label: "Scan the structure from the left every time" },
      { id: "memorize", label: "Memorize the answer shape without testing it" }
    ],
    correctOptionId,
    feedback: overrides.feedback ?? defaultFeedback(id),
    incorrectFeedback: overrides.incorrectFeedback ?? "Not yet. Look for the invariant, state, or data contract that stays true across the operation.",
    xp: id === "binary-search-check" ? 12 : 8,
    nextBlockId
  };
}

function diagram(id: string, title: string, family: RendererFamily, component: string, prompt: string, data: Record<string, unknown>): DiagramBlock {
  return {
    id,
    title,
    kind: "diagram",
    modality: "watch",
    renderer: {
      family,
      component,
      fallback: `Accessible ${title.toLowerCase()} walkthrough.`,
      nativeTarget: family === "skia" ? "mobile" : family === "d3" || family === "three" ? "web" : "both"
    },
    prompt,
    data
  };
}

function simulation(id: string, title: string, family: RendererFamily, component: string, controls: string[], successCriteria: string): SimulationBlock {
  return {
    id,
    title,
    kind: "simulation",
    modality: "interact",
    renderer: {
      family,
      component,
      fallback: `${title} can be stepped through without motion.`,
      nativeTarget: family === "three" ? "web" : "both"
    },
    controls,
    successCriteria
  };
}

function codeTrace(id: string, title: string, code: string, tracePoints: string[]): CodeTraceBlock {
  return {
    id,
    title,
    kind: "code-trace",
    modality: "interact",
    language: "typescript",
    code,
    tracePoints
  };
}

function lab(id: string, title: string, family: RendererFamily, component: string, task: string, successCriteria: string, xp = 16): LabBlock {
  return {
    id,
    title,
    kind: "lab",
    modality: "practice",
    renderer: {
      family,
      component,
      fallback: `${title} includes keyboard-accessible controls and text feedback.`,
      nativeTarget: family === "skia" ? "mobile" : family === "three" || family === "d3" ? "web" : "both"
    },
    task,
    successCriteria,
    xp
  };
}

function reflection(id: string, prompt: string): ReflectionBlock {
  return {
    id,
    title: "Reflection",
    kind: "reflection",
    modality: "reflect",
    prompt
  };
}

function project(id: string, title: string, brief: string, deliverables: string[], xp = 30): ProjectBlock {
  return {
    id,
    title,
    kind: "project",
    modality: "practice",
    brief,
    deliverables,
    xp
  };
}

function lesson(id: string, title: string, summary: string, outcomes: string[], blocks: CourseBlock[], estimatedMinutes = 9): CourseLesson {
  return {
    id,
    title,
    summary,
    estimatedMinutes,
    outcomes,
    blocks
  };
}

type ConceptLessonProfile = {
  read: string[];
  audioScript: string;
  diagramPrompt: string;
  diagramData: Record<string, unknown>;
  quizQuestion: string;
  correctLabel: string;
  wrongLabels: [string, string];
  feedback: string;
  incorrectFeedback: string;
  reflectionPrompt: string;
  guide: LessonLearningGuide;
};

const conceptLessonProfiles: Record<string, ConceptLessonProfile> = {
  "big-o-as-shape": {
    read: [
      "Big-O describes the shape of growth, not the exact stopwatch time on one machine.",
      "When input doubles, a linear algorithm roughly doubles its work, a quadratic algorithm can do about four times as much work, and a logarithmic algorithm may only add one more decision.",
      "Use the shape to compare approaches before code details distract you."
    ],
    audioScript: "Big-O is a growth sketch. Ask what happens when n doubles: linear work doubles, quadratic work can quadruple, and logarithmic work adds only one or two choices. The shape tells you which solution survives larger inputs.",
    diagramPrompt: "Step through how work changes when n grows from small to large.",
    diagramData: {
      nodes: ["n grows", "O(log n)", "O(n)", "O(n^2)"],
      feedback: ["Start by changing input size, not hardware.", "Logarithmic work grows by extra decisions.", "Linear work tracks each item once.", "Quadratic work pairs items and bends upward fast."],
      invariant: "complexity compares growth as input changes"
    },
    quizQuestion: "What does Big-O help you compare?",
    correctLabel: "Name the invariant and preserve it",
    wrongLabels: ["The exact runtime on your laptop", "The color or layout of the code"],
    feedback: "Right. Big-O compares how the amount of work grows as input size changes.",
    incorrectFeedback: "Not yet. Ignore machine speed and ask how the number of operations changes when n grows.",
    reflectionPrompt: "If n doubled from 1,000 to 2,000, which shape would you fear most and why?",
    guide: {
      why: "Big-O gives learners a way to reason before benchmarking. It protects you from choosing an approach that only looks fast on tiny inputs.",
      mentalModel: "Treat each complexity class as a curve. Doubling n is the pressure test that reveals whether the curve stays gentle or bends sharply upward.",
      workedExample: "If a loop checks 1,000 items, doubling n checks about 2,000. A nested pair check can jump toward 4,000,000 comparisons.",
      commonTrap: "The common mistake is treating Big-O as a memorized label instead of asking what repeated work appears as n grows.",
      practicePrompt: "Pick two input sizes and estimate how the number of decisions changes for O(log n), O(n), and O(n^2).",
      explainBack: "Explain Big-O by describing what happens to work when input size doubles."
    }
  },
  "loops-and-growth": {
    read: [
      "A loop is a repeated state transition. Count what changes each pass and what must remain true before the next pass starts.",
      "One loop over n items usually gives linear growth. A loop inside another loop often means each outer item triggers many inner checks.",
      "The trick is to count visits, not braces."
    ],
    audioScript: "Read loops as visits to state. One loop usually visits each item once. Nested loops may visit pairs of items. Before naming the complexity, ask what the inner loop does for every outer step.",
    diagramPrompt: "Watch one loop become many visits when another loop sits inside it.",
    diagramData: {
      nodes: ["one pass", "count visits", "nested pass", "pair growth"],
      feedback: ["Start with the state that changes each pass.", "Count how many times the body can run.", "Nested loops multiply repeated visits.", "Pair growth appears when each item compares with many others."],
      invariant: "growth comes from how many state visits the code can make"
    },
    quizQuestion: "What should you count before labeling loop complexity?",
    correctLabel: "Count how many state visits happen",
    wrongLabels: ["Count only the number of braces", "Assume every loop is always O(n)"],
    feedback: "Right. Complexity follows the number of times useful work can run.",
    incorrectFeedback: "Not yet. A loop body can run very different numbers of times depending on nesting and bounds.",
    reflectionPrompt: "Where would a nested loop stop being scary because the inner loop runs only a constant number of times?",
    guide: {
      why: "Loop complexity matters because a small-looking block can hide repeated work that dominates the program.",
      mentalModel: "A loop is a machine that revisits state. Complexity is the maximum number of meaningful visits.",
      workedExample: "A single pass over 10 items visits 10 states. A pairwise comparison can visit 10 times 10 states.",
      commonTrap: "Counting syntax instead of executions makes a nested loop look cheaper than it is.",
      practicePrompt: "For each loop, say what changes, how many values it can take, and whether another loop repeats inside it.",
      explainBack: "Explain loop growth by counting visits to state rather than reading code shape alone."
    }
  },
  "complexity-tradeoffs": {
    read: [
      "A time-space tradeoff spends memory to avoid repeated work, or spends time to avoid storing extra state.",
      "A hash set can remember values you have seen so a later lookup does not scan the whole list again.",
      "Good tradeoffs start with the operation you need to make cheap."
    ],
    audioScript: "Tradeoffs are budget moves. Extra memory can buy faster lookups, cached answers, or fewer repeated scans. Before spending memory, name the operation that gets cheaper and the constraint that makes the spend acceptable.",
    diagramPrompt: "Compare repeated scanning with storing a small memory of seen values.",
    diagramData: {
      nodes: ["slow scan", "store state", "fast lookup", "check budget"],
      feedback: ["Repeated work is the time cost.", "Stored state records what future steps need.", "Lookup becomes cheap because the answer is remembered.", "The trade is good only if memory is acceptable."],
      invariant: "a tradeoff is useful only when it makes the needed operation cheaper"
    },
    quizQuestion: "When is extra memory worth spending?",
    correctLabel: "When it removes repeated expensive work",
    wrongLabels: ["Whenever memory exists", "Only when it makes code shorter"],
    feedback: "Right. Memory is useful when it buys a real reduction in repeated work.",
    incorrectFeedback: "Not yet. Tie the memory cost to a specific operation that becomes cheaper.",
    reflectionPrompt: "Name one problem where a cache helps, and one where the memory cost would not be worth it.",
    guide: {
      why: "Tradeoffs are central to algorithm design because the fastest approach often stores extra evidence.",
      mentalModel: "Think of memory as a notebook. It helps only when a future step would otherwise recompute or rescan something.",
      workedExample: "Two-sum can scan previous numbers with a set instead of comparing every pair.",
      commonTrap: "Adding a data structure without naming the cheaper operation creates complexity without benefit.",
      practicePrompt: "For a candidate solution, write the time saved on one side and the memory spent on the other.",
      explainBack: "Explain a time-space tradeoff as spending stored state to avoid future work."
    }
  },
  "array-indexing": {
    read: [
      "An array stores items in contiguous slots, so index i is an offset from the start.",
      "Reading an index is cheap because the address is computed directly. Inserting in the middle is expensive because later items must shift.",
      "Ask whether the problem needs random reads or frequent middle edits."
    ],
    audioScript: "Array indexing is address arithmetic. The index tells you how far to jump from the start, so reads are constant time. Middle inserts are different: shifting neighbors preserves order but costs work.",
    diagramPrompt: "Move from base address to offset, then compare read and insert costs.",
    diagramData: {
      nodes: ["base", "offset i", "read slot", "shift tail"],
      feedback: ["The base address anchors the array.", "The index is an offset from that base.", "Reading jumps straight to the slot.", "Middle insertion shifts later items to preserve order."],
      invariant: "array order is stored by contiguous position"
    },
    quizQuestion: "Why is reading array[i] fast?",
    correctLabel: "The index computes a direct offset",
    wrongLabels: ["The array searches every earlier item", "The value is always cached by the CPU"],
    feedback: "Right. Contiguous storage lets the index point directly at the slot.",
    incorrectFeedback: "Not yet. Array reads are fast because position maps to an address, not because the array scans.",
    reflectionPrompt: "Would you choose an array for frequent middle insertions? Explain the shift cost.",
    guide: {
      why: "Array indexing explains why arrays are excellent for random access and weaker for middle edits.",
      mentalModel: "An array is a row of fixed-width slots. The index is an offset that tells the machine which slot to jump to.",
      workedExample: "Reading index 4 jumps to base plus four slots. Inserting at index 1 shifts indexes 1 through the end.",
      commonTrap: "Assuming every array operation is constant time hides the cost of preserving order after insertion.",
      practicePrompt: "For each operation, say whether it jumps to one slot or moves many slots.",
      explainBack: "Explain arrays by connecting index offsets to fast reads and shifts to expensive inserts."
    }
  },
  "two-pointers": {
    read: [
      "Two pointers are cursors that move through a sequence while a boundary rule stays true.",
      "One pointer might mark the left candidate while another marks the right candidate, or one may chase the other to define a window.",
      "The value is in the rule for moving them, not in having two variables."
    ],
    audioScript: "Two pointers work when movement preserves a boundary. Say what each pointer means, then move only the pointer that can no longer help. The invariant is the reason you avoid checking every pair.",
    diagramPrompt: "Advance two cursors and keep the candidate region honest.",
    diagramData: {
      nodes: ["left role", "right role", "move one", "region shrinks"],
      feedback: ["Name what the left pointer proves.", "Name what the right pointer proves.", "Move the pointer whose side can be discarded.", "The remaining region still contains every possible answer."],
      invariant: "each pointer movement must preserve the candidate region"
    },
    quizQuestion: "What makes a two-pointer solution valid?",
    correctLabel: "Each pointer move preserves the candidate rule",
    wrongLabels: ["Using variables named left and right", "Moving both pointers every loop"],
    feedback: "Right. The movement rule is what removes work safely.",
    incorrectFeedback: "Not yet. Two pointers are useful only when each movement is justified by a preserved boundary.",
    reflectionPrompt: "Describe a case where moving the wrong pointer would skip a valid answer.",
    guide: {
      why: "Two pointers turn many pair checks into a disciplined walk through a sequence.",
      mentalModel: "Each pointer is a boundary marker. The algorithm is the rule that says which boundary can move next.",
      workedExample: "In a sorted two-sum scan, if left plus right is too small, moving left is safe because smaller left values cannot help.",
      commonTrap: "Moving pointers by habit instead of proof can skip the only valid pair.",
      practicePrompt: "Before each pointer move, say which candidates are being eliminated and why.",
      explainBack: "Explain two pointers as boundary movement that safely shrinks the candidate space."
    }
  },
  "stack-queue-contracts": {
    read: [
      "A stack returns the most recent item first. A queue returns the oldest waiting item first.",
      "The structure is not decoration: it encodes the story of the work. Undo uses a stack; breadth-first search uses a queue.",
      "Choose by asking what should be handled next."
    ],
    audioScript: "Stacks and queues are promises about next. A stack says the newest item comes back first. A queue says the oldest waiting item comes back first. Match that promise to the problem story before coding.",
    diagramPrompt: "Compare newest-first and oldest-first access discipline.",
    diagramData: {
      nodes: ["push/enqueue", "stack next", "queue next", "match story"],
      feedback: ["Items enter the structure.", "A stack exposes the most recent item.", "A queue exposes the oldest waiting item.", "The right contract follows the story of what should happen next."],
      invariant: "access discipline decides which item becomes next"
    },
    quizQuestion: "How should you choose between stack and queue?",
    correctLabel: "Match next item order to the problem story",
    wrongLabels: ["Always use whichever is shorter to code", "Use a queue for every graph problem"],
    feedback: "Right. The access contract should match the next item the problem needs.",
    incorrectFeedback: "Not yet. The key difference is newest-first versus oldest-first behavior.",
    reflectionPrompt: "Why does undo feel like a stack while a service line feels like a queue?",
    guide: {
      why: "Access discipline changes behavior even when the stored items are identical.",
      mentalModel: "A stack is a pile; a queue is a line. The next item is determined by the contract.",
      workedExample: "Undo pops the latest action. A print queue serves the earliest waiting job.",
      commonTrap: "Choosing by habit instead of access order causes traversal and scheduling bugs.",
      practicePrompt: "For a scenario, say whether the newest item or oldest waiting item should be next.",
      explainBack: "Explain stacks and queues by naming the next-item contract."
    }
  },
  "sliding-window": {
    read: [
      "A sliding window keeps a contiguous region of a sequence and updates it as the region moves.",
      "Instead of recomputing a sum or count from scratch, you remove the item that leaves and add the item that enters.",
      "The window rule tells you when to expand, shrink, or record an answer."
    ],
    audioScript: "A sliding window is a moving summary. Keep a count, sum, or set for the active region. When the boundary moves, update only the entering and leaving items instead of repeating all the work.",
    diagramPrompt: "Watch a contiguous window move while its summary stays current.",
    diagramData: {
      nodes: ["open window", "add right", "remove left", "record answer"],
      feedback: ["Start with a valid contiguous region.", "Expanding includes one new item.", "Shrinking removes only the item that left.", "The answer uses the maintained summary."],
      invariant: "the summary must match exactly the active window"
    },
    quizQuestion: "What makes sliding window faster than recomputing?",
    correctLabel: "Update only the entering and leaving items",
    wrongLabels: ["Sort the sequence first every time", "Restart the count for each index"],
    feedback: "Right. The maintained summary avoids repeating work for overlapping windows.",
    incorrectFeedback: "Not yet. The speedup comes from updating the current window, not starting over.",
    reflectionPrompt: "Name the summary you would maintain for longest substring without repeats.",
    guide: {
      why: "Sliding windows exploit overlap between neighboring subarrays or substrings.",
      mentalModel: "The window is a moving frame, and the summary is true only for items inside that frame.",
      workedExample: "For a fixed-size sum, add the new right value and subtract the old left value.",
      commonTrap: "Forgetting to remove the left item makes the summary describe a larger region than the active window.",
      practicePrompt: "After every boundary move, state what entered, what left, and whether the summary is still true.",
      explainBack: "Explain sliding window as a maintained summary over a moving contiguous region."
    }
  },
  "tree-traversal": {
    read: [
      "Traversal order answers a question about a tree. Preorder sees the root before children; inorder reads a binary search tree in sorted order.",
      "Postorder waits until children are done, and level order moves by distance from the root.",
      "Choose the order by the evidence you need."
    ],
    audioScript: "Tree traversal is question-driven. If you need parents before children, use preorder. If you need sorted values from a search tree, use inorder. If children must finish first, use postorder. If distance matters, use level order.",
    diagramPrompt: "Compare traversal orders by the question each one answers.",
    diagramData: {
      nodes: ["root first", "left-root-right", "children first", "level by level"],
      feedback: ["Preorder records context before descendants.", "Inorder reveals sorted order in a BST.", "Postorder combines children before the parent.", "Level order explores by distance from the root."],
      invariant: "the visit order should match the question being answered"
    },
    quizQuestion: "Which traversal reads a binary search tree in sorted order?",
    correctLabel: "Inorder: left, root, right",
    wrongLabels: ["Preorder: root before children", "Level order: row by row"],
    feedback: "Right. Inorder uses the BST ordering rule to produce sorted values.",
    incorrectFeedback: "Not yet. For a BST, sorted order comes from left subtree, root, then right subtree.",
    reflectionPrompt: "Which traversal would you use to delete a tree safely, and why must children finish first?",
    guide: {
      why: "Traversal order determines what information is available when each node is processed.",
      mentalModel: "A traversal is a promise about when a node is visited relative to its children.",
      workedExample: "For values 1, 2, 3 in a BST, inorder visits 1, then 2, then 3.",
      commonTrap: "Memorizing names without matching them to use cases makes traversal choices arbitrary.",
      practicePrompt: "Before choosing an order, name whether parent, child, sorted, or distance information matters.",
      explainBack: "Explain tree traversal by linking the order to the question it answers."
    }
  },
  "heap-invariants": {
    read: [
      "A heap keeps the highest or lowest priority item at the root without fully sorting every item.",
      "After insert or remove, bubbling restores the parent-child priority rule.",
      "The invariant is local: each parent must be at least as important as its children in a max heap."
    ],
    audioScript: "A heap is not a sorted array. It only promises the best item is at the root and every parent beats its children. Bubble up and bubble down repair that promise after changes.",
    diagramPrompt: "Watch local parent-child swaps restore the root priority promise.",
    diagramData: {
      nodes: ["insert leaf", "compare parent", "bubble swap", "root best"],
      feedback: ["New items enter at a leaf.", "Only parent-child priority needs checking.", "Swap while the local rule is broken.", "The root exposes the best item without full sorting."],
      invariant: "every parent satisfies the heap priority rule"
    },
    quizQuestion: "What does a heap guarantee?",
    correctLabel: "The root holds the best-priority item",
    wrongLabels: ["Every item is globally sorted", "Lookup by arbitrary value is constant time"],
    feedback: "Right. A heap gives fast access to the best-priority item, not a fully sorted list.",
    incorrectFeedback: "Not yet. A heap preserves parent-child priority, not total sorted order.",
    reflectionPrompt: "Why is a heap useful for repeatedly taking the next highest-priority task?",
    guide: {
      why: "Heaps support priority queues without paying to keep every item sorted.",
      mentalModel: "A heap is a tree of local priority promises. The root is trustworthy because every parent beats its children.",
      workedExample: "Insert 9 under parent 5, swap them, then keep bubbling until no parent-child rule is broken.",
      commonTrap: "Expecting inorder sorted output from a heap confuses heap order with binary search tree order.",
      practicePrompt: "After each insert or removal, point to the first parent-child pair that violates priority.",
      explainBack: "Explain a heap as local priority repair that keeps the best item at the root."
    }
  },
  "graph-representations": {
    read: [
      "A graph representation decides how neighbors and edge checks are stored.",
      "An adjacency list is compact for sparse graphs and makes neighbor iteration natural. An adjacency matrix makes edge existence checks direct but spends space on every possible pair.",
      "Pick by graph density and query shape."
    ],
    audioScript: "Representations are query tradeoffs. Adjacency lists store actual neighbors, so sparse graphs stay compact. Matrices store every possible pair, so checking one edge is direct but memory grows quickly.",
    diagramPrompt: "Compare neighbor lists with a pair matrix for the same graph.",
    diagramData: {
      nodes: ["list edges", "iterate neighbors", "matrix cells", "check pair"],
      feedback: ["Adjacency lists store only known connections.", "Neighbor iteration is natural from a list.", "A matrix allocates a cell for each pair.", "Pair lookup is direct when the matrix cell exists."],
      invariant: "the representation should make the common graph query cheap"
    },
    quizQuestion: "When is an adjacency list usually better?",
    correctLabel: "Sparse graph with neighbor iteration",
    wrongLabels: ["Dense graph with every pair connected", "When edge weights must disappear"],
    feedback: "Right. Sparse graphs avoid wasting matrix space on missing edges.",
    incorrectFeedback: "Not yet. Lists shine when there are far fewer edges than possible pairs.",
    reflectionPrompt: "For a social network with millions of users and few direct friends per user, which representation fits?",
    guide: {
      why: "Graph representation affects both memory cost and the speed of common graph operations.",
      mentalModel: "A list stores actual relationships; a matrix stores a yes-or-no slot for every possible relationship.",
      workedExample: "Five nodes with four edges use four neighbor entries in a list but twenty-five cells in a matrix.",
      commonTrap: "Choosing a matrix for a sparse graph wastes space before the algorithm even starts.",
      practicePrompt: "Estimate node count, edge count, and the most common query before picking a representation.",
      explainBack: "Explain graph representations as matching storage shape to graph density and query needs."
    }
  },
  "shortest-paths": {
    read: [
      "Shortest path means different things depending on edge weights.",
      "If every edge costs the same, BFS finds the fewest-edge path by expanding one distance layer at a time.",
      "If edges have weights, you need relaxation logic such as Dijkstra's algorithm because fewer edges may not mean lower cost."
    ],
    audioScript: "Shortest path starts with the edge contract. Unweighted edges let BFS expand by distance layers. Weighted edges need relaxation, because a path with more edges can still be cheaper than one heavy edge.",
    diagramPrompt: "Choose BFS or weighted relaxation by reading the edge costs.",
    diagramData: {
      nodes: ["read costs", "unweighted BFS", "weighted relax", "prove distance"],
      feedback: ["First ask whether every edge has the same cost.", "BFS works when each step costs one.", "Weighted graphs need relaxation of candidate distances.", "The chosen method must prove the best known distance."],
      invariant: "path cost must match the edge-cost contract"
    },
    quizQuestion: "When is BFS enough for shortest paths?",
    correctLabel: "When all edges have equal cost",
    wrongLabels: ["Whenever the graph has cycles", "Only when the graph is a tree"],
    feedback: "Right. Equal-cost edges let BFS layer order match shortest distance.",
    incorrectFeedback: "Not yet. Weighted edges can make a later-looking path cheaper.",
    reflectionPrompt: "Give an example where two edges with low weights beat one expensive direct edge.",
    guide: {
      why: "Shortest path algorithms depend on whether distance means edge count or total weight.",
      mentalModel: "BFS is a wave of equal-cost steps. Weighted relaxation is a ledger of best known costs.",
      workedExample: "A direct edge costing 10 can lose to two edges costing 3 and 3.",
      commonTrap: "Using BFS on weighted edges confuses fewest steps with cheapest route.",
      practicePrompt: "Before choosing an algorithm, mark whether edges are unweighted, nonnegative weighted, or may be negative.",
      explainBack: "Explain shortest paths by naming the edge-cost contract before naming the algorithm."
    }
  },
  "sorting-invariants": {
    read: [
      "A sorting algorithm is easier to trust when you can name the sorted region and the unknown region.",
      "Bubble sort grows a settled suffix; insertion sort grows a sorted prefix; partitioning separates values around a pivot.",
      "The invariant explains why each pass moves the array closer to sorted."
    ],
    audioScript: "Sorting is not magic movement. Each algorithm protects a region. Name which part is already sorted, which part is unknown, and what one pass guarantees before you compare another pair.",
    diagramPrompt: "Watch the sorted region grow while the unknown region shrinks.",
    diagramData: {
      nodes: ["unknown", "compare pair", "grow sorted", "verify order"],
      feedback: ["Start with an unsorted region.", "Each comparison has a local job.", "The algorithm grows a region with a promise.", "Sorting is done when the promise covers the array."],
      invariant: "the sorted region must mean something precise after each pass"
    },
    quizQuestion: "What should you name before tracing a sort?",
    correctLabel: "The sorted region and the unknown region",
    wrongLabels: ["Only the final sorted answer", "The fastest programming language"],
    feedback: "Right. A sorting trace becomes understandable when the protected region is named.",
    incorrectFeedback: "Not yet. The important proof is which region is already guaranteed sorted.",
    reflectionPrompt: "For insertion sort, what does the sorted prefix guarantee after each insertion?",
    guide: {
      why: "Sorting invariants turn a moving array into a proof you can check after each step.",
      mentalModel: "The array is split into regions. Each pass must expand the region with a guarantee.",
      workedExample: "After one bubble-sort pass, the largest value has moved to the end, so the settled suffix has length one.",
      commonTrap: "Watching swaps without naming the protected region makes sorting feel random.",
      practicePrompt: "After every pass, point to the sorted region and say why it is safe.",
      explainBack: "Explain a sort by naming the region that becomes guaranteed after each operation."
    }
  },
  "selection-partition": {
    read: [
      "Selection finds the item with a target rank, such as the kth smallest, without fully sorting every value.",
      "Partitioning chooses a pivot and moves smaller values to one side and larger values to the other.",
      "After partition, the pivot rank tells you which side can still contain the answer."
    ],
    audioScript: "Selection uses partitioning to avoid sorting everything. Once the pivot lands at its rank, only one side can contain the kth value. The other side is not fully sorted, but it is no longer needed.",
    diagramPrompt: "Partition around a pivot and discard the side whose ranks cannot contain k.",
    diagramData: {
      nodes: ["pick pivot", "partition sides", "read rank", "search one side"],
      feedback: ["Choose a pivot to compare against.", "Partition separates lower and higher values.", "The pivot rank reveals where k can live.", "Only the possible side needs more work."],
      invariant: "partition preserves enough rank information to ignore one side"
    },
    quizQuestion: "Why can selection avoid fully sorting?",
    correctLabel: "Partition rank discards one side",
    wrongLabels: ["It guesses the answer without comparisons", "It sorts both sides completely every time"],
    feedback: "Right. The pivot rank tells you which side still matters for the target rank.",
    incorrectFeedback: "Not yet. Selection uses partition rank evidence, not a completed sort.",
    reflectionPrompt: "If the pivot lands at rank 7 and you need rank 3, which side can you ignore?",
    guide: {
      why: "Selection is useful when rank matters but full order does not.",
      mentalModel: "Partitioning gives a pivot a final rank. The target rank must be on one side or at the pivot.",
      workedExample: "If the pivot becomes the fifth smallest and you need the second smallest, search only the lower side.",
      commonTrap: "Sorting both sides after partition wastes the advantage of selection.",
      practicePrompt: "After each partition, compare pivot rank with k and state which side remains possible.",
      explainBack: "Explain selection as using pivot rank to throw away the side that cannot contain the answer."
    }
  },
  "recursion-to-memo": {
    read: [
      "Recursion branches can ask the same smaller question many times.",
      "Memoization gives each subproblem a key and stores the answer the first time it is solved.",
      "The speedup appears when later branches reuse the stored answer instead of recomputing the whole subtree."
    ],
    audioScript: "Memoization is remembering subproblem answers. Name the state that makes a question unique, store the answer under that key, and reuse it when recursion asks the same question again.",
    diagramPrompt: "Turn repeated recursive branches into stored subproblem answers.",
    diagramData: {
      nodes: ["branch", "repeat state", "store answer", "reuse answer"],
      feedback: ["Recursion splits into smaller questions.", "Different branches may ask the same state.", "Memoization stores the first solved answer.", "Later calls reuse the answer instead of branching again."],
      invariant: "the memo key must fully identify the subproblem"
    },
    quizQuestion: "What must a memoization key capture?",
    correctLabel: "All state that defines the subproblem",
    wrongLabels: ["Only the function name", "Only the final output value"],
    feedback: "Right. The key must identify when two calls are truly the same subproblem.",
    incorrectFeedback: "Not yet. A memo is safe only when the key captures the whole state of the question.",
    reflectionPrompt: "For Fibonacci, why is n enough as the memo key?",
    guide: {
      why: "Memoization turns repeated recursive work into table lookups.",
      mentalModel: "Each unique subproblem gets a label. Solving it once creates an answer that later calls can trust.",
      workedExample: "fib(5) asks for fib(3) through multiple branches, but a memo stores fib(3) after the first solve.",
      commonTrap: "Using an incomplete key reuses answers for questions that are not actually the same.",
      practicePrompt: "Before memoizing, write the exact state variables that define one subproblem.",
      explainBack: "Explain memoization as naming subproblem state and reusing answers for repeated calls."
    }
  },
  "greedy-choice": {
    read: [
      "A greedy algorithm makes the best-looking local choice and commits to it.",
      "That is only safe when you can prove the local choice does not block the best global answer.",
      "The proof usually shows an exchange: any optimal answer can be adjusted to include the greedy choice."
    ],
    audioScript: "Greedy is not just picking what looks best. The local choice needs a safety proof. Ask whether choosing it now can be exchanged into some optimal solution without making the final answer worse.",
    diagramPrompt: "Test a local choice against the proof that it stays globally safe.",
    diagramData: {
      nodes: ["local best", "safety rule", "exchange proof", "commit"],
      feedback: ["A greedy step chooses the most attractive local option.", "A safety rule explains why that option is allowed.", "The exchange proof shows an optimal answer can include it.", "Commit only after the proof survives."],
      invariant: "each committed choice must remain compatible with an optimal answer"
    },
    quizQuestion: "What makes a greedy choice trustworthy?",
    correctLabel: "A proof the local choice stays globally safe",
    wrongLabels: ["It feels intuitive on the first example", "It always uses the smallest number"],
    feedback: "Right. Greedy choices need a safety argument, often an exchange proof.",
    incorrectFeedback: "Not yet. A local best choice can fail unless it is proven safe globally.",
    reflectionPrompt: "Describe a local choice that looks good now but could block a better future result.",
    guide: {
      why: "Greedy algorithms are fast and elegant when the local choice is provably safe.",
      mentalModel: "A greedy step is a commitment. The proof says that commitment can live inside an optimal solution.",
      workedExample: "For interval scheduling, picking the earliest finishing event leaves the most room for future compatible events.",
      commonTrap: "Testing greedy on one example is not the same as proving the choice is safe.",
      practicePrompt: "For a greedy idea, write the exchange argument or find a counterexample.",
      explainBack: "Explain greedy strategy as a local commitment backed by a global safety proof."
    }
  },
  "problem-reading": {
    read: [
      "Good algorithm work starts before coding: extract inputs, outputs, constraints, and examples.",
      "Constraints reveal whether brute force can survive or whether you need a better structure.",
      "Hidden invariants often appear in words like sorted, unique, adjacent, shortest, or repeated."
    ],
    audioScript: "Read the problem like a detective. Circle inputs, outputs, constraints, and special words. Those words are signals: sorted suggests binary search or two pointers, shortest suggests graph search, repeated suggests memoization or hashing.",
    diagramPrompt: "Convert problem wording into algorithm signals before picking a solution.",
    diagramData: {
      nodes: ["inputs", "constraints", "signal words", "approach"],
      feedback: ["Start by naming what data enters.", "Constraints limit which approaches can survive.", "Signal words reveal structure and invariants.", "Only then choose an approach to trace."],
      invariant: "the approach must answer the problem constraints, not just the sample"
    },
    quizQuestion: "What should happen before writing code?",
    correctLabel: "Extract constraints and signal words",
    wrongLabels: ["Start typing the first loop", "Ignore examples until the end"],
    feedback: "Right. Constraints and signal words tell you which algorithm families are plausible.",
    incorrectFeedback: "Not yet. Jumping to code before reading constraints often chooses the wrong shape.",
    reflectionPrompt: "List three words in a problem statement that would change your algorithm choice.",
    guide: {
      why: "Problem reading prevents wasted implementation time by revealing the actual algorithm signals.",
      mentalModel: "A problem statement is a map: constraints are borders, examples are landmarks, and signal words point to structures.",
      workedExample: "The phrase sorted array with target should trigger candidate approaches like binary search or two pointers.",
      commonTrap: "Solving only the sample input can miss constraints that break the chosen approach.",
      practicePrompt: "Before coding, write inputs, outputs, constraints, signal words, and one edge case.",
      explainBack: "Explain problem reading as translating wording into constraints, invariants, and candidate structures."
    }
  },
  "choose-data-structure": {
    read: [
      "A data structure is chosen by the operations the problem needs to make cheap.",
      "Hash sets make membership checks cheap, heaps make repeated best-item removal cheap, and queues make oldest-next processing explicit.",
      "Map the desired operations before choosing the structure."
    ],
    audioScript: "Do not choose structures by name recognition. Write the operations first: lookup, insert, delete, min, next, neighbor iteration. Then choose the structure whose contract makes those operations natural.",
    diagramPrompt: "Map operation needs to structure contracts before implementation.",
    diagramData: {
      nodes: ["need lookup", "need next", "need priority", "choose contract"],
      feedback: ["Membership-heavy problems point toward sets or maps.", "Order-of-arrival problems point toward queues.", "Best-next problems point toward heaps.", "The chosen structure should make the core operation cheap."],
      invariant: "the structure must serve the operation the problem repeats"
    },
    quizQuestion: "What is the best reason to choose a data structure?",
    correctLabel: "It makes the repeated operation cheap",
    wrongLabels: ["It was used in the previous lesson", "It has the shortest name"],
    feedback: "Right. Structure choice follows the operation contract the problem repeats.",
    incorrectFeedback: "Not yet. Start with the operations the problem needs, then pick the matching contract.",
    reflectionPrompt: "For a problem with many membership checks, why does a set beat repeated array scanning?",
    guide: {
      why: "Data structure choice is where many algorithm speedups come from.",
      mentalModel: "Each structure is a contract for operations. Choose the contract that matches the repeated need.",
      workedExample: "If you repeatedly ask have I seen this value, a hash set turns scans into direct membership checks.",
      commonTrap: "Choosing a fashionable structure without matching operations adds complexity without solving the bottleneck.",
      practicePrompt: "List the top two repeated operations, then name the structure that makes each one cheap.",
      explainBack: "Explain data structure choice as matching repeated operations to the structure's contract."
    }
  }
};

const lessonGuideOverrides: Record<string, Partial<LessonLearningGuide>> = {
  "binary-search-invariants": {
    why: "Binary search is a lesson in earning every discard. The moment the target can leave the active range, the speedup becomes a bug.",
    mentalModel: "The sorted window is the contract: binary search only works because the answer is never allowed to leave the active window. Low and high name every place where the target can still live.",
    workedExample: "In [4, 8, 12, 16, 20, 24, 28], we compare against 16, discard the left half, then keep 20 inside the remaining window.",
    commonTrap: "Moving both bounds because the midpoint felt wrong breaks the proof. One comparison should eliminate exactly the impossible half.",
    practicePrompt: "Before each click, say why the discarded half cannot contain the target.",
    explainBack: "Explain binary search as a repeated promise: sorted data lets one comparison remove half the remaining candidates."
  },
  "tree-rotations": {
    why: "Balanced search trees need rotations so lookup stays fast after inserts and deletes change height.",
    mentalModel: "A rotation is local pointer choreography: the shape changes, but every value must still appear in sorted inorder order.",
    workedExample: "For a left rotation, the right child rises, the old root moves left, and the middle subtree reconnects where its values still fit inorder.",
    commonTrap: "Treating rotation like a visual spin loses the middle subtree. Every moved pointer must preserve sorted order.",
    practicePrompt: "After each rotation, read the inorder sequence out loud and check that it has not changed.",
    explainBack: "Explain how a tree can change height without changing the answers returned by search."
  },
  "dp-table-fill": {
    why: "Dynamic programming is useful when a hard problem keeps asking for answers to the same smaller problems.",
    mentalModel: "A cell is ready only when the cells it depends on are already solved. A DP cell is a named promise: once filled, it stores the answer for one exact subproblem.",
    workedExample: "Fill base cells first, then let each new cell read only solved neighbors until the final answer has all dependency evidence behind it.",
    commonTrap: "Filling cells in a convenient visual order can ask for a value that has not been solved yet.",
    practicePrompt: "For every highlighted cell, point to the dependency cells that already justify it.",
    explainBack: "Explain DP as choosing state, proving dependencies, and filling from known answers toward the target answer."
  },
  "hash-table-load": {
    why: "Hash tables feel constant time only while bucket pressure stays under control.",
    mentalModel: "Load factor is the table's pressure gauge: too many keys per bucket turns direct lookup into searching a small crowd.",
    workedExample: "Insert keys until one bucket collides repeatedly, then resize so the same keys spread across more positions.",
    commonTrap: "Memorizing that hash maps are O(1) hides the collision story that makes resizing necessary.",
    practicePrompt: "Predict which bucket gets crowded before stepping the collision timeline.",
    explainBack: "Explain why resizing spends work now to protect future lookups."
  },
  "linked-list-pointers": {
    why: "Linked lists make insertion cheap only if every node remains reachable while pointers change.",
    mentalModel: "A pointer is a saved route. Rewiring is safe when you keep the old route before replacing it.",
    workedExample: "To insert after current, create the new node, point it at current.next, then point current.next at the new node.",
    commonTrap: "Overwriting current.next too early drops the rest of the chain.",
    practicePrompt: "Name the pointer you must save before each reconnect.",
    explainBack: "Explain linked-list insertion as preserving reachability while changing one local connection."
  },
  "bfs-dfs-frontiers": {
    why: "Graph traversal depends on frontier discipline: the data structure decides the order of discovery.",
    mentalModel: "BFS is a queue that expands by distance; DFS is a stack that follows depth before siblings.",
    workedExample: "Start at A, enqueue neighbors for BFS, and watch each layer finish before the next layer begins.",
    commonTrap: "Skipping the seen set lets cycles turn traversal into repeated work.",
    practicePrompt: "Before visiting a node, say whether it came from queue order or stack order.",
    explainBack: "Explain why BFS finds shortest unweighted paths and DFS does not guarantee that."
  },
  "capstone-arcade": {
    why: "The capstone tests whether the learning loop transfers to unseen problems, not whether you remember labels.",
    mentalModel: "Read constraints, name the invariant, choose the structure, trace one example, then code.",
    workedExample: "For a route problem, identify unweighted edges, choose BFS, trace the frontier, then state the complexity.",
    commonTrap: "Jumping to code before naming the invariant makes debugging feel random.",
    practicePrompt: "For each challenge, write the one sentence that justifies the chosen data structure.",
    explainBack: "Explain your solution as a chain of evidence: problem signal, invariant, structure, trace, complexity."
  }
};

export function getLessonLearningGuide(lesson: CourseLesson): LessonLearningGuide {
  const primaryOutcome = lesson.outcomes[0] ?? `Explain ${lesson.title.toLowerCase()}`;
  const secondaryOutcome = lesson.outcomes[1] ?? "check the invariant after each step";
  const fallback: LessonLearningGuide = {
    why: `${lesson.summary} It matters because the right algorithm starts with the state that must stay true, not with code syntax.`,
    mentalModel: `Treat ${lesson.title.toLowerCase()} as a contract: ${primaryOutcome.toLowerCase()}.`,
    workedExample: `Use one tiny input, name the current state, apply one operation, then check whether you can still ${secondaryOutcome.toLowerCase()}.`,
    commonTrap: `The common failure is moving too fast from the name of ${lesson.title.toLowerCase()} to implementation without proving the invariant on an example.`,
    practicePrompt: "Predict the next state before using the visual, then compare the feedback with the rule you named.",
    explainBack: `Explain ${lesson.title.toLowerCase()} by naming the problem signal, the invariant, and the operation that preserves it.`
  };

  return {
    ...fallback,
    ...(conceptLessonProfiles[lesson.id]?.guide ?? {}),
    ...(lessonGuideOverrides[lesson.id] ?? {})
  };
}

function conceptLesson(id: string, title: string, summary: string, correctOptionId: string): CourseLesson {
  const profile = conceptLessonProfiles[id];
  const correctLabel = profile?.correctLabel ?? defaultCorrectLabel(correctOptionId);

  return lesson(id, title, summary, [`Explain ${title.toLowerCase()} in one minute`, "Choose the right data contract under pressure"], [
    text(`${id}-read`, title, profile?.read ?? [summary, "The useful habit is to name the state that stays true before every operation."]),
    audio(`${id}-audio`, `${title} audio`, profile?.audioScript ?? `${title}: say the invariant first, then run the operation.`),
    diagram(
      `${id}-map`,
      `${title} map`,
      "svg",
      "concept-map",
      profile?.diagramPrompt ?? "Trace the states from input to output.",
      profile?.diagramData ?? { nodes: ["input", "state", "operation", "output"] }
    ),
    quiz(
      `${id}-check`,
      profile?.quizQuestion ?? `What keeps ${title.toLowerCase()} reliable?`,
      correctOptionId,
      undefined,
      profile ? {
        options: [
          { id: correctOptionId, label: correctLabel },
          { id: "distractor-one", label: profile.wrongLabels[0] },
          { id: "distractor-two", label: profile.wrongLabels[1] }
        ],
        feedback: profile.feedback,
        incorrectFeedback: profile.incorrectFeedback
      } : undefined
    ),
    reflection(`${id}-reflection`, profile?.reflectionPrompt ?? `Where would ${title.toLowerCase()} fail if the invariant was false?`)
  ]);
}

export function buildAlgorithmsDataStructuresCourse(): Course {
  return {
    id: "algorithms-data-structures",
    title: "Algorithms & Data Structures",
    subtitle: "A complete path from mental models to tactile interview practice.",
    audience: "Learners who want durable algorithm intuition through micro lessons, visualizations, checks, and games.",
    level: "beginner",
    outcomes: [
      "Reason about complexity with concrete growth models",
      "Select data structures by operation contract",
      "Trace searching, sorting, tree, graph, and dynamic programming algorithms",
      "Practice implementation choices through interactive labs"
    ],
    rendererCapabilities,
    units: [
      {
        id: "mental-models-complexity",
        title: "Mental Models & Complexity",
        summary: "Build the vocabulary for comparing algorithms without hiding behind notation.",
        lessons: [
          conceptLesson("big-o-as-shape", "Big-O as Shape", "Compare growth by sketching how work changes when input doubles.", "name-invariant"),
          conceptLesson("loops-and-growth", "Loops and Growth", "Read nested loops as repeated state transitions, not magic formulas.", "name-invariant"),
          conceptLesson("complexity-tradeoffs", "Time Space Tradeoffs", "Trade memory for fewer repeated operations and know when that helps.", "name-invariant")
        ]
      },
      {
        id: "arrays-strings-linked-lists",
        title: "Arrays, Strings & Linked Lists",
        summary: "Understand contiguous memory, pointer hops, and sequence manipulation.",
        lessons: [
          conceptLesson("array-indexing", "Array Indexing", "Use offsets to reason about constant-time reads and expensive inserts.", "name-invariant"),
          conceptLesson("two-pointers", "Two Pointers", "Move two cursors through a sequence while preserving a boundary invariant.", "name-invariant"),
          lesson("linked-list-pointers", "Linked List Pointers", "Feel why pointer rewiring is cheap and random access is expensive.", ["Rewire next pointers safely", "Compare arrays and linked lists"], [
            text("linked-list-read", "Pointer contracts", ["A linked list node owns a value and a pointer to the next node.", "Most bugs happen when a temporary pointer is lost before the reconnect."]),
            diagram("linked-list-pointer-skia", "Skia pointer manipulative", "skia", "linked-list-rewire", "Drag nodes on native canvas and keep the chain connected.", { nodes: ["head", "current", "next"] }),
            codeTrace("linked-list-trace", "Insert after current", "current.next = new Node(value, current.next);", ["Save current", "Create node", "Point new node to old next", "Point current to new node"]),
            quiz("linked-list-check", "What must stay reachable during insertion?", "name-invariant"),
            lab("linked-list-lab", "Repair the chain", "skia", "linked-list-rewire", "Reconnect a broken list without dropping a node.", "All nodes remain reachable from head.")
          ])
        ]
      },
      {
        id: "stacks-queues-hash-tables",
        title: "Stacks, Queues & Hash Tables",
        summary: "Use access discipline and hashing to make operation choices obvious.",
        lessons: [
          conceptLesson("stack-queue-contracts", "Stack and Queue Contracts", "Choose last-in-first-out or first-in-first-out by the story of the problem.", "name-invariant"),
          lesson("hash-table-load", "Hash Table Load", "Watch collisions, resizing, and lookup cost as motion instead of mystery.", ["Explain load factor", "Predict resize pressure"], [
            text("hash-load-read", "Buckets and pressure", ["A hash table is fast when keys spread across buckets.", "Load factor tells you when collisions become too common."]),
            simulation("hash-collision-motion", "Collision timeline", "anime", "hash-collision-timeline", ["insert", "collide", "resize"], "Learner predicts when resize happens."),
            diagram("hash-bucket-map", "Bucket map", "svg", "bucket-map", "Compare before and after resize.", { buckets: [1, 4, 2, 0, 3] }),
            quiz("hash-table-check", "What does resizing protect?", "name-invariant", "hash-collision-motion"),
            lab("hash-table-lab", "Balance the buckets", "anime", "hash-collision-timeline", "Insert keys while keeping bucket pressure under control.", "No bucket exceeds the collision threshold.")
          ]),
          conceptLesson("sliding-window", "Sliding Window", "Maintain a moving window so repeated work falls away.", "name-invariant")
        ]
      },
      {
        id: "trees-heaps",
        title: "Trees & Heaps",
        summary: "See hierarchy, height, ordering, and rotations as spatial operations.",
        lessons: [
          conceptLesson("tree-traversal", "Tree Traversal", "Choose preorder, inorder, postorder, or level order by the question being asked.", "name-invariant"),
          conceptLesson("heap-invariants", "Heap Invariants", "Keep the best item at the root without fully sorting everything.", "name-invariant"),
          lesson("tree-rotations", "Tree Rotations", "Rotate a tree in 3D space and keep inorder order intact.", ["Rotate without losing sorted order", "Explain balance as height control"], [
            text("tree-rotation-read", "Rotation promise", ["A rotation changes height while preserving inorder order.", "The local subtree changes shape; the sorted sequence stays identical."]),
            simulation("tree-rotation-3d", "Tree rotation 3D", "three", "tree-rotation-scene", ["rotate-left", "rotate-right", "reset"], "The inorder sequence remains 1,2,3,4,5."),
            diagram("tree-rotation-fallback", "Rotation fallback", "svg", "tree-rotation-2d", "Step through the same rotation in 2D.", { before: ["1", "2", "3"], after: ["1", "3", "2"] }),
            quiz("tree-rotation-check", "What must stay true after rotation?", "name-invariant", "tree-rotation-3d"),
            lab("tree-rotation-lab", "Balance the subtree", "three", "tree-rotation-scene", "Rotate until the selected subtree height drops.", "Tree height decreases while sorted order remains.")
          ])
        ]
      },
      {
        id: "graphs",
        title: "Graphs",
        summary: "Represent relationships, traverse frontiers, and reason about shortest paths.",
        lessons: [
          conceptLesson("graph-representations", "Graph Representations", "Pick adjacency lists or matrices by density and query shape.", "name-invariant"),
          lesson("bfs-dfs-frontiers", "BFS and DFS Frontiers", "Watch the frontier expand as a data structure choice.", ["Use queue for BFS", "Use stack or recursion for DFS"], [
            text("frontier-read", "Frontier discipline", ["BFS explores by distance using a queue.", "DFS explores by depth using a stack or call stack."]),
            diagram("frontier-d3", "D3 frontier graph", "d3", "frontier-graph", "Toggle queue and stack to see traversal order.", { nodes: ["A", "B", "C", "D", "E"], edges: [["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"]] }),
            codeTrace("frontier-trace", "BFS loop", "while (queue.length) { visit(queue.shift()); }", ["enqueue start", "dequeue", "visit neighbors", "mark seen"]),
            quiz("frontier-check", "Which structure gives shortest unweighted paths?", "name-invariant", "frontier-d3"),
            lab("frontier-lab", "Find the frontier", "d3", "frontier-graph", "Reach every node without revisiting one.", "Every node is visited once.")
          ]),
          conceptLesson("shortest-paths", "Shortest Paths", "Separate unweighted BFS from weighted relaxation.", "name-invariant")
        ]
      },
      {
        id: "sorting-searching-selection",
        title: "Sorting, Searching & Selection",
        summary: "Trace ordering invariants from binary search through partition-based selection.",
        lessons: [
          conceptLesson("sorting-invariants", "Sorting Invariants", "Name the sorted region and the unknown region before every pass.", "name-invariant"),
          lesson("binary-search-invariants", "Binary Search Invariants", "Keep the answer inside a sorted window while cutting the work in half.", ["Maintain low and high bounds", "Explain logarithmic search"], [
            text("binary-search-read", "The window promise", ["Binary search is not about guessing the middle.", "It is about preserving the promise that the answer, if it exists, is inside the current window."]),
            audio("binary-search-audio", "Binary search audio", "Low and high are a contract. Mid is just the question you ask to shrink that contract.", 64),
            diagram("binary-search-window", "Binary search window", "d3", "binary-search-window", "Drag the target and watch low/high shrink.", { values: [4, 8, 12, 16, 20, 24, 28], target: 20 }),
            codeTrace("binary-search-trace", "Binary search loop", "while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); }", ["choose mid", "compare target", "discard impossible half", "preserve window"]),
            quiz("binary-search-check", "Why is binary search fast on sorted data?", "halve-space", "binary-search-window"),
            lab("binary-search-lab", "Keep the target inside", "d3", "binary-search-window", "Shrink the window until only the target remains.", "The target is never discarded.")
          ]),
          conceptLesson("selection-partition", "Selection and Partition", "Use partitioning to find a rank without fully sorting.", "name-invariant")
        ]
      },
      {
        id: "dynamic-programming-greedy",
        title: "Dynamic Programming & Greedy Strategy",
        summary: "Turn repeated subproblems into tables and distinguish local choices from reusable state.",
        lessons: [
          conceptLesson("recursion-to-memo", "Recursion to Memo", "Cache answers when branches ask the same question again.", "name-invariant"),
          lesson("dp-table-fill", "DP Grid Fill", "Fill a table by dependency order and feel why direction matters.", ["Identify subproblem state", "Fill cells only after dependencies"], [
            text("dp-grid-read", "Cells are promises", ["Each cell stores the best answer for a smaller problem.", "The fill order matters because a cell can only use solved neighbors."]),
            diagram("dp-grid-fill", "DP grid fill", "svg", "dp-grid", "Tap cells in dependency order.", { rows: 4, columns: 5, dependencies: ["top", "left"] }),
            simulation("dp-grid-motion", "DP fill timeline", "anime", "dp-grid-timeline", ["step", "reset", "auto"], "Every highlighted cell has solved dependencies."),
            quiz("dp-grid-check", "When is a DP cell ready?", "name-invariant", "dp-grid-fill"),
            lab("dp-grid-lab", "Fill the table", "svg", "dp-grid", "Complete a grid without using unsolved neighbors.", "All dependencies are satisfied.")
          ]),
          conceptLesson("greedy-choice", "Greedy Choice", "Prove a local choice is safe before trusting it.", "name-invariant")
        ]
      },
      {
        id: "capstone-interview-arcade",
        title: "Capstone Interview Arcade",
        summary: "Bring the course together with problem reading, structure choice, and timed practice.",
        lessons: [
          conceptLesson("problem-reading", "Problem Reading", "Extract inputs, outputs, constraints, and hidden invariants before coding.", "name-invariant"),
          conceptLesson("choose-data-structure", "Choose the Data Structure", "Map desired operations to the structure that makes them natural.", "name-invariant"),
          lesson("capstone-arcade", "Capstone Arcade", "Solve a mixed set of algorithm challenges with hints, checks, and reflections.", ["Pick an approach", "Justify complexity", "Practice under timed feedback"], [
            text("capstone-read", "Capstone loop", ["Read the problem.", "Name the invariant.", "Pick the structure.", "Trace one example.", "Only then code."]),
            lab("capstone-sort-lab", "Sorting arcade", "svg", "sorting-bars", "Sort a noisy input by choosing comparisons and swaps.", "Array is sorted with minimal unnecessary swaps.", 24),
            lab("capstone-graph-lab", "Graph route arcade", "d3", "frontier-graph", "Find the shortest unweighted route while avoiding revisits.", "Route reaches the goal with BFS frontier discipline.", 24),
            project("capstone-project", "Build an algorithm explainer", "Create a tiny explainer for one unseen problem using at least one diagram, one check, and one complexity claim.", ["Problem summary", "Invariant", "Diagram", "Quiz", "Complexity note"], 40),
            reflection("capstone-reflection", "What signal told you which data structure to choose?")
          ])
        ]
      },
      {
        id: "sorting-algorithms-deep",
        title: "Sorting Algorithms in Practice",
        summary: "Read, trace, and choose between bubble, quick, and merge sort with real code.",
        lessons: sortingLessons
      },
      {
        id: "searching-algorithms-deep",
        title: "Searching Algorithms in Practice",
        summary: "Trace linear, binary, and jump search on sorted and unsorted data.",
        lessons: searchingLessons
      },
      {
        id: "binary-search-trees-deep",
        title: "Binary Search Trees",
        summary: "Insert, search, and traverse trees with real implementations.",
        lessons: treesLessons
      },
      {
        id: "graph-dp-algorithms",
        title: "Graphs & Dynamic Programming",
        summary: "Traverse graphs and build dynamic programming tables for classic problems.",
        lessons: graphsDpLessons
      },
      {
        id: "algorithm-coding-challenges",
        title: "Coding Challenges",
        summary: "Apply the algorithms in interview-style challenges with checks and labs.",
        lessons: challengeLessons
      }
    ]
  };
}

export function computeCourseCoverage(course: Course): CourseCoverage {
  const lessons = course.units.flatMap((unit) => unit.lessons);
  const blocks = lessons.flatMap((item) => item.blocks);
  const rendererFamilies = new Set<RendererFamily>(course.rendererCapabilities.map((renderer) => renderer.family));

  for (const block of blocks) {
    if ("renderer" in block) {
      rendererFamilies.add(block.renderer.family);
    }
  }

  return {
    unitCount: course.units.length,
    lessonCount: lessons.length,
    blockCount: blocks.length,
    blockKinds: [...new Set(blocks.map((block) => block.kind))].sort(),
    rendererFamilies: [...rendererFamilies].sort(),
    assessmentCount: blocks.filter((block) => block.kind === "quiz" || block.kind === "lab" || block.kind === "project").length
  };
}

export function buildRendererManifest(course: Course): RendererManifestEntry[] {
  const interactiveBlocks = course.units
    .flatMap((unit) => unit.lessons)
    .flatMap((item) => item.blocks)
    .filter((block): block is DiagramBlock | SimulationBlock | LabBlock => (
      (block.kind === "diagram" || block.kind === "simulation" || block.kind === "lab") && "renderer" in block
    ));

  return course.rendererCapabilities
    .map((capability) => {
      const blocksForFamily = interactiveBlocks.filter((block) => block.renderer.family === capability.family);
      const targets = new Set([capability.nativeTarget, ...blocksForFamily.map((block) => block.renderer.nativeTarget)]);

      return {
        family: capability.family,
        components: [...new Set([capability.component, ...blocksForFamily.map((block) => block.renderer.component)])].sort(),
        blockCount: blocksForFamily.length,
        webReady: targets.has("web") || targets.has("both"),
        mobileReady: targets.has("mobile") || targets.has("both"),
        fallbackReady: Boolean(capability.fallback.trim()) && blocksForFamily.every((block) => Boolean(block.renderer.fallback.trim()))
      };
    })
    .sort((first, second) => first.family.localeCompare(second.family));
}

export function validateCourse(course: Course): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  if (!course.units.length) {
    errors.push("Course must include at least one unit.");
  }

  for (const unit of course.units) {
    if (!unit.lessons.length) {
      errors.push(`Unit ${unit.id} must include at least one lesson.`);
    }

    for (const item of unit.lessons) {
      if (seenIds.has(item.id)) {
        errors.push(`Duplicate lesson id: ${item.id}`);
      }
      seenIds.add(item.id);
      if (item.estimatedMinutes > 12) {
        errors.push(`Lesson ${item.id} exceeds the micro-learning limit.`);
      }
      if (!item.outcomes.length) {
        errors.push(`Lesson ${item.id} must include outcomes.`);
      }
      if (!item.blocks.length) {
        errors.push(`Lesson ${item.id} must include content blocks.`);
      }
      if (!item.blocks.some((block) => block.kind === "quiz" || block.kind === "lab" || block.kind === "project")) {
        warnings.push(`Lesson ${item.id} has no assessment block.`);
      }
      for (const block of item.blocks) {
        if (seenIds.has(block.id)) {
          errors.push(`Duplicate block id: ${block.id}`);
        }
        seenIds.add(block.id);
        if ("renderer" in block && !block.renderer.fallback.trim()) {
          errors.push(`Interactive block ${block.id} must include a fallback.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function findLesson(course: Course, lessonId: string): CourseLesson | undefined {
  return course.units.flatMap((unit) => unit.lessons).find((item) => item.id === lessonId);
}

export function findInteractiveBlocks(course: Course): Array<DiagramBlock | SimulationBlock | CodeTraceBlock | LabBlock | ProjectBlock> {
  return course.units
    .flatMap((unit) => unit.lessons)
    .flatMap((item) => item.blocks)
    .filter((block): block is DiagramBlock | SimulationBlock | CodeTraceBlock | LabBlock | ProjectBlock => (
      block.kind === "diagram" ||
      block.kind === "simulation" ||
      block.kind === "code-trace" ||
      block.kind === "lab" ||
      block.kind === "project"
    ));
}

export function scoreCourseCheck(course: Course, quizId: string, selectedOptionId: string): CourseCheckResult {
  const quizBlock = course.units
    .flatMap((unit) => unit.lessons)
    .flatMap((item) => item.blocks)
    .find((block): block is QuizBlock => block.kind === "quiz" && block.id === quizId);

  if (!quizBlock) {
    throw new Error(`Unknown course quiz: ${quizId}`);
  }

  const correct = selectedOptionId === quizBlock.correctOptionId;
  return {
    correct,
    xpAwarded: correct ? quizBlock.xp : 0,
    feedback: correct ? quizBlock.feedback : quizBlock.incorrectFeedback,
    nextBlockId: quizBlock.nextBlockId
  };
}

function defaultCorrectLabel(optionId: string) {
  if (optionId === "halve-space") {
    return "Keep the target inside the remaining sorted window";
  }
  if (optionId === "name-invariant") {
    return "Name the invariant and preserve it";
  }
  return "Preserve the algorithm contract";
}

function defaultFeedback(quizId: string) {
  if (quizId === "binary-search-check") {
    return "Right. The invariant keeps the answer inside the remaining sorted window.";
  }
  return "Right. The operation works because the invariant survives each step.";
}

export {
  text,
  audio,
  quiz,
  diagram,
  simulation,
  codeTrace,
  lab,
  reflection,
  project,
  lesson,
  conceptLesson
};
export type { ConceptLessonProfile };
