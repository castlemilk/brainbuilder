# Candidate concept catalogue

This is an assistant-authored concept map of the pinned source, pending subject review. The identifiers are proposed stable documentation identities; they do not replace current lesson/block IDs or represent learner mastery. See [the authoring contract](authoring-contract.md), [review gaps](review-gaps.md) and [machine-readable inventory](concepts.json).

**56 candidate concepts:** 12 foundational prerequisites and 44 algorithm concepts. All prerequisite edges are proposed; the validated DAG is a consistency check, not pedagogical approval.

## Foundational prerequisites

### Program state and control flow

`bb.concept.foundations.program-state` · version 1 · coverage `missing` · subject review pending

**Observable outcome:** Given a short assignment, conditional and loop, record the variable values after each step and state when the loop stops.

**Proposed prerequisites:** None required by this candidate map.

**Existing source contexts:** [loops-and-growth](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L991-L991), [linear-search](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L16-L50), [linked-list-pointers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1002-L1008).

**Coverage:** The course uses variables, functions, conditionals, references and loops throughout but has no dedicated introduction or prerequisite check for these basics. Linked lessons are contexts that assume this knowledge, not substitute prerequisite lessons.

**Subject-review question:** What minimum code-reading check distinguishes a learner who can trace assignments and branches from one who needs an introductory route?

### Indices and interval boundaries

`bb.concept.foundations.index-bounds` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** For an array and inclusive low/high bounds, identify valid indices, the current candidate interval and the empty-interval condition.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [array-indexing](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1000-L1000), [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90), [linear-search](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L16-L50).

**Coverage:** Direct indexing and low/high are shown, but boundary conventions and empty-input checks are not taught or assessed systematically.

**Subject-review question:** Which boundary conventions, empty inputs and duplicate-value contracts must be stated before a trace is scored?

### Sorted order and comparator meaning

`bb.concept.foundations.sorted-order` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** Given values and a comparator, identify whether they are in nondecreasing order and justify which values can be excluded by a comparison.

**Proposed prerequisites:** None required by this candidate map.

**Existing source contexts:** [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90), [challenge-merge-arrays](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L69-L122), [sorting-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1064-L1064).

**Coverage:** Sorted/nondecreasing input is stated as a requirement in search and merge material, but no standalone prerequisite explanation and check establish this knowledge.

**Subject-review question:** How will an author establish ordering, equality and the comparator contract before using safe elimination or merging?

### Recursion state and base cases

`bb.concept.foundations.recursion-call-state` · version 1 · coverage `missing` · subject review pending

**Observable outcome:** Trace a small recursive call tree, name each call state and show how a base case and decreasing subproblem prevent further calls.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [recursion-to-memo](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1081-L1081), [quick-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L73-L134), [merge-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L135-L192), [dp-fib](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L159-L214), [tree-traversals](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L95-L171).

**Coverage:** Recursive examples and base cases are present, but there is no dedicated introductory recursion lesson or prerequisite assessment; the learning-home recursion module is only a catalogue item.

**Subject-review question:** Which call-stack and termination foundations need an authored bridge before recursive sorting, traversal and memoization?

### Input size, operation model and cases

`bb.concept.foundations.complexity-model` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** For a stated implementation, name the input-size variable, counted operation, case being discussed and whether extra copies or call-stack space are included.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [big-o-as-shape](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L990-L990), [complexity-tradeoffs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L992-L992), [choose-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L193-L223).

**Coverage:** Growth and tradeoffs are introduced, but the cost model, average-case assumptions and memory-accounting conventions are not consistently explicit.

**Subject-review question:** Can learners distinguish an algorithm family, the shown implementation, an average-case assumption and an auxiliary-space convention?

### Halving and logarithmic decisions

