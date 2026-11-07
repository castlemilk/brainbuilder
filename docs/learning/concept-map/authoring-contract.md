# Concept authoring contract

Version 0.1.0 · BB-LRN-001 · source baseline `abf70fa012356038ffa5a2c4092584d452724e5e`.

This contract is a documentation deliverable. It introduces candidate concept identities and review requirements without changing the runtime model, existing source IDs or learner history. All educational mappings and prerequisite edges need subject review. No human educational approval is recorded.

## Four different records

| Record | Meaning | Identity and version | What it does not establish |
| --- | --- | --- | --- |
| Concept | A bounded construct with an observable outcome, applicable conditions and proposed prerequisites | `bb.concept.<area>.<semantic-slug>` plus an integer version | Reading a lesson or recognizing a label does not establish this outcome |
| Lesson | An authored sequence that can introduce or revisit one or several concepts | Retain the existing `CourseLesson.id`; add an explicit content version when the authoring/runtime work adopts this contract | Its ID is not a concept ID, and reaching its end is not checked understanding |
| Activity | One explanation, visual, response prompt, lab or application opportunity within a lesson or review | Retain existing block IDs as source identities; new examples use `bb.activity...` with separate prompt/rubric versions | A declared quiz/lab/project is not automatically a valid assessment |
| Session | A learner's bounded visit, selecting suitable activities and saving a checkpoint | Future session instance ID, budget, mode, activities, checkpoint and timestamps | A session is not a content unit, a concept or a mastery observation |

The existing definitions are in [courseware](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts). The source has lessons and blocks, but not this concept-level contract. The [worked mappings](worked-mappings.md) show the same concept reappearing in multiple existing lessons and the distinction between reusable content and a visit.

## Minimum concept record

Every concept needs a stable ID; separate version; bounded label; observable outcome stating the task, conditions and expected reasoning; proposed prerequisite IDs; existing source lesson/activity bindings; coverage status; limits; and subject-review status. `concepts.json` supplies those records and retains a specific subject-review question for each of its 56 candidates.

An outcome should be assessable without claiming universal understanding. For example, “given a sorted array and inclusive bounds, justify which interval can be discarded” is narrower than “master binary search.” A broad capstone outcome must be narrowed to a bounded scenario before becoming a pilot assessment.

Reuse an ID only while the construct retains the same meaning. Editing wording or replacing an example increments its separate version when interpretation or assessment changes. Splitting one construct, changing its preconditions or making a materially different claim requires a new ID and an explicit mapping of the old identity; do not silently reinterpret earlier observations.

## Prerequisite contract

`prerequisite_ids` lists the concepts proposed before attempting this outcome. Each edge is an authoring hypothesis, not proof about an individual learner or an enforced lock. The graph must be acyclic, and every referenced node must exist. The supplied topological order is one feasible ordering, not the only valid curriculum.

Foundations with missing dedicated material remain real nodes with explicit gaps. A lesson that assumes a concept cannot silently count as its prerequisite lesson. The four missing dedicated introductions/checks are program state/control flow, recursion call state, prefix versus subsequence, and sort stability. Eight other foundations have partial coverage. A pilot author must either supply an adequate bridge or establish the prerequisite through a suitable check and record the chosen treatment; onboarding self-report alone is not a checked demonstration.

Current source unit order is not adopted as a prerequisite graph. For example, tree traversal appears before the deep BST introduction, and coding examples assume syntax and recursion. The new graph makes these assumptions reviewable without rewriting the current course.

## Source and activity contract

Every existing-material binding names the course, unit, lesson and block IDs and resolves to immutable source evidence. `source-coverage.json` includes baseline file hashes, 201 line-span references and every one of the 205 block records. Generated `conceptLesson` blocks retain their call site, factory and content profile references so a generated ID is not mistaken for a literal source declaration.

Each activity needs a purpose and concept alignment; source/material version; supported attention and response modes; approximate duration if estimated; a coherent stopping boundary; and an honest evidence category. Question and rubric identities must be separate from the concept. New prompts need their own versions even when they assess the same construct.

Preserve the warm paper, ink and restrained accent identity when presenting these activities, but do not depend on color, motion, sound or drag alone to communicate the concept. A renderer declaration or fallback string is an implementation intention, not verified accessible behavior. Numerical traces generally need a visible or otherwise accessible sequence; narration may introduce the idea but must not promise equivalent assessment in an unsuitable context.

## Evidence and completion boundaries

| Event | Permissible interpretation |
| --- | --- |
| Read, hear or watch an explanation | Exposure to that material/version |
| Think privately, reveal, then report confidence | Private self-report; objective correctness remains unknown |
| Select an answer in a current source quiz | A checked option selection under the actual hint/reveal context; review the question and keyed answer first |
| Submit reasoning or code | An attempt; a reviewed rubric or execution result is needed to say what was established |
| Attempt a later prompt | A later observation only when timing, prompt version, assistance and intervening practice are recorded |
| Finish a lesson/session | Navigation or completion state, distinct from the observations above |

Private recall is unscored. Audio completion cannot create checked recall. A lab's finite passing examples do not prove general algorithm correctness, complexity or learning. The companion evidence contract in `docs/learning/evidence-contract/` owns the fuller semantics; this authoring contract supplies content identities and conditions for that work.

## Review before pilot use

Subject review should check factual explanations, assumptions, code/prose consistency, examples, prerequisite sufficiency, question-answer alignment and rubric limits. Record reviewer, reviewed source/content version, decision and unresolved issues when review actually happens. This inventory leaves every subject-review record pending and every approver/date null.

The highest-confidence source inconsistencies are reproducible in [review-gaps.md](review-gaps.md), with acceptance gates. Existing structural tests passing is not a substitute for resolving those gaps. Do not mark a source reviewed merely because its ID, file hash or graph edge validates.

## Job and session selection

Work fluency, technical interview preparation and curiosity remain three distinct unvalidated candidates in `concepts.json`. Their triggers, desired outcomes, content-fit hypotheses and required discovery evidence are separate. This task selects no cohort or payment model. BB-GTM-001 chooses the initial job; BB-LRN-003 then curates a small reviewed path.

Session budgets in examples are approximate planning choices. Choose a complete small objective, review or application step; do not truncate required context to force a duration. Preserve work when a learner leaves and return to a meaningful boundary. A short visit can introduce an idea, while a later visit checks it. Neither a duration nor the number of content blocks establishes efficacy.
