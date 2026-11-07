# Brainbuilder: learning that fits into ordinary life

Product review, wireframe direction and first market-research workbench  
Prepared 7 November 2026

## Recommended direction

Position Brainbuilder around **turning a few spare minutes into knowledge people can recall and use**. Give each visit one useful next action, connect that action to an ongoing goal, and make returning after an interruption easy.

The first version should prove this routine using Brainbuilder's existing algorithms material. A suitable initial cohort to investigate is adults refreshing technical fundamentals for a current work or interview goal. Those are separate jobs: discovery should select one before the pilot. This is a product hypothesis, not a validated market segment.

Suggested broad promise: **“A few minutes. Something you can use.”** Supporting copy: “Pick up a useful idea, try it for yourself, and return to it when you need a refresher.” For a technical pilot, test the more concrete promise: **“Keep technical ideas fresh, five minutes at a time.”** Duration is an estimate and a design choice to test.

Three generated boards cover twelve proposed mobile screens. They preserve the existing warm paper, ink, teal, ember and violet identity. The companion wireframe specification defines behavior that a static image cannot demonstrate. Example lesson and progress values in the images are illustrative; the screens are proposals, not a deployed product.

## 1. Review of the current product

### Scope and provenance

The review inspected the default-branch source at commit [`abf70fa012356038ffa5a2c4092584d452724e5e`](https://github.com/castlemilk/brainbuilder/tree/abf70fa012356038ffa5a2c4092584d452724e5e). The commit is dated 22 October 2026. It covered the native and web UI, design context, shared learning model, courseware and Go service handler. This was a source review, not a runtime, device, accessibility or production audit. The previously generated Brainbuilder wireframes were not located in the available conversation/file retrieval; the repository supplied the design baseline.

The [design context](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.impeccable.md) already calls for intentional microlearning, commute-ready interactions, tactile practice, clear feedback and a mature sketchbook aesthetic. That is a strong foundation to retain.

| Finding from the reviewed source | Implication for the next design |
|---|---|
| The mobile navigation exposes Home, Browse, Feed, Play, Library and You. Home also contains a feed card, path map and sorting game. | Offer four main destinations: Today, Paths, Saved and Progress. Put practice and labs inside the relevant learning path; keep discovery/search available within Paths. |
| The mobile header, daily-goal panel and onboarding/plan summary render before the selected tab's content. | Keep the daily decision near the top and move setup out of repeated visits. Use focused lesson screens with minimal surrounding navigation. |
| The courseware includes structured lessons, explanations, diagrams, simulations, quizzes and labs. | Reuse these assets to teach a specific concept and offer a deeper session when the learner has time. |
| The mobile feed's audio button toggles a Boolean and changes the visual progress bar. Native course audio blocks show a title and duration. | Actual playback, background behavior, interruption recovery, transcripts and offline media are necessary implementation work for an on-the-go promise. |
| The shared learning model records modes, durations, quizzes, XP, streaks, hearts, paths and a league, but the reviewed types do not include concept-level delayed-recall observations or a review schedule. | Add an evidence-based learning history and a review planner. Preserve enjoyable feedback, while making the primary progress view about observed learning. |
| Native enrollment, selected lesson, quiz results and saved bites are held in component state in the reviewed component. The web UI persists some session/enrollment state locally. | Define durable, cross-session saving explicitly before promising seamless continuity. Persist checkpoints and sync attempts without duplicate credit. |
| Both web and native `completeCourseLesson` implementations mark every lesson complete when the final lesson is completed; the web implementation also awards a course bonus from this final-position check. | Derive completion from the actual required lesson set, make repeats idempotent, and separate “reached the end” from lesson completion and evidence of understanding. Fix this on both clients before using completion as a meaningful outcome. |
| `buildLearningHome` returns seeded values such as a 12-day streak and 1,240 XP. | Real learner views need empty, loading, offline and genuine-history states. Demo metrics must remain labelled as examples. |

Source references: [native UI](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/mobile/src/MobileApp.tsx), [web UI](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/apps/web/src/App.tsx), [learning model](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/learning-model/src/index.ts), [courseware](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/packages/courseware/src/index.ts), [service handler](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/backend/internal/httpapi/handler.go).

These findings describe this revision. They do not establish the state of a different branch or an independently deployed build.

## 2. The learning experience

### Start with one obvious action

Today should open with a preselected, useful session: **“Continue · about 5 min.”** Time and mode are adjustments, with sensible defaults remembered from the last visit. The 2/5/10-minute and Read/Listen/Practice controls in the wireframes demonstrate available choices; users should not have to make two fresh decisions before every session.

The next activity can be a new concept, a short return to an earlier idea, or one application question. A two-minute option should be coherent on its own. It can revisit an existing concept rather than compress a longer explanation until its context disappears.

The central sequence is: encounter a useful idea, attempt to recall it, receive an explanation, try a new situation, and revisit the idea later. The application can spread this sequence over several visits. A learner who only has time to listen should leave with a saved place and a later practice opportunity.

### Fit the available attention

| Situation | Recommended interaction | Continuity requirement |
|---|---|---|
| Short seated break | A compact visual explanation and one answer | Save after each meaningful step. |
| Public transport | Reading or audio, with optional private recall | Resume at the current concept and playback position. |
| Audio-only moment | Narration, replay, transcript available afterward | Record listening as exposure; defer scored questions. |
| A longer focused session | Interactive lab, code tracing or a richer scenario | Connect it to the same concept and path. |
| Returning after several days | A small refresh selected from the current goal | Cap the suggested workload; allow pausing or changing a goal. |

Mode should adapt to the material. Narration can explain an intuition or tradeoff; a code trace may require the screen. Do not present every lesson as equally suitable for every mode. Quiet practice must work without speaking aloud or granting microphone access.

### Make progress interpretable

Maintain separate observations for:

- **Exposure:** read or listened to an explanation.
- **Private practice:** the learner attempted recall and self-reported how it went.
- **Checked response:** a submitted answer was assessed against a specific prompt and rubric.
- **Delayed checked response:** a response was checked after a known interval, with intervening reviews recorded.
- **Application:** performance on a new scenario, associated with that scenario's limits.

“4 of 6 checked concepts recalled after seven days” is interpretable only with the denominator, interval, prompt type and last-check date. It must not include merely played audio or unobserved private answers. “Seven days” is an example measurement window, not a universal claim about optimal spacing. Show uncertainty and sparse data honestly. Avoid an intelligence score or a claim of permanent mastery.

The reviewed primary research supports retrieval practice, spaced revisits and testing application with new questions in the studied tasks. It does not validate Brainbuilder, AI grading, commuting while learning or any fixed lesson duration. The original abstracts were reviewed: [Roediger & Karpicke, 2006](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/), [Cepeda et al., 2008](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2008.02209.x/), [Butler, 2010](https://profiles.wustl.edu/en/publications/repeated-testing-produces-superior-transfer-of-learning-relative-/).

## 3. Wireframe set

| Board | Screens | Product question |
|---|---|---|
| **01 — Learn in the gaps** | Choose an outcome; Today; one useful idea; recall before reveal | Can someone begin a useful session with little planning? |
| **02 — A lesson that travels with you** | Downloaded trip pack; audio player; interruption recovery; return after a break | Can learning fit around ordinary interruptions and variable attention? |
| **03 — Build knowledge that stays** | A useful path; learning from selected source material; application; recall evidence | Can the learner see a connection between small sessions and useful understanding? |

The first board makes the lesson the focal point. The second treats playback and restart as core product work. The third gives the routine a cumulative purpose. Source import is a proposed extension after the basic routine works; it introduces additional content-quality and source-handling requirements.

Keep the existing tactile games and visual reasoning. The goal is to place each activity where it helps explain or practise a concept. Enjoyment and celebratory feedback can remain. An optional weekly rhythm is worth testing alongside optional streaks; the source evidence does not justify assuming everyone dislikes gamification.

## 4. What the first market scan found

### Coverage

The seed contains **21 evidence records**: 12 learner-signal records from 12 distinct conversations/pages, six official competitor descriptions, and three primary learning-research abstracts. Ten learner sources were inspected in full; two are indexed-excerpt leads with low-quality/unreviewed flags. The learner sources comprise nine Reddit conversations, two Anki forum discussions, and one Australian App Store review page. The two research streams logged **27 search queries** in total.

This is a deliberately selected convenience sample. Distinct discussion roots are a deduplication unit, not proof of independent people. Search-result totals were not recorded consistently, so the coverage log leaves those totals unknown. There are no representative-demand, market-size, conversion, efficacy or optimal-price estimates.

### Signals that change the design

| Observation | Proposed response | Qualification |
|---|---|---|
| A Blinkist user describes quick consumption followed by poor recall and little depth. | Add a return loop and a route into deeper material. | One discussion of self-reported experience; no retention test. [Source](https://www.reddit.com/r/nonfictionbookclub/comments/1lee2aq/whats_your_experience_with_blinkist/) |
| An Anki user requests simple audio playback and explicitly separates listening from correctness and spaced-review scheduling. | Provide a real listening mode and keep exposure separate from assessed learning. | A specific experienced-user workflow, not a market-wide preference. [Source](https://forums.ankiweb.net/t/play-card-audio-in-sequence-like-a-playlist/66189) |
| A learner asks for review timing that adapts after a missed day. | Offer a manageable next session and a gentle restart. | A planner alone might satisfy this job. [Source](https://www.reddit.com/r/studying/comments/1xbnr6c/app_to_track_when_i_need_to_revise_for_spaced/) |
| Another learner wants varied explanations/scenarios and dislikes building a prompting workflow; they say they would pay. | Make the next activity ready without requiring a chat prompt. | Stated intent is not an observed purchase. [Source](https://www.reddit.com/r/studytips/comments/1tugf7j/im_looking_for_an_app_that_uses_spaced_repetition/) |
| An Imprint trial user reports switching to a discounted paid Blinkist plan despite liking the trial. | Test the value of a concrete learning goal and a clearly priced continuation. | A reported purchase, not transaction-verified behavior or a price benchmark. [Source](https://www.reddit.com/r/productivity/comments/1sk0hqd/what_do_you_think_of_imprint_app_for_visual/) |
| A positive Imprint reviewer asks for application, interactivity and more gamification. | Preserve play while connecting it to a learning purpose. | One review; its displayed date does not establish a year. [Source](https://apps.apple.com/au/app/imprint-visual-micro-learning/id1482780647?platform=iphone&see-all=reviews) |

The two excerpt-only leads concern finishing content within a commute and choosing rest during a commute. They are useful questions for discovery, but stay outside the source-checked count until their full sources can be inspected. Promotional replies and visible cross-post duplicates were excluded as independent support.

### Competitive position

| Product | Established overlap in official material | Implication |
|---|---|---|
| [Brilliant](https://brilliant.org/faq/) | Interactive visual problems, feedback and guided paths | Brainbuilder needs a useful audience-specific routine as well as good interactive teaching. |
| [Blinkist](https://www.blinkist.com/pricing) | Short reading/listening and external-content summaries | Audio and summaries are established comparison points. |
| [Headway](https://headway.zendesk.com/hc/en-us/articles/15241582642716-What-is-Headway) | Daily insights, personalization, streaks and spaced repetition | “Daily microlearning with repetition” alone is a weak differentiator. |
| [Imprint](https://www.imprintapp.com/i/visual) | Visual, interactive short lessons and an alternative to scrolling | Visual polish and brief sessions need a more specific outcome. |
| [NotebookLM / Google’s current notebook mobile help](https://support.google.com/gemininotebook/answer/16296687?co=GENIE.Platform%3DAndroid&hl=en) | Source intake, background/offline audio, quizzes and flashcards | Source-to-audio generation faces direct platform competition. The retrieved help uses the Gemini Notebook name; this scan did not investigate a rename announcement. |
| [RemNote](https://www.remnote.com/feature/learn-any-pdf) | Guided source sections, citations, recall/application questions and topic tracking | Even source-based adaptive study is already marketed. Audience, experience, trusted content and sustained use need validation. |

These are official feature descriptions, not hands-on audits or proof of efficacy. Missing mentions are not evidence of absent features. Pricing pages varied by geography and promotion during retrieval; no comparable Australian price table was established.

The proposed differentiator is a dependable learning relationship: less planning, less restart effort, useful content, and a history that helps choose what to revisit. Distribution within a specific community and trusted subject coverage could strengthen this over time. Neither is established by these wireframes or this small evidence set.

## 5. Reusable research workbench

The accompanying workbench is a local Python/SQLite tool, with a Jupyter analysis notebook and a self-contained HTML report. Its purpose is to accumulate traceable evidence and explicit decisions across research rounds.

It supports JSON, JSONL and CSV ingestion; canonical URL and conversation grouping; provenance and date fields; source-access and review flags; separate observations and inferences; negative evidence; evidence-to-hypothesis links; a query/coverage log; revision history for changed evidence; and repeatable HTML/CSV/JSON exports. The database distinguishes learner testimony, vendor claims, learning research and founder hypotheses.

Each record can preserve the user's job, problem, workaround, payment signal, source URL, publication date if known, capture date, evidence quality and review status. “Verified” means the recorded source was checked by the named reviewer. It does not verify author identity, payment, demand or a learning outcome. The initial review provenance is assistant review; no human validation is claimed.

The report counts distinct conversation roots within this corpus. Additional comments in a thread do not become independent customer counts. Counts across themes can overlap. Recheck flags concern the age of the capture; a newly retrieved old post remains historical testimony.

### How to run it

From the unpacked workbench directory:

```bash
python3 bb_research.py init
python3 bb_research.py import-hypotheses data/hypotheses.json
python3 bb_research.py ingest data/evidence_seed.json
python3 bb_research.py import-links data/hypothesis_links.json
python3 bb_research.py import-queries data/query_log.json
python3 bb_research.py export --as-of 2026-11-07 --out reports/2026-11-07
```

The delivered database and report are already seeded. Re-importing unchanged records is intended to be idempotent. Use deliberate update options when changing an existing observation. The README documents the full schema and commands. The notebook provides a transparent starting point for analysis; Jupyter itself is optional for running the CLI.

Delivery checks passed: 14 integrity tests; an unchanged re-import of all 21 real records; database integrity verification; and execution of all eight notebook code cells against the seeded database. The report's navigation targets and collapsed coverage section were checked. A graphical browser check was attempted, but the available Playwright installation had no browser executable and no installed Chrome was found. Interactive graphical filtering and visual layout therefore remain unverified; the report is an early research tool.

The tool imports reviewed evidence and generates a research queue. It does not automatically crawl Reddit, app stores or private communities. Collection can later use authorized APIs or exports through adapters that preserve the same provenance contract. No outreach or recurring collection task was started.

### Make each research round decision-oriented

1. Pick one uncertainty: audience, recurring job, value of audio, restart friction, learning outcome, or price.
2. Search several channels using the query matrix; record the exact queries and selection limits.
3. Inspect originals, group cross-posts, remove promotional material from demand counts, and preserve contrary evidence.
4. Link observations to a hypothesis as support, contradiction or context. Record who made that interpretation.
5. Choose the smallest observed-behavior test that could change the decision.
6. Update the hypothesis with the result and next action; re-export the report.

Useful next channels include recent critical and positive app-store reviews, technical learning communities, direct interviews with people who stopped using a product, and task observation with the prototype. An exhaustive scan is neither claimed nor necessary before testing the central routine, but the sampling gaps should remain visible.

## 6. Discovery and pilot plan

All sample sizes and gates below are proposed operating choices. They are not industry benchmarks, power calculations or external claims.

### Two weeks of discovery

**Week 1:** interview 10–12 people across likely technical-learning jobs. Ask them to show a recent resource, a stalled learning attempt, their current workaround, their available time, and any relevant purchase. Separate work fluency, interview preparation and curiosity. A useful focusing gate is at least five people independently demonstrating a similar recurring job and a recent attempt or workaround.

**Week 2:** run eight task-based prototype sessions in the chosen cohort. Ask users to start, shorten a session, change mode, recover from an interruption and return after a simulated missed period. Check whether they understand the difference between private and checked progress. A chosen usability gate is six of eight completing the start/resume tasks without moderator help, with repeated misunderstandings resolved before building a larger catalog.

Test source-import interest separately. Someone wanting help with a saved article does not yet establish that they want a general document workspace.

### Four weeks of a small pilot

Recruit approximately 24 people from the selected cohort. Use a small, reviewed set of existing algorithms concepts, with explicit prerequisite and outcome definitions.

| Period | Activity | Evidence |
|---|---|---|
| Week 1 | Baseline check, first sessions, scoring calibration | Prior knowledge, start friction, comprehension of controls, grading disagreements |
| Weeks 2–3 | Natural use, limited reminders, bounded review load | Self-initiated returns, time used, interruptions, resumes, mode choice, abandonment |
| Within the pilot | Counterbalanced comparison of matched topics with explanation/restudy versus recall/application, with comparable time | Directional evidence about the learning activity, including exposure and outside study |
| Week 4 | Delayed checks, fresh application tasks, interviews with returners and people who stopped, an explicitly priced continuation | Recall, application, follow-up coverage, non-return reasons and actual continuation decisions |

Example directional gates: about 14 of 24 participants complete three substantive self-initiated sessions in week 3; follow-up is obtained from at least 18 of 24; delayed recall moves in a positive paired direction without worse application performance; and around six choose the disclosed paid continuation. Set the offer and decision rules before observing outcomes. The price itself remains to be chosen after discovery and a comparable pricing review.

Small samples, topic differences, selection and carryover limit causal conclusions. Report all recruited/invited denominators, missing follow-up, prior knowledge, intervening practice and scoring disputes. A result among returners cannot be treated as the result for everyone enrolled. A paid pilot's conversion cannot be generalized to a consumer market.

If repeat use is strong but recall is weak, improve the learning activities. If learning is encouraging but return is weak, reduce friction or tighten the context. If both improve but people decline a paid continuation, revisit the audience or offer before expanding content.

## 7. Implementation order

| Priority | Work | Reviewable result |
|---|---|---|
| P0 | Today entry point, four-destination navigation, focused lesson flow | A first useful session with one clear CTA and no repeated setup |
| P0 | Durable session/checkpoint state and accurate completion rules | Leaving, restarting and reaching the final lesson preserve truthful progress |
| P0 | Recall attempts, feedback and modest review scheduling for curated material | Exposure, self-report and checked answers have distinct records |
| P0 | Real audio playback and transcript, followed by background/offline validation | The stated travel use case works on an actual phone |
| P1 | Fresh application prompts, calm return flow, reminder preferences | A small session remains useful after absence and across changing attention |
| P1 | Learning evidence view and pilot telemetry | Reviewers can trace a displayed outcome to actual observations |
| P2 | Selected-source import and lesson preview | Generated material preserves provenance, supports correction and acknowledges missing source coverage |
| P2 | Wider subject catalog and richer personalization | Expansion follows evidence from a useful retained routine |

The current work delivers the design direction, twelve-screen concept set, source review and runnable research foundation. Product implementation and participant studies remain future work.