`bb.concept.foundations.halving-and-growth` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** For candidate sets of 8 and 32 items, count successive halvings to a singleton and explain why doubling the size adds one halving step in this example.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`

**Existing source contexts:** [big-o-as-shape](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L990-L990), [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90).

**Coverage:** Halving and logarithmic growth are described, but the mathematical bridge and its limits need a specific checked example.

**Subject-review question:** What numerical example explains the logarithmic claim without requiring unintroduced logarithm notation?

### Tree vocabulary and height

`bb.concept.foundations.tree-structure` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** On a labelled rooted tree, identify root, child, subtree and leaf, and compute the stated edge-count height convention.

**Proposed prerequisites:** None required by this candidate map.

**Existing source contexts:** [bst-insert](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L16-L94), [tree-traversal](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1032-L1032), [tree-rotations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1034-L1040).

**Coverage:** Nodes and children appear in BST explanations, while root/subtree/height are used across lessons without a dedicated vocabulary and convention check.

**Subject-review question:** Which height convention and empty-tree treatment will the content use consistently?

### Graph edges, direction and weight

`bb.concept.foundations.graph-structure` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** Given a small graph, list vertices and edges, state whether edges are directed and compare hop count with the sum of edge weights.

**Proposed prerequisites:** None required by this candidate map.

**Existing source contexts:** [graph-representations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1048-L1048), [shortest-paths](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1056-L1056), [dijkstra](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L91-L158).

**Coverage:** Lists, matrices and weighted paths are described, but foundational graph assumptions differ across examples and need explicit checks.

**Subject-review question:** Do examples state directedness, unreachable vertices, edge weights and whether every vertex appears in the representation?

### Map and set operation contracts

`bb.concept.foundations.map-set-operations` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** Trace insert, membership lookup and value retrieval on a small map or set, keeping key identity distinct from the stored value.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [hash-table-load](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1017-L1023), [challenge-two-sum](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L16-L68), [graph-bfs-dfs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L16-L90).

**Coverage:** Map and Set APIs are used in code and hash buckets are discussed, but an introductory API/identity contract and prerequisite check are absent.

**Subject-review question:** What is assumed about equality, key/value access and average lookup cost before maps and visited sets are used?

### Prefixes and subsequences

`bb.concept.foundations.prefix-and-subsequence` · version 1 · coverage `missing` · subject review pending

**Observable outcome:** For two short strings, distinguish a prefix by length, a contiguous substring and an order-preserving subsequence using explicit character positions.

**Proposed prerequisites:** `bb.concept.foundations.index-bounds`

**Existing source contexts:** [dp-lcs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L278-L337), [sliding-window](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1024-L1024).

**Coverage:** LCS uses prefixes and subsequences without a dedicated explanation or check distinguishing them from substrings; the linked material is an assumption context.

**Subject-review question:** How will prefix length and half-open indexing be distinguished from inclusive endpoints before the LCS recurrence?

### Stable ordering of equal keys

`bb.concept.foundations.sort-stability` · version 1 · coverage `missing` · subject review pending

**Observable outcome:** Given records with equal sort keys and distinct identities, show whether a proposed sorted result preserves their original relative order.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`

**Existing source contexts:** [merge-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L135-L192), [choose-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L193-L223).

**Coverage:** Stability is asserted and used in choices, but no dedicated definition, equal-key example or prerequisite check is authored.

**Subject-review question:** Will a record-with-equal-keys example make stability observable rather than a memorized algorithm label?

### A state property preserved by a loop

`bb.concept.foundations.loop-invariant` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** Given an initial state and one loop step, state a candidate property, check it before and after the step and identify what the stopping state permits concluding.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [sorting-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1064-L1064), [binary-search-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1065-L1072), [two-pointers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1001-L1001).

**Coverage:** Many lessons name a local invariant, but the shared idea of initialization, preservation and a bounded conclusion is not taught as a prerequisite unit.

**Subject-review question:** What small worked proof establishes preservation and termination without assuming learners already understand the word invariant?

## Algorithm concepts

### Compare growth rates

