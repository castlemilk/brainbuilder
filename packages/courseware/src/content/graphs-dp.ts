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

export const graphsDpLessons: CourseLesson[] = [
  lesson(
    "graph-bfs-dfs",
    "Graph Traversal: BFS & DFS",
    "Explore a graph with a queue (BFS, by distance) or a stack/recursion (DFS, by depth).",
    [
      "Explain the queue versus stack difference",
      "State what BFS guarantees on unweighted graphs"
    ],
    [
      text("graph-bfs-dfs-read", "What it does", [
        "BFS uses a queue and visits nodes by increasing distance from the start.",
        "DFS uses a stack or recursion and dives deep before backtracking.",
        "Both need a visited set to avoid revisiting nodes in cycles.",
        "On unweighted graphs BFS finds the fewest-edge path."
      ]),
      codeTrace(
        "graph-bfs-dfs-trace",
        "BFS and DFS",
        `function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue = [start];
  const order: string[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
    }
  }
  return order;
}
function dfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  function visit(node: string) {
    visited.add(node);
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) visit(neighbor);
    }
  }
  visit(start);
  return order;
}`,
        [
          "BFS: enqueue the start",
          "BFS: dequeue, mark visited, enqueue unseen neighbors",
          "DFS: push start onto the call stack",
          "DFS: visit, then recurse into each unseen neighbor",
          "Both use a visited set to avoid cycles"
        ]
      ),
      simulation("graph-bfs-dfs-sim", "Traversal frontier", "svg", "frontier-graph", ["step", "play", "reset"], "Every node is visited once thanks to the visited set."),
      quiz(
        "graph-bfs-dfs-check",
        "Which traversal finds the shortest path in an unweighted graph?",
        "opt-bfs",
        undefined,
        {
          options: [
            { id: "opt-bfs", label: "BFS (queue, by distance)" },
            { id: "opt-dfs", label: "DFS (stack, by depth)" },
            { id: "opt-either", label: "Either one" }
          ],
          feedback:
            "Right. Expanding by distance layer guarantees the first time you reach a node is along the fewest edges.",
          incorrectFeedback: "Not yet. Which structure expands nearest nodes first?"
        }
      ),
      reflection(
        "graph-bfs-dfs-reflection",
        "Why does a missing visited set turn traversal into infinite loops on cyclic graphs?"
      )
    ]
  ),
  lesson(
    "dijkstra",
    "Dijkstra's Algorithm",
    "Repeatedly relax the cheapest known distance to find shortest weighted paths from a source.",
    [
      "Explain the relaxation step",
      "State when Dijkstra is valid"
    ],
    [
      text("dijkstra-read", "What it does", [
        "Dijkstra finds shortest paths from one source in a graph with non-negative edge weights.",
        "It keeps a distance estimate per node and always expands the unvisited node with the smallest known distance.",
        "Relaxation updates a neighbor's distance when a shorter route is found.",
        "It is invalid with negative edge weights (use Bellman-Ford instead)."
      ]),
      codeTrace(
        "dijkstra-trace",
        "Dijkstra implementation",
        `function dijkstra(graph: Map<string, { to: string; weight: number }[]>, start: string): Map<string, number> {
  const dist = new Map<string, number>();
  for (const node of graph.keys()) dist.set(node, node === start ? 0 : Infinity);
  const visited = new Set<string>();
  while (visited.size < graph.size) {
    let current: string | null = null;
    let best = Infinity;
    for (const [node, d] of dist) {
      if (!visited.has(node) && d < best) { best = d; current = node; }
    }
    if (current === null) break;
    visited.add(current);
    for (const edge of graph.get(current) ?? []) {
      const alt = dist.get(current)! + edge.weight;
      if (alt < (dist.get(edge.to) ?? Infinity)) dist.set(edge.to, alt);
    }
  }
  return dist;
}`,
        [
          "Initialize all distances to Infinity except the start (0)",
          "Pick the unvisited node with the smallest distance",
          "Mark it visited",
          "Relax each neighbor: dist + weight < known?",
          "Repeat until every node is settled"
        ]
      ),
      simulation("dijkstra-sim", "Relaxation wave", "svg", "frontier-graph", ["step", "play", "reset"], "Settled nodes never improve once chosen."),
      quiz(
        "dijkstra-check",
        "Why does Dijkstra fail with negative edge weights?",
        "opt-neg",
        undefined,
        {
          options: [
            { id: "opt-neg", label: "A settled node's distance could later be improved" },
            { id: "opt-slow", label: "It becomes too slow" },
            { id: "opt-cycle", label: "It creates cycles" }
          ],
          feedback:
            "Right. Once a node is marked settled, Dijkstra never revisits it, but a negative edge could reduce its distance afterward.",
          incorrectFeedback: "Not yet. What assumption about settled distances breaks?"
        }
      ),
      reflection(
        "dijkstra-reflection",
        "How would you adapt the algorithm for a single target (early exit)?"
      )
    ]
  ),
  lesson(
    "dp-fib",
    "DP: Fibonacci & Memoization",
    "Turn repeated recursive subproblems into stored answers to avoid exponential work.",
    [
      "Explain what memoization stores",
      "Contrast naive recursion with memoized cost"
    ],
    [
      text("dp-fib-read", "What it does", [
        "Naive recursive Fibonacci recomputes the same subproblems exponentially.",
        "Memoization stores each solved subproblem (here, just n) the first time it is computed.",
        "Later calls reuse the stored answer instead of branching again.",
        "Cost drops from exponential to O(n) time and O(n) space."
      ]),
      codeTrace(
        "dp-fib-trace",
        "Memoized Fibonacci",
        `function fib(n: number, memo: Map<number, number> = new Map()): number {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n)!;
  const value = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, value);
  return value;
}`,
        [
          "Base cases: fib(0)=0, fib(1)=1",
          "Check the memo before recursing",
          "Compute fib(n-1) + fib(n-2)",
          "Store the result under key n",
          "Reuse the stored answer on later calls"
        ]
      ),
      simulation("dp-fib-sim", "Memo table fill", "svg", "dp-grid-fill", ["step", "play", "reset"], "Each subproblem is solved once."),
      quiz(
        "dp-fib-check",
        "What does memoization do to naive Fibonacci's time cost?",
        "opt-on",
        undefined,
        {
          options: [
            { id: "opt-on", label: "Exponential becomes O(n)" },
            { id: "opt-same", label: "Stays exponential" },
            { id: "opt-logn", label: "Becomes O(log n)" }
          ],
          feedback:
            "Right. Each subproblem is solved once, so the work is linear in n.",
          incorrectFeedback: "Not yet. Each unique subproblem is computed how many times?"
        }
      ),
      reflection(
        "dp-fib-reflection",
        "Why is n alone a sufficient memo key for Fibonacci?"
      )
    ]
  ),
  lesson(
    "dp-knapsack",
    "DP: 0/1 Knapsack",
    "Fill a table of best value per item and capacity to choose what to pack.",
    [
      "Explain the dp[i][w] state",
      "Write the recurrence in words"
    ],
    [
      text("dp-knapsack-read", "What it does", [
        "Each cell dp[i][w] is the best value using the first i items at capacity w.",
        "For item i you may skip it (dp[i-1][w]) or take it (dp[i-1][w-weight]+value).",
        "You take the max of those two choices.",
        "Filling row by row and reading the last cell gives the optimum."
      ]),
      codeTrace(
        "dp-knapsack-trace",
        "Knapsack DP",
        `function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let cap = 0; cap <= capacity; cap++) {
      const without = dp[i - 1][cap];
      const withItem = w <= cap ? dp[i - 1][cap - w] + v : 0;
      dp[i][cap] = Math.max(without, withItem);
    }
  }
  return dp[n][capacity];
}`,
        [
          "Build a (n+1) x (capacity+1) table of zeros",
          "For each item i",
          "For each capacity cap",
          "Skip it, or take it if it fits",
          "Store the max and read dp[n][capacity]"
        ]
      ),
      simulation("dp-knapsack-sim", "Knapsack table", "svg", "dp-grid-fill", ["step", "play", "reset"], "The last cell holds the optimum value."),
      quiz(
        "dp-knapsack-check",
        "What does dp[i][w] represent?",
        "opt-state",
        undefined,
        {
          options: [
            { id: "opt-state", label: "Best value using first i items within capacity w" },
            { id: "opt-count", label: "Number of ways to fill capacity w" },
            { id: "opt-weight", label: "Total weight of item i" }
          ],
          feedback:
            "Right. The state is the optimal value for a prefix of items under a capacity bound.",
          incorrectFeedback: "Not yet. What two things does the state capture?"
        }
      ),
      reflection(
        "dp-knapsack-reflection",
        "How would you recover the actual set of chosen items, not just the value?"
      )
    ]
  ),
  lesson(
    "dp-lcs",
    "DP: Longest Common Subsequence",
    "Build a table that grows when characters match and carries forward otherwise.",
    [
      "Explain the match versus mismatch rule",
      "State the recurrence"
    ],
    [
      text("dp-lcs-read", "What it does", [
        "dp[i][j] is the LCS length of the prefixes str1[0..i] and str2[0..j].",
        "If the characters match, dp[i][j] = dp[i-1][j-1] + 1.",
        "If they differ, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
        "The final cell holds the length; the sequence is recovered by backtracking."
      ]),
      codeTrace(
        "dp-lcs-trace",
        "LCS DP",
        `function lcsLength(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}`,
        [
          "Build an (m+1) x (n+1) table of zeros",
          "For each character of a",
          "For each character of b",
          "Match: take the diagonal + 1",
          "Mismatch: take the best of up or left"
        ]
      ),
      simulation("dp-lcs-sim", "LCS table", "svg", "dp-grid-fill", ["step", "play", "reset"], "The final cell holds the LCS length."),
      quiz(
        "dp-lcs-check",
        "When characters match, what is dp[i][j]?",
        "opt-diag",
        undefined,
        {
          options: [
            { id: "opt-diag", label: "dp[i-1][j-1] + 1" },
            { id: "opt-max", label: "max(dp[i-1][j], dp[i][j-1])" },
            { id: "opt-zero", label: "0" }
          ],
          feedback:
            "Right. A matching character extends the LCS found in the smaller prefixes by one.",
          incorrectFeedback: "Not yet. Which previous cell grows when they match?"
        }
      ),
      reflection(
        "dp-lcs-reflection",
        "How would you recover the actual common subsequence from the table?"
      )
    ]
  )
];
