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

export const sortingLessons: CourseLesson[] = [
  lesson(
    "bubble-sort",
    "Bubble Sort",
    "Repeatedly compare adjacent elements and swap out-of-order pairs until the array settles.",
    ["Explain why the largest value reaches the end each pass", "Predict time and space cost"],
    [
      text("bubble-sort-read", "What it does", [
        "Bubble sort makes repeated passes over the array.",
        "On each pass it compares adjacent pairs and swaps them when out of order.",
        "The largest unsorted value bubbles to its final position at the end of the pass.",
        "An early-exit optimization stops once a full pass makes no swaps."
      ]),
      codeTrace(
        "bubble-sort-trace",
        "Bubble sort implementation",
        `function bubbleSort(arr: number[]): number[] {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}`,
        [
          "Copy the array so the input is not mutated",
          "Outer pass fixes one more element at the end",
          "Inner loop compares adjacent pairs",
          "Swap when the left value is greater",
          "Stop early when a pass makes no swaps"
        ]
      ),
      quiz(
        "bubble-sort-check",
        "What is bubble sort's worst-case time complexity?",
        "opt-n2",
        undefined,
        {
          options: [
            { id: "opt-n2", label: "O(n^2)" },
            { id: "opt-n", label: "O(n)" },
            { id: "opt-logn", label: "O(log n)" }
          ],
          feedback: "Right. Roughly n^2 / 2 comparisons happen across all passes in the worst case.",
          incorrectFeedback: "Not yet. Count the nested comparisons across every pass."
        }
      ),
      reflection("bubble-sort-reflection", "When would you actually choose bubble sort over a faster algorithm?")
    ]
  ),
  lesson(
    "quick-sort",
    "Quick Sort",
    "Partition around a pivot so smaller values go left and larger values go right, then recurse.",
    ["Explain what the partition step guarantees", "Distinguish average and worst-case cost"],
    [
      text("quick-sort-read", "What it does", [
        "Quick sort picks a pivot and partitions the array around it.",
        "After partition, the pivot is in its final sorted position.",
        "It recursively sorts the left and right subarrays.",
        "Pivot choice matters: a bad pivot (e.g. always the last element on sorted input) causes worst-case behavior."
      ]),
      codeTrace(
        "quick-sort-trace",
        "Quick sort implementation",
        `function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}
function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
        [
          "Recurse only if low < high",
          "Choose the rightmost element as pivot",
          "Walk left to right moving smaller values before i",
          "Place the pivot at its final rank i+1",
          "Recurse on the two sides"
        ]
      ),
      quiz(
        "quick-sort-check",
        "What is quick sort's average-case time complexity?",
        "opt-nlogn",
        undefined,
        {
          options: [
            { id: "opt-nlogn", label: "O(n log n)" },
            { id: "opt-n2", label: "O(n^2)" },
            { id: "opt-n", label: "O(n)" }
          ],
          feedback: "Right. Balanced partitions give a recursion depth of about log n with n work per level.",
          incorrectFeedback: "Not yet. Think about balanced recursion depth times the work per level."
        }
      ),
      reflection("quick-sort-reflection", "Why can quick sort degrade to O(n^2), and what pivot choice prevents it?")
    ]
  ),
  lesson(
    "merge-sort",
    "Merge Sort",
    "Divide the array in half, sort each half, then merge the sorted halves back together.",
    ["Explain why merge sort is always O(n log n)", "Describe the cost of the merge step"],
    [
      text("merge-sort-read", "What it does", [
        "Merge sort recursively splits the array until single elements remain.",
        "It then merges pairs of sorted arrays into larger sorted arrays.",
        "The merge step walks both halves and emits the smaller front element.",
        "It is stable and needs extra space proportional to the input."
      ]),
      codeTrace(
        "merge-sort-trace",
        "Merge sort implementation",
        `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
        [
          "Base case: length <= 1 is already sorted",
          "Split at the midpoint",
          "Recursively sort left and right",
          "Merge by comparing front elements",
          "Append any remaining elements"
        ]
      ),
      quiz(
        "merge-sort-check",
        "What extra space does merge sort require?",
        "opt-on",
        undefined,
        {
          options: [
            { id: "opt-on", label: "O(n) auxiliary space" },
            { id: "opt-o1", label: "O(1) in place" },
            { id: "opt-ologn", label: "O(log n) stack only" }
          ],
          feedback: "Right. Merging needs a temporary array of size proportional to n.",
          incorrectFeedback: "Not yet. The merge step copies values into a new array."
        }
      ),
      reflection("merge-sort-reflection", "Why is merge sort preferred over quick sort when stability matters?")
    ]
  ),
  lesson(
    "choose-sort",
    "Choosing a Sort",
    "Match a sorting algorithm to the input shape, stability needs, and memory budget.",
    ["Compare bubble, quick, and merge sort on stability and space", "Pick a sort for a given constraint"],
    [
      text("choose-sort-read", "Tradeoffs", [
        "Bubble sort is simple and in-place but O(n^2): fine only for tiny or nearly-sorted data.",
        "Quick sort is in-place and fast in practice (O(n log n) average) but not stable and can hit O(n^2).",
        "Merge sort is stable with guaranteed O(n log n) but needs O(n) extra space.",
        "When memory is tight and average speed matters, quick sort; when stability or guaranteed worst case matters, merge sort."
      ]),
      quiz(
        "choose-sort-check",
        "You need a stable sort with guaranteed O(n log n) worst case but can spare O(n) memory. Which do you pick?",
        "opt-merge",
        undefined,
        {
          options: [
            { id: "opt-merge", label: "Merge sort" },
            { id: "opt-quick", label: "Quick sort" },
            { id: "opt-bubble", label: "Bubble sort" }
          ],
          feedback: "Right. Merge sort is the only one of the three that is both stable and guaranteed O(n log n).",
          incorrectFeedback: "Not yet. Check stability and worst-case guarantee, not just average speed."
        }
      ),
      reflection("choose-sort-reflection", "Name a real situation where you would accept O(n) extra memory to get a stable O(n log n) sort.")
    ]
  )
];
