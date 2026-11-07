# Brainbuilder learning-evidence semantics

**Version 1.0.0 · BB-LRN-004 · candidate for product review · 7 November 2026**

## 1. Purpose, boundary and source basis

This contract defines the educational meaning of an observation and the conditions under which it may support a progress statement. Normative language below describes the intended product behavior when this version is adopted. It does not freeze an API, prescribe a database or implement a scheduler. The JSON shape in the accompanying [worked traces](worked-traces-v1.0.0.json) is an illustrative fixture format; [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25) owns technical types, event encoding and replay/storage decisions.

The source review baseline is [`abf70fa012356038ffa5a2c4092584d452724e5e`](https://github.com/castlemilk/brainbuilder/tree/abf70fa012356038ffa5a2c4092584d452724e5e). The existing [shared model](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts) and [courseware](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts) expose fixed-choice correctness, feedback and reward fields. Those fields alone do not supply prompt/rubric version, assistance, actual delay or assessed free-text reasoning. Their existing selected-option judgments must not be relabeled as produced recall.

The [wireframe specification](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md), especially screens 03, 04, 06, 11 and 12, is the product input. The fixture source maps to course `algorithms-data-structures`, unit `sorting-searching-selection`, lesson `binary-search-invariants`, and the `binary-search-read`, `-audio`, `-window`, `-trace`, `-check` and `-lab` blocks at that baseline. Code provenance is not subject-matter approval.

The proposed stable concept is `bb.concept.algorithms.binary-search-interval-invariant`; `bb.concept.foundations.sorted-order` is a prerequisite whose dedicated teaching coverage is still incomplete. The application family uses proposed IDs `bb.activity.algorithms.search-strategy-application`, `bb.prompt.algorithms.search-strategy-application` and `bb.rubric.algorithms.search-strategy-application`. Fixtures keep identity and draft version separate. These authoring examples are not an approved pilot rubric or new shipped content.

## 2. Observation classes and allowed claims

| Class | What was observed | Allowed description | What it cannot establish |
| --- | --- | --- | --- |
| Read exposure | A recorded reading interaction with a particular material version and coverage state | “Read this section” or “Reading started,” according to the observed interaction | Attention, comprehension, correctness or retained knowledge. |
| Listened exposure | Actual recorded playback of a material/version, with partial/completed/unknown coverage | “Listened to this segment” | A correct answer, checked recall or lesson/concept mastery. A UI play toggle is insufficient evidence of playback. |
| Private practice/self-report | A prompt was offered and a learner reports their own experience after thinking privately | “You reported ‘I had it’ / ‘Partly’ / ‘Need another pass’” | An assessed answer. No objective `correct`, outcome, score or assessment field belongs on the private observation. |
| Submitted response | An observable response was locked for a named prompt/version | “Answer submitted; checking” | A checked outcome while assessment is pending, unavailable, uncertain or disputed. |
| Checked response | A submitted response has a final judgment under a named rubric/version, with method and assistance context | “This response met / partly met / did not meet these criteria” | Infallible truth, complete understanding or broad mastery. |
| Delayed checked response | The same checked response, additionally qualified by a planned later opportunity, a named earlier anchor and actual elapsed interval | “This check occurred X after [named anchor], with [recorded practice context]” | A universal retention period, forgetting deadline or knowledge retained without any intervening practice. |
| Application response | A response to a scenario linked to a concept, with task/rubric and prior-exposure context | “This reasoning met the criteria in this scenario” | General transfer to every new situation. |

A delayed check is a qualified view of one response, not another response to add to counts. Application and recognition remain separately labeled from produced recall. The fixture recognition example supplies response options; the produced-recall examples require a response without supplied answer options. Presentation or input modality alone does not establish the kind of learning evidence.

Private `partly` is a self-report. Assessed `partial` is a rubric judgment about an observed answer. They must remain different in UI, data and aggregation. “Not sure yet,” skipping, leaving or not answering does not prove an incorrect belief and must not silently become an incorrect assessed result.

Lesson completion and rewards are separate activity concepts. Completing a lesson may establish that the app's stated activity condition was met. It does not manufacture a checked response. Legacy completion claims, including preserved partial claims, retain their legacy/unknown-basis provenance; migrations must not invent observations or backfill judgments. Demo/seeded metrics never become learner evidence.

## 3. Required interpretive context

The following meanings must be recoverable for any supported claim. Exact production field names belong to the technical contract.

| Context | Product requirement |
| --- | --- |
| Identity and scope | Distinguish the learner, concept, observation and check opportunity; distinguish a delivery copy from a new response. Mode change/resume preserves the opportunity. |
| Source/content | Preserve the exact source/material identity and version supporting the activity. A moving URL alone is not a version. Unknown provenance remains unknown and cannot support an otherwise unsupported checked claim. |
| Prompt | Preserve identity, version, family, task kind and response format. Changing a version does not erase earlier exposure to the same scenario family. |
| Rubric | Preserve the rubric/version actually used for each assessment revision, its supported prompt family and assessment method. |
| Time | Preserve timezone-qualified occurrence times and their precision/uncertainty. A response's occurrence is its locked submission time, not its later assessment, sync, receipt or display time. |
| Assistance | Record hints, answer reveals, worked examples and relevant source access, with their timing and whether the observed assistance history is complete. |
| Assessment | Preserve unassessed, pending/manual/uncertain/disputed and final states; keep prior judgments when corrected. |
| Prior practice | For a delayed observation, identify the anchor, relevant concept scope, known intervening activities and whether history is incomplete. Outside practice is unknown or a labeled self-report. |
| Application novelty | Preserve the authored relation to taught examples, scenario family, known earlier prompt/solution exposure and the limits of that history. |

An unknown field is not an empty history, zero practice, no assistance, an incorrect answer or a correct answer. Old Boolean `correct` values without enough context must not be upgraded into this contract's stronger claims. Necessary provenance does not require names, emails, raw source documents or raw answers in research analytics. Response retention/access policies and privacy implementation remain separate engineering/research work.

## 4. Assistance, response locking and assessment states

### Assistance applies to the response being claimed

An unassisted claim in this contract means **no recorded in-task assistance, with a known app assistance history**. It does not assert that unobserved outside help was impossible.

- A hint, answer reveal, worked example or relevant source view at or before submission makes that response assisted. Unknown ordering/completeness cannot be treated as proof of no help.
- An answer locked before feedback is not retroactively assisted by feedback shown afterward. T02 includes a correct response followed by a reveal ten seconds later.
- The reveal becomes relevant history for later practice. A private-to-typed switch, resume, new component or mode cannot erase assistance already given in that opportunity. T02's private reveal therefore disqualifies the later typed response from unassisted credit even though that typed record has no new help event.
- Viewing relevant material in a separate recorded activity while constructing the answer also counts as assistance. It cannot be hidden by assigning a different UI route.
- A reset/retry is not evidence that the learner had never seen the prompt, feedback or scenario. Fresh opportunity identity requires the actual learning/measurement rule, not a convenient new client ID.

### Assessment lifecycle

| State | Meaning | Eligibility for a final-outcome numerator or denominator |
| --- | --- | --- |
| No response / skipped | No locked assessable response | Neither; show separately as missing/skipped activity. |
| Pending | Submitted, no final assessment available | Neither; disclose pending coverage. |
| Manual review | A human judgment is required or underway | Neither until that review resolves. |
| Uncertain | The available rubric/assessor cannot support a judgment | Neither; offer an explanation or review route. |
| Disputed | A previous judgment is contested and unresolved | Neither in the current view; preserve earlier as-of views. |
| Final correct | The recorded response meets the named rubric's criteria | Numerator and denominator, if all other eligibility conditions hold. |
| Final partial | Some criteria are met; the stated full-success condition is not | Denominator, not the full-correct numerator; retain the partial count and explanatory feedback. |
| Final incorrect | The checked response does not meet the stated success condition | Denominator, not numerator. |

Corrections retain the original response, earlier assessment revisions, the superseded assessment ID, reason, method, rubric version and revision time. A report states its assessment cutoff. A human review is not an extra learner response. A new rubric does not silently rewrite old reports: T03 is pending at one cutoff, partial at the next, and correct under a documented later rubric revision. Each snapshot still contains at most one judgment for that response.

The examples contain fixed fictional judgments; the checker never infers correctness from answer text. Calibrating real rubrics and evaluating an executable typed-response assessor belong to BB-LRN-006, BB-LRN-005 and BB-QA-006.

## 5. Delayed checks and fresh application

### Actual elapsed time, not a retention label

For a delayed check, record the planned later opportunity and a named anchor such as the completion of a particular learning exposure. Compute:

`elapsed = response submitted at − named anchor occurred at`

The anchor must belong to the same learner and relevant concept scope and precede the check. Preserve both endpoints and their versions. Convert comparable timestamps to a common time basis; do not subtract calendar dates or substitute assessment/receipt time. If the anchor is missing, clocks cannot be compared or ordering is unreliable, the interval is unknown and the observation is excluded from interval-specific claims. It may remain an ordinary checked response with that limitation.

Also preserve relevant intervening read/listen exposure, private practice, attempts, feedback and assistance. In these examples, the context records practice between the anchor and the start of the check. Help during the check is handled by the assistance rule. A feedback event attached to an earlier response can itself be intervening practice. Relevance scope must be named; broader or external practice must not be silently assumed absent.

| Fixture | Named-anchor interval | Latest recorded practice before check | Interpretation |
| --- | --- | --- | --- |
| `fixture-d-clean` | 617,400 seconds: 7 days, 3 hours, 30 minutes | The named anchor | No intervening practice appears in the complete recorded-app fixture history; outside practice remains unknown. |
| `fixture-d-practiced` | 617,400 seconds | A reread 95,400 seconds before submission: 1 day, 2 hours, 30 minutes | This is a later unaided check after a recorded reread, not a seven-day interval without practice. |
| `fixture-d-unknown-history` | 617,400 seconds | Unknown completeness | An empty known list does not establish that there was no practice. |
| `fixture-d-partial` | 694,800 seconds: 8 days, 1 hour | The named anchor | A valid delayed partial outcome remains in the eligible denominator. |
| `fixture-tz-response` | 90,000 seconds | The named anchor | Consecutive local dates with explicit differing UTC offsets span 25 hours. |
| `fixture-m-response` | 270 seconds | The named anchor | Grading eight days later does not turn this immediate response into a delayed check. |

R07 uses a **chosen reporting window of 604,800–777,600 seconds, inclusive** (7–9 days). This is a fixture reporting rule, not an optimal interval, forgetting model or scheduling default. A real report must declare its window before interpreting outcomes and show actual interval range/context. A narrower “no recorded intervening practice” view additionally requires complete recorded-app history and no relevant intervening record. It still cannot claim no outside practice.

### Freshness is contextual

A fresh application claim requires an authored scenario that differs meaningfully from taught examples and no earlier exposure to that scenario family in the known recorded-app history. Unknown history is not fresh. A changed prompt version, wording or filename does not erase family exposure. Assistance before the application response changes its claim in the same way as recall.

T06's draft-2 prompt remains the same scenario family as draft-1 and is excluded from the fresh subset. A new-context partial response contributes to its denominator, not its full-correct numerator. The example describes success in the assessed scenario only; it cannot establish broad transfer, interview readiness or future performance.

## 6. Aggregation and honest denominators

### Define the population before looking at success

A metric must name the learner/cohort, concept scope, task kind, reporting/assessment cutoff, opportunity selection rule, assistance policy, interval policy when used, and counting unit. The worked unit is **the primary response action in a check opportunity**. Its first submitted/skipped/no-response action is selected by observed order, before considering correctness. A later successful retry cannot replace an earlier incorrect first answer. Private-only activity remains private and never supplies a checked outcome.

Delivery copies with the same canonical observation identity count once. Conflicting payloads under an identity must not silently overwrite one another. An unresolved tie in which response came first is unknown order, not permission to pick the more favorable answer or sort by ID. These semantic invariants do not implement transport idempotency; BB-ENG-002 and the persistence/sync tasks own that work.

### Worked eligibility rules

For the unassisted produced-recall reports:

1. Exclude demo/fixture-origin data from actual learner views. These files are entirely synthetic; the `origin` switch only models that exclusion inside the example checker.
2. Deduplicate delivery copies, preserving distinct genuine opportunities and every historical response.
3. Exclude exposure/private records, skipped/nonresponses and retries of the same opportunity.
4. Require a final judgment available at the report's assessment cutoff. Keep pending, manual-review, uncertain and disputed counts visible separately.
5. Require a produced-recall task. Fixed-choice recognition and application are different evidence classes.
6. Require known in-task assistance context with no pre-submission help. Preserve all assisted observations for appropriately labeled practice history.
7. For a delayed view, additionally apply the declared opportunity/interval rules and any explicitly chosen intervening-practice filter.

**Numerator:** primary eligible responses judged fully correct.  
**Denominator:** all primary eligible responses with final correct, partial or incorrect judgments.  
**Display beside the ratio:** partial/incorrect split, excluded and unresolved coverage, actual dates/intervals, assistance definition and history limits.

These ratios are conditional on eligible checked opportunities. They are not completion rates, response rates or estimates for everyone invited/enrolled. A study separately reports offered/submitted/assessed/missing counts and its participant denominators. Excluding unresolved responses from a checked-outcome denominator must not hide missingness or selection.

R02 yields **1 correct / 3 eligible opportunities**, including one partial and one incorrect. Its demo, duplicate delivery, private responses, assisted responses, recognition, unresolved judgments and correct retry add no unassisted-recall credit. R07 yields **3/4** within its chosen delayed window; the narrower R08 yields **1/2**. Those are different declared populations, not two competing estimates to choose according to which looks better.

A zero denominator displays **“No eligible checks yet”**, never “0% knowledge,” “100% correct” or a division-by-zero placeholder. Repeated checks of one concept do not become several distinct concepts. A future statement such as “4 of 6 concepts” needs a predeclared concept set, one specified representative opportunity per concept and a visible list of unobserved/excluded concepts. This contract does not create that stronger metric from attempt counts.

## 7. Scheduling and UI handoff

| Observation | Permissible planner/UI use | Prohibited promotion |
| --- | --- | --- |
| Exposure only | Save position, show activity history, offer optional practice | Mark recalled or advance a checked-success count. |
| Private self-report | Offer another pass or let the learner adjust workload | Convert confidence into an assessed outcome. |
| Assisted/partial/incorrect practice | Offer an explanation, coherent next practice or reviewed follow-up | Hide assistance or relabel partial as fully correct. |
| Pending/manual/uncertain/disputed | Preserve work, show the unresolved state and appropriate next step | Guess correctness or silently punish the learner as wrong. |
| Eligible checked/delayed response | Inform a versioned review policy with its actual context | Assert permanent mastery or a universal memory expiry. |
| Skipped/absent | Let the learner pause, return or select a manageable activity | Erase past observations or infer lost knowledge. |

BB-LRN-009 owns the review policy; BB-ENG-013 owns its implementation. This contract supplies meanings rather than intervals or adaptive-algorithm promises. Progress may change because additional evidence or an assessment correction became available; explain that reason and preserve the original observation.

## 8. Verification, versioning and remaining gates

The [checker](check_contract.py) validates catalog references, forbidden state combinations, timestamp arithmetic, relevant recorded history, scenario-family history and all ten hand-specified aggregation expectations. The [tests](test_contract.py) exercise material counterexamples, including duplicate/conflicting identities, a private correctness field, uncertainty mistaken for a final result, a correct retry replacing an incorrect answer, forgotten private assistance, an invented seven-day/24-hour interval and changed-version “freshness.”

The fixture checker has a complete synthetic input snapshot and explicitly asserted app-history completeness. It does not prove that a real app captured every interaction, reconstruct unavailable outside practice, resolve real clock uncertainty, grade novel text, migrate data, implement a technical event schema or validate a production analytics pipeline. Snapshot availability and late-arriving records must be handled explicitly by the future technical/reporting implementation; these fixtures exercise assessment cutoffs and known-record context only.

Change this product contract's major version when observation meanings or metric eligibility change. Additive clarifications/examples can use a minor version; editorial corrections can use a patch. Prompt, source, content and rubric versions remain independent. Never substitute a later version into an old observation without a traceable reinterpretation/revision.

Remaining gates are product adoption of these semantics, the selected concept/content mapping, reviewed and calibrated real rubrics, the agreed pilot reporting protocol and actual API/storage/UI/device implementation. Passing these synthetic consistency checks establishes internal coherence of the deliverable, **not learning efficacy, valid automated assessment, representative demand or completed application behavior**.
