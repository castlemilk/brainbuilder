# DES backlog

Design identity accessibility and prototypes. **6 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

2 ready; 4 blocked; 0 discovery; 0 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-DES-001 — Codify Brainbuilder's warm tactile visual system for the new screens](#bb-des-001) | P0 | ready | foundation | S | [#3](https://github.com/castlemilk/brainbuilder/issues/3) |
| [BB-DES-002 — Build reusable accessible patterns for short learning activities](#bb-des-002) | P0 | blocked | foundation | M | [#24](https://github.com/castlemilk/brainbuilder/issues/24) |
| [BB-DES-003 — Provide usable alternatives to diagrams, motion and drag-only labs](#bb-des-003) | P1 | blocked | pilot | M | [#51](https://github.com/castlemilk/brainbuilder/issues/51) |
| [BB-DES-004 — Define the accessibility acceptance and device review matrix](#bb-des-004) | P0 | ready | foundation | S | [#4](https://github.com/castlemilk/brainbuilder/issues/4) |
| [BB-DES-005 — Review implemented core screens for readability, access and state completeness](#bb-des-005) | P1 | blocked | pilot | M | [#61](https://github.com/castlemilk/brainbuilder/issues/61) |
| [BB-DES-006 — Build a clickable twelve-screen prototype and research task fixtures](#bb-des-006) | P0 | blocked | foundation | M | [#30](https://github.com/castlemilk/brainbuilder/issues/30) |

## BB DES 001

**Codify Brainbuilder's warm tactile visual system for the new screens**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#3 — \[P0\]\[BB-DES-001\] Codify Brainbuilder's warm tactile visual system for the new screens](https://github.com/castlemilk/brainbuilder/issues/3)

**Problem**

New microlearning surfaces need consistency with Brainbuilder's existing mature tactile identity instead of drifting into a generic productivity or children's quiz aesthetic.

**Scope**

- Document reusable warm-paper, ink, teal, ember and violet roles plus typography, spacing, borders and modest shadows.
- Define readable text hierarchy, dominant action styling and restrained motion or celebration behavior.
- Map shared semantic tokens to native and web usage while retaining platform-appropriate controls.

**Acceptance criteria**

- [ ] A compact token sheet identifies foreground/background roles, type hierarchy, spacing and focus/disabled/error states.
- [ ] Example Today, lesson and progress compositions visibly preserve warm paper, strong editorial headings and readable body type.
- [ ] Color carries no sole meaning: examples include text or icon distinctions for evidence, status and feedback.
- [ ] Decorative texture and motion can be reduced without removing instructions or interaction meaning.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [.impeccable.md at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.impeccable.md)
- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Compare the token sheet and three representative compositions with the pinned design context; record deliberate departures and check the readability of nondecorative elements.

**Risks and limits**

Paper texture, thin outlines and offset shadows can weaken legibility if overused. Visual warmth must survive accessibility adaptations without depending on decoration.

## BB DES 002

**Build reusable accessible patterns for short learning activities**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#24 — \[P0\]\[BB-DES-002\] Build reusable accessible patterns for short learning activities](https://github.com/castlemilk/brainbuilder/issues/24)

**Problem**

One-off cards, selectors and feedback panels would make the new screens inconsistent and harder to use or maintain across native and web.

**Scope**

- Define and implement reusable session action, agenda card, time/mode adjustment, progress label, feedback and source-panel patterns.
- Specify focus, selection, loading, disabled, error, offline and empty states using the agreed accessibility matrix.
- Keep the task scoped to shared presentation and interaction patterns; feature-specific learning and persistence logic remain in their own tasks.

**Acceptance criteria**

- [ ] A documented component inventory covers the core Today, focused-lesson and progress patterns with native and web usage examples.
- [ ] Each interactive pattern has an accessible name, role/state, visible focus treatment where relevant and a sufficiently large documented target.
- [ ] Time/mode controls can be adjusted without gesture-only interaction and do not rely on color to identify selection.
- [ ] Loading, unavailable, failed and empty examples communicate actual state and a next action instead of fabricated success.
- [ ] Text scaling and reduced-motion examples preserve access to content and primary actions.

**Task dependencies**

- [BB-DES-001](https://github.com/castlemilk/brainbuilder/issues/3) — Codify Brainbuilder's warm tactile visual system for the new screens
- [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4) — Define the accessibility acceptance and device review matrix

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [.impeccable.md at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.impeccable.md)

**Validation**

Review each pattern against the [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4) manual acceptance matrix and demonstrate representative variants in the component examples rather than writing implementation-mirroring tests.

**Risks and limits**

A shared appearance cannot erase meaningful native/web interaction differences. A component demonstration alone does not establish accessibility of complete learning flows.

## BB DES 003

**Provide usable alternatives to diagrams, motion and drag-only labs**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#51 — \[P1\]\[BB-DES-003\] Provide usable alternatives to diagrams, motion and drag-only labs](https://github.com/castlemilk/brainbuilder/issues/51)

**Problem**

Brainbuilder's tactile diagrams and labs are valuable, but visual-only explanations, drag-only controls or continuous motion can block access to the same concept.

**Scope**

- Audit only the pilot path's selected diagrams and labs, retaining their learning purpose and playful identity.
- Design equivalent text or structured descriptions, explicit step controls and non-drag interaction routes where needed.
- Specify screen-reader announcements and reduced-motion behavior that preserve meaningful state changes without overwhelming the learner.

**Acceptance criteria**

- [ ] Each pilot diagram or lab has an identified learning objective and a documented accessible route to the same essential information.
- [ ] Any drag-based action has a visible control or keyboard-compatible alternative appropriate to the platform.
- [ ] Step, pause and reset controls expose meaningful state without announcing every decorative animation frame.
- [ ] Reduced motion preserves the algorithm or concept sequence through clear static or stepped states.
- [ ] The authoring review confirms that the alternative has not removed the reasoning required by the activity.

**Task dependencies**

- [BB-DES-002](https://github.com/castlemilk/brainbuilder/issues/24) — Build reusable accessible patterns for short learning activities
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Walk selected pilot activities using keyboard or explicit controls, screen-reader descriptions and reduced motion; compare the resulting explanation and choices with the original concept objective.

**Risks and limits**

An alternative can unintentionally give away the answer or assess a different skill. Preserve the intended reasoning and document any activity that cannot yet offer a comparable route.

## BB DES 004

**Define the accessibility acceptance and device review matrix**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#4 — \[P0\]\[BB-DES-004\] Define the accessibility acceptance and device review matrix](https://github.com/castlemilk/brainbuilder/issues/4)

**Problem**

The concept boards describe accessibility goals but have not established usable native behavior, readable responsive layouts or an explicit validation scope.

**Scope**

- Write observable manual acceptance criteria for focus/order, screen-reader labels, text scaling, reflow, contrast, touch targets and reduced motion.
- Define the native and web device/browser combinations to be reviewed and record unavailable combinations as untested.
- Include focused lessons, player controls, download states, interrupted sessions and evidence labels in the state matrix; engineering owns automation and real playback verification.

**Acceptance criteria**

- [ ] The matrix names the chosen platform/device/browser combinations and the assistive settings needed for each review.
- [ ] Each criterion is observable, has a pass/fail/not-tested result field and identifies the screen or shared pattern it covers.
- [ ] The matrix covers text enlargement/reflow, meaningful focus order, labels/states, contrast, non-color meaning, target size and reduced motion.
- [ ] Player, download failure, saving failure, recall-route switching and progress-empty states are explicitly included.
- [ ] The document states the scope of review and does not claim conformance for untested platforms or states.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Review the matrix against all twelve screens and the shared pattern inventory; check that every test has a reproducible setup and an observable expected result.

**Risks and limits**

A checklist can create false assurance if it omits real device behavior or affected users. The recorded review scope must remain explicit, and participant research is a separate activity.

## BB DES 005

**Review implemented core screens for readability, access and state completeness**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#61 — \[P1\]\[BB-DES-005\] Review implemented core screens for readability, access and state completeness](https://github.com/castlemilk/brainbuilder/issues/61)

**Problem**

A convincing concept image or clickable prototype cannot establish that real screens remain readable, accessible and truthful in compact, interrupted or failed states.

**Scope**

- Run the agreed internal design/accessibility review on available native and web development builds using the [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4) matrix.
- Inspect compact layouts, enlarged text, focus/screen-reader order, reduced motion and representative empty/loading/offline/error states.
- Record defects with reproduction evidence and recheck corrections; recruitment and participant usability execution stay in [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40).
- Own manual visual and interaction review of the implemented screens; hand findings and fixtures to [BB-QA-005](https://github.com/castlemilk/brainbuilder/issues/62) for the release accessibility and recovery evidence.

**Acceptance criteria**

- [ ] Every in-scope matrix row has a recorded result, build identifier and platform context, with unavailable combinations marked not tested.
- [ ] Primary actions and essential instructional copy remain reachable at the chosen compact viewport and enlarged text settings.
- [ ] Core start, recall, save, resume, return and progress flows expose a meaningful reading/focus order and state labels.
- [ ] Defects include a reproduction path, impact and evidence; blocking access or misleading-state defects are corrected or explicitly stop the affected pilot flow.
- [ ] Corrected blocking defects are rechecked, and the review reports limitations without claiming that a visual inspection proves usability or learning efficacy.

**Task dependencies**

- [BB-DES-002](https://github.com/castlemilk/brainbuilder/issues/24) — Build reusable accessible patterns for short learning activities
- [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4) — Define the accessibility acceptance and device review matrix
- [BB-DES-006](https://github.com/castlemilk/brainbuilder/issues/30) — Build a clickable twelve-screen prototype and research task fixtures
- [BB-UX-004](https://github.com/castlemilk/brainbuilder/issues/41) — Build a focused finite lesson shell with save-and-leave behavior
- [BB-UX-005](https://github.com/castlemilk/brainbuilder/issues/49) — Resume interrupted sessions with a recap and a coherent shorter option
- [BB-LRN-005](https://github.com/castlemilk/brainbuilder/issues/56) — Deliver recall-before-reveal with separate private and typed practice
- [BB-LRN-008](https://github.com/castlemilk/brainbuilder/issues/55) — Show progress as contextual observations with honest empty states
- [BB-ENG-010](https://github.com/castlemilk/brainbuilder/issues/37) — Replace simulated audio with real playback and matching transcripts
- [BB-QA-007](https://github.com/castlemilk/brainbuilder/issues/11) — Run existing browser flows and platform export checks in CI
- [BB-UX-002](https://github.com/castlemilk/brainbuilder/issues/47) — Offer a short outcome setup and a first lesson before account creation
- [BB-UX-003](https://github.com/castlemilk/brainbuilder/issues/48) — Make Today present one useful session with remembered adjustments
- [BB-UX-006](https://github.com/castlemilk/brainbuilder/issues/59) — Offer a manageable return after a break and an optional reminder rhythm
- [BB-UX-007](https://github.com/castlemilk/brainbuilder/issues/50) — Show useful goal paths with honest completion and contextual labs

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Perform the scoped manual review once the core builds exist, retain screenshots or equivalent reproducible evidence for material defects, and broaden review only to resolve an identified risk or required gate.

**Risks and limits**

An internal review cannot substitute for assistive-technology expertise or participant evaluation. Native audio/background behavior remains an engineering real-device gate.

## BB DES 006

**Build a clickable twelve-screen prototype and research task fixtures**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Design — Identity, access and prototypes

**Canonical issue:** [#30 — \[P0\]\[BB-DES-006\] Build a clickable twelve-screen prototype and research task fixtures](https://github.com/castlemilk/brainbuilder/issues/30)

**Problem**

The three image boards communicate direction, but task-based evaluation needs connected flows, honest state variants and consistent learning examples.

**Scope**

- Turn the twelve-screen specification into a connected prototype using the warm tactile system and representative authored concept examples.
- Provide fixtures for start, shorten, mode change, interruption, resume, return and interpretation of private versus checked progress.
- Label selected-source learning as a future extension and simulated download/audio states as prototype behavior; hand off to [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) for participant sessions.

**Acceptance criteria**

- [ ] All twelve screens are represented and linked to the appropriate Today, Paths, Saved or Progress context.
- [ ] A participant can attempt the start, shorten, mode-switch, unexpected-stop, resume and missed-period return tasks without the moderator editing the prototype.
- [ ] Private practice hides typed entry and remains self-report; the checked-progress fixture exposes a denominator and timing/assistance context.
- [ ] The pack/player branch includes ready, incomplete and failed examples, and clearly identifies any simulated playback or offline behavior.
- [ ] A handoff package includes task start states, prototype version, known limitations and clearly labelled illustrative learner data; [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) owns recruitment, sessions and analysis.

**Task dependencies**

- [BB-DES-001](https://github.com/castlemilk/brainbuilder/issues/3) — Codify Brainbuilder's warm tactile visual system for the new screens
- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [docs/microlearning/Brainbuilder-Image-Prompts.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Image-Prompts.md)

**Validation**

Dry-run every research task from its documented start state and verify all screen links, labels and prototype limitations before passing the versioned package to [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40).

**Risks and limits**

A prototype can test navigation and interpretation but cannot establish retention, habit, real offline reliability or willingness to pay. Illustrative data and future capabilities must remain visibly distinct from working behavior.