`bb.concept.algorithms.growth-rates` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For stated linear, quadratic and logarithmic operation counts, predict how the work changes when input size doubles and distinguish this from measured wall-clock time.

**Proposed prerequisites:** `bb.concept.foundations.complexity-model`, `bb.concept.foundations.halving-and-growth`

**Existing source contexts:** [big-o-as-shape](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L990-L990).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Correct the unrelated labelled answer in big-o-as-shape-check and verify the numerical examples and case assumptions.

### Count loop operations

`bb.concept.algorithms.loop-operation-counts` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a single loop, a fixed-bound inner loop and a full pairwise loop, count body executions on a tiny input before assigning a growth class.

**Proposed prerequisites:** `bb.concept.foundations.program-state`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [loops-and-growth](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L991-L991).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Do examples include dependent loop bounds so nesting is not mistaken for an automatic quadratic guarantee?

### Time and space tradeoffs

`bb.concept.algorithms.time-space-tradeoffs` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a repeated-lookup task, compare rescanning with storing seen values, naming the saved work, extra state and conditions that justify the exchange.

**Proposed prerequisites:** `bb.concept.algorithms.growth-rates`, `bb.concept.foundations.complexity-model`

**Existing source contexts:** [complexity-tradeoffs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L992-L992), [challenge-two-sum](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L16-L68).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Specify average hash-lookup assumptions and memory accounting; a general tradeoff is not proof that a cache is always worthwhile.

### Array access and ordered insertion

`bb.concept.algorithms.array-access-and-insertion` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace an indexed read and a middle insertion on a small fixed-width array, distinguishing direct access from the elements that must move to preserve order.

**Proposed prerequisites:** `bb.concept.foundations.index-bounds`, `bb.concept.foundations.complexity-model`

**Existing source contexts:** [array-indexing](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1000-L1000).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** State the abstract array model rather than implying every language sequence or memory representation has identical costs.

### Two-pointer candidate elimination

`bb.concept.algorithms.two-pointer-elimination` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** On a sorted two-sum example, state both cursor roles and justify which move removes impossible pairs without skipping a candidate.

**Proposed prerequisites:** `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.foundations.sorted-order`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [two-pointers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1001-L1001).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** The movement proof depends on the problem and ordering; include a counterexample to an unjustified move.

### Linked-list reachability during rewiring

`bb.concept.algorithms.linked-list-reachability` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given head, current and next references, insert a node while preserving reachability and identify the update order that would lose the remaining chain.

**Proposed prerequisites:** `bb.concept.foundations.program-state`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [linked-list-pointers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1002-L1008).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Separate constant local rewiring from the time required to find the insertion point, and check the generic quiz answer label.

### Stack and queue access discipline

`bb.concept.algorithms.stack-queue-discipline` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given the same sequence of arrivals, produce the next-item order for a stack and a queue and match each contract to an undo or waiting-line scenario.

**Proposed prerequisites:** `bb.concept.foundations.program-state`

**Existing source contexts:** [stack-queue-contracts](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1016-L1016).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Distinguish an abstract queue contract from the cost of a particular array shift implementation.

### Hash-table load and resizing

`bb.concept.algorithms.hash-table-load-and-resize` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace inserts into labelled buckets, compute the stated load factor and explain what a resize changes and what it cannot guarantee about collisions.

**Proposed prerequisites:** `bb.concept.foundations.map-set-operations`, `bb.concept.algorithms.time-space-tradeoffs`

**Existing source contexts:** [hash-table-load](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1017-L1023).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Review hash/load assumptions, resizing guarantees and the generic hash-table-check answer before teaching them as a scored claim.

### Maintain a sliding-window summary

`bb.concept.algorithms.sliding-window-summary` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** On a fixed-size window, update a sum by removing the leaving value and adding the entering value, and detect a summary that no longer matches the active region.

