# Brainbuilder

Brainbuilder is a learning prototype with a React web app, an Expo/React Native app, shared TypeScript learning content and a Go Connect API. The current planning direction is to help people learn in short available moments, resume after interruption and return for useful practice.

**The microlearning designs and market propositions are draft hypotheses.** This publication adds documentation, concept wireframes, a research workbench and a delivery backlog; it makes **no product code or behavior changes**.

## Start here

- [Brainbuilder Space](https://chatgpt.com/space/page_6aeec28f5a7c8191894cd9f4ad93f3d1) — project home and planning context.
- [Live roadmap: issue #2](https://github.com/castlemilk/brainbuilder/issues/2) and [backlog index](docs/backlog/README.md) — task scope, dependencies and evidence requirements.
- [Delivery guide](docs/microlearning/Delivery-Guide.md) — working sequence, validation and branch/PR workflow.
- [Product and microlearning review](docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md) — findings, positioning proposals and research limits.
- [Behavior specification](docs/microlearning/Brainbuilder-Wireframe-Spec.md) and [wireframe gallery](docs/microlearning/wireframes/README.md) — twelve proposed screens across three concept boards.
- [Research workbench](research/brainbuilder-workbench/README.md) — runnable evidence ledger, source provenance, search queue, notebook and dated report.

The code review baseline is [`abf70fa012356038ffa5a2c4092584d452724e5e`](https://github.com/castlemilk/brainbuilder/commit/abf70fa012356038ffa5a2c4092584d452724e5e). The planning snapshot dated **7 November 2026** contains **67 tasks: 19 ready, 41 blocked, 2 discovery and 5 later**. These labels describe planned readiness, not completed implementation; check the live roadmap for subsequent changes.

## Repository map

| Location | Purpose |
| --- | --- |
| [apps/web](apps/web) | React/Vite web application and browser tests. |
| [apps/mobile](apps/mobile) | Expo/React Native application, component tests, Expo web tests and an iOS Maestro flow. |
| [backend](backend) | Go Connect API, catalog and backend tests. |
| [packages/learning-model](packages/learning-model) | Shared learning types and prototype data/scoring helpers. |
| [packages/courseware](packages/courseware) | Shared algorithms/data-structures content and activity definitions. |
| [docs/microlearning](docs/microlearning) | Product review, behavior specification, generated concepts and delivery guide. |
| [docs/backlog](docs/backlog/README.md) | Planned work by track, acceptance criteria and dependencies. |
| [research/brainbuilder-workbench](research/brainbuilder-workbench/README.md) | Local Python/SQLite research tooling and the public-source snapshot. |

## Run the prototype

Use Node 22, as configured in [application CI](.github/workflows/application-ci.yml), and the Go version/toolchain declared in [backend/go.mod](backend/go.mod) when running the API.

From the repository root:

```bash
npm ci
npm run dev:web
```

For the Go service, in a separate terminal:

```bash
cd backend
go run ./cmd/server
```

To connect the web app to that service, start it from the repository root with:

```bash
VITE_API_URL=http://127.0.0.1:8080 npm run dev:web
```

Start Expo with `npm run dev:mobile`. Native API access uses `EXPO_PUBLIC_API_URL`; a physical device needs an address it can reach. See the [delivery guide](docs/microlearning/Delivery-Guide.md#run-and-validation-reference) for checks and platform limitations.

Without an API URL, the prototype uses seeded local data. Seeded progress and simulated controls do not establish actual learning history, real audio or offline availability; the review and backlog identify those gaps.

## Five useful starting tasks

| Task | First concrete result |
| --- | --- |
| [BB-ENG-001](docs/backlog/ENG.md#bb-eng-001) | Completing the final lesson first no longer completes untouched lessons on either client. |
| [BB-LRN-004](docs/backlog/LRN.md#bb-lrn-004) | Agreed semantics distinguish exposure, private self-report, checked and delayed checked responses. |
| [BB-LRN-001](docs/backlog/LRN.md#bb-lrn-001) | Existing material has stable concepts, outcomes and prerequisites. |
| [BB-RES-003](docs/backlog/RES.md#bb-res-003) | A usable discovery interview, screening and recruitment preparation pack. |
| [BB-UX-001](docs/backlog/UX.md#bb-ux-001) | The main navigation supports Today, Paths, Saved and Progress. |

For research-only work, start with the [workbench instructions](research/brainbuilder-workbench/README.md) and its [verification record](research/brainbuilder-workbench/VERIFICATION.md). The CLI uses Python's standard library and performs no network collection.
