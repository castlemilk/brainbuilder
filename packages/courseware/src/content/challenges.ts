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

export const challengeLessons: CourseLesson[] = [
  lesson("challenge-two-sum", "Challenge: Two Sum", "Return the indices of the two numbers that add up to a target.", ["Describe the hash-map one-pass approach", "State the time and space tradeoff"], [
    text("challenge-two-sum-read", "Problem", [
      "Given an array of integers and a target, return the indices of the two numbers that sum to the target.",
      "Constraints: 2 <= nums.length <= 10^4; exactly one valid answer exists; do not reuse the same element.",
      "Example: nums = [2, 7, 11, 15], target = 9 returns [0, 1].",
      "A brute force checks every pair in O(n^2); a hash map does it in one pass."
    ]),
    codeTrace("challenge-two-sum-trace", "Optimal two-sum", `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement)!, i];
    seen.set(nums[i], i);
  }
  return [];
}`, [
      "Build a map of value to index seen so far",
      "For each number compute its complement",
      "If the complement is already in the map, return the pair",
      "Otherwise record this number and its index",
      "One pass gives O(n) time, O(n) space"
    ]),
    lab("challenge-two-sum-lab", "Implement Two Sum", "anime", "coding-lab", "Implement twoSum so it returns the two indices whose values sum to target, using a hash map in a single pass.", "Returns [0, 1] for [2, 7, 11, 15] with target 9, and [1, 2] for [3, 2, 4] with target 6.", 18),
    quiz("challenge-two-sum-check", "What is the time complexity of the hash-map one-pass solution?", "opt-on", undefined, {
      question: "What is the time complexity of the hash-map one-pass solution?",
      options: [
        { id: "opt-on", label: "O(n) time, O(n) space" },
        { id: "opt-n2", label: "O(n^2) time" },
        { id: "opt-logn", label: "O(log n) time" }
      ],
      feedback: "Right. One pass plus O(1) average map lookups, at the cost of O(n) extra space.",
      incorrectFeedback: "Not yet. How many times do we scan the array?"
    }),
    reflection("challenge-two-sum-reflection", "Why does a hash map beat the nested-loop brute force here?")
  ]),
  lesson("challenge-merge-arrays", "Challenge: Merge Two Sorted Arrays", "Merge two already-sorted arrays into one sorted array.", ["Explain the two-pointer merge", "State the time and space cost"], [
    text("challenge-merge-arrays-read", "Problem", [
      "Given two arrays sorted in non-decreasing order, merge them into one sorted array.",
      "Constraints: 0 <= arr1.length, arr2.length <= 1000; both inputs are already sorted.",
      "Example: [1, 3, 5] and [2, 4, 6] become [1, 2, 3, 4, 5, 6].",
      "This is the core operation inside merge sort."
    ]),
    codeTrace("challenge-merge-arrays-trace", "Two-pointer merge", `function mergeSortedArrays(a: number[], b: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) result.push(a[i++]);
    else result.push(b[j++]);
  }
  while (i < a.length) result.push(a[i++]);
  while (j < b.length) result.push(b[j++]);
  return result;
}`, [
      "Use a pointer for each array",
      "Compare the fronts, push the smaller",
      "Advance the pointer you consumed",
      "Drain whichever array still has elements",
      "Result is sorted in O(m + n)"
    ]),
    lab("challenge-merge-arrays-lab", "Implement Merge", "anime", "coding-lab", "Implement mergeSortedArrays using two pointers to produce one sorted array.", "Returns [1, 2, 3, 4, 5, 6] for [1, 3, 5] and [2, 4, 6].", 18),
    quiz("challenge-merge-arrays-check", "What is the time complexity of the two-pointer merge?", "opt-mn", undefined, {
      question: "What is the time complexity of the two-pointer merge?",
      options: [
        { id: "opt-mn", label: "O(m + n)" },
        { id: "opt-nlogn", label: "O(n log n)" },
        { id: "opt-n", label: "O(n) where n is the larger array" }
      ],
      feedback: "Right. Each element from both arrays is visited exactly once.",
      incorrectFeedback: "Not yet. How many total elements are processed?"
    }),
    reflection("challenge-merge-arrays-reflection", "How would you merge in place to avoid the extra array?")
  ]),
  lesson("challenge-bubble-impl", "Challenge: Implement Bubble Sort", "Write bubble sort to sort an array in ascending order.", ["Implement the nested comparison and swap", "Add the early-exit optimization"], [
    text("challenge-bubble-impl-read", "Problem", [
      "Implement bubble sort that sorts an integer array in ascending order.",
      "Constraints: 1 <= array.length <= 1000.",
      "Example: [64, 34, 25, 12, 22, 11, 90] becomes [11, 12, 22, 25, 34, 64, 90].",
      "Hint: after each pass the largest unsorted element is in place; stop early if a pass makes no swaps."
    ]),
    codeTrace("challenge-bubble-impl-trace", "Reference bubble sort", `function bubbleSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; }
    }
    if (!swapped) break;
  }
  return a;
}`, [
      "Copy the array to avoid mutating input",
      "Outer loop runs at most n-1 passes",
      "Inner loop compares adjacent pairs",
      "Swap when left is greater than right",
      "Break early if a pass made no swaps"
    ]),
    lab("challenge-bubble-impl-lab", "Implement Bubble Sort", "anime", "coding-lab", "Implement bubbleSort that returns a new sorted array using adjacent swaps and an early-exit flag.", "Returns [11, 12, 22, 25, 34, 64, 90] for [64, 34, 25, 12, 22, 11, 90].", 16),
    quiz("challenge-bubble-impl-check", "What is bubble sort's space complexity?", "opt-o1", undefined, {
      question: "What is bubble sort's space complexity?",
      options: [
        { id: "opt-o1", label: "O(1) in place" },
        { id: "opt-on", label: "O(n) auxiliary" },
        { id: "opt-logn", label: "O(log n)" }
      ],
      feedback: "Right. Only a few scalar variables are needed; it sorts in place.",
      incorrectFeedback: "Not yet. Does it allocate a second array?"
    }),
    reflection("challenge-bubble-impl-reflection", "Why does the inner loop bound shrink by i each pass?")
  ])
];