**Proposed prerequisites:** `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [sliding-window](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1024-L1024).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Separate fixed-window arithmetic from variable-window feasibility rules and map/set-based substring examples.

### BST ordering, insertion and search

`bb.concept.algorithms.bst-ordering-and-search` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace insertion and lookup in a small BST under an explicit duplicate policy, showing why each chosen branch preserves its ordering contract.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.foundations.tree-structure`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [bst-insert](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L16-L94).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** The code sends equal values right while the initial prose says larger; make duplicate handling and all-subtree bounds explicit.

### Tree height and operation cost

`bb.concept.algorithms.tree-height-and-balance` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Compare root-to-target path lengths in a skewed and a shorter-height tree, explaining why lookup cost follows height and why balance is a separate guarantee.

**Proposed prerequisites:** `bb.concept.foundations.tree-structure`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [bst-insert](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L16-L94), [tree-rotations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1034-L1040).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Avoid inferring balance from the BST property alone, and use a consistent height convention.

### Choose a tree visit order

`bb.concept.algorithms.tree-traversal-order` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Produce preorder, inorder, postorder and level-order sequences for a labelled tree and select an order based on whether parents, children or distance layers are needed first.

**Proposed prerequisites:** `bb.concept.foundations.tree-structure`, `bb.concept.foundations.recursion-call-state`, `bb.concept.algorithms.stack-queue-discipline`

**Existing source contexts:** [tree-traversal](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1032-L1032), [tree-traversals](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L95-L171).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Check that the chosen example does not conflate ordinary binary trees with ordered BSTs; serialization needs structural markers or an additional contract.

### BST inorder ordering

`bb.concept.algorithms.bst-inorder-property` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given a BST and its ordering contract, trace left-root-right visits and explain why the resulting value sequence is ordered.

**Proposed prerequisites:** `bb.concept.algorithms.bst-ordering-and-search`, `bb.concept.algorithms.tree-traversal-order`

