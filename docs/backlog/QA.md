# QA backlog

Quality and release evidence. **8 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

1 ready; 7 blocked; 0 discovery; 0 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-QA-001 — Prove completion and learning-evidence invariants across both clients](#bb-qa-001) | P0 | blocked | foundation | M | [#45](https://github.com/castlemilk/brainbuilder/issues/45) |
| [BB-QA-002 — Gate contract generation and compatibility in CI](#bb-qa-002) | P0 | blocked | foundation | M | [#28](https://github.com/castlemilk/brainbuilder/issues/28) |
| [BB-QA-003 — Exercise restart, offline-sync and cross-device fault recovery](#bb-qa-003) | P0 | blocked | pilot | L | [#46](https://github.com/castlemilk/brainbuilder/issues/46) |
| [BB-QA-004 — Verify audio and offline packs on physical iOS and Android devices](#bb-qa-004) | P1 | blocked | pilot | L | [#58](https://github.com/castlemilk/brainbuilder/issues/58) |
| [BB-QA-005 — Validate accessible microlearning and recovery across form factors](#bb-qa-005) | P1 | blocked | pilot | M | [#62](https://github.com/castlemilk/brainbuilder/issues/62) |
| [BB-QA-006 — Audit content, feedback and delayed-check measurement before the pilot](#bb-qa-006) | P0 | blocked | pilot | M | [#60](https://github.com/castlemilk/brainbuilder/issues/60) |
| [BB-QA-007 — Run existing browser flows and platform export checks in CI](#bb-qa-007) | P0 | ready | foundation | M | [#11](https://github.com/castlemilk/brainbuilder/issues/11) |
| [BB-QA-008 — Create an evidence-based pilot readiness and rollback gate](#bb-qa-008) | P1 | blocked | pilot | M | [#63](https://github.com/castlemilk/brainbuilder/issues/63) |

## BB QA 001

**Prove completion and learning-evidence invariants across both clients**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Learning correctness assurance

**Canonical issue:** [#45 — \[P0\]\[BB-QA-001\] Prove completion and learning-evidence invariants across both clients](https://github.com/castlemilk/brainbuilder/issues/45)

**Problem**

Existing tests exercise completion but both clients still contain the final-lesson shortcut. Cross-client invariants must protect progress semantics.

**Scope**

- Create shared scenarios for required-lesson sets, ordering, repeat actions and legacy recovery.
- Verify exposure/private/assisted/checked/delayed-check projection invariants.
- Exercise public client actions and API outcomes rather than only helper snapshots.

**Acceptance criteria**

- [ ] Final-first, reverse-order, duplicate and unknown-lesson cases produce the same truthful counts on web/native.
- [ ] Listening, revealing answers and private self-report cannot create unaided checked success or mastery.
- [ ] Equivalent histories produce equivalent visible totals, including zero/unknown-history cases.
- [ ] Failures identify event history, course version and displayed values so inflated progress is reproducible.

**Task dependencies**

- [BB-ENG-001](https://github.com/castlemilk/brainbuilder/issues/5) — Make lesson and course completion truthful on web and native
- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-008](https://github.com/castlemilk/brainbuilder/issues/36) — Render real progress and explicit empty, cached and error states

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.test.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.test.tsx)
- [apps/web/src/App.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx)
- [packages/learning-model/src/index.test.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.test.ts)
- [backend/internal/catalog/catalog_test.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog_test.go)

**Validation**

Run invariants at model/API level and highest-risk public flows in real browser/native runtimes; retain regression evidence.

**Risks and limits**

Do not encode the existing shortcut as expected behavior. Scores and course completion are different dimensions.

## BB QA 002

**Gate contract generation and compatibility in CI**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** API and regression assurance

**Canonical issue:** [#28 — \[P0\]\[BB-QA-002\] Gate contract generation and compatibility in CI](https://github.com/castlemilk/brainbuilder/issues/28)

**Problem**

CI does not regenerate contract artifacts; manual JSON casts can conceal Go/web/native drift until runtime.

**Scope**

- Add clean regeneration, lint and breaking-change checks with a defined comparison baseline.
- Exercise both client adapters against the Go service with default/unknown values and typed errors.
- Separate schema compatibility guarantees from learning-semantic versioning.

**Acceptance criteria**

- [ ] CI fails when proto changes leave stale generated output and passes after deterministic regeneration.
- [ ] Removed/reused fields or incompatible RPCs fail the chosen gate with useful diagnostics.
- [ ] Web/native adapters consume shared success/error fixtures correctly from a running Go service.
- [ ] Artifacts record generator versions and baseline; no result relies only on a response type assertion.

**Task dependencies**

- [BB-ENG-003](https://github.com/castlemilk/brainbuilder/issues/6) — Make Go Connect and TypeScript contracts reproducibly generated

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [.github/workflows/application-ci.yml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.github/workflows/application-ci.yml)
- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)
- [apps/web/src/lib/api.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/lib/api.ts)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)

**Validation**

Exercise positive and deliberate-failure fixture changes, then remove deliberate failures and verify a clean gate.

**Risks and limits**

Schema compatibility cannot prove a scoring change preserves historical meaning; content/rubric assurance remains separate.

## BB QA 003

**Exercise restart, offline-sync and cross-device fault recovery**

**Priority:** P0 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Offline and durability assurance

**Canonical issue:** [#46 — \[P0\]\[BB-QA-003\] Exercise restart, offline-sync and cross-device fault recovery](https://github.com/castlemilk/brainbuilder/issues/46)

**Problem**

The on-the-go promise needs interruption/recovery evidence beyond a saved UI; the baseline lacks durable native/backend history.

**Scope**

- Cover force-close, failed writes, offline events, lost acknowledgements, reordered batches and expired identity.
- Use two independent clients against a disposable real store.
- Check migrations, guest/account isolation and clock/content-version conflicts.

**Acceptance criteria**

- [ ] After each fault, accepted attempts/checkpoints reconcile across outbox, server and UI without unexplained loss or duplication.
- [ ] Replaying acknowledged batches has no effect and server-commit/ack-loss recovers after restart.
- [ ] Account switching/guest attachment cannot expose or merge another learner's records.
- [ ] Unresolved conflicts are visible/actionable and retries stay within documented bounds.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary
- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend
- [BB-ENG-007](https://github.com/castlemilk/brainbuilder/issues/35) — Synchronize offline learning events idempotently across devices

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [apps/web/src/App.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx)
- [backend/internal/catalog/catalog.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog.go)
- [backend/internal/httpapi/handler.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/httpapi/handler.go)

**Validation**

Automate deterministic faults and reproduce force-close/airplane-mode cases on devices with event-count/checkpoint evidence.

**Risks and limits**

Mocks can pass despite filesystem or transaction failures; test the selected store and actual native lifecycle.

## BB QA 004

**Verify audio and offline packs on physical iOS and Android devices**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Native media assurance

**Canonical issue:** [#58 — \[P1\]\[BB-QA-004\] Verify audio and offline packs on physical iOS and Android devices](https://github.com/castlemilk/brainbuilder/issues/58)

**Problem**

Component and Expo web tests cannot establish audible playback, background operation or offline integrity on devices.

**Scope**

- Define supported device/OS/build/content matrix.
- Test playback/rate/seek, transcripts, lock screen, interruptions, headphones and restoration.
- Exercise offline cold-start, corruption, partial downloads, storage pressure and pack removal.

**Acceptance criteria**

- [ ] At least one supported physical iOS and one supported physical Android device complete the documented matrix with evidence.
- [ ] Audible content, position and transcript version agree; playback failure never becomes successful exposure.
- [ ] A verified ready pack works in airplane mode after process termination while corrupt/missing assets report failure/partial availability.
- [ ] Release evidence separates tested support, known limits and untested combinations; Expo web is never substituted for device results.

**Task dependencies**

- [BB-ENG-010](https://github.com/castlemilk/brainbuilder/issues/37) — Replace simulated audio with real playback and matching transcripts
- [BB-ENG-011](https://github.com/castlemilk/brainbuilder/issues/52) — Support native background audio, interruptions and lock-screen controls
- [BB-ENG-012](https://github.com/castlemilk/brainbuilder/issues/53) — Build resumable offline packs with verified download integrity
- [BB-ENG-016](https://github.com/castlemilk/brainbuilder/issues/16) — Discover and document the actual pilot build and release path

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)
- [apps/mobile/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/playwright.config.ts)
- [apps/mobile/.maestro/ios-learning-program.yaml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/.maestro/ios-learning-program.yaml)
- [apps/mobile/src/MobileApp.test.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.test.tsx)

**Validation**

Use actual native builds with intended audio configuration; retain concise recordings, versions and failure logs.

**Risks and limits**

Device access and native profiles may block the gate. Report blocked coverage rather than infer support from simulators.

## BB QA 005

**Validate accessible microlearning and recovery across form factors**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Experience quality assurance

**Canonical issue:** [#62 — \[P1\]\[BB-QA-005\] Validate accessible microlearning and recovery across form factors](https://github.com/castlemilk/brainbuilder/issues/62)

**Problem**

Short sessions still require usable focus, readable text, transcript alternatives and recoverable errors; redesigned flows introduce new accessibility risks.

**Scope**

- Audit Today, lessons, recall, feedback, review, Saved/offline and Progress on phone/tablet/desktop.
- Exercise keyboard, VoiceOver/TalkBack, enlarged text, reduced motion and transcripts.
- Check loading/empty/error/retry, mode changes and resume focus against the interaction criteria.
- Use the design review in [BB-DES-005](https://github.com/castlemilk/brainbuilder/issues/61) as input and retain reproducible keyboard, assistive-technology and recovery evidence for the pilot gate.

**Acceptance criteria**

- [ ] A learner can start, pause, resume, answer and recover from errors with keyboard/supported screen reader without missing or trapped focus.
- [ ] Supported enlarged-text/viewport combinations preserve readable content and reachable actions without destructive overlap.
- [ ] Audio has usable transcripts and status/assessment feedback is announced meaningfully without color-only cues.
- [ ] The audit records affected builds/screens, resolved defects and explicitly accepted residual issues against chosen criteria.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-008](https://github.com/castlemilk/brainbuilder/issues/36) — Render real progress and explicit empty, cached and error states
- [BB-ENG-010](https://github.com/castlemilk/brainbuilder/issues/37) — Replace simulated audio with real playback and matching transcripts
- [BB-ENG-013](https://github.com/castlemilk/brainbuilder/issues/38) — Implement a bounded review queue and resumable micro-session planner
- [BB-DES-003](https://github.com/castlemilk/brainbuilder/issues/51) — Provide usable alternatives to diagrams, motion and drag-only labs
- [BB-DES-004](https://github.com/castlemilk/brainbuilder/issues/4) — Define the accessibility acceptance and device review matrix
- [BB-DES-005](https://github.com/castlemilk/brainbuilder/issues/61) — Review implemented core screens for readability, access and state completeness

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [apps/web/src/App.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx)
- [apps/mobile/src/MobileApp.test.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.test.tsx)
- [apps/web/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/playwright.config.ts)

**Validation**

Combine automated browser checks with manual keyboard and real VoiceOver/TalkBack sessions; capture concise issue evidence.

**Risks and limits**

Automated accessibility passes do not establish a usable screen-reader flow. Assess both actual platforms.

## BB QA 006

**Audit content, feedback and delayed-check measurement before the pilot**

**Priority:** P0 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Learning correctness assurance

**Canonical issue:** [#60 — \[P0\]\[BB-QA-006\] Audit content, feedback and delayed-check measurement before the pilot](https://github.com/castlemilk/brainbuilder/issues/60)

**Problem**

A reviewed schema alone does not establish sound explanations, fair scoring or accurate delayed-check labels.

**Scope**

- Build a reviewed assessment set covering correct, partial, incorrect, ambiguous and assisted responses.
- Check source support, feedback and version linkage; record disagreement/correction decisions.
- Audit elapsed time, intervening exposure, assistance, denominators and missingness in learning outcomes.

**Acceptance criteria**

- [ ] Every pilot check has reviewed expected outcomes/feedback; ambiguity stays unscored or follows an explicit rule.
- [ ] Sampled attempts can be reconstructed from exact prompt/content/rubric versions and assistance history.
- [ ] Delayed-check reports disclose elapsed time/intervening review and exclude private self-report from checked-success counts.
- [ ] Material content/scoring defects block affected activities until corrected and re-reviewed.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests
- [BB-ENG-013](https://github.com/castlemilk/brainbuilder/issues/38) — Implement a bounded review queue and resumable micro-session planner
- [BB-RES-006](https://github.com/castlemilk/brainbuilder/issues/14) — Prepare the four-week pilot protocol, comparison and grading audit
- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-LRN-006](https://github.com/castlemilk/brainbuilder/issues/44) — Calibrate pilot answer rubrics and explanatory feedback
- [BB-LRN-007](https://github.com/castlemilk/brainbuilder/issues/57) — Author fresh application scenarios with explicit reasoning criteria
- [BB-LRN-005](https://github.com/castlemilk/brainbuilder/issues/56) — Deliver recall-before-reveal with separate private and typed practice

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [backend/internal/catalog/catalog.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog.go)

**Validation**

Run the reviewed response set through actual scoring, audit representative histories and verify corrections preserve historical outcomes. Run calibration cases through the implemented typed-response assessment path and inspect persisted assistance and outcome records.

**Risks and limits**

Future free-text grading requires separate human comparison/error analysis. Fixed-choice behavior is not validated generative grading.

## BB QA 007

**Run existing browser flows and platform export checks in CI**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** API and regression assurance

**Canonical issue:** [#11 — \[P0\]\[BB-QA-007\] Run existing browser flows and platform export checks in CI](https://github.com/castlemilk/brainbuilder/issues/11)

**Problem**

CI runs unit/type/web-build/Go checks but omits existing Playwright E2E and native exports, leaving runtime gaps.

**Scope**

- Install/run actual browser tests using the existing web configuration that starts Go.
- Run Expo web E2E separately and validate iOS/Android exports as build checks.
- Retain failure traces/screenshots/logs and separate browser, Expo web, export and device results.

**Acceptance criteria**

- [ ] CI executes web Playwright against the actual Go service, including home load and a checked response, and captures failure traces.
- [ ] Expo web phone/tablet flows execute in a real browser with runtime/console failures surfaced.
- [ ] iOS/Android export commands produce inspectable artifacts or explicit blocking failures; exports are not labeled device passes.
- [ ] Summaries identify test classes/tool versions and an intentional runtime regression fails the relevant gate.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [.github/workflows/application-ci.yml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.github/workflows/application-ci.yml)
- [apps/web/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/playwright.config.ts)
- [apps/mobile/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/playwright.config.ts)
- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)
- [package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/package.json)

**Validation**

Run the expanded clean-checkout workflow, inspect real artifacts and verify one temporary runtime failure is detected before removing it.

**Risks and limits**

Report runner/toolchain constraints. Browser viewport emulation does not validate mobile OS lifecycle.

## BB QA 008

**Create an evidence-based pilot readiness and rollback gate**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Pilot delivery assurance

**Canonical issue:** [#63 — \[P1\]\[BB-QA-008\] Create an evidence-based pilot readiness and rollback gate](https://github.com/castlemilk/brainbuilder/issues/63)

**Problem**

Reliable pilot research requires known build/content versions, durable history, media behavior and measurements; no release environment was verified.

**Scope**

- Assemble versioned readiness evidence for build, content, migrations, telemetry and completed QA.
- Rehearse first use, interruption, offline work, sync and later checked response.
- Record limits, stop conditions, support ownership and reversible pilot rollback using the discovered delivery path.
- Link [BB-ENG-017](https://github.com/castlemilk/brainbuilder/issues/42) device permission, scheduling and cancellation evidence in the readiness record.

**Acceptance criteria**

- [ ] The record names exact application build/commit, content/rubric versions, supported devices and observed evidence.
- [ ] No blocker can fabricate progress, lose accepted attempts, expose another learner's history or falsely claim offline/audio availability.
- [ ] Pilot metrics reconcile to canonical events for a known trace, with missing/unconsented data handled explicitly.
- [ ] A disable/rollback/support rehearsal preserves history; unverified hosting/signing remains a stated blocker.

**Task dependencies**

- [BB-ENG-014](https://github.com/castlemilk/brainbuilder/issues/54) — Instrument the pilot with minimal, consent-aware learning telemetry
- [BB-ENG-016](https://github.com/castlemilk/brainbuilder/issues/16) — Discover and document the actual pilot build and release path
- [BB-QA-001](https://github.com/castlemilk/brainbuilder/issues/45) — Prove completion and learning-evidence invariants across both clients
- [BB-QA-002](https://github.com/castlemilk/brainbuilder/issues/28) — Gate contract generation and compatibility in CI
- [BB-QA-003](https://github.com/castlemilk/brainbuilder/issues/46) — Exercise restart, offline-sync and cross-device fault recovery
- [BB-QA-004](https://github.com/castlemilk/brainbuilder/issues/58) — Verify audio and offline packs on physical iOS and Android devices
- [BB-QA-005](https://github.com/castlemilk/brainbuilder/issues/62) — Validate accessible microlearning and recovery across form factors
- [BB-QA-006](https://github.com/castlemilk/brainbuilder/issues/60) — Audit content, feedback and delayed-check measurement before the pilot
- [BB-QA-007](https://github.com/castlemilk/brainbuilder/issues/11) — Run existing browser flows and platform export checks in CI

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [.github/workflows/application-ci.yml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.github/workflows/application-ci.yml)
- [backend/cmd/server/main.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/cmd/server/main.go)
- [apps/mobile/.maestro/ios-learning-program.yaml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/.maestro/ios-learning-program.yaml)
- [apps/web/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/playwright.config.ts)

**Validation**

Run a bounded rehearsal on the intended pilot distribution path, reconcile its evidence and review unresolved blockers before recruitment.

**Risks and limits**

This verifies readiness, not production deployment or permission to send recruitment messages. A checklist cannot replace missing runtime evidence.
