# Brainbuilder delivery guide

This guide connects the existing application to the proposed microlearning work. Use the [Brainbuilder Space](https://chatgpt.com/space/page_6aeec28f5a7c8191894cd9f4ad93f3d1) for shared planning, the [live roadmap](https://github.com/castlemilk/brainbuilder/issues/2) for issue navigation and the [backlog index](../backlog/README.md) for detailed task contracts.

## Baseline and scope

The code review baseline is [`abf70fa012356038ffa5a2c4092584d452724e5e`](https://github.com/castlemilk/brainbuilder/commit/abf70fa012356038ffa5a2c4092584d452724e5e). The 7 November 2026 planning snapshot contains **67 planned tasks: 19 ready, 41 blocked, 2 discovery and 5 later**. The documentation/research publication makes **no product code or behavior changes**.

The proposed positioning, learner segments, learning flow, session budgets and visual designs are draft hypotheses. Source observations are inputs to decisions; they do not establish representative demand, willingness to pay, product-market fit or learning efficacy. Read the [product review](Brainbuilder-Review-and-Microlearning-Plan.md), [behavior specification](Brainbuilder-Wireframe-Spec.md) and [wireframe gallery](wireframes/README.md) together. The specification carries the behavior detail that a concept image cannot express.

Current application code lives in [web](../../apps/web), [mobile](../../apps/mobile), [the Go backend](../../backend), [learning-model](../../packages/learning-model) and [courseware](../../packages/courseware). The [research workbench](../../research/brainbuilder-workbench/README.md) is a separate, runnable evidence tool. Its verification does not establish that the application works on native devices.

## Read task status as a working contract

| Status | How to use it |
| --- | --- |
| Ready | The planned task has no unmet declared prerequisite. Recheck current issue state and code before taking it. |
| Blocked | Record which prerequisite and evidence are missing. Preparation can proceed, but completion still depends on the stated contracts. |
| Discovery | Resolve a concrete unknown, such as existing identity or release configuration, and record the resulting decision and implementation boundary. |
| Later | Expansion work stays behind its stated demand or pilot gate. Keep new evidence linked to it. |

Priority and phase answer different questions. Priority orders attention; phase describes foundation, pilot or expansion. A pilot gate remains a gate even when its task is P1. Effort labels are planning estimates, and the initial counts are a dated snapshot.

Use stable `BB-TRACK-NNN` IDs in issues, branches, PRs and evidence. Check the task's latest issue alongside its [track page](../backlog/README.md). If a dependency or scope changes, update the issue and the versioned backlog together and recheck that the graph stays acyclic. A prerequisite is satisfied by its completed acceptance evidence, not simply by a linked PR.

## Begin with five bounded pieces of work

| Task | Why it is useful now | Evidence to leave |
| --- | --- | --- |
| [BB-ENG-001](../backlog/ENG.md#bb-eng-001) | The final-lesson shortcut can manufacture course completion on web and native. | Final-first, arbitrary-order and repeat-action regressions with truthful visible counts. |
| [BB-LRN-004](../backlog/LRN.md#bb-lrn-004) | The event model, progress UI and research need a shared meaning of learning evidence. | Worked examples distinguishing exposure, private practice, assistance, checked and delayed checked responses. |
| [BB-LRN-001](../backlog/LRN.md#bb-lrn-001) | Stable concepts and outcomes let the existing material support coherent short sessions. | A mapped concept/outcome/prerequisite inventory with gaps recorded. |
| [BB-RES-003](../backlog/RES.md#bb-res-003) | Discovery needs a consistent way to learn about actual behavior and workarounds. | A reviewable screening/interview/recruitment preparation pack, with unanswered questions explicit. |
| [BB-UX-001](../backlog/UX.md#bb-ux-001) | The proposed navigation needs a clear implementation home. | Working Today, Paths, Saved and Progress entry points with route/tab behavior checked. |

These tasks can progress in parallel with clear ownership. Interview-pack preparation does not mean interviews or participant contact have occurred.

## Working sequence

### 1. Repair truthfulness and define the learning contract

Start with the completion repair, evidence semantics and concept map. Establish reproducible API generation and baseline runtime checks alongside this work. The relevant tracks are [engineering](../backlog/ENG.md), [learning](../backlog/LRN.md) and [QA](../backlog/QA.md).

Keep lesson completion, media exposure, private self-report, assisted practice and checked responses distinct. Historical seeded values are not evidence to migrate into real learner achievements. Record uncertainty where an old state cannot be reconstructed.

### 2. Discover the audience and make a reviewed path concrete

Use the [research](../backlog/RES.md) and [go-to-market](../backlog/GTM.md) tasks to prepare discovery, conduct the scoped research and select one audience and learning job. Curate one path from existing algorithms material using its outcomes and supported session variants.

Content schema/versioning can proceed from the concept inventory. Actual pilot curation and rubric calibration must use the selected learning job. Keep market observations, competitor claims, learning research and founder hypotheses separate in the [workbench](../../research/brainbuilder-workbench/README.md).

### 3. Build the durable learning loop

Resolve the actual identity and environment configuration, then implement versioned state, learner-owned backend persistence and idempotent offline synchronization. Build the finite lesson shell, typed/private recall, interruption recovery, honest progress and bounded review queue against those contracts.

The [UX](../backlog/UX.md), [learning](../backlog/LRN.md), [design](../backlog/DES.md) and [engineering](../backlog/ENG.md) tasks describe a shared outcome. UI completion should include the actual state transition and error behavior it promises. Typed assessment must use its reviewed rubric/version and retain an uncertain route when a judgment is unsupported.

### 4. Establish usable audio, offline packs and voluntary reminders

Replace simulated playback with real media and matching transcripts, then verify background and lock-screen behavior on native builds. A pack becomes ready only after its required local assets pass integrity/version checks.

Reminder preferences must control actual scheduling and cancellation. The telemetry contract must distinguish notification-triggered, self-initiated and unknown session starts, and preserve the difference between resuming and starting again. Keep OS/build limitations in the release evidence.

### 5. Rehearse the implemented journey before running the pilot

Use [BB-QA-008](../backlog/QA.md#bb-qa-008) as the integrated readiness record. Its evidence must cover the actual entry, Today, lesson, recall, pause/resume, return, reminder, path and progress flows, together with content/scoring, privacy, sync and native-media checks.

Freeze the study protocol before observing pilot outcomes. Run the planned pilot only after its dependencies are met, and report eligibility/enrollment, missing follow-up, outside study, assistance and grading disagreement with the outcome denominators. A small feasibility study supports bounded decisions, not general efficacy claims.

### 6. Let results determine expansion

Source import, extra acquisition channels and broader content remain behind their backlog gates. Keep the source-import expansion linked to demonstrated jobs and the reviewed content contract. New hypotheses can be added without representing them as implemented functionality or validated demand.

## Branch and PR workflow

1. Read the task, linked evidence, current issue state and applicable repository instructions. Compare current code with the review baseline before assuming a finding still applies.
2. Recheck prerequisites and existing ownership. Choose a branch scoped to one task or a small coherent dependency slice.
3. Implement the smallest complete outcome, including meaningful empty/error/recovery behavior. Record any scope or contract decision in the task and supporting documentation.
4. Run checks that address the change's actual risk and the task's acceptance criteria. Keep logs, fixtures, screenshots or device evidence concise and reproducible.
5. Open a PR linking the task ID and issue. Use a draft while known blockers remain. Follow the repository's configured review, checks and merge policy.
6. After integration, update the task with the resulting commit, validation evidence and remaining limitations. Refresh dependency readiness and the Space/roadmap summary when their state changes.

Example branch creation from the fetched main branch:

```bash
git fetch origin
git switch -c fix/bb-eng-001-truthful-completion origin/main
```

A useful PR description states the observed problem and impact, the behavior changed, acceptance evidence, and material limitations or follow-up tasks. Link screenshots to the exact build and identify the platform. Keep generated files traceable to their source command.

## What “done” needs to show

| Work type | Completion evidence |
| --- | --- |
| Product behavior | A reproducible user journey satisfies the task's observable criteria, including the relevant empty/error/recovery cases. |
| Learning data | The event history explains the displayed result; content/rubric versions, assistance and uncertainty remain inspectable. |
| Persistence and sync | Real-store/restart/fault evidence establishes durability and idempotent effects for the supported scenario. |
| Audio and offline | Actual playback and verified assets work on the supported build/device matrix; unsupported combinations are stated. |
| Reminder delivery | Opt-in/off, quiet hours, changes and cancellation agree with observed scheduling behavior; session origin remains measurable. |
| Content and assessment | Reviewed sources, outcomes, calibration examples, feedback and versions support the pilot activity. |
| Research | Source access and review depth are explicit; methods, denominators, counterevidence and limitations accompany findings. |
| Release readiness | The build, content, migration/configuration and QA evidence are named, and blocking gaps remain visible. |

A screenshot establishes only what it shows. Unit tests, browser execution, Expo web, native exports and physical-device checks provide different evidence. Record “not tested” when the required environment was unavailable.

## Run and validation reference

The root [package scripts](../../package.json), [web package](../../apps/web/package.json), [mobile package](../../apps/mobile/package.json), [Go module](../../backend/go.mod) and [application workflow](../../.github/workflows/application-ci.yml) are the executable references. The following commands document those entry points; this publication did not rerun application/runtime validation.

From the repository root:

```bash
npm ci
npm run test --workspaces
npm run typecheck --workspaces
npm run build --workspace packages/learning-model --workspace packages/courseware --workspace apps/web
```

From `backend/`:

```bash
go vet ./...
go test -count=1 ./...
go run ./cmd/server
```

The server defaults to port 8080 and accepts `BRAINBUILDER_ADDR`. Web uses `VITE_API_URL`; native uses `EXPO_PUBLIC_API_URL`. Without a configured API, prototype clients use local seeded data. Choose a network address reachable from the actual mobile device when connecting to a locally running backend.

Existing runtime/export entry points from the repository root:

```bash
npm run e2e --workspace apps/web
npm run e2e --workspace apps/mobile
npm run build --workspace apps/mobile
```

The web [Playwright configuration](../../apps/web/playwright.config.ts) starts the Go service and web app. The mobile [Playwright configuration](../../apps/mobile/playwright.config.ts) tests an Expo web export in phone/tablet browser viewports. Native package build scripts export iOS and Android bundles; that does not prove device installation, audio background behavior or native release readiness. Browser executables and compatible platform tooling must be available for the relevant checks.

At the code review baseline, CI covered workspace unit tests, types, shared/web builds and Go checks. [BB-QA-007](../backlog/QA.md#bb-qa-007) plans to close the existing browser/export execution gap, while the native device and pilot tasks require their own evidence.

For the research tool, use its [README](../../research/brainbuilder-workbench/README.md), [protocol](../../research/brainbuilder-workbench/docs/research_protocol.md) and [verification record](../../research/brainbuilder-workbench/VERIFICATION.md). The public snapshot has recorded integrity/CLI/notebook checks; graphical report interaction remains a separate validation task. New participant/private data belongs outside the tracked public-source snapshot, as described in the workbench instructions.