**Existing source contexts:** [tree-traversal](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1032-L1032), [tree-traversals](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/trees.ts#L95-L171).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Verify the duplicate policy and demonstrate why the claim does not hold for arbitrary binary trees.

### Heap parent-child priority

`bb.concept.algorithms.heap-parent-child-priority` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Identify a violated heap parent-child relation after an insert or removal and choose a local repair while distinguishing root priority from global sorted order.

**Proposed prerequisites:** `bb.concept.foundations.tree-structure`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [heap-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1033-L1033).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Specify min versus max heap and the shape condition; the overview should not imply that arbitrary value lookup is constant time.

### Tree rotations preserve ordered search

`bb.concept.algorithms.tree-rotations-preserve-order` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For one left or right rotation, identify the moving nodes and middle subtree, then compare the before/after inorder sequence and local height.

**Proposed prerequisites:** `bb.concept.algorithms.bst-inorder-property`, `bb.concept.algorithms.tree-height-and-balance`, `bb.concept.foundations.program-state`

**Existing source contexts:** [tree-rotations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1034-L1040).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Clarify the meaning of the fallback diagram arrays and ensure all reconnected pointers preserve the same inorder sequence.

### Graph representation tradeoffs

`bb.concept.algorithms.graph-representation-tradeoffs` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Represent the same stated graph as a list and matrix, count the stored entries under its directedness contract and choose a representation for a specified neighbor or edge query.

**Proposed prerequisites:** `bb.concept.foundations.graph-structure`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [graph-representations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1048-L1048).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** The four-edge versus twenty-five-cell example needs directed/undirected assumptions; do not count an undirected edge as one neighbor entry without explanation.

### BFS queue and visited discipline

`bb.concept.algorithms.bfs-frontier-and-visited` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace a BFS queue from a start node, mark vertices when first scheduled and show that each reachable vertex is scheduled once under the given graph contract.

**Proposed prerequisites:** `bb.concept.foundations.graph-structure`, `bb.concept.algorithms.stack-queue-discipline`, `bb.concept.foundations.map-set-operations`

**Existing source contexts:** [bfs-dfs-frontiers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1049-L1055), [graph-bfs-dfs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L16-L90).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Align mark-on-enqueue code with the trace wording and distinguish all reachable vertices from every vertex in a disconnected graph.

### DFS depth and visited discipline

`bb.concept.algorithms.dfs-frontier-and-visited` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace a depth-first walk and backtrack on a small cyclic graph, showing the visited set and identifying why depth-first order need not minimize hops.

**Proposed prerequisites:** `bb.concept.foundations.graph-structure`, `bb.concept.algorithms.stack-queue-discipline`, `bb.concept.foundations.map-set-operations`, `bb.concept.foundations.recursion-call-state`

**Existing source contexts:** [bfs-dfs-frontiers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1049-L1055), [graph-bfs-dfs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L16-L90).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Record neighbor order and recursion assumptions so multiple valid traces are not incorrectly rejected.

### Fewest-edge paths with BFS

`bb.concept.algorithms.unweighted-shortest-path` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For equal-cost edges, explain how BFS distance layers establish a fewest-edge route and give a weighted example where hop count would answer a different question.

**Proposed prerequisites:** `bb.concept.algorithms.bfs-frontier-and-visited`, `bb.concept.foundations.graph-structure`

**Existing source contexts:** [bfs-dfs-frontiers](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1049-L1055), [graph-bfs-dfs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L16-L90), [shortest-paths](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1056-L1056).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** The code returns a visitation order, not a reconstructed route; specify the additional predecessor evidence required for route tasks.

### Relax a weighted path estimate

`bb.concept.algorithms.weighted-relaxation` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given a current distance and an outgoing edge weight, compute a candidate neighbor distance and decide whether it improves the stored estimate.

**Proposed prerequisites:** `bb.concept.foundations.graph-structure`, `bb.concept.foundations.map-set-operations`

**Existing source contexts:** [shortest-paths](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1056-L1056), [dijkstra](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L91-L158).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Distinguish an estimate update from a proof that a distance is final, and state how unknown or unreachable distances are represented.

### Dijkstra settled-distance condition

`bb.concept.algorithms.dijkstra-settled-distance` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** On a nonnegative-weight example, choose the smallest unvisited distance, perform relaxations and explain which assumption a negative edge would break.

**Proposed prerequisites:** `bb.concept.algorithms.weighted-relaxation`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [dijkstra](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L91-L158).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Review the complete vertex-set contract and the scan-based implementation cost; do not attribute heap-based complexity to this code.

### Sorting regions and guarantees

`bb.concept.algorithms.sorting-region-invariants` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** After a pass of a stated sort, identify the region with an ordering guarantee and distinguish it from a merely partitioned or still-unknown region.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [sorting-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1064-L1064), [capstone-arcade](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1129-L1135).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Use an algorithm-specific guarantee; a partition is not a fully sorted half, and the source only mentions insertion sort without supplying a dedicated lesson.

### Bubble-sort pass and early exit

`bb.concept.algorithms.bubble-sort-pass-and-stop` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace one adjacent-swap pass, identify the settled suffix and justify a no-swap early stop, while accounting for whether this implementation copies the input.

**Proposed prerequisites:** `bb.concept.algorithms.sorting-region-invariants`, `bb.concept.algorithms.loop-operation-counts`, `bb.concept.algorithms.array-access-and-insertion`

**Existing source contexts:** [bubble-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L16-L72), [challenge-bubble-impl](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L123-L178), [capstone-arcade](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1129-L1135).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Resolve the source mismatch between a copied output array and the O(1) in-place quiz answer before using the affected assessment.

### Partition around a pivot

`bb.concept.algorithms.partition-pivot-rank` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For the displayed partition scheme, trace the boundary and pivot placement, stating which values lie on each side and why this does not sort those sides.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [selection-partition](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1073-L1073), [quick-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L73-L134).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Make equality handling, pivot scheme and rank convention explicit rather than generalizing one partition guarantee to all variants.

### Selection without sorting both sides

`bb.concept.algorithms.selection-by-rank` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given a pivot rank and a requested rank under one indexing convention, choose the remaining side or pivot and justify discarding the other side.

**Proposed prerequisites:** `bb.concept.algorithms.partition-pivot-rank`

**Existing source contexts:** [selection-partition](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1073-L1073).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** This is conceptual selection material; no complete quickselect implementation or assessment of a full execution is present.

### Quicksort recursive partitions

`bb.concept.algorithms.quicksort-recursive-partition` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace the displayed quicksort calls around a pivot, compare balanced and skewed partitions and state the implementation and probability assumptions behind cost claims.

**Proposed prerequisites:** `bb.concept.algorithms.partition-pivot-rank`, `bb.concept.foundations.recursion-call-state`, `bb.concept.algorithms.loop-operation-counts`

**Existing source contexts:** [quick-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L73-L134).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Replace the unqualified pivot-choice prevention claim and account for recursion-stack space separately from in-place partitioning.

### Merge two sorted sequences

`bb.concept.algorithms.merge-sorted-sequences` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Merge two nondecreasing sequences with two cursors, preserving the output-prefix invariant, draining leftovers and accounting for every emitted element.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [merge-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L135-L192), [challenge-merge-arrays](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L69-L122).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Specify tie handling and output allocation; repair the asymptotically equivalent complexity distractor before grading this check.

### Merge-sort split and combine

`bb.concept.algorithms.merge-sort-divide-and-merge` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace a small recursive split-and-merge tree, connect each level to total merge work and distinguish output storage, temporary copies and call-stack requirements.

**Proposed prerequisites:** `bb.concept.algorithms.merge-sorted-sequences`, `bb.concept.foundations.recursion-call-state`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [merge-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L135-L192).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Qualify complexity with the stated comparison/data model and demonstrate stability using labelled equal-key records.

### Choose a sort under explicit constraints

`bb.concept.algorithms.sort-choice-under-constraints` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a scenario with stability, mutation, memory and worst-case requirements, compare the presented sort variants and justify a choice or identify missing information.

**Proposed prerequisites:** `bb.concept.algorithms.bubble-sort-pass-and-stop`, `bb.concept.algorithms.quicksort-recursive-partition`, `bb.concept.algorithms.merge-sort-divide-and-merge`, `bb.concept.foundations.sort-stability`, `bb.concept.algorithms.time-space-tradeoffs`

**Existing source contexts:** [choose-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L193-L223).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Treat the choice as conditional among the shown variants, not a universal fastest-sort recommendation; code and space descriptions must agree.

### Linear search and first-match contract

`bb.concept.algorithms.linear-search-first-match` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace a linear scan on an unsorted array, return the first matching index or not-found result, and distinguish best-case from full-scan work.

**Proposed prerequisites:** `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.algorithms.loop-operation-counts`

**Existing source contexts:** [linear-search](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L16-L50).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** State duplicate behavior and what average-case cost assumes; a small-input comparison should not promise binary search is always faster in elapsed time.

### Binary-search candidate interval

`bb.concept.algorithms.binary-search-interval-invariant` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Given an ordered array, target and inclusive bounds, justify each discarded interval and preserve the claim that any matching target still under consideration lies inside the bounds.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.foundations.index-bounds`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [binary-search-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1065-L1072), [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Distinguish any-match from first-match behavior, include absent targets, and verify the bounds convention rather than relying on a familiar animation.

### Binary-search progress and logarithmic cost

`bb.concept.algorithms.binary-search-progress-and-log-cost` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace bound updates on found and absent targets, show that the candidate interval shrinks and connect repeated halving with the number of comparisons.

**Proposed prerequisites:** `bb.concept.algorithms.binary-search-interval-invariant`, `bb.concept.foundations.halving-and-growth`, `bb.concept.algorithms.growth-rates`, `bb.concept.foundations.program-state`

**Existing source contexts:** [binary-search-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1065-L1072), [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Use the complete deep implementation for executable tracing; the overview trace only computes mid and does not contain a progressing loop.

### Jump-search block selection

`bb.concept.algorithms.jump-search-block-selection` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** On a sorted array and stated block size, identify the possible target block, scan it in the direction the implementation uses and account for jumps plus in-block comparisons.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.algorithms.linear-search-first-match`, `bb.concept.foundations.index-bounds`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [jump-search](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L91-L135).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Reconcile backward-scan prose with forward-incrementing code and explain the square-root step-size assumption and edge cases.

### Choose between scanning and ordered search

`bb.concept.algorithms.search-strategy-choice` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** For a lookup scenario, ask about ordering, updates, number of queries and preprocessing before choosing a linear scan or binary search under the stated representation.

**Proposed prerequisites:** `bb.concept.algorithms.linear-search-first-match`, `bb.concept.algorithms.binary-search-interval-invariant`, `bb.concept.algorithms.binary-search-progress-and-log-cost`, `bb.concept.algorithms.time-space-tradeoffs`

**Existing source contexts:** [linear-search](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L16-L50), [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90).

**Coverage:** Existing search explanations provide ingredients for the choice, but the application activity and scored reasoning rubric are proposed, not implemented.

**Subject-review question:** The cross-lesson comparison needs a new scenario, source-supported rubric and subject review; it is not already a validated application assessment.

### Memoization key and reuse

`bb.concept.algorithms.memoized-subproblem-state` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a recursive example, identify which state defines one subproblem, detect a repeated state and explain when a stored answer can be reused safely.

**Proposed prerequisites:** `bb.concept.foundations.recursion-call-state`, `bb.concept.foundations.map-set-operations`, `bb.concept.algorithms.time-space-tradeoffs`

**Existing source contexts:** [recursion-to-memo](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1081-L1081), [dp-fib](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L159-L214).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Show an incomplete-key counterexample and make purity/input-context assumptions explicit before reusing answers.

### DP state and dependency order

`bb.concept.algorithms.dp-state-and-dependency-order` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Define what one DP cell means, identify its base cases and prerequisite cells, and choose an order that reads only already justified values.

**Proposed prerequisites:** `bb.concept.foundations.index-bounds`, `bb.concept.foundations.loop-invariant`, `bb.concept.algorithms.memoized-subproblem-state`

**Existing source contexts:** [dp-table-fill](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1082-L1088), [dp-knapsack](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L215-L277), [dp-lcs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L278-L337).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Memoization is a proposed teaching bridge, not a logical requirement for every DP treatment; each grid needs an explicit recurrence and state meaning.

### Memoized Fibonacci

`bb.concept.algorithms.fibonacci-memoization` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace fib on a small nonnegative integer, identify reused subproblems and count solved states under a declared arithmetic model.

**Proposed prerequisites:** `bb.concept.algorithms.memoized-subproblem-state`, `bb.concept.foundations.recursion-call-state`, `bb.concept.algorithms.growth-rates`

**Existing source contexts:** [dp-fib](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L159-L214).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** State the input domain, numeric precision limits and unit-cost arithmetic convention rather than generalizing O(n) to unlimited exact integers.

### Zero-one knapsack choices

`bb.concept.algorithms.knapsack-choice-recurrence` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a small integer-capacity instance, define dp by item prefix and capacity, compare skip/take choices and explain why an item is used at most once.

**Proposed prerequisites:** `bb.concept.algorithms.dp-state-and-dependency-order`, `bb.concept.foundations.index-bounds`, `bb.concept.foundations.program-state`

**Existing source contexts:** [dp-knapsack](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L215-L277).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** State weight/capacity and value assumptions, distinguish a value result from item reconstruction, and qualify pseudo-polynomial cost if introduced.

### Longest-common-subsequence recurrence

`bb.concept.algorithms.lcs-prefix-recurrence` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For two short strings, define DP cells by prefix lengths and use match or mismatch cases to fill a small table without confusing subsequences with substrings.

**Proposed prerequisites:** `bb.concept.algorithms.dp-state-and-dependency-order`, `bb.concept.foundations.prefix-and-subsequence`, `bb.concept.foundations.index-bounds`

**Existing source contexts:** [dp-lcs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/graphs-dp.ts#L278-L337).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Resolve the inclusive-prefix wording versus i-1/j-1 code convention, and keep length calculation separate from reconstructing a sequence.

### Greedy choice and counterexamples

`bb.concept.algorithms.greedy-choice-safety` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a proposed local choice, articulate the global safety claim and either sketch an appropriate exchange argument or produce a counterexample to the rule.

**Proposed prerequisites:** `bb.concept.foundations.loop-invariant`, `bb.concept.foundations.complexity-model`

**Existing source contexts:** [greedy-choice](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1089-L1089).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** The source supplies an informal interval-scheduling example; a full worked exchange proof and a scored counterexample task still need authoring.

### Read a problem as a contract

`bb.concept.algorithms.problem-constraints-and-contracts` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** From a small problem statement, list inputs, output obligations, constraints and one edge case before naming candidate algorithms.

**Proposed prerequisites:** None required by this candidate map.

**Existing source contexts:** [problem-reading](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1127-L1127), [capstone-arcade](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1129-L1135), [challenge-two-sum](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L16-L68).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Avoid keyword-to-algorithm shortcuts; ask what assumptions would make a familiar algorithm inapplicable.

### Match repeated operations to a structure

`bb.concept.algorithms.data-structure-selection` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** For a stated workload, name its repeated operation and compare the relevant structure contracts, including one reason a tempting alternative may not fit.

**Proposed prerequisites:** `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.algorithms.stack-queue-discipline`, `bb.concept.algorithms.hash-table-load-and-resize`, `bb.concept.algorithms.heap-parent-child-priority`, `bb.concept.algorithms.time-space-tradeoffs`

**Existing source contexts:** [choose-data-structure](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1128-L1128), [capstone-arcade](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1129-L1135).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** A smaller pilot should narrow this broad comparison to the structures it actually teaches and assess a concrete scenario rather than name recognition.

### One-pass complement lookup

`bb.concept.algorithms.two-sum-complement-map` · version 1 · coverage `existing_material` · subject review pending

**Observable outcome:** Trace a value-to-index map for two-sum, look up the complement before inserting the current item and justify why the same array position is not reused.

**Proposed prerequisites:** `bb.concept.foundations.map-set-operations`, `bb.concept.algorithms.array-access-and-insertion`, `bb.concept.algorithms.time-space-tradeoffs`, `bb.concept.algorithms.problem-constraints-and-contracts`

**Existing source contexts:** [challenge-two-sum](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L16-L68).

**Coverage:** Existing source material addresses this proposed outcome; its accuracy, sufficiency and assessment alignment still need subject review.

**Subject-review question:** Use duplicate values and absence/uniqueness contracts deliberately; finite test cases and output equality alone do not prove a one-pass algorithm or understanding.

### Explain and justify an algorithm choice

`bb.concept.algorithms.algorithm-explanation-and-justification` · version 1 · coverage `partial` · subject review pending

**Observable outcome:** For a new bounded problem, produce a problem contract, chosen invariant, small trace and qualified complexity claim, and state an assumption that would change the choice.

**Proposed prerequisites:** `bb.concept.algorithms.problem-constraints-and-contracts`, `bb.concept.algorithms.data-structure-selection`, `bb.concept.algorithms.growth-rates`, `bb.concept.foundations.loop-invariant`

**Existing source contexts:** [capstone-arcade](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1129-L1135).

**Coverage:** The capstone project and reflection specify deliverables, but a source-supported scoring rubric and calibrated fresh task are not present.

**Subject-review question:** The project requests an explainer but has no validated reasoning rubric; claims must remain limited to the produced task and assistance context.
