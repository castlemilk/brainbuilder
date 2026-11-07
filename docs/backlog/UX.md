# UX backlog

Product experience and navigation. **8 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

1 ready; 6 blocked; 0 discovery; 1 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-UX-001 — Replace competing entry points with Today, Paths, Saved and Progress](#bb-ux-001) | P0 | ready | foundation | M | [#15](https://github.com/castlemilk/brainbuilder/issues/15) |
| [BB-UX-002 — Offer a short outcome setup and a first lesson before account creation](#bb-ux-002) | P0 | blocked | foundation | M | [#47](https://github.com/castlemilk/brainbuilder/issues/47) |
| [BB-UX-003 — Make Today present one useful session with remembered adjustments](#bb-ux-003) | P0 | blocked | foundation | M | [#48](https://github.com/castlemilk/brainbuilder/issues/48) |
| [BB-UX-004 — Build a focused finite lesson shell with save-and-leave behavior](#bb-ux-004) | P0 | blocked | foundation | M | [#41](https://github.com/castlemilk/brainbuilder/issues/41) |
| [BB-UX-005 — Resume interrupted sessions with a recap and a coherent shorter option](#bb-ux-005) | P0 | blocked | foundation | M | [#49](https://github.com/castlemilk/brainbuilder/issues/49) |
| [BB-UX-006 — Offer a manageable return after a break and an optional reminder rhythm](#bb-ux-006) | P1 | blocked | pilot | M | [#59](https://github.com/castlemilk/brainbuilder/issues/59) |
| [BB-UX-007 — Show useful goal paths with honest completion and contextual labs](#bb-ux-007) | P0 | blocked | foundation | M | [#50](https://github.com/castlemilk/brainbuilder/issues/50) |
| [BB-UX-008 — Add an explicit selected-source preview flow after the core routine is validated](#bb-ux-008) | P2 | later | expansion | M | [#69](https://github.com/castlemilk/brainbuilder/issues/69) |

## BB UX 001

**Replace competing entry points with Today, Paths, Saved and Progress**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#15 — \[P0\]\[BB-UX-001\] Replace competing entry points with Today, Paths, Saved and Progress](https://github.com/castlemilk/brainbuilder/issues/15)

**Problem**

The reviewed native navigation splits a learning routine across Home, Browse, Feed, Play, Library and You, while Home also exposes several competing activities.

**Scope**

- Map existing native and web routes to the four proposed destinations, including discovery/search within Paths and relevant labs within their concepts.
- Specify route migration, deep links, back behavior and destination labels before replacing the primary navigation.
- Keep preferences and account controls reachable without making them another primary learning destination.

**Acceptance criteria**

- [ ] A route inventory maps every existing learner entry point to Today, Paths, Saved, Progress or a documented secondary route.
- [ ] The main shell exposes exactly the four destination labels, with one selected destination and accessible names.
- [ ] Existing lab, course and saved-item deep links either resolve to the corresponding content or show an explicit recovery route.
- [ ] A navigation walkthrough reaches a relevant lab from a concept and returns to the same path position.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [apps/web/src/App.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx)

**Validation**

Review the route inventory against the current entry points and walk existing deep links plus back navigation in native and web development builds.

**Risks and limits**

Consolidation can hide valuable labs or break existing links. The new labels are a proposal to evaluate, not established user preference.

## BB UX 002

**Offer a short outcome setup and a first lesson before account creation**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#47 — \[P0\]\[BB-UX-002\] Offer a short outcome setup and a first lesson before account creation](https://github.com/castlemilk/brainbuilder/issues/47)

**Problem**

Repeated setup and abstract topic choices delay the first useful action, and an unsupported goal can lead to an empty or misleading promise.

**Scope**

- Implement screen 01 with one short, changeable outcome selection and an approximate time preference.
- Route a new learner to an available reviewed lesson and allow them to try it before requiring an account.
- Define unsupported-goal, guest-session and optional account-handoff copy using the selected pilot path.

**Acceptance criteria**

- [ ] A new guest can choose an available outcome and start its reviewed first activity without entering a name or email.
- [ ] An unsupported outcome explains the content gap and offers a real available path without fabricating coverage.
- [ ] A returning learner bypasses onboarding and can edit the outcome or budget later.
- [ ] The guest-to-account handoff shows what will be preserved and visibly handles an unavailable save or sign-in service.

**Task dependencies**

- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)

**Validation**

Walk a new guest, unsupported goal and returning learner through screen 01; include the first-session task in the prototype package used by [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40).

**Risks and limits**

An attractive onboarding promise can exceed the available reviewed content. Guest-state preservation depends on the engineering handoff contract.

## BB UX 003

**Make Today present one useful session with remembered adjustments**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#48 — \[P0\]\[BB-UX-003\] Make Today present one useful session with remembered adjustments](https://github.com/castlemilk/brainbuilder/issues/48)

**Problem**

A learner with little available time needs a ready next action; mandatory time and mode choices at every visit add planning effort.

**Scope**

- Implement screen 02 with one goal-linked primary action, an approximate duration and a short activity agenda.
- Prioritize a meaningful saved continuation when present, and remember optional time and Read/Listen/Practice adjustments.
- Consume the session-selection policy and queue contract, including new learner, no due review, paused goal and unavailable-mode states.

**Acceptance criteria**

- [ ] A returning learner with a valid plan can start the proposed session with one action without reselecting time and mode.
- [ ] The primary action, goal description and agenda correspond to the activities actually offered.
- [ ] Reducing the budget substitutes a coherent smaller objective or review and never cuts an essential explanation mid-step.
- [ ] An unavailable mode states the reason and offers a supported alternative; connection requirements are visible before starting.
- [ ] New learner, paused goal, empty queue and interrupted-session fixtures each show a usable next step without invented progress.

**Task dependencies**

- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-009](https://github.com/castlemilk/brainbuilder/issues/34) — Define a bounded review policy for short sessions and missed days
- [BB-ENG-008](https://github.com/castlemilk/brainbuilder/issues/36) — Render real progress and explicit empty, cached and error states
- [BB-ENG-013](https://github.com/castlemilk/brainbuilder/issues/38) — Implement a bounded review queue and resumable micro-session planner

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Walk the fixed state fixtures and confirm the chosen agenda matches the session contract; give the start and shorten tasks to [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) for participant evaluation.

**Risks and limits**

Duration is an estimate and must not become a completion promise. Default selection can appear arbitrary unless its connection to the learner's goal is clear.

## BB UX 004

**Build a focused finite lesson shell with save-and-leave behavior**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#41 — \[P0\]\[BB-UX-004\] Build a focused finite lesson shell with save-and-leave behavior](https://github.com/castlemilk/brainbuilder/issues/41)

**Problem**

Global navigation and repeated setup compete with a short lesson, while source inspection or an early exit can disrupt the learner's place.

**Scope**

- Implement the shared focused shell for screens 03, 04 and 11, with a finite activity sequence and one dominant next action.
- Provide accessible source, transcript and help panels plus a clear save-and-leave action.
- Consume durable checkpoint state and expose pending, saved and failed-save UI without implementing the storage layer in this task.

**Acceptance criteria**

- [ ] A focused lesson removes the persistent main navigation while retaining an accessible exit.
- [ ] The learner can identify the current activity and the finite remaining sequence without an endless content feed.
- [ ] Opening and closing source, transcript or help preserves the activity, answer draft and relevant playback position supplied by the checkpoint contract.
- [ ] Save-and-leave reflects the actual save state and offers recovery for a failed save instead of claiming success.
- [ ] Leaving early preserves completed work and does not label the learner or session a failure.

**Task dependencies**

- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-DES-002](https://github.com/castlemilk/brainbuilder/issues/24) — Build reusable accessible patterns for short learning activities
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)

**Validation**

Exercise panel open/close, exit during a draft and a failed-save fixture in the focused shell; review labels with the accessibility matrix in [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4).

**Risks and limits**

A visually reassuring save message is harmful if storage has not acknowledged it. Some activities need a meaningful boundary rather than arbitrary pixel-position restoration.

## BB UX 005

**Resume interrupted sessions with a recap and a coherent shorter option**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#49 — \[P0\]\[BB-UX-005\] Resume interrupted sessions with a recap and a coherent shorter option](https://github.com/castlemilk/brainbuilder/issues/49)

**Problem**

An interrupted learner may have less time and less context when returning; restarting everything wastes work and weakens the routine.

**Scope**

- Implement screen 07 using the last saved meaningful activity checkpoint or audio position.
- Show a short recap, resume action, coherent shorter restart and explicit start-from-beginning action.
- Define the learner-facing distinction between restarting the presentation and deleting previously recorded evidence.

**Acceptance criteria**

- [ ] Resume identifies the saved activity and gives a one-sentence recap consistent with the stored checkpoint.
- [ ] A saved answer draft and completed work remain available after interruption and reload when the persistence contract reports them saved.
- [ ] The shorter option chooses an authored coherent activity rather than silently discarding required context or completed work.
- [ ] Restart copy states what will restart and does not erase prior learning observations.
- [ ] A replayed or retried submission displays a single attempt result when engineering returns the same stable attempt identifier.

**Task dependencies**

- [BB-UX-004](https://github.com/castlemilk/brainbuilder/issues/41) — Build a focused finite lesson shell with save-and-leave behavior
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-007](https://github.com/castlemilk/brainbuilder/issues/35) — Synchronize offline learning events idempotently across devices

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Use interrupted explanation, drafted response and paused-audio fixtures; supply the unexpected-stop and resume tasks to [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40).

**Risks and limits**

A recap can reveal a pending recall answer. Recap content must be appropriate to the activity, and any answer-revealing help must be recorded as assistance.

## BB UX 006

**Offer a manageable return after a break and an optional reminder rhythm**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#59 — \[P1\]\[BB-UX-006\] Offer a manageable return after a break and an optional reminder rhythm](https://github.com/castlemilk/brainbuilder/issues/59)

**Problem**

A large overdue queue or punitive return message can make resuming feel expensive, while premature notification requests provide no demonstrated value.

**Scope**

- Implement screen 08 with a small useful refresh, a visible capped plan and the ability to change or pause the goal.
- Offer reminder preferences after a meaningful learning action, including frequency, quiet times, pause and off.
- Preserve optional celebrations and motivational preferences while keeping learning history intact after missed days.

**Acceptance criteria**

- [ ] A missed-period fixture presents a bounded next session and explains that remaining reviews were reordered.
- [ ] The learner can change or pause the current goal from the return flow and see the resulting next-step state.
- [ ] No missed-day state erases past observations or describes uncompleted practice as lost knowledge.
- [ ] Reminder permission is requested only following a meaningful action, with a clear defer option and editable quiet-time and frequency settings.
- [ ] Turning reminders off updates the visible preference without changing access to learning or existing progress.

**Task dependencies**

- [BB-UX-003](https://github.com/castlemilk/brainbuilder/issues/48) — Make Today present one useful session with remembered adjustments
- [BB-LRN-009](https://github.com/castlemilk/brainbuilder/issues/34) — Define a bounded review policy for short sessions and missed days
- [BB-ENG-017](https://github.com/castlemilk/brainbuilder/issues/42) — Persist voluntary reminder preferences and schedule bounded notifications

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Walk short and long absence fixtures, goal pause and notification denial; use the return task in [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) to assess comprehension rather than assuming this tone fits everyone.

**Risks and limits**

Different learners value different motivational features. A capped queue is workload guidance, not a claim that unreviewed material is retained or forgotten.

## BB UX 007

**Show useful goal paths with honest completion and contextual labs**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#50 — \[P0\]\[BB-UX-007\] Show useful goal paths with honest completion and contextual labs](https://github.com/castlemilk/brainbuilder/issues/50)

**Problem**

Existing rich algorithms material needs a clear route from a concrete outcome to small concepts and deeper practice, with accurate completion labels.

**Scope**

- Implement screen 09 for the curated pilot path, showing its outcome, prerequisites, next concept and relevant deeper activities.
- Separate reached-the-end, completed-lesson and checked-concept states in the path UI.
- Keep topic discovery and search within Paths without expanding the subject catalog in this task.

**Acceptance criteria**

- [ ] The path shows an outcome and prerequisites linked to the authored concept inventory.
- [ ] Each concept offers its next useful action and only relevant existing labs or deeper activities.
- [ ] Completing the final lesson does not visually mark earlier untouched lessons complete.
- [ ] Lesson completion and observed checked understanding have distinct labels and can display different states.
- [ ] A revisit date is labelled as a suggested practice time, and an unmet prerequisite produces a clear route to the needed material.

**Task dependencies**

- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-ENG-001](https://github.com/castlemilk/brainbuilder/issues/5) — Make lesson and course completion truthful on web and native
- [BB-ENG-008](https://github.com/castlemilk/brainbuilder/issues/36) — Render real progress and explicit empty, cached and error states

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)

**Validation**

Review a path containing untouched, started, completed and checked concepts, then navigate into a relevant lab and back; verify labels against actual completion fixtures.

**Risks and limits**

Completion and mastery are easy to conflate. The path should expose the evidence available without implying permanent mastery or a universal sequence for all learners.

## BB UX 008

**Add an explicit selected-source preview flow after the core routine is validated**

**Priority:** P2 · **Status:** later · **Phase:** expansion · **Effort:** M

**Epic:** UX — Start, continue and return

**Canonical issue:** [#69 — \[P2\]\[BB-UX-008\] Add an explicit selected-source preview flow after the core routine is validated](https://github.com/castlemilk/brainbuilder/issues/69)

**Problem**

Selected material could connect learning to a personal need, but automatic intake without a clear goal, source support or review can create misleading lessons.

**Scope**

- Implement screen 10 within Saved only after the source-authoring and core-routine gates are satisfied.
- Let the learner intentionally choose a supported article, excerpt or note, state a goal and preview the supported lesson sequence.
- Provide source identity/version, visible supporting material, correction, removal and explicit processing/failure states.

**Acceptance criteria**

- [ ] A recorded post-pilot decision permits this extension before implementation begins.
- [ ] The flow processes only the material explicitly selected by the learner and shows the source and requested goal in the preview.
- [ ] Every proposed explanation and question exposes its supporting source material or is flagged as unsupported before lesson acceptance.
- [ ] Insufficient content, unsupported format, extraction failure and changed-source fixtures each produce a clear recovery path.
- [ ] The learner can cancel, correct or remove the proposed lesson; importing or previewing it creates no reading, recall or mastery credit.

**Task dependencies**

- [BB-UX-001](https://github.com/castlemilk/brainbuilder/issues/15) — Replace competing entry points with Today, Paths, Saved and Progress
- [BB-LRN-010](https://github.com/castlemilk/brainbuilder/issues/66) — Define a source-supported authoring contract for selected-material lessons
- [BB-ENG-015](https://github.com/castlemilk/brainbuilder/issues/67) — Design source import after the curated pilot demonstrates demand

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Review supported, insufficient, changed and failed sources against the import authoring contract; treat the earlier prototype version as a labelled concept, not a working importer.

**Risks and limits**

Source intake can distract from proving the core routine and is already a competitive feature category. Support for a source does not establish its factual quality or permission to redistribute it.
