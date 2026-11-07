# LRN backlog

Learning content and evidence. **10 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

2 ready; 7 blocked; 0 discovery; 1 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-LRN-001 — Define stable concepts, outcomes and prerequisites for the existing material](#bb-lrn-001) | P0 | ready | foundation | M | [#9](https://github.com/castlemilk/brainbuilder/issues/9) |
| [BB-LRN-002 — Specify coherent short-session variants and supported attention modes](#bb-lrn-002) | P0 | blocked | foundation | M | [#27](https://github.com/castlemilk/brainbuilder/issues/27) |
| [BB-LRN-003 — Curate one reviewed algorithms path for the selected pilot job](#bb-lrn-003) | P0 | blocked | foundation | L | [#39](https://github.com/castlemilk/brainbuilder/issues/39) |
| [BB-LRN-004 — Define honest exposure, self-report, checked and delayed-check semantics](#bb-lrn-004) | P0 | ready | foundation | M | [#10](https://github.com/castlemilk/brainbuilder/issues/10) |
| [BB-LRN-005 — Deliver recall-before-reveal with separate private and typed practice](#bb-lrn-005) | P0 | blocked | foundation | M | [#56](https://github.com/castlemilk/brainbuilder/issues/56) |
| [BB-LRN-006 — Calibrate pilot answer rubrics and explanatory feedback](#bb-lrn-006) | P0 | blocked | foundation | M | [#44](https://github.com/castlemilk/brainbuilder/issues/44) |
| [BB-LRN-007 — Author fresh application scenarios with explicit reasoning criteria](#bb-lrn-007) | P1 | blocked | pilot | M | [#57](https://github.com/castlemilk/brainbuilder/issues/57) |
| [BB-LRN-008 — Show progress as contextual observations with honest empty states](#bb-lrn-008) | P1 | blocked | pilot | M | [#55](https://github.com/castlemilk/brainbuilder/issues/55) |
| [BB-LRN-009 — Define a bounded review policy for short sessions and missed days](#bb-lrn-009) | P0 | blocked | foundation | M | [#34](https://github.com/castlemilk/brainbuilder/issues/34) |
| [BB-LRN-010 — Define a source-supported authoring contract for selected-material lessons](#bb-lrn-010) | P2 | later | expansion | M | [#66](https://github.com/castlemilk/brainbuilder/issues/66) |

## BB LRN 001

**Define stable concepts, outcomes and prerequisites for the existing material**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#9 — \[P0\]\[BB-LRN-001\] Define stable concepts, outcomes and prerequisites for the existing material](https://github.com/castlemilk/brainbuilder/issues/9)

**Problem**

Course lessons and activity formats alone do not identify what a learner should be able to explain or apply, or what observations refer to the same underlying idea.

**Scope**

- Inventory existing algorithms material as candidate concepts with stable identifiers and concrete outcomes.
- Define the authoring contract for prerequisites, source/version, explanation, practice and relevant deeper activities.
- Keep work fluency, interview preparation and curiosity as distinct possible jobs until [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33) selects the pilot cohort.

**Acceptance criteria**

- [ ] Each inventoried candidate has a stable concept identifier, observable intended outcome and reviewed-material reference.
- [ ] Prerequisite edges have no cycles, and missing prerequisites are explicitly marked rather than silently omitted.
- [ ] The contract distinguishes a concept from a lesson, activity format and session, with at least two mapped examples from current courseware.
- [ ] Every candidate identifies existing reusable material and any authoring or subject-review gap.
- [ ] The inventory preserves the candidate user jobs without claiming that one has already been validated.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)

**Validation**

Trace two existing multi-format lessons into the contract and inspect the prerequisite graph; record content gaps for the curated pilot path rather than inventing missing source material.

**Risks and limits**

Overly broad concepts are hard to assess, while excessive fragmentation loses meaning. Stable IDs must survive presentation changes without implying equivalence between materially different outcomes.

## BB LRN 002

**Specify coherent short-session variants and supported attention modes**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#27 — \[P0\]\[BB-LRN-002\] Specify coherent short-session variants and supported attention modes](https://github.com/castlemilk/brainbuilder/issues/27)

**Problem**

Shortening a lesson or switching to audio can remove necessary context, and not every visual or interactive technical activity fits every situation.

**Scope**

- Define activity metadata for approximate duration, mode suitability, required attention and coherent stopping points.
- Author representative 2-, 5- and 10-minute session variants using existing concepts, including review-only alternatives.
- Specify mode and budget transitions as product rules for the session selector and player; leave playback and persistence implementation to engineering.

**Acceptance criteria**

- [ ] Representative short, medium and longer sessions each state a complete small objective and a meaningful ending.
- [ ] Every sample activity identifies supported modes and the need for visual inspection, typing or interaction where applicable.
- [ ] A shorter budget substitutes an authored activity or review instead of truncating essential explanation or feedback.
- [ ] An unavailable mode has a documented reason and a supported alternative, with completed work preserved across a mode change.
- [ ] All time labels are estimates; the authoring guidance makes no claim that a particular duration or multitasking context guarantees learning.

**Task dependencies**

- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Walk each sample at its claimed approximate duration and review whether its objective survives shortening and mode changes; retain observed timing ranges for later pilot calibration.

**Risks and limits**

Reading and response times vary. Audio may be unsuitable for diagrams or demanding reasoning, and a short session may need a later checked activity to establish understanding.

## BB LRN 003

**Curate one reviewed algorithms path for the selected pilot job**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** L

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#39 — \[P0\]\[BB-LRN-003\] Curate one reviewed algorithms path for the selected pilot job](https://github.com/castlemilk/brainbuilder/issues/39)

**Problem**

A wide catalog would obscure whether the basic routine helps a specific learner accomplish a real goal; the pilot needs a small coherent and reviewable body of material.

**Scope**

- Choose a bounded path from existing algorithms material after the cohort/job decision, with a planning target of 8–12 concepts subject to prerequisite review.
- Prepare explanations, worked examples, recall prompts, relevant labs, transcripts and supported audio scripts under the shared authoring contract.
- Record source support, subject-review outcomes and remaining content gaps; assessment calibration and fresh application prompts are separate tasks.

**Acceptance criteria**

- [ ] The path names the selected cohort/job, a concrete useful outcome and the prerequisites needed to attempt it.
- [ ] A bounded concept list and any change from the planning target are documented before pilot delivery.
- [ ] Each concept has a reviewed explanation, at least one retrieval prompt, a coherent short-session option and source/version provenance.
- [ ] Audio-supported concepts have scripts and transcripts that remain understandable without an unseen essential visual; unsupported formats are labelled.
- [ ] Subject review records factual corrections and unresolved gaps, and no unresolved critical content error enters the pilot path.

**Task dependencies**

- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33) — Select one initial audience and a concrete learning job

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)

**Validation**

Conduct a recorded subject-content review against the named sources, trace the prerequisite chain and perform an end-to-end content walkthrough before supplying the path to [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64).

**Risks and limits**

The selected cohort may need material outside the existing catalog. Reduce or revise the pilot scope if reviewed coverage is insufficient rather than generating unsupported content to fill it.

## BB LRN 004

**Define honest exposure, self-report, checked and delayed-check semantics**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#10 — \[P0\]\[BB-LRN-004\] Define honest exposure, self-report, checked and delayed-check semantics](https://github.com/castlemilk/brainbuilder/issues/10)

**Problem**

Current activity and reward counters cannot establish what was recalled, how it was checked or how much assistance was used.

**Scope**

- Define a versioned product evidence contract for exposure, private self-report, submitted/checked responses, delayed checks and application attempts.
- Specify prompt/rubric versions, timestamps, elapsed interval, assistance, source version and relevant intervening practice needed to interpret observations.
- Provide inclusion/exclusion examples for progress aggregation and scheduling; engineering owns event storage and idempotency.

**Acceptance criteria**

- [ ] The contract separately represents read/listened exposure, private self-report, assessed response, delayed assessed response and application evidence.
- [ ] Private thinking and listen-only completion have no objective correctness field or checked-recall credit.
- [ ] Hints, answer reveal, worked examples, skips, uncertain assessments and partial answers have explicit representations.
- [ ] A delayed-check observation preserves its actual elapsed interval, prompt version and relevant intervening practice rather than asserting a universal retention period.
- [ ] Worked aggregation examples show eligible numerators and denominators and exclude demo data, duplicate events and ineligible assistance from any unassisted-recall claim.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)

**Validation**

Review a small truth table covering exposure only, private confidence, hinted answers, unassisted answers, delayed answers and uncertain grading; use the same fixtures in engineering aggregation and progress UI work.

**Risks and limits**

A precise-looking metric can overstate weak or sparse evidence. The contract must preserve observation context and must not become an intelligence or permanent-mastery score.

## BB LRN 005

**Deliver recall-before-reveal with separate private and typed practice**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#56 — \[P0\]\[BB-LRN-005\] Deliver recall-before-reveal with separate private and typed practice](https://github.com/castlemilk/brainbuilder/issues/56)

**Problem**

Learners need a low-friction way to attempt recall on the go, but an unobserved mental answer must not be treated as a checked correct response.

**Scope**

- Implement screen 04 with private thinking, typed response and Not sure yet routes.
- Reveal explanatory feedback only after the chosen attempt action, with optional hints and worked examples recorded as assistance.
- Use the assessment contract for typed responses and the separate self-report contract for private practice; voice assessment remains outside this task.
- Own or wire the executable typed-response assessment adapter using versioned pilot rubrics, including uncertain and manual-review outcomes; rubric authoring alone does not implement assessment.

**Acceptance criteria**

- [ ] Choosing private practice hides the text field and presents reveal as the primary action.
- [ ] After private reveal, I had it, Partly and Need another pass are stored and displayed only as self-reports.
- [ ] Typed practice submits the response for a checked outcome with explanatory feedback and an uncertain state when assessment cannot support a judgment.
- [ ] Not sure yet, hints, answer reveal and worked examples are recorded according to [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) and never silently become unassisted correct answers.
- [ ] Switching route before submission preserves the prompt, avoids duplicate attempts and explains any assistance already revealed.

**Task dependencies**

- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics
- [BB-LRN-006](https://github.com/castlemilk/brainbuilder/issues/44) — Calibrate pilot answer rubrics and explanatory feedback
- [BB-UX-004](https://github.com/castlemilk/brainbuilder/issues/41) — Build a focused finite lesson shell with save-and-leave behavior
- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend
- [BB-ENG-007](https://github.com/castlemilk/brainbuilder/issues/35) — Synchronize offline learning events idempotently across devices

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Walk private, typed, uncertain, hinted and Not sure fixtures; have [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) ask participants to explain the difference between private practice and checked progress.

**Risks and limits**

Self-reported confidence can be mistaken for observed recall. Automatic checking may be unreliable for short or ambiguous answers, so uncertainty and explanation must stay visible.

## BB LRN 006

**Calibrate pilot answer rubrics and explanatory feedback**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#44 — \[P0\]\[BB-LRN-006\] Calibrate pilot answer rubrics and explanatory feedback](https://github.com/castlemilk/brainbuilder/issues/44)

**Problem**

A quiz result or generated judgment is only useful if it distinguishes substantive reasoning from superficial keyword matches and identifies what the response established.

**Scope**

- Author versioned reference answers, essential reasoning criteria, acceptable alternatives and common misconceptions for pilot retrieval prompts.
- Create a calibration set covering correct, partly correct, incorrect, ambiguous and unsupported responses.
- Define explanatory feedback and uncertain/manual-review outcomes, plus the pilot audit handoff; research owns study execution.

**Acceptance criteria**

- [ ] Every pilot checked prompt has source-supported criteria, an answer rationale and a rubric version.
- [ ] The calibration set includes paraphrased valid answers, keyword-only wrong answers, partial reasoning and answers the rubric cannot confidently classify.
- [ ] Feedback identifies established reasoning, a specific gap and a useful next step without claiming more understanding than the response demonstrates.
- [ ] Manual review records disagreements and rubric revisions; unresolved material grading errors are excluded or routed to uncertain before pilot use.
- [ ] An audit plan defines how sampled pilot judgments and disagreements will be recorded for [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64) without treating automated assessment as ground truth.

**Task dependencies**

- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Apply the rubrics to the fixed calibration set, record disagreement patterns and revise before enabling checked progress; retain the original and revised versions for audit.

**Risks and limits**

Rubric agreement on authored examples does not prove reliable grading of unseen answers. Novel or weakly supported responses must retain an uncertain route.

## BB LRN 007

**Author fresh application scenarios with explicit reasoning criteria**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#57 — \[P1\]\[BB-LRN-007\] Author fresh application scenarios with explicit reasoning criteria](https://github.com/castlemilk/brainbuilder/issues/57)

**Problem**

Repeating an example or recognizing keywords can look like understanding without showing whether the learner can use the idea in a different situation.

**Scope**

- Author screen 11 scenarios that differ from taught examples and ask for reasoning about a useful choice or limitation.
- Prepare alternate prompts for later checks so previously revealed answers are not reused as if unseen.
- Extend the pilot rubrics to application, including source support, acceptable alternatives, assistance and uncertain outcomes.

**Acceptance criteria**

- [ ] Each selected application objective has a new-context prompt and at least one alternate with a documented relationship to the taught concept.
- [ ] Rubrics reward relevant reasoning and tradeoffs, with a keyword-only answer included as an insufficient calibration example.
- [ ] Prompt metadata records prerequisites, version and prior exposure so the pilot can distinguish fresh from repeated tasks.
- [ ] A worked example or hint is available but visibly changes the assistance context of the resulting observation.
- [ ] Feedback limits claims to the assessed scenario and retains an uncertain outcome for reasoning the rubric cannot support.

**Task dependencies**

- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics
- [BB-LRN-006](https://github.com/castlemilk/brainbuilder/issues/44) — Calibrate pilot answer rubrics and explanatory feedback

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Conduct subject review of scenario novelty and rubric support, then supply fixed prompt versions and exposure rules to the [BB-RES-006](https://github.com/castlemilk/brainbuilder/issues/14) protocol and [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64) pilot.

**Risks and limits**

A changed story can still test the same memorized answer. A successful application response does not establish broad transfer beyond the tasks actually assessed.

## BB LRN 008

**Show progress as contextual observations with honest empty states**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#55 — \[P1\]\[BB-LRN-008\] Show progress as contextual observations with honest empty states](https://github.com/castlemilk/brainbuilder/issues/55)

**Problem**

Seeded XP and streak values or an unexplained mastery score can appear to be genuine learner history and conceal how little has actually been checked.

**Scope**

- Implement screen 12 with checked observations, elapsed time and an actionable next review.
- Separate read/listened activity, private self-report, lesson completion and assessed outcomes in the presentation.
- Use aggregation supplied by engineering and provide expandable eligibility/context details plus no-data and sparse-data states.

**Acceptance criteria**

- [ ] Every checked-recall summary exposes its eligible numerator, denominator, dates or elapsed interval and assistance context.
- [ ] Relevant intervening reviews and prompt context are available in the observation detail.
- [ ] Private self-reports and listening/reading exposure are displayed separately and never increase a checked-correct count.
- [ ] A new account shows No delayed checks yet or an equivalent truthful empty state, with no seeded streak, XP or recall results presented as real history.
- [ ] The view offers a useful next practice action and makes no claim about intelligence, permanent mastery or unmeasured learning efficacy.

**Task dependencies**

- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics
- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-ENG-008](https://github.com/castlemilk/brainbuilder/issues/36) — Render real progress and explicit empty, cached and error states

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)

**Validation**

Trace rendered summaries to the shared [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) fixtures, including mixed assistance, only self-reports, sparse checks and no history; assess interpretation through [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40).

**Risks and limits**

Small denominators and uneven intervals can create misleading comparisons. Preserve context and avoid ranking unlike observations as a single mastery score.

## BB LRN 009

**Define a bounded review policy for short sessions and missed days**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#34 — \[P0\]\[BB-LRN-009\] Define a bounded review policy for short sessions and missed days](https://github.com/castlemilk/brainbuilder/issues/34)

**Problem**

A review queue needs interpretable rules for what to revisit and how to recover from missed days; unchecked exposure or an arbitrary due date must not imply retained knowledge.

**Scope**

- Specify a simple configurable initial scheduling policy, workload cap, priority rules and learner overrides as pilot hypotheses.
- Define how new concepts, due reviews, paused goals, private requests for more practice and assisted or uncertain attempts affect the offered queue.
- Produce decision fixtures and user-facing rationale for engineering implementation; do not build the scheduler here.

**Acceptance criteria**

- [ ] The policy documents its initial intervals, workload cap and ordering rules as adjustable product assumptions rather than universal optimal spacing.
- [ ] Given fixed example observations and a time budget, decision fixtures specify a bounded coherent next session and explain why each activity is included.
- [ ] Missed days reorder pending practice without deleting history or claiming memory has expired.
- [ ] Listen-only exposure and private self-report cannot advance checked-recall success; a self-report may request further practice with its origin preserved.
- [ ] Pause, resume, unavailable content and no-due-review cases have explicit behavior, with changed recommendations distinguishable from past observations.

**Task dependencies**

- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Review fixtures for a new learner, short budget, long absence, paused goal, assisted attempts and private practice; hand the same expected decisions to the engineering queue implementation.

**Risks and limits**

A simple policy may be insufficiently personalized, while premature adaptive modeling would obscure its assumptions. Calibrate from pilot observations without presenting the schedule as proof of efficacy.

## BB LRN 010

**Define a source-supported authoring contract for selected-material lessons**

**Priority:** P2 · **Status:** later · **Phase:** expansion · **Effort:** M

**Epic:** Learning — Evidence and useful practice

**Canonical issue:** [#66 — \[P2\]\[BB-LRN-010\] Define a source-supported authoring contract for selected-material lessons](https://github.com/castlemilk/brainbuilder/issues/66)

**Problem**

Generating small lessons from arbitrary material can create unsupported explanations, unanswerable questions and a false appearance of validated learning content.

**Scope**

- After the core-pilot decision, define the narrow initial supported-source contract for selected articles, excerpts or notes.
- Require source identity/version and supporting spans for proposed concepts, explanations, questions and answer rubrics.
- Specify insufficient-material, changed-source, correction, removal and review-status behavior before implementing source intake.

**Acceptance criteria**

- [ ] A documented decision after [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64) explicitly permits this extension and states the unmet need it addresses.
- [ ] Sample proposed lessons map each substantive explanation and assessment criterion to supporting material from the selected version.
- [ ] Missing prerequisites, conflicting claims and unsupported answers remain visible gaps rather than being silently filled.
- [ ] The contract distinguishes generated draft, reviewed material and learner evidence, and importing a source creates no exposure or understanding credit.
- [ ] Changed or removed source fixtures define how future lesson use, citations and existing observations remain understandable.

**Task dependencies**

- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics
- [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64) — Run the approximately 24-person four-week learning pilot and audit its outcomes

**Additional prerequisites**

- Recorded decision that the core routine merits expansion into selected-source learning

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Review a small set of adequate, insufficient, conflicting and changed sources against the contract; do not use successful formatting as evidence that generated educational claims are accurate.

**Risks and limits**

Source quality varies and citations alone do not establish truth. This extension must not postpone proving an effective, usable routine with the reviewed pilot content.
