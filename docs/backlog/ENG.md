# ENG backlog

Engineering and platform delivery. **17 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

2 ready; 12 blocked; 2 discovery; 1 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-ENG-001 — Make lesson and course completion truthful on web and native](#bb-eng-001) | P0 | ready | foundation | S | [#5](https://github.com/castlemilk/brainbuilder/issues/5) |
| [BB-ENG-002 — Encode learning evidence as shared versioned event contracts](#bb-eng-002) | P0 | blocked | foundation | M | [#25](https://github.com/castlemilk/brainbuilder/issues/25) |
| [BB-ENG-003 — Make Go Connect and TypeScript contracts reproducibly generated](#bb-eng-003) | P0 | ready | foundation | M | [#6](https://github.com/castlemilk/brainbuilder/issues/6) |
| [BB-ENG-004 — Persist sessions, checkpoints and saved learning state](#bb-eng-004) | P0 | blocked | foundation | L | [#31](https://github.com/castlemilk/brainbuilder/issues/31) |
| [BB-ENG-005 — Establish a pilot learner identity and authorization boundary](#bb-eng-005) | P0 | discovery | foundation | L | [#7](https://github.com/castlemilk/brainbuilder/issues/7) |
| [BB-ENG-006 — Store learning events and projections durably in the Go backend](#bb-eng-006) | P0 | blocked | foundation | L | [#32](https://github.com/castlemilk/brainbuilder/issues/32) |
| [BB-ENG-007 — Synchronize offline learning events idempotently across devices](#bb-eng-007) | P0 | blocked | pilot | L | [#35](https://github.com/castlemilk/brainbuilder/issues/35) |
| [BB-ENG-008 — Render real progress and explicit empty, cached and error states](#bb-eng-008) | P0 | blocked | foundation | M | [#36](https://github.com/castlemilk/brainbuilder/issues/36) |
| [BB-ENG-009 — Version content and validate publishable courseware manifests](#bb-eng-009) | P0 | blocked | foundation | M | [#26](https://github.com/castlemilk/brainbuilder/issues/26) |
| [BB-ENG-010 — Replace simulated audio with real playback and matching transcripts](#bb-eng-010) | P0 | blocked | pilot | L | [#37](https://github.com/castlemilk/brainbuilder/issues/37) |
| [BB-ENG-011 — Support native background audio, interruptions and lock-screen controls](#bb-eng-011) | P1 | blocked | pilot | L | [#52](https://github.com/castlemilk/brainbuilder/issues/52) |
| [BB-ENG-012 — Build resumable offline packs with verified download integrity](#bb-eng-012) | P1 | blocked | pilot | L | [#53](https://github.com/castlemilk/brainbuilder/issues/53) |
| [BB-ENG-013 — Implement a bounded review queue and resumable micro-session planner](#bb-eng-013) | P0 | blocked | foundation | L | [#38](https://github.com/castlemilk/brainbuilder/issues/38) |
| [BB-ENG-014 — Instrument the pilot with minimal, consent-aware learning telemetry](#bb-eng-014) | P1 | blocked | pilot | M | [#54](https://github.com/castlemilk/brainbuilder/issues/54) |
| [BB-ENG-015 — Design source import after the curated pilot demonstrates demand](#bb-eng-015) | P2 | later | expansion | L | [#67](https://github.com/castlemilk/brainbuilder/issues/67) |
| [BB-ENG-016 — Discover and document the actual pilot build and release path](#bb-eng-016) | P1 | discovery | foundation | M | [#16](https://github.com/castlemilk/brainbuilder/issues/16) |
| [BB-ENG-017 — Persist voluntary reminder preferences and schedule bounded notifications](#bb-eng-017) | P1 | blocked | pilot | M | [#42](https://github.com/castlemilk/brainbuilder/issues/42) |

## BB ENG 001

**Make lesson and course completion truthful on web and native**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Trustworthy learning state

**Canonical issue:** [#5 — \[P0\]\[BB-ENG-001\] Make lesson and course completion truthful on web and native](https://github.com/castlemilk/brainbuilder/issues/5)

**Problem**

Both completeCourseLesson implementations mark every lesson complete when the final lesson is selected. Web also awards a course bonus from that position check.

**Scope**

- Complete only the requested valid lesson.
- Derive course completion from the required lesson set for the enrolled course version.
- Make repeated taps idempotent and define treatment of previously inflated local enrollments.

**Acceptance criteria**

- [ ] Completing the final lesson first yields exactly one completed lesson and an active course on both clients.
- [ ] Completing all required lessons in any order completes the course once; repeats do not duplicate rewards.
- [ ] Unknown or obsolete lesson IDs cannot satisfy the current required set.
- [ ] Legacy all-complete records without evidence follow a documented migration or uncertain-history state; no attempts are fabricated.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx#L170-L182 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L170-L182)
- [apps/web/src/App.tsx#L333-L365 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L333-L365)
- [apps/mobile/src/MobileApp.test.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.test.tsx)

**Validation**

Reproduce final-first, arbitrary order, duplicate taps, unknown lesson and legacy-state cases in focused web/native regressions and inspect visible runtime counts.

**Risks and limits**

Repair may expose inflated legacy progress. Completion must remain separate from checked recall or mastery.

## BB ENG 002

**Encode learning evidence as shared versioned event contracts**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Trustworthy learning state

**Canonical issue:** [#25 — \[P0\]\[BB-ENG-002\] Encode learning evidence as shared versioned event contracts](https://github.com/castlemilk/brainbuilder/issues/25)

**Problem**

The shared model has quiz results and aggregate XP/streaks but no concept-level attempt history, assistance record or delayed-check context.

**Scope**

- Implement the product evidence semantics agreed in [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) as technical types, API fields and replay fixtures; do not redefine the educational meaning.
- Specify goal, concept, activity, session, checkpoint, exposure, practice and checked-attempt records.
- Add stable event/actor/device/session IDs, content/rubric versions, schema version, client time and server receipt time.
- Represent private self-report, assistance, pending assessment and checked results explicitly; minimize stored raw answers.

**Acceptance criteria**

- [ ] Example traces distinguish listening, private recall, hinted practice, unaided checked answers and later checked answers.
- [ ] Scored attempts identify content/rubric versions, elapsed interval, assistance and intervening reviews, or explicitly record unknown context.
- [ ] Replay rules cover duplicates, unknown versions, invalid transitions and uncertain device time.
- [ ] Shared fixtures express identical IDs and semantics across TypeScript and the API design.

**Task dependencies**

- [BB-LRN-004](https://github.com/castlemilk/brainbuilder/issues/10) — Define honest exposure, self-report, checked and delayed-check semantics

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)

**Validation**

Review event traces against the wireframe rules and exercise serialization/replay examples with missing historical context.

**Risks and limits**

Excessive capture creates sensitive data without research value. A later answer is not automatically unaided delayed-retention evidence.

## BB ENG 003

**Make Go Connect and TypeScript contracts reproducibly generated**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** API and durable platform

**Canonical issue:** [#6 — \[P0\]\[BB-ENG-003\] Make Go Connect and TypeScript contracts reproducibly generated](https://github.com/castlemilk/brainbuilder/issues/6)

**Problem**

The tree contains a proto and generated Go files but no Buf configuration/generation script. Apps hand-build JSON RPC requests and cast responses.

**Scope**

- Add pinned Buf/protobuf/Connect generation configuration and commands compatible with the current workspaces.
- Generate or centrally adapt typed clients for both apps and retain an explicit demo adapter.
- Document additive evolution, reserved fields, enum defaults and typed errors.

**Acceptance criteria**

- [ ] A clean checkout regenerates committed bindings without a diff using one documented command.
- [ ] Both apps share a typed contract adapter and handle malformed/unavailable responses without a blind LearningHome cast.
- [ ] Lint and compatibility checks pass an additive fixture and reject a deliberately breaking fixture.
- [ ] Existing RPC behavior stays compatible and local/demo operation is selected explicitly.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)
- [backend/gen/learning/v1/learning.pb.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.pb.go)
- [backend/gen/learning/v1/learningv1connect/learning.connect.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learningv1connect/learning.connect.go)
- [apps/web/src/lib/api.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/lib/api.ts)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/package.json)

**Validation**

Regenerate twice from clean inputs and exercise clients against the real Go handler with success and typed-error cases.

**Risks and limits**

Tool selection must fit pinned Go, Expo and web versions. Transport compatibility does not prove learning-semantic compatibility.

## BB ENG 004

**Persist sessions, checkpoints and saved learning state**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** L

**Epic:** API and durable platform

**Canonical issue:** [#31 — \[P0\]\[BB-ENG-004\] Persist sessions, checkpoints and saved learning state](https://github.com/castlemilk/brainbuilder/issues/31)

**Problem**

Native session, enrollment, answers and saved items live in React state. Web persists selected session/enrollment records but lacks a complete interruption-safe checkpoint.

**Scope**

- Add versioned native/web persistence adapters with guest/account partitions.
- Persist committed activity boundaries, audio position, mode, assistance, pending attempts and saved items.
- Handle interrupted writes, migrations and visible save failures.

**Acceptance criteria**

- [ ] Force-close/reopen restores the latest committed activity, mode and saved items without creating a learning success.
- [ ] Read/listen switching and source/help overlays preserve the same activity and checkpoint.
- [ ] Old schemas migrate; corrupt/unsupported records show recoverable states instead of fabricated progress.
- [ ] Storage failure visibly reports unsaved work and account changes cannot expose another learner's local data.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx#L69-L84 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L69-L84)
- [apps/web/src/App.tsx#L177-L235 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L177-L235)
- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)

**Validation**

Inject storage failures and kill the app during writes on web/native; inspect restored IDs, checkpoints and migrations.

**Risks and limits**

Persist domain records rather than component internals. Define content-version mismatch behavior for resume.

## BB ENG 005

**Establish a pilot learner identity and authorization boundary**

**Priority:** P0 · **Status:** discovery · **Phase:** foundation · **Effort:** L

**Epic:** API and durable platform

**Canonical issue:** [#7 — \[P0\]\[BB-ENG-005\] Establish a pilot learner identity and authorization boundary](https://github.com/castlemilk/brainbuilder/issues/7)

**Problem**

Onboarding records name/email locally and both clients fetch alex. The inspected handler trusts user_id without an authenticated learner boundary.

**Scope**

- Inventory existing identity configuration before selecting an integration; record guest/account behavior.
- Implement server-verified identity for private operations while keeping local guest mode explicit.
- Define expiry, logout, cache isolation, confirmed guest attachment and authenticated origin configuration.

**Acceptance criteria**

- [ ] A decision record identifies the available identity system, environments and credential handling without assuming a provider.
- [ ] Tampering with user_id cannot read/write another learner's private records; unauthenticated private calls return a typed error.
- [ ] Expired sessions preserve unsynced work and reauthentication cannot attach it to a different account.
- [ ] Guest attachment targets the verified account and account switching isolates cached private views.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx#L99-L157 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L99-L157)
- [apps/web/src/App.tsx#L203-L255 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L203-L255)
- [backend/internal/httpapi/handler.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/httpapi/handler.go)
- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)

**Validation**

Run two-account and guest scenarios against the real handler, including ID tampering, expiration, logout and rejected origins.

**Risks and limits**

No identity provider or deployed service was verified. Name/email entry is not authentication; current CORS reflects origins.

## BB ENG 006

**Store learning events and projections durably in the Go backend**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** L

**Epic:** API and durable platform

**Canonical issue:** [#32 — \[P0\]\[BB-ENG-006\] Store learning events and projections durably in the Go backend](https://github.com/castlemilk/brainbuilder/issues/32)

**Problem**

The Go catalog returns seeded data and scores fixed quizzes without durable event, enrollment, checkpoint or review-plan storage.

**Scope**

- Choose persistence from confirmed project constraints and add schemas/migrations for learner-owned records.
- Add authenticated read/write RPCs for events, checkpoints, enrollment and sync cursors.
- Persist event uniqueness and projection changes transactionally; document recovery.

**Acceptance criteria**

- [ ] Accepted events and visible progress survive a server restart and are readable from a second authenticated client.
- [ ] Reusing an event ID cannot create another attempt/reward; different payloads under the same ID return a conflict.
- [ ] Interrupted transactions cannot leave acknowledged-but-missing events or partial projections.
- [ ] A schema upgrade and recovery rehearsal preserve representative histories in a disposable real store.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-003](https://github.com/castlemilk/brainbuilder/issues/6) — Make Go Connect and TypeScript contracts reproducibly generated
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [backend/internal/catalog/catalog.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog.go)
- [backend/internal/httpapi/handler.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/httpapi/handler.go)
- [backend/cmd/server/main.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/cmd/server/main.go)
- [backend/go.mod at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/go.mod)

**Validation**

Use real-store integration tests with server restarts, transaction failures and a migration/recovery rehearsal.

**Risks and limits**

No hosting or database choice has been verified. In-memory tests cannot establish durable behavior.

## BB ENG 007

**Synchronize offline learning events idempotently across devices**

**Priority:** P0 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Offline learning

**Canonical issue:** [#35 — \[P0\]\[BB-ENG-007\] Synchronize offline learning events idempotently across devices](https://github.com/castlemilk/brainbuilder/issues/35)

**Problem**

No durable outbox or learner event-sync API exists. A fetch error currently labels the app offline while seeded local data remains.

**Scope**

- Add a persistent outbox, stable event IDs, bounded retry/backoff and per-event acknowledgements.
- Specify merges for attempts, saved items, preferences, checkpoints and content versions.
- Expose pending/syncing/synced/conflict states and isolate guest/account queues.

**Acceptance criteria**

- [ ] An offline attempt survives process death and reaches the server once even when commit succeeds but acknowledgement is lost.
- [ ] Distinct attempts from two devices are retained; replaying batches changes no totals.
- [ ] Out-of-order events, clock skew and stale content follow documented rules or visible conflict handling.
- [ ] Expired identity, throttling and persistent errors preserve queued work, bound retries and show an actionable status.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary
- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx#L92-L139 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L92-L139)
- [apps/web/src/lib/api.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/lib/api.ts)
- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)
- [backend/internal/catalog/catalog.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog.go)

**Validation**

Replay duplicate, reordered and lost-ack batches plus two-device reconnect/expiry scenarios; reconcile client/server event counts.

**Risks and limits**

Exactly-once effects need server uniqueness. Last-write-wins is unsuitable for distinct attempts or untrusted device time.

## BB ENG 008

**Render real progress and explicit empty, cached and error states**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Trustworthy learning state

**Canonical issue:** [#36 — \[P0\]\[BB-ENG-008\] Render real progress and explicit empty, cached and error states](https://github.com/castlemilk/brainbuilder/issues/36)

**Problem**

Both apps begin with populated Alex history, XP, streaks and progress; failed fetches can leave fixtures looking like real learner history.

**Scope**

- Separate demo, first-use, authenticated and verified-cache view models.
- Derive progress from recorded events with denominators, content versions, assistance and check dates.
- Implement loading, empty, no-due-review, offline with/without cache, retry and unavailable-content states.

**Acceptance criteria**

- [ ] New learners see no invented lesson completions, checked answers, streaks or XP; demos are labeled.
- [ ] A failed first fetch shows an actionable empty/error state; offline return shows only the learner's cached history and sync status.
- [ ] Progress distinguishes exposure/private practice from checked and delayed checked responses, with denominators and dates.
- [ ] Unknown evidence remains unknown and retries/account changes never flash another learner's or seeded history.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [backend/internal/catalog/catalog.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/catalog/catalog.go)
- [apps/mobile/src/MobileApp.tsx#L69-L130 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L69-L130)
- [apps/web/src/App.tsx#L203-L255 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L203-L255)

**Validation**

Exercise first-use, no-history, no-cache, stale-cache, fetch failure and account-switch fixtures; reconcile every displayed count.

**Risks and limits**

Fixture history cannot become evidence. Listening and self-report must not imply mastery.

## BB ENG 009

**Version content and validate publishable courseware manifests**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** M

**Epic:** Content quality and provenance

**Canonical issue:** [#26 — \[P0\]\[BB-ENG-009\] Version content and validate publishable courseware manifests](https://github.com/castlemilk/brainbuilder/issues/26)

**Problem**

Courseware has rich activities and fixed-answer checks, but course/block types lack review lifecycle, immutable content versions and rubric provenance.

**Scope**

- Add concept mapping, content/source versions, provenance references, review state and rubric versions.
- Build and validate a candidate manifest from existing algorithms material; actual pilot curation and review are owned by [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) and [BB-QA-006](https://github.com/castlemilk/brainbuilder/issues/60).
- Define correction, withdrawal and supersession while preserving historical attempt references.

**Acceptance criteria**

- [ ] A candidate manifest references stable concept, source, content and rubric versions and exposes review state for every activity.
- [ ] Publish validation rejects unreviewed material, missing provenance and invalid references while allowing clearly marked drafts.
- [ ] Content/scoring changes create a new version and old attempts remain explainable under the original version.
- [ ] Withdrawal removes new-session availability and updates saved/downloaded status without rewriting past outcomes.

**Task dependencies**

- [BB-LRN-001](https://github.com/castlemilk/brainbuilder/issues/9) — Define stable concepts, outcomes and prerequisites for the existing material

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [packages/courseware/src/content/searching.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/content/searching.ts)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)

**Validation**

Validate the pilot manifest and exercise publish, correction, withdrawal and historical-version lookups with invalid fixtures.

**Risks and limits**

A reviewer field is not proof of accuracy; human content and scoring review is a separate acceptance gate.

## BB ENG 010

**Replace simulated audio with real playback and matching transcripts**

**Priority:** P0 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Mobile learning media

**Canonical issue:** [#37 — \[P0\]\[BB-ENG-010\] Replace simulated audio with real playback and matching transcripts](https://github.com/castlemilk/brainbuilder/issues/37)

**Problem**

Feed playback is a Boolean toggle with fixed progress width. Course audio blocks contain scripts and declared durations, not verified playable assets.

**Scope**

- Choose compatible web/native playback adapters and attach versioned audio assets to the pilot manifest.
- Implement actual loading, play/pause, seek, rate, media-clock position and failure states.
- Provide matching transcripts and same-activity read/listen handoff; record exposure independently of checked answers.

**Acceptance criteria**

- [ ] Playing a pilot lesson produces audible content on web/native and position/duration follows the real media clock.
- [ ] Transcript and audio versions match; mode switching preserves the activity/resume anchor without duplicate attempts.
- [ ] Unavailable or invalid audio offers retry or transcript access and never reports playing after failure.
- [ ] Playback completion records exposure only and cannot mark answers correct, finish unrelated lessons or improve checked-recall evidence.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx#L420-L472 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx#L420-L472)
- [apps/web/src/App.tsx#L2848-L2857 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L2848-L2857)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)

**Validation**

Listen to full assets on actual runtimes, compare UI/media clocks and force missing/invalid media; inspect resulting event history.

**Risks and limits**

Player compatibility and asset rights/hosting need verification. A script or animated bar does not establish playback.

## BB ENG 011

**Support native background audio, interruptions and lock-screen controls**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Mobile learning media

**Canonical issue:** [#52 — \[P1\]\[BB-ENG-011\] Support native background audio, interruptions and lock-screen controls](https://github.com/castlemilk/brainbuilder/issues/52)

**Problem**

Commute listening requires device lifecycle behavior beyond the current component toggle; no background player integration is present in the inspected native package.

**Scope**

- Configure selected player/build profiles for background listening and media controls.
- Handle background/foreground, calls, competing audio, headphones and Bluetooth changes.
- Persist/reconcile player checkpoints and distinguish OS interruption from learner pause.

**Acceptance criteria**

- [ ] Supported iOS/Android profiles preserve documented listening behavior while locked/backgrounded with working media controls.
- [ ] Interruptions pause or duck predictably; headphone removal does not unexpectedly start speaker playback.
- [ ] Returning to the app reconciles the actual position without duplicate exposure/completion events.
- [ ] Supported-platform claims link to device evidence and unsupported behavior has a clear fallback.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-010](https://github.com/castlemilk/brainbuilder/issues/37) — Replace simulated audio with real playback and matching transcripts
- [BB-ENG-016](https://github.com/castlemilk/brainbuilder/issues/16) — Discover and document the actual pilot build and release path

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)
- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [apps/mobile/app.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/app.json)
- [apps/mobile/.maestro/ios-learning-program.yaml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/.maestro/ios-learning-program.yaml)

**Validation**

Record physical-device lock/unlock, call, headphone and app-lifecycle scenarios on the supported OS matrix.

**Risks and limits**

Expo web exports and component tests cannot establish background behavior. Support depends on actual player/native configuration.

## BB ENG 012

**Build resumable offline packs with verified download integrity**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Offline learning

**Canonical issue:** [#53 — \[P1\]\[BB-ENG-012\] Build resumable offline packs with verified download integrity](https://github.com/castlemilk/brainbuilder/issues/53)

**Problem**

Saved bites are preferences rather than verified offline lessons; no complete audio/transcript/activity asset manifest exists.

**Scope**

- Define manifests with required assets, sizes, integrity values and content versions.
- Implement not-downloaded/downloading/ready/partial/failed/removed states with retry, cancel, resume and storage controls.
- Handle active playback/removal, withdrawn content and obsolete pack cleanup.

**Acceptance criteria**

- [ ] Ready requires successful local integrity/version checks for every required asset.
- [ ] A ready pack completes its supported loop in airplane mode after cold start; missing assets show an honest partial/failure state.
- [ ] Interrupted, corrupt and storage-full downloads recover without false readiness or unrelated pack loss.
- [ ] Users can inspect/remove stored packs while pending attempts and learning history remain safe.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests
- [BB-ENG-010](https://github.com/castlemilk/brainbuilder/issues/37) — Replace simulated audio with real playback and matching transcripts

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)
- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)

**Validation**

Download, corrupt, interrupt, resume, cold-start offline and remove real packs under constrained device storage.

**Risks and limits**

A saved flag is not an offline guarantee. Active playback and withdrawn versions need explicit consistency rules.

## BB ENG 013

**Implement a bounded review queue and resumable micro-session planner**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** L

**Epic:** Continuous learning loop

**Canonical issue:** [#38 — \[P0\]\[BB-ENG-013\] Implement a bounded review queue and resumable micro-session planner](https://github.com/castlemilk/brainbuilder/issues/38)

**Problem**

The model has static quests and path progress but no review due dates or concept evidence. Continual learning needs an explainable, bounded queue.

**Scope**

- Implement learning-design review rules as a versioned scheduler with an injected clock.
- Compose sessions from time budget, due work, prerequisites, available modes/assets and meaningful stopping points.
- Support pause, skip, return after absence and offline reconciliation.

**Acceptance criteria**

- [ ] Identical history/clock/rule versions produce the same queue with an explanation for each recommendation.
- [ ] Incorrect, assisted, private-practice and unaided checked events follow their separate specified scheduling rules.
- [ ] The queue respects workload caps and paused goals; return after absence does not require clearing unlimited overdue work.
- [ ] Timezone changes/offline merges neither duplicate due items nor turn self-report into retention evidence.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests
- [BB-LRN-002](https://github.com/castlemilk/brainbuilder/issues/27) — Specify coherent short-session variants and supported attention modes
- [BB-LRN-009](https://github.com/castlemilk/brainbuilder/issues/34) — Define a bounded review policy for short sessions and missed days

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [backend/gen/learning/v1/learning.proto at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/gen/learning/v1/learning.proto)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)

**Validation**

Replay short/long histories with controlled clocks, absences and offline merges; inspect real two-/five-/ten-minute planning flows.

**Risks and limits**

Session budgets are options to test. No retention-optimization claim is warranted before comparative evidence.

## BB ENG 014

**Instrument the pilot with minimal, consent-aware learning telemetry**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Pilot measurement

**Canonical issue:** [#54 — \[P1\]\[BB-ENG-014\] Instrument the pilot with minimal, consent-aware learning telemetry](https://github.com/castlemilk/brainbuilder/issues/54)

**Problem**

The inspected code lacks research-ready interruption/resume, media-use and checked-outcome measurement; clicks and seeded progress cannot answer whether learning works.

**Scope**

- Implement the pilot event dictionary with canonical IDs and versioned metric definitions.
- Measure start/checkpoint/resume, media failure, assistance, attempts, sync and exit while separating research from operational records.
- Enforce opt-out, retention and access decisions; omit raw answers/documents/names/emails from analytics by default.
- Record session_start_origin as self_initiated, notification or unknown, and distinguish resumed sessions from fresh starts.

**Acceptance criteria**

- [ ] Metric definitions specify numerator, denominator, window and missing-data treatment.
- [ ] Events distinguish exposure/private practice/checked outcomes and retries do not inflate counts.
- [ ] Opt-out prevents optional research collection while essential local learning works; retention/deletion behavior is demonstrated.
- [ ] Payload/log inspection finds no default raw-answer/document/name/email leakage and exposes unknown/unsynced data-quality counts.
- [ ] A real notification-to-session trace is marked notification; direct starts are self_initiated when observed, unresolved origins remain unknown, and a resume is distinct from a fresh session.

**Task dependencies**

- [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) — Encode learning evidence as shared versioned event contracts
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary
- [BB-ENG-007](https://github.com/castlemilk/brainbuilder/issues/35) — Synchronize offline learning events idempotently across devices
- [BB-RES-006](https://github.com/castlemilk/brainbuilder/issues/14) — Prepare the four-week pilot protocol, comparison and grading audit
- [BB-ENG-017](https://github.com/castlemilk/brainbuilder/issues/42) — Persist voluntary reminder preferences and schedule bounded notifications

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/mobile/src/MobileApp.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx)
- [apps/web/src/App.tsx at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [backend/internal/httpapi/handler.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/httpapi/handler.go)

**Validation**

Run a consented synthetic pilot trace and reconcile metrics to canonical events; repeat with opt-out, missing data and retries.

**Risks and limits**

Research telemetry must not become another authoritative history store. Interpret small samples with missingness and denominators.

## BB ENG 015

**Design source import after the curated pilot demonstrates demand**

**Priority:** P2 · **Status:** later · **Phase:** expansion · **Effort:** L

**Epic:** Source import expansion

**Canonical issue:** [#67 — \[P2\]\[BB-ENG-015\] Design source import after the curated pilot demonstrates demand](https://github.com/castlemilk/brainbuilder/issues/67)

**Problem**

The custom web flow builds a local learning surface from a draft; it does not establish verified extraction, provenance, assessment quality or an import service.

**Scope**

- After the demand gate, define intentional URL/file selection, supported inputs, bounded extraction and draft/review/publish states.
- Preserve references, extraction/source versions and correction/removal propagation.
- Reuse existing event/content/rubric contracts rather than a separate learning-history system.

**Acceptance criteria**

- [ ] A research decision names the import job, supported sources and why it outranks more curated content before implementation.
- [ ] Supported explicitly selected material imports with traceable references; failed/partial/unsupported extraction is reported honestly.
- [ ] Generated lessons/checks stay draft until the quality gate passes and source gaps are not presented as verified facts.
- [ ] Changed/removed sources update drafts/download manifests predictably while historic attempts retain original versions.

**Task dependencies**

- [BB-ENG-006](https://github.com/castlemilk/brainbuilder/issues/32) — Store learning events and projections durably in the Go backend
- [BB-ENG-009](https://github.com/castlemilk/brainbuilder/issues/26) — Version content and validate publishable courseware manifests
- [BB-LRN-010](https://github.com/castlemilk/brainbuilder/issues/66) — Define a source-supported authoring contract for selected-material lessons

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [apps/web/src/App.tsx#L298-L301 at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx#L298-L301)
- [packages/learning-model/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts)
- [packages/courseware/src/index.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts)

**Validation**

Trace fixture imports through supported, malformed, changed and removed cases; verify published claim/assessment provenance.

**Risks and limits**

Do not label the local builder a production importer. Private-source permissions, arbitrary URL access and collection limits require an explicit design.

## BB ENG 016

**Discover and document the actual pilot build and release path**

**Priority:** P1 · **Status:** discovery · **Phase:** foundation · **Effort:** M

**Epic:** Pilot delivery foundations

**Canonical issue:** [#16 — \[P1\]\[BB-ENG-016\] Discover and document the actual pilot build and release path](https://github.com/castlemilk/brainbuilder/issues/16)

**Problem**

The tree has local scripts and CI but no verified deployment workflow, staging service, native signing or distribution setup.

**Scope**

- Inventory existing environments, endpoints, configuration and native profiles using read-only evidence.
- Document run/build/configuration for web, Go, iOS and Android and identify missing gates.
- Define version stamping, health/readiness, rollback and support requirements without creating deployment services.

**Acceptance criteria**

- [ ] The runbook marks each environment/capability observed, missing or awaiting access and cites its configuration evidence.
- [ ] A clean-checkout command starts the available local web/backend flow and documents mobile API configuration without secrets.
- [ ] Proposed native profiles identify how background audio/offline behavior will be tested on supported devices.
- [ ] The release checklist states artifacts, migrations, readiness signals, rollback and blockers without claiming unobserved deployments.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [.github/workflows/application-ci.yml at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.github/workflows/application-ci.yml)
- [package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/package.json)
- [apps/mobile/package.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/package.json)
- [apps/mobile/app.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/app.json)
- [apps/web/playwright.config.ts at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/playwright.config.ts)
- [backend/cmd/server/main.go at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/cmd/server/main.go)

**Validation**

Execute available local run/build steps and retain exact versions/logs; mark inaccessible remote/signing checks unverified.

**Risks and limits**

No deployment file does not prove no external deployment exists. Discovery must not publish builds, create paid services or alter production.

## BB ENG 017

**Persist voluntary reminder preferences and schedule bounded notifications**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Continuity and learner control

**Canonical issue:** [#42 — \[P1\]\[BB-ENG-017\] Persist voluntary reminder preferences and schedule bounded notifications](https://github.com/castlemilk/brainbuilder/issues/42)

**Problem**

The return flow needs reliable reminder controls; a visible off switch or quiet-time setting must correspond to actual delivery behavior.

**Scope**

- Select the smallest supported reminder mechanism for the verified pilot build path and document platform limitations.
- Persist opt-in, frequency, timezone, quiet hours, pause and off preferences with clear account/device ownership.
- Schedule only bounded reminders for active goals, reconcile changed preferences and cancel stale pending notifications.

**Acceptance criteria**

- [ ] Declining permission or choosing off leaves learning fully usable and creates no active reminder schedule.
- [ ] Changing frequency, timezone or quiet hours updates future delivery without duplicate or stale reminders.
- [ ] Pausing a goal or turning reminders off cancels its pending notifications and persists after restart.
- [ ] Controlled-clock and device checks show the configured cap and quiet hours are respected; notification opens are distinguishable from self-initiated session starts.

**Task dependencies**

- [BB-ENG-004](https://github.com/castlemilk/brainbuilder/issues/31) — Persist sessions, checkpoints and saved learning state
- [BB-ENG-005](https://github.com/castlemilk/brainbuilder/issues/7) — Establish a pilot learner identity and authorization boundary
- [BB-ENG-016](https://github.com/castlemilk/brainbuilder/issues/16) — Discover and document the actual pilot build and release path
- [BB-LRN-009](https://github.com/castlemilk/brainbuilder/issues/34) — Define a bounded review policy for short sessions and missed days

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)
- [apps/mobile/app.json at abf70fa](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/app.json)

**Validation**

Exercise permission granted/denied, schedule changes, device restart, timezone travel, paused goals and cancellation on the selected native build. Record supported behavior and remaining platform limits.

**Risks and limits**

Notification delivery is platform-dependent. Reminders can inflate apparent return behavior, so the pilot must report prompted and self-initiated sessions separately.
