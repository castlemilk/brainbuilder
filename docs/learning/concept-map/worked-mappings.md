# Two worked concept mappings

These are complete authoring examples, not implemented lesson flows or approved pilot assessments. Existing source references are pinned to `abf70fa012356038ffa5a2c4092584d452724e5e`; new prompts, criteria and session compositions are assistant-authored drafts. Subject review, cohort selection, accessibility review and rubric calibration remain pending.

## Mapping 1 — Preserve a binary-search candidate interval

**Candidate job:** explain a technical choice for current work. Interview preparation and curiosity could use related content, but their value and delivery requirements must be evaluated separately.

**Concept:** `bb.concept.algorithms.binary-search-interval-invariant`, version 1.

**Observable outcome:** given an ordered array, target and inclusive bounds, justify each discarded interval and preserve the claim that any matching target still under consideration lies inside the bounds. This does not claim first-occurrence handling for duplicates or general mastery of every binary-search variant.

**Proposed prerequisites:** `bb.concept.foundations.sorted-order`, `bb.concept.foundations.index-bounds`, and `bb.concept.foundations.loop-invariant`. All are partial foundations in the current source. Check the ordering and bounds conventions or provide a short reviewed bridge before the main prompt.

### Existing source to concept

| Existing lesson | Blocks to reuse | Role and limit |
| --- | --- | --- |
| [binary-search-invariants](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts#L1065-L1073) | `binary-search-read`, `binary-search-audio`, `binary-search-window` | Explain and illustrate the candidate-window promise; exposure only |
| Same lesson | `binary-search-trace` | A short conceptual loop fragment; it only computes `mid`, so it is not a complete progressing implementation |
| Same lesson | `binary-search-check`, `binary-search-lab` | Existing option check and declared manipulation task; inspect rubric adequacy and actual renderer behavior before treating either as evidence of the full outcome |
| [binary-search-code](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts#L51-L90) | `binary-search-code-read`, `binary-search-code-trace`, `binary-search-sim` | A complete displayed implementation with bound updates and a not-found return |
| Same deep lesson | `binary-search-code-check`, `binary-search-code-reflection` | Existing sortedness recognition and a prompt about missing bound updates; neither is a recorded delayed check |

The same interval concept appears in two lessons and several modalities. `bb.concept.algorithms.binary-search-progress-and-log-cost` is a separate related construct: explaining the complexity claim requires more than naming the invariant.

### Draft recall activity

**Activity:** `bb.activity.algorithms.binary-search-recall`, version 1. **Prompt:** `bb.prompt.algorithms.binary-search-recall`, version 1. **Rubric:** `bb.rubric.algorithms.binary-search-recall`, version 1. These identities exist as documentation drafts in `concepts.json`.

Prompt: “In [3, 7, 11, 15, 19], the target is 19 and the midpoint value is 11. Which indices remain possible after comparison, and why can the others be discarded?” State zero-based inclusive bounds before the attempt.

A source-supported draft response retains indices 3–4: the target is greater than 11, and the ordered values at indices 0–2 cannot match it. This step preserves a candidate set; it has not by itself found the target. Partial reasoning, incorrect bounds and uncertainty must remain distinct. “Move right” alone does not establish the ordering argument.

Offer private thinking or typing. Private mode hides entry, reveals the explanation after the attempt and records only “I had it / Partly / Need another pass” as self-report. A typed answer remains a submitted attempt until an actual reviewed assessment returns its result. A hint, revealed answer or worked trace changes the assistance context. No demonstration here creates a learner observation.

### Draft application activity

**Activity:** `bb.activity.algorithms.search-strategy-application`, version 1. Prompt and rubric use `bb.prompt.algorithms.search-strategy-application` and `bb.rubric.algorithms.search-strategy-application`, each version 1.

Scenario: a directory receives frequent additions and is queried once during import and repeatedly during the day. Ask what must be known before choosing a linear scan or binary search, and when each could be reasonable.

The draft rubric asks for the ordering/comparator and access model, query frequency, preprocessing and update-maintenance costs, and a conditional recommendation. Missing information is a valid reason to withhold a categorical choice. Support comes from [linear search and binary search explanations](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts) and [time-space tradeoffs](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts). The scenario is new authored material, not an existing validated application task. Do not award correctness from the keyword “binary.”

### Session and return mapping

| Visit template | Coherent objective | Saved boundary and evidence |
| --- | --- | --- |
| About 2 minutes | Review one safe discard with the prerequisite convention stated | Preserve the prompt and any draft; private practice remains self-report |
| About 5 minutes | Explain the window, trace one example and attempt recall | Save after explanation or attempt; keep exposure separate from checked response |
| Longer focused visit | Inspect the complete code and apply the idea to the changing-directory scenario | Record the actual attempt, rubric version and assistance, not a universal mastery percentage |
| Later revisit | Use a different target or absent-target case appropriate to the same bounds convention | Record elapsed interval, intervening practice and whether the prompt was previously exposed |

These durations are estimates to test, not an optimal schedule. Listening can introduce the idea; a detailed index trace needs an accessible sequence and an appropriate attention context. A later-check interval is chosen by the separate review policy, not established by this mapping.

## Mapping 2 — Merge two sorted sequences

**Candidate job:** explain or implement a merge for a bounded task. Interview relevance is a hypothesis, not a chosen cohort.

**Concept:** `bb.concept.algorithms.merge-sorted-sequences`, version 1.

**Observable outcome:** merge two nondecreasing sequences with two cursors, preserve the output-prefix invariant, drain leftovers and account for every emitted element. **Prerequisites:** sorted order, array access/indexing and loop invariants. A stable-record application additionally requires `bb.concept.foundations.sort-stability`, which has no dedicated introduction/check in the inspected course.

### Existing source to concept

| Existing lesson | Blocks to reuse | Role and limit |
| --- | --- | --- |
| [merge-sort](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/sorting.ts#L135-L192) | `merge-sort-read`, `merge-sort-trace`, `merge-sort-sim` | The merge primitive appears inside recursive sorting; splitting and recursion belong to the separate `merge-sort-divide-and-merge` concept |
| [challenge-merge-arrays](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/challenges.ts#L69-L122) | `challenge-merge-arrays-read`, `challenge-merge-arrays-trace` | Explicit two-sequence task and the cursor/leftover implementation |
| Same challenge | `challenge-merge-arrays-lab` | A declared coding lab with three examples. Passing them would not prove stability, complexity or general correctness |
| Same challenge | `challenge-merge-arrays-check`, `challenge-merge-arrays-reflection` | Existing complexity choice needs review because an alternative expressed using the larger length can have the same asymptotic bound; in-place extension also needs its own assumptions |

### Draft recall activity

**Activity:** `bb.activity.algorithms.merge-prefix-recall`; prompt `bb.prompt.algorithms.merge-prefix-recall`; rubric `bb.rubric.algorithms.merge-prefix-recall`; all version 1, pending review.

Prompt: “Merge [1, 4, 4] and [2, 4, 7] in nondecreasing order. After output [1, 2], what value can be emitted next, which cursor moves, and why is the remaining output still constructible?”

Under a stated left-first-on-equal rule, emit the left 4 and advance only the left cursor. The output remains an ordered prefix because both remaining inputs are ordered and this value is no greater than either remaining front. A different consistent tie rule can preserve numeric sortedness; accepting it must depend on whether stability is part of the stated outcome. Continue until one side empties, then append its counterpart's remaining values. Do not discard duplicates.

The draft criteria require a smallest remaining front, correct cursor movement, the ordering argument and leftover handling. Private recall stays unscored. A typed explanation and a coding attempt are different observations, with different rubrics and assistance histories.

### Draft application activity

**Activity:** `bb.activity.algorithms.merge-records-application`; prompt `bb.prompt.algorithms.merge-records-application`; rubric `bb.rubric.algorithms.merge-records-application`; all version 1, pending review.

Scenario: two event batches are independently sorted by timestamp. Equal timestamps must retain an agreed original sequence across batches. Ask what extra ordering information is needed, then how the merge preserves it.

A well-supported answer first requests the cross-batch order or tie-break rule. Equal timestamps alone do not determine original interleaving. It then maintains the output-prefix invariant and consumes one record at a time under that comparator. “Choose the left batch on ties” is only sufficient when the agreed original-order contract makes that choice correct. This scenario introduces a missing stability foundation and cannot be treated as ready-to-score until that bridge and rubric are reviewed.

### Session and return mapping

| Visit template | Coherent objective | Boundary and limitation |
| --- | --- | --- |
| About 2 minutes | Predict one next emission with the tie rule stated | Finish the small prediction and explanation; do not pretend the whole merge was implemented |
| About 5 minutes | Trace a short merge and explain leftover handling | Save both cursor positions and the response draft at a meaningful boundary |
| Focused practice | Use the existing coding lab, then explain the output and allocation contract | Existing finite examples are supporting checks, not proof of all edge cases or algorithmic complexity |
| Later revisit | Use empty-side, duplicate-key or changed-length examples without repeating a revealed answer | Record actual prompt version, interval, assistance and intervening practice |

Before pilot use, add reviewed examples for empty inputs, equal-key identities and the exact output/mutation contract. The source's nine-minute lesson estimates do not determine these visit durations.
