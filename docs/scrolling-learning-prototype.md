# Scrolling learning prototype

Brainbuilder needs a way to explore a useful idea during a short break, try it without pressure, and return after an interruption. This web prototype makes that loop reviewable at `/learn`.

The Home screen and existing Feed link to it. The prototype has its own responsive layout, with Discover and My path. The existing course, feed, account and completion flows remain separate. This change is based on `main` and does not depend on the course-completion or discovery-foundations pull requests.

## Run and compare

From the repository root:

```sh
npm ci --ignore-scripts --no-audit --fund=false
npm run dev --workspace apps/web
```

Open `http://127.0.0.1:5173/learn` for the scrolling interaction. Open `/learn?navigation=buttons` for the same content and order with paging gestures disabled. Both variants retain visible Previous and Next controls. Use a fresh browser profile for each research participant; the two variants share this prototype's checkpoint on the same origin.

The app needs no API server for this experience. Its diagrams are interactive HTML and CSS; there is no simulated video or audio player.

## Scope

| Surface | Included behavior |
| --- | --- |
| Discover | Three ideas: linear search, binary search, and stack/queue order; source details, rationale and saved ideas |
| My path | A five-card binary-search sequence: try first, explanation, fresh case, feedback, endpoint |
| Optional practice | Private reflection, a text draft, or an explicitly submitted multiple-choice response |
| Interruption | A versioned checkpoint with positions, drafts, selected response, assistance history and recorded checks |
| Ending | A finite endpoint reporting observed activity, with explicit exit or continuation |
| Navigation comparison | Identical content in scrolling and button variants; no allocation or analytics service |

Source links are pinned to the existing courseware commit so reviewers can trace the teaching material. The new prose and practice examples are adaptations, not claims of validated instructional effectiveness.

## Evidence rules

Moving to another card records exposure only. Saving an idea, typing a draft, or reporting private reflection does not establish correctness. Text is not graded by keyword or an AI service. A multiple-choice check is recorded only after explicit submission, and its original result is retained when the learner returns to the card.

Help, revealed explanations and prior instruction remain part of the attempt context after moving back or restoring the page. A correct immediate check is not described as mastery or delayed retention. The new experience does not award XP or mutate course completion.

## Persistence boundaries

State is stored in this browser under `brainbuilder.scroll-learning.v1`. A successful write is required before the interface reports a local save. Read, validation and write failures must stay visible; an invalid or newer checkpoint must not be silently overwritten. Retrying a save and explicitly starting fresh are distinct actions.

This is browser-local continuity. There is no signed-in synchronization, cross-device resume, durable server record, storage-conflict resolution between tabs, or recovery after the user clears browser data. Loaded pages can use their in-memory state if a write fails, but the latest state is then not guaranteed to survive reload. The prototype does not promise an installable offline app.

## Interaction and accessibility review

Paging gestures must not consume input inside a text field, a source/details dialog, an interactive diagram, selected text, or a card body that still has content to scroll. Each deliberate gesture advances at most one card. Keyboard and visible-button navigation remain available; a learner can move on without answering.

Dialogs must expose their label, contain keyboard focus, close with Escape and return focus to their trigger. The interface must reflow with enlarged text, maintain readable contrast, preserve visible focus, and honor reduced motion. Automated browser coverage uses desktop and mobile Chromium viewports; it does not replace testing with assistive technology or on physical iOS and Android devices.

## Verification commands

```sh
npm run test --workspaces
npm run typecheck --workspaces
npm run build --workspace packages/learning-model --workspace packages/courseware --workspace apps/web
npx playwright install chromium
npm run e2e:scroll --workspace apps/web
```

`Application CI` runs the workspace checks and a separate focused Chromium job for this prototype. Browser reports and failure traces are retained as workflow artifacts. The scrolling suite uses a Vite server on port 5174 and does not require the Go API.

## Next decisions to research

1. Compare scrolling and button navigation using the same content, then test explanation quality and recall later. Completion or time spent alone is not evidence of learning.
2. Observe whether people distinguish browsing, private reflection, drafts and checked answers without facilitator explanation.
3. Interrupt a session during a draft, a revealed explanation and feedback; ask the participant to resume without hints.
4. Test whether the finite endpoint feels useful, abrupt or easy to miss, and whether returning is motivated by a real learning goal.
5. Validate the next subject and content source with target learners before increasing feed volume.

These are research tasks. No participants have been recruited, no responses collected, and no preference or learning-effect result is claimed by this implementation.

Production follow-up includes server persistence and account boundaries, a reviewed content pipeline, genuine media assets and transcripts if media is validated, native gesture and screen-reader testing, consented research instrumentation, and delayed practice scheduling. Those capabilities are not implemented here.

## Roadmap relationship

This prototype supplies review material for the following open tasks. It does not close their broader acceptance criteria.

| Existing task | Prototype contribution | Work still required by that task |
| --- | --- | --- |
| [BB-UX-001 / #15](https://github.com/castlemilk/brainbuilder/issues/15) | A discoverable, isolated learning route | Full Today/Paths/Saved/Progress migration across web and native, route inventory and deep-link recovery |
| [BB-ENG-002 / #25](https://github.com/castlemilk/brainbuilder/issues/25) | Explicit local evidence and assistance context with serialized examples | Shared API contracts, actor/device/session IDs, content/rubric versions, timestamps and replay rules |
| [BB-LRN-002 / #27](https://github.com/castlemilk/brainbuilder/issues/27) | One coherent visual practice sequence with a finite endpoint | Reviewed 2-, 5- and 10-minute variants, supported attention modes and measured timing ranges |
| [BB-ENG-004 / #31](https://github.com/castlemilk/brainbuilder/issues/31) | Browser-local checkpoints and visible failure/recovery states | Guest/account partitioning, native persistence, migration strategy, media positions and OS lifecycle validation |
| [BB-QA-007 / #11](https://github.com/castlemilk/brainbuilder/issues/11) | A focused desktop/mobile Chromium gate and artifacts | Existing journeys against the Go API, Expo web journeys, iOS/Android export checks and device evidence |
