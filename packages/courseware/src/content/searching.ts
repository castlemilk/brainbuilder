import {
  audio,
  codeTrace,
  diagram,
  lab,
  lesson,
  project,
  quiz,
  reflection,
  simulation,
  text,
  type CourseLesson
} from "../index";

export const searchingLessons: CourseLesson[] = [
  lesson("linear-search", "Linear Search", "Walk through the array one element at a time until the target is found.", [
    "Explain when linear search is the right tool",
    "State its time complexity"
  ], [
    text("linear-search-read", "What it does", [
      "Linear search checks each element in order from the start.",
      "It returns the index of the first match, or -1 if none.",
      "It works on unsorted data and needs no preprocessing.",
      "Best case is O(1) (first element); worst and average are O(n)."
    ]),
    codeTrace("linear-search-trace", "Linear search implementation", `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`, [
      "Start at index 0",
      "Compare the current element with the target",
      "Return the index when it matches",
      "Move to the next element if not found",
      "Return -1 after checking every element"
    ]),
    simulation("linear-search-sim", "Linear scan", "svg", "search-scan", ["step", "play", "reset"], "Scans every element from the start."),
    quiz("linear-search-check", "What is the key advantage of linear search?", "opt-unsorted", undefined, {
      question: "What is the key advantage of linear search?",
      options: [
        { id: "opt-unsorted", label: "Works on unsorted data with O(1) extra space" },
        { id: "opt-fast", label: "Faster than binary search on sorted data" },
        { id: "opt-stable", label: "It is a stable sort" }
      ],
      feedback: "Right. Linear search needs no ordering and only constant extra space.",
      incorrectFeedback: "Not yet. Think about what preprocessing (or lack of it) linear search requires."
    }),
    reflection("linear-search-reflection", "Why is linear search still used despite O(n) cost?")
  ]),
  lesson("binary-search-code", "Binary Search", "On sorted data, repeatedly halve the search range using the midpoint.", [
    "Explain why the range always contains the answer",
    "State the time complexity"
  ], [
    text("binary-search-code-read", "What it does", [
      "Binary search requires a sorted array.",
      "It compares the midpoint to the target, then discards the half that cannot contain it.",
      "The low and high bounds name the only places the target can still be.",
      "Each comparison removes half the remaining candidates, giving O(log n)."
    ]),
    codeTrace("binary-search-code-trace", "Binary search implementation", `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`, [
      "Set low=0 and high=last index",
      "Compute the midpoint",
      "Return mid when it matches the target",
      "If target is larger, discard the left half",
      "If target is smaller, discard the right half"
    ]),
    simulation("binary-search-sim", "Binary search window", "svg", "binary-search-window", ["step", "play", "reset"], "Discarding half is always safe on sorted data."),
    quiz("binary-search-code-check", "Why must the array be sorted for binary search?", "opt-discard", undefined, {
      question: "Why must the array be sorted for binary search?",
      options: [
        { id: "opt-discard", label: "So discarding half is always safe" },
        { id: "opt-speed", label: "To make the code shorter" },
        { id: "opt-stable", label: "To keep equal elements ordered" }
      ],
      feedback: "Right. Sorted order is what guarantees the discarded half can never hold the target.",
      incorrectFeedback: "Not yet. The discard step relies on ordering."
    }),
    reflection("binary-search-code-reflection", "What breaks if you forget to move low or high and only compare the midpoint?")
  ]),
  lesson("jump-search", "Jump Search", "On sorted data, jump ahead by fixed blocks, then linear-scan the final block.", [
    "Explain the block-jump idea",
    "Compare its cost to linear and binary search"
  ], [
    text("jump-search-read", "What it does", [
      "Jump search also needs sorted data.",
      "It jumps forward by about sqrt(n) steps until the target is smaller than the next jump point.",
      "It then linear-scans backward to the previous jump point.",
      "Time is O(sqrt(n)): between linear O(n) and binary O(log n)."
    ]),
    codeTrace("jump-search-trace", "Jump search implementation", `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;
  let current = step;
  while (arr[Math.min(current, n) - 1] < target) {
    prev = current;
    current += step;
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(current, n)) return -1;
  }
  return arr[prev] === target ? prev : -1;
}`, [
      "Compute step = sqrt(n)",
      "Jump ahead while the block end is below target",
      "Stop at the block that may contain the target",
      "Linear-scan within that block",
      "Return the index or -1"
    ]),
    simulation("jump-search-sim", "Jump blocks", "svg", "search-jump", ["step", "play", "reset"], "Jumps ahead, then linear-scans one block."),
    quiz("jump-search-check", "What is jump search's time complexity?", "opt-sqrt", undefined, {
      question: "What is jump search's time complexity?",
      options: [
        { id: "opt-sqrt", label: "O(sqrt n)" },
        { id: "opt-logn", label: "O(log n)" },
        { id: "opt-n", label: "O(n)" }
      ],
      feedback: "Right. Jumps of size sqrt(n) plus a linear scan of one block give O(sqrt n).",
      incorrectFeedback: "Not yet. It is faster than linear but slower than binary search."
    }),
    reflection("jump-search-reflection", "When might jump search beat binary search in practice?")
  ])
];
