# RES backlog

Research operations and validation. **10 proposed tasks** · planning snapshot 2026-11-07.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

## Track overview

6 ready; 3 blocked; 0 discovery; 1 later.

S, M and L are relative planning estimates, not durations or commitments. A ready task is available for its stated scope; it is not assigned or completed. Dependencies and additional prerequisites are separate requirements.

[Backlog overview and status semantics](README.md)

## Task index

| Task | Priority | Status | Phase | Effort | Issue |
| --- | --- | --- | --- | --- | --- |
| [BB-RES-001 — Resolve the two excerpt-only learner research leads](#bb-res-001) | P1 | ready | foundation | S | [#21](https://github.com/castlemilk/brainbuilder/issues/21) |
| [BB-RES-002 — Audit the evidence taxonomy, provenance and denominators before expanding collection](#bb-res-002) | P0 | ready | foundation | M | [#12](https://github.com/castlemilk/brainbuilder/issues/12) |
| [BB-RES-003 — Prepare the discovery interview, screening and recruitment pack](#bb-res-003) | P0 | ready | foundation | M | [#13](https://github.com/castlemilk/brainbuilder/issues/13) |
| [BB-RES-004 — Conduct and synthesize 10–12 behavioral discovery interviews](#bb-res-004) | P0 | blocked | foundation | L | [#29](https://github.com/castlemilk/brainbuilder/issues/29) |
| [BB-RES-005 — Observe eight task-based prototype sessions with the selected cohort](#bb-res-005) | P0 | blocked | pilot | M | [#40](https://github.com/castlemilk/brainbuilder/issues/40) |
| [BB-RES-006 — Prepare the four-week pilot protocol, comparison and grading audit](#bb-res-006) | P0 | ready | foundation | M | [#14](https://github.com/castlemilk/brainbuilder/issues/14) |
| [BB-RES-007 — Run the approximately 24-person four-week learning pilot and audit its outcomes](#bb-res-007) | P1 | blocked | pilot | L | [#64](https://github.com/castlemilk/brainbuilder/issues/64) |
| [BB-RES-008 — Complete graphical browser validation of the existing research dashboard](#bb-res-008) | P1 | ready | foundation | S | [#22](https://github.com/castlemilk/brainbuilder/issues/22) |
| [BB-RES-009 — Add one authorized research-source adapter beyond manual import](#bb-res-009) | P2 | later | expansion | L | [#43](https://github.com/castlemilk/brainbuilder/issues/43) |
| [BB-RES-010 — Define a manual research cadence and evidence-to-decision review](#bb-res-010) | P1 | ready | foundation | S | [#23](https://github.com/castlemilk/brainbuilder/issues/23) |

## BB RES 001

**Resolve the two excerpt-only learner research leads**

**Priority:** P1 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Research evidence and tooling

**Canonical issue:** [#21 — \[P1\]\[BB-RES-001\] Resolve the two excerpt-only learner research leads](https://github.com/castlemilk/brainbuilder/issues/21)

**Problem**

VOC-002 and VOC-009 remain snippet-only, unreviewed leads. They concern short commute content and commute decompression respectively; treating either as a fully checked observation could distort the on-the-go positioning.

**Scope**

- Reopen the original threads through permitted search or source access and inspect the original post plus the context needed to interpret it.
- Record whether the source is full text, partial, deleted or inaccessible; preserve the existing limitation if full context remains unavailable.
- Update only supported observations, counterevidence, uncertain publication dates and reviewer provenance through the existing revision-preserving update flow.
- Revisit affected hypothesis links without converting entertainment or decompression preferences into evidence of demand for technical learning.

**Acceptance criteria**

- [ ] Both records have a dated access outcome, source URL and actual access-level label.
- [ ] Every upgraded review status names the real reviewer type; no human-review label is inferred from an assistant check.
- [ ] The before-and-after observation and hypothesis-link decisions are inspectable in a saved revision or decision note.
- [ ] If either source remains inaccessible, it remains unreviewed and explicitly excluded from any claim requiring full-text verification.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [VOC-002 Podcasts for a 20 minute commute?](https://www.reddit.com/r/podcasts/comments/1insevi)
- [VOC-009 Podcasts to help switch off on commute home](https://www.reddit.com/r/podcasts/comments/1kxpm4d)
- [https://www.reddit.com/r/podcasts/comments/1insevi](https://www.reddit.com/r/podcasts/comments/1insevi)
- [https://www.reddit.com/r/podcasts/comments/1kxpm4d](https://www.reddit.com/r/podcasts/comments/1kxpm4d)

**Validation**

Review the two exported rows and their revision history against the source-access record; rerun the existing report to ensure access gaps remain visible.

**Risks and limits**

A successful open may reveal a different context. Continued access failure is a legitimate research result and must not be filled with a reconstructed post.

## BB RES 002

**Audit the evidence taxonomy, provenance and denominators before expanding collection**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** Research evidence and tooling

**Canonical issue:** [#12 — \[P0\]\[BB-RES-002\] Audit the evidence taxonomy, provenance and denominators before expanding collection](https://github.com/castlemilk/brainbuilder/issues/12)

**Problem**

The completed workbench already separates evidence types, review provenance, thread origins and unknown query counts. Its initial 21 records remain an exploratory convenience sample; additional collection needs a consistent codebook and a review audit, not another ingestion engine.

**Scope**

- Audit the 21-record baseline and the six proposed hypotheses against the existing research protocol; preserve the 12 learner records, six vendor descriptions and three primary-study abstracts as distinct evidence classes.
- Document coding rules for job, learning moment, interruption, existing workaround, concrete outcome, payment evidence, source access, counterevidence and ambiguous or overlapping categories.
- Specify manual common-origin grouping for crossposts, app-store review pages and copied material, including uncertainty when independence cannot be established.
- Define separate denominators for captured threads/pages, study invitations, eligible people, enrolled participants, completed sessions, delayed follow-ups and paid continuations.
- Treat schema changes as optional, backward-compatible extensions only where the audit demonstrates a missing field.

**Acceptance criteria**

- [ ] A versioned codebook contains inclusion, exclusion and ambiguous-case examples for every decision-relevant category.
- [ ] An audit sheet reconciles all 21 baseline records, their access/review labels and their demand-count eligibility without silently deleting contradictory evidence.
- [ ] A denominator dictionary explicitly states that captured threads/pages are not unique people, market prevalence or representative demand.
- [ ] Any actual human second review is attributed to a named consenting reviewer; otherwise the report continues to show zero human-reviewed records.
- [ ] Existing idempotent imports, revision history and unknown-count behavior remain intact; any necessary schema extension has a documented migration and a focused integrity check.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [research/brainbuilder-workbench/README.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/README.md)
- [research/brainbuilder-workbench/docs/research_protocol.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/docs/research_protocol.md)
- [research/brainbuilder-workbench/data/initial_scan_manifest.json](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/data/initial_scan_manifest.json)

**Validation**

Reconcile the audit against exported evidence, hypotheses and query logs; inspect at least one crosspost, one app-review source, one abstract and one snippet-only row to confirm the rules produce the intended labels.

**Risks and limits**

More rows can create an illusion of corroboration when they share an origin. A polished dashboard must not turn assistant source checks or anonymous self-reports into independently verified customer outcomes.

## BB RES 003

**Prepare the discovery interview, screening and recruitment pack**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** Customer discovery and pilot studies

**Canonical issue:** [#13 — \[P0\]\[BB-RES-003\] Prepare the discovery interview, screening and recruitment pack](https://github.com/castlemilk/brainbuilder/issues/13)

**Problem**

The public-source scan suggests several possible jobs, but there is no direct participant evidence selecting interview preparation, current-work technical fluency or general curiosity as the first cohort.

**Scope**

- Extend the completed interview guide into a 10–12-person discovery protocol spanning the three candidate jobs, with explicit eligibility and an initial balanced recruitment target.
- Draft neutral screener questions, invitation copy, participant information, consent language and a moderator guide; keep all material unsent.
- Ask for recent learning episodes, stopped attempts, material the person actually used, current workarounds, relevant purchases or refusals, and contexts in which they prefer rest rather than learning.
- Prepare a consent-aware note template, pseudonymous participant IDs, withdrawal process, optional-recording choice and a proposed retention/deletion period to approve before recruitment.
- Separate behavioral questions from late-session concept reactions so the Brainbuilder proposition does not lead the discovery interview.

**Acceptance criteria**

- [ ] The pack contains a screener, unsent invitation, consent/participant information, moderator script and structured observation template.
- [ ] Each candidate job has explicit inclusion/exclusion criteria and the plan records how recruitment-channel bias and existing-product familiarity will be logged.
- [ ] The script elicits a concrete recent episode and an existing alternative before presenting any product concept or price question.
- [ ] The operations checklist specifies who may access identifiable records, what recording requires, how withdrawal works and what must be decided before data collection.
- [ ] The handoff prominently states that no person has been contacted and that recruitment, incentives, contact and recording execution need explicit authorization.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [VOC-001 What’s your experience with Blinkist?](https://www.reddit.com/r/nonfictionbookclub/comments/1lee2aq/whats_your_experience_with_blinkist/)
- [VOC-005 App to track when I need to revise for spaced repetition](https://www.reddit.com/r/studying/comments/1xbnr6c/app_to_track_when_i_need_to_revise_for_spaced/)
- [VOC-009 Podcasts to help switch off on commute home](https://www.reddit.com/r/podcasts/comments/1kxpm4d)
- [VOC-010 Passed today!](https://hr.reddit.com/r/cissp/comments/1pfvqtb/passed_today/?sort=top)
- [VOC-011 I’m looking for an app that uses spaced repetition, but not mainly through flashcards.](https://www.reddit.com/r/studytips/comments/1tugf7j/im_looking_for_an_app_that_uses_spaced_repetition/)
- [research/brainbuilder-workbench/templates/interview_guide.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/templates/interview_guide.md)

**Validation**

Dry-run the script internally without contacting participants; identify leading questions, questions that assume a commute, and fields that would collect unnecessary personal data.

**Risks and limits**

A convenience sample recruited from enthusiastic learners can overstate the problem. Hypothetical willingness to pay and an attractive concept reaction are not observed adoption or payment.

## BB RES 004

**Conduct and synthesize 10–12 behavioral discovery interviews**

**Priority:** P0 · **Status:** blocked · **Phase:** foundation · **Effort:** L

**Epic:** Customer discovery and pilot studies

**Canonical issue:** [#29 — \[P0\]\[BB-RES-004\] Conduct and synthesize 10–12 behavioral discovery interviews](https://github.com/castlemilk/brainbuilder/issues/29)

**Problem**

The proposed first audience and its recurring learning job need direct evidence before the pilot content, messaging and learning routine are narrowed.

**Scope**

- After authorization, recruit 10–12 eligible participants using the approved pack; track invited, screened, eligible, enrolled, completed and withdrawn counts without treating nonresponses as disinterest.
- Conduct interviews around actual learning behavior and, where participants choose to show them, recent materials, calendars, workarounds and payment evidence.
- Code each interview using the evidence taxonomy, preserving alternative explanations, satisfied workarounds, decompression preferences and cases where longer focused study works better.
- Produce a segment-by-job evidence matrix and an explicit recommendation for the audience decision in [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33).
- Treat approximately five independent participants demonstrating the same recurring job and workaround as a chosen focus heuristic, not a population-demand estimate.

**Acceptance criteria**

- [ ] The report accounts for every recruited participant and clearly reports achieved sample size, recruitment routes, dropouts and departures from the planned 10–12 interviews.
- [ ] Each completed interview has consent status, a pseudonymous record and at least one concrete behavior observation or an explicit finding that no recent example was available.
- [ ] The synthesis separates observed artifacts, participant self-report, researcher inference and hypothetical purchase intent.
- [ ] The audience recommendation includes recurring jobs, existing alternatives, contradictory cases and the limits of the small convenience sample.
- [ ] Identifiable material and recordings follow the approved access and retention plan; no participant quotes or identity are published without the applicable permission.

**Task dependencies**

- [BB-RES-003](https://github.com/castlemilk/brainbuilder/issues/13) — Prepare the discovery interview, screening and recruitment pack
- [BB-RES-002](https://github.com/castlemilk/brainbuilder/issues/12) — Audit the evidence taxonomy, provenance and denominators before expanding collection

**Additional prerequisites**

- Explicit authorization for participant recruitment, contact, any incentives, and any recording before execution

**Evidence**

- [VOC-005 App to track when I need to revise for spaced repetition](https://www.reddit.com/r/studying/comments/1xbnr6c/app_to_track_when_i_need_to_revise_for_spaced/)
- [VOC-006 My best ever streak, and it ends here](https://www.reddit.com/r/duolingo/comments/1wy9tbt/my_best_ever_streak_and_it_ends_here/)
- [VOC-009 Podcasts to help switch off on commute home](https://www.reddit.com/r/podcasts/comments/1kxpm4d)
- [VOC-010 Passed today!](https://hr.reddit.com/r/cissp/comments/1pfvqtb/passed_today/?sort=top)
- [VOC-011 I’m looking for an app that uses spaced repetition, but not mainly through flashcards.](https://www.reddit.com/r/studytips/comments/1tugf7j/im_looking_for_an_app_that_uses_spaced_repetition/)

**Validation**

Reconcile the study log with consent and interview records, then audit the recommendation against both supporting and contradictory cases rather than just the most enthusiastic interviews.

**Risks and limits**

Contact and recruitment are not authorized by the current Space/backlog request. Small qualitative samples support focus and problem discovery, not market size, conversion rates or statistical segment rankings.

## BB RES 005

**Observe eight task-based prototype sessions with the selected cohort**

**Priority:** P0 · **Status:** blocked · **Phase:** pilot · **Effort:** M

**Epic:** Customer discovery and pilot studies

**Canonical issue:** [#40 — \[P0\]\[BB-RES-005\] Observe eight task-based prototype sessions with the selected cohort](https://github.com/castlemilk/brainbuilder/issues/40)

**Problem**

The proposed finite session, mode choices, saved checkpoint and gentle return flows need observed usability evidence before implementation effort is treated as validated demand.

**Scope**

- Use the clickable prototype from [BB-DES-006](https://github.com/castlemilk/brainbuilder/issues/30) with eight eligible people from the selected cohort; declare simulated functionality before interpreting results.
- Observe starting a relevant session, shortening the available time, changing mode, recovering from an interruption and returning after a missed day.
- Check whether people distinguish exposure and private mental recall from checked answers, delayed recall and fresh application.
- Record independent task completion, assistance, errors, time, interpretation and context-specific objections; test listening and speaking preferences separately.
- Use an initial target of roughly six of eight independently starting and resuming as a chosen usability gate; revise it explicitly if the tasks or prototype fidelity change.

**Acceptance criteria**

- [ ] All eight planned sessions, or the documented achieved sample, have participant eligibility, consent, prototype version and a consistent task script recorded.
- [ ] A task-by-participant matrix distinguishes independent success, success with help, failure and untestable simulation for each flow.
- [ ] The report explicitly evaluates whether progress labels mislead anyone into believing listening or self-report proves checked mastery.
- [ ] Findings identify observed blockers and recommended design changes, with traceable evidence and contradictory preferences retained.
- [ ] The decision names whether the chosen gate was met, reports the small-sample limitations and makes no claim about retention, audio reliability or learning efficacy from a clickable prototype.

**Task dependencies**

- [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33) — Select one initial audience and a concrete learning job
- [BB-DES-006](https://github.com/castlemilk/brainbuilder/issues/30) — Build a clickable twelve-screen prototype and research task fixtures
- [BB-RES-003](https://github.com/castlemilk/brainbuilder/issues/13) — Prepare the discovery interview, screening and recruitment pack

**Additional prerequisites**

- Explicit authorization for participant recruitment/contact and the approved session data-handling plan

**Evidence**

- [VOC-003 Play card audio in sequence, like a playlist](https://forums.ankiweb.net/t/play-card-audio-in-sequence-like-a-playlist/66189)
- [VOC-004 AnKing Note type add on problems with audio for TTS](https://forums.ankiweb.net/t/anking-note-type-add-on-problems-with-audio-for-tts/68961)
- [VOC-005 App to track when I need to revise for spaced repetition](https://www.reddit.com/r/studying/comments/1xbnr6c/app_to_track_when_i_need_to_revise_for_spaced/)
- [VOC-006 My best ever streak, and it ends here](https://www.reddit.com/r/duolingo/comments/1wy9tbt/my_best_ever_streak_and_it_ends_here/)
- [VOC-011 I’m looking for an app that uses spaced repetition, but not mainly through flashcards.](https://www.reddit.com/r/studytips/comments/1tugf7j/im_looking_for_an_app_that_uses_spaced_repetition/)
- [docs/microlearning/Brainbuilder-Wireframe-Spec.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Wireframe-Spec.md)

**Validation**

Review recordings only where consented, otherwise structured notes; independently recheck the task outcome coding for ambiguous successes and moderator-assisted recoveries.

**Risks and limits**

Moderation, polished screens and repeated tasks can inflate apparent ease. Prototype audio controls cannot establish background playback, offline reliability or safety during real-world movement.

## BB RES 006

**Prepare the four-week pilot protocol, comparison and grading audit**

**Priority:** P0 · **Status:** ready · **Phase:** foundation · **Effort:** M

**Epic:** Customer discovery and pilot studies

**Canonical issue:** [#14 — \[P0\]\[BB-RES-006\] Prepare the four-week pilot protocol, comparison and grading audit](https://github.com/castlemilk/brainbuilder/issues/14)

**Problem**

A short-session product can increase completion without improving delayed understanding. The pilot needs a defined comparison, scoring process and missing-data plan before any outcomes are observed.

**Scope**

- Draft a four-week protocol targeting approximately 24 people in one selected cohort, with a freeze checklist that resolves cohort, materials, score forms, instrumentation and decisions before [BB-RES-007](https://github.com/castlemilk/brainbuilder/issues/64) starts.
- Separate natural-use feasibility measures from a bounded learning comparison: use matched topics, comparable study time, counterbalanced assignment/order, baseline knowledge checks and fresh delayed recall/application forms.
- Define explanation/restudy and recall/application conditions precisely; record actual time, hints, outside study, topic difficulty and carryover rather than assuming the two conditions are equivalent.
- Specify blinded human scoring on a prespecified sample spanning score bands plus all flagged/disputed responses; log scorer agreement, model/rubric versions and changes without using the model as its own gold standard.
- Predefine attrition and missing-follow-up handling, eligible/enrolled denominators and reporting of all departures; distinguish retention, checked learning and eventual paid continuation.

**Acceptance criteria**

- [ ] A versioned draft contains the study questions, recruitment target, schedule, matching/assignment method, exposure budget, assessment delay, scoring plan and explicit pre-launch freeze checklist.
- [ ] Illustrative gates such as 14 of 24 completing three substantive self-initiated sessions in week three and at least 18 of 24 completing follow-up are labeled chosen operating hypotheses, not external benchmarks.
- [ ] The analysis plan reports recruited/enrolled counts, available paired results and missing outcomes separately; missing learning scores are neither silently excluded from headline claims nor invented as zero knowledge.
- [ ] The grading plan states the audit sample-selection rule, blind-review process, disagreement handling and the stop/revise rule for materially misleading feedback.
- [ ] The draft states that this small feasibility pilot does not establish general efficacy, an optimal lesson duration, market conversion or safe learning during driving; no participant contact or automation is initiated.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [LEARN-001 Roediger and Karpicke (2006), Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)
- [LEARN-002 Cepeda, Vul, Rohrer, Wixted and Pashler (2008), Spacing Effects in Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2008.02209.x/)
- [LEARN-003 Butler (2010), Repeated testing produces superior transfer of learning relative to repeated studying](https://profiles.wustl.edu/en/publications/repeated-testing-produces-superior-transfer-of-learning-relative-/)
- [VOC-001 What’s your experience with Blinkist?](https://www.reddit.com/r/nonfictionbookclub/comments/1lee2aq/whats_your_experience_with_blinkist/)
- [VOC-010 Passed today!](https://hr.reddit.com/r/cissp/comments/1pfvqtb/passed_today/?sort=top)
- [docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md)

**Validation**

Walk through synthetic participant records including dropout, partial exposure, outside study, unequal time and grading disagreement; confirm that the prespecified reporting produces transparent denominators and appropriately limited conclusions.

**Risks and limits**

Baseline tests can themselves change learning, topic matching may be imperfect and the sample is small. The final cohort and content remain provisional until discovery and prototype results are incorporated and the protocol is frozen.

## BB RES 007

**Run the approximately 24-person four-week learning pilot and audit its outcomes**

**Priority:** P1 · **Status:** blocked · **Phase:** pilot · **Effort:** L

**Epic:** Customer discovery and pilot studies

**Canonical issue:** [#64 — \[P1\]\[BB-RES-007\] Run the approximately 24-person four-week learning pilot and audit its outcomes](https://github.com/castlemilk/brainbuilder/issues/64)

**Problem**

No Brainbuilder participant study has yet established reliable return behavior, delayed checked recall, fresh application or trustworthy automated feedback in the proposed learning routine.

**Scope**

- After authorization and release readiness, recruit the selected cohort, freeze the protocol and record baseline knowledge, expectations, consent and relevant prior study.
- Run week-one onboarding and scoring calibration, weeks-two/three natural use plus the bounded equal-time comparison, and week-four delayed recall/fresh-application follow-up.
- Observe interruptions, missed days and reminder exposure without treating prompted opens, passive listening or lesson completion as checked learning.
- Perform the planned blinded grading audit, investigate confident wrong feedback and preserve assessment/model/content versions when corrections are required.
- Produce an exploratory continue/revise/stop decision with paired learning results, usage, uncertainty, missingness, technical failures and consented attrition interviews; hand the eligible continuation cohort to [BB-GTM-007](https://github.com/castlemilk/brainbuilder/issues/65) only after its separate authorization gate.

**Acceptance criteria**

- [ ] The final dataset accounts for invited, eligible, enrolled, withdrawn and follow-up participants, actual study time, condition/topic assignment, hints and relevant outside study.
- [ ] Learning reporting shows baseline and delayed checked results, fresh-application results and available paired comparisons; complete-case findings are visibly accompanied by missing-follow-up counts and the prespecified sensitivity discussion.
- [ ] The scoring audit reports its actual coverage, scorer agreement, important error examples, disputes and any rubric/model changes; unvalidated scores do not appear as proven mastery.
- [ ] The chosen feasibility gates are assessed using declared denominators; deviations, replacements and technical failures are documented rather than removed to improve the headline.
- [ ] The recommendation separates usability, engagement, learning signals and payment evidence, labels the study exploratory and records any safety, privacy or feedback issue requiring a pause.

**Task dependencies**

- [BB-RES-006](https://github.com/castlemilk/brainbuilder/issues/14) — Prepare the four-week pilot protocol, comparison and grading audit
- [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33) — Select one initial audience and a concrete learning job
- [BB-RES-005](https://github.com/castlemilk/brainbuilder/issues/40) — Observe eight task-based prototype sessions with the selected cohort
- [BB-LRN-003](https://github.com/castlemilk/brainbuilder/issues/39) — Curate one reviewed algorithms path for the selected pilot job
- [BB-LRN-006](https://github.com/castlemilk/brainbuilder/issues/44) — Calibrate pilot answer rubrics and explanatory feedback
- [BB-LRN-007](https://github.com/castlemilk/brainbuilder/issues/57) — Author fresh application scenarios with explicit reasoning criteria
- [BB-ENG-014](https://github.com/castlemilk/brainbuilder/issues/54) — Instrument the pilot with minimal, consent-aware learning telemetry
- [BB-QA-008](https://github.com/castlemilk/brainbuilder/issues/63) — Create an evidence-based pilot readiness and rollback gate

**Additional prerequisites**

- Protocol freeze after cohort/material selection and instrumentation review
- Explicit authorization for recruitment, participant contact, incentives if any, recordings if any, and the study data-handling plan

**Evidence**

- [VOC-001 What’s your experience with Blinkist?](https://www.reddit.com/r/nonfictionbookclub/comments/1lee2aq/whats_your_experience_with_blinkist/)
- [VOC-005 App to track when I need to revise for spaced repetition](https://www.reddit.com/r/studying/comments/1xbnr6c/app_to_track_when_i_need_to_revise_for_spaced/)
- [VOC-006 My best ever streak, and it ends here](https://www.reddit.com/r/duolingo/comments/1wy9tbt/my_best_ever_streak_and_it_ends_here/)
- [VOC-010 Passed today!](https://hr.reddit.com/r/cissp/comments/1pfvqtb/passed_today/?sort=top)
- [VOC-011 I’m looking for an app that uses spaced repetition, but not mainly through flashcards.](https://www.reddit.com/r/studytips/comments/1tugf7j/im_looking_for_an_app_that_uses_spaced_repetition/)
- [LEARN-001 Roediger and Karpicke (2006), Test-Enhanced Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/)
- [LEARN-002 Cepeda, Vul, Rohrer, Wixted and Pashler (2008), Spacing Effects in Learning](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2008.02209.x/)
- [LEARN-003 Butler (2010), Repeated testing produces superior transfer of learning relative to repeated studying](https://profiles.wustl.edu/en/publications/repeated-testing-produces-superior-transfer-of-learning-relative-/)

**Validation**

Reconcile participant operations, instrumentation and assessment exports; inspect the paired-analysis inputs and manually audited scoring sample before accepting the pilot decision memo.

**Risks and limits**

The pilot is not powered to establish broad causal learning claims. Attrition, unequal exposure, outside study, assessment familiarity, grading drift and topic/order effects can produce misleading improvements. Recruitment and study execution remain unauthorized.

## BB RES 008

**Complete graphical browser validation of the existing research dashboard**

**Priority:** P1 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Research evidence and tooling

**Canonical issue:** [#22 — \[P1\]\[BB-RES-008\] Complete graphical browser validation of the existing research dashboard](https://github.com/castlemilk/brainbuilder/issues/22)

**Problem**

The existing offline HTML report passed structural checks, but its layout and interactions were not observed in a browser because the prior environment had neither a Playwright browser binary nor installed Chrome.

**Scope**

- Use an available supported browser or provision the environment's supported test runtime, recording any unresolved installation/access blocker honestly.
- Open the existing generated report at representative phone and desktop widths; exercise search, evidence/review/segment filters, section anchors and the collapsed query log.
- Check long source text, empty-filter states, keyboard focus, accessible labels, contrast and whether source links remain usable.
- Check that whole-corpus summary denominators remain visibly labeled when evidence cards are filtered and that planned queries cannot be mistaken for executed searches.
- Fix only observed report issues and retain screenshots plus browser/runtime versions as verification evidence.

**Acceptance criteria**

- [ ] At least one supported browser has actually rendered the report at phone and desktop widths, with dated screenshots and runtime details saved.
- [ ] Search, combined filters, no-result state, anchors and log expansion have observed outcomes; keyboard access to core controls is checked.
- [ ] Filtered cards and whole-corpus summaries are legible and explicitly distinguished, including unknown query totals and unreviewed records.
- [ ] Any observed defects are fixed and rechecked; if no browser can run, the task remains blocked and the verification report retains the graphical-validation gap.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [research/brainbuilder-workbench/VERIFICATION.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/VERIFICATION.md)
- [research/brainbuilder-workbench/reports/2026-11-07/report.html](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/reports/2026-11-07/report.html)
- [research/brainbuilder-workbench/README.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/README.md)

**Validation**

Use actual browser interaction and captured views, not an HTML parser alone; rerun existing structural checks only if the report generator changes.

**Risks and limits**

A browser dependency may still be unavailable. Rendering success at one width does not establish every-browser compatibility, and screenshots alone do not verify filter behavior.

## BB RES 009

**Add one authorized research-source adapter beyond manual import**

**Priority:** P2 · **Status:** later · **Phase:** expansion · **Effort:** L

**Epic:** Research evidence and tooling

**Canonical issue:** [#43 — \[P2\]\[BB-RES-009\] Add one authorized research-source adapter beyond manual import](https://github.com/castlemilk/brainbuilder/issues/43)

**Problem**

The completed workbench supports deliberate JSON/JSONL/CSV import and query logging, but has no live collector. A repeatable source feed is useful only after its research value, access method and provenance can be demonstrated.

**Scope**

- Choose one high-value source from the selected research questions and inspect its current authorized API or supported export; document permitted scope, access requirements and rate/retention constraints.
- Implement only the source-specific fetch/export transformation and checkpointing needed to feed the existing importer; do not replace the working SQLite or import pipeline.
- Preserve stable source IDs, shared origin, query/date, pagination or export scope, actual access level, unknown counts and raw-to-normalized provenance with minimal retained personal data.
- Import candidates as unreviewed until source checking occurs, support idempotent reruns and bounded retries, and avoid collecting credentials or full copyrighted posts into the dataset.
- If an authorized API/export is unavailable, keep the collection manual and document the gap; do not substitute an assumed scraper or schedule unattended collection.

**Acceptance criteria**

- [ ] An access note identifies the exact supported method, authorized account/scope where relevant, current provider documentation and any usage limits.
- [ ] A small permitted sample imports through the existing pipeline with traceable source IDs, correct content-access labels and no fabricated pagination or result universe.
- [ ] A repeat run produces no duplicate observations; checkpoint/retry behavior and a partial-access failure are demonstrated with a focused test fixture.
- [ ] Credentials and unnecessary personal identifiers are absent from exported evidence, logs and repository files; candidate rows remain unreviewed by default.
- [ ] A manual runbook explains invocation, review handoff, limits and how to stop; no schedule or additional source connector is activated.

**Task dependencies**

- [BB-RES-002](https://github.com/castlemilk/brainbuilder/issues/12) — Audit the evidence taxonomy, provenance and denominators before expanding collection
- [BB-GTM-001](https://github.com/castlemilk/brainbuilder/issues/33) — Select one initial audience and a concrete learning job

**Additional prerequisites**

- A selected source with an actually available authorized API or supported export and any required account access/permission

**Evidence**

- [research/brainbuilder-workbench/README.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/README.md)
- [research/brainbuilder-workbench/docs/research_protocol.md](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/docs/research_protocol.md)
- [research/brainbuilder-workbench/config/query_matrix.csv](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/config/query_matrix.csv)

**Validation**

Compare a permitted source response/export with normalized rows and query logs, rerun the same input, and exercise one partial result or rate-limit path before calling the adapter usable.

**Risks and limits**

Provider access and terms can change, and an apparently convenient feed may add little independent evidence. Collection volume is not a success metric; a permitted manual workflow is preferable when an adapter cannot meet provenance and access requirements.

## BB RES 010

**Define a manual research cadence and evidence-to-decision review**

**Priority:** P1 · **Status:** ready · **Phase:** foundation · **Effort:** S

**Epic:** Research evidence and tooling

**Canonical issue:** [#23 — \[P1\]\[BB-RES-010\] Define a manual research cadence and evidence-to-decision review](https://github.com/castlemilk/brainbuilder/issues/23)

**Problem**

The completed workbench contains six proposed hypotheses, 33 links, 27 performed-query records and 18 planned queries. Continuing research needs a bounded decision process so this material does not become an accumulating list of untested feature requests.

**Scope**

- Draft a weekly manual review of one decision-relevant question and a monthly competitor/pricing refresh when those facts affect an active decision; leave cadence and role assignments as proposals.
- Define a review packet containing new evidence, contradictory cases, source-access gaps, hypothesis changes, affected backlog items and one explicit continue/revise/stop decision.
- Specify a human-review handoff for important claims while preserving the current zero-human-review baseline until review actually occurs.
- Create a dated snapshot/change-log convention that separates planned queries from executed queries and capture freshness from source publication age.
- Set trigger conditions for later automation consideration; do not create a reminder, scheduled search, collector job or outbound notification.

**Acceptance criteria**

- [ ] A runbook proposes frequency, maximum review scope, inputs, output template and unassigned responsible roles without inventing commitments or dates.
- [ ] A decision-log template links evidence and counterevidence to hypotheses and backlog IDs, preserves rejected alternatives and states what would change the decision.
- [ ] A worked example using existing evidence shows how one hypothesis would be kept, revised or deferred without claiming new research was conducted.
- [ ] The runbook names the current access/review limitations, planned-query status and any adapter/runtime gaps; it explicitly records that no recurring execution has been scheduled.

**Task dependencies**

None recorded.

**Additional prerequisites**

None recorded beyond the task dependencies.

**Evidence**

- [research/brainbuilder-workbench/data/hypotheses.json](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/data/hypotheses.json)
- [research/brainbuilder-workbench/data/hypothesis_links.json](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/data/hypothesis_links.json)
- [research/brainbuilder-workbench/data/query_log.json](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/data/query_log.json)
- [research/brainbuilder-workbench/reports/search_queue.csv](https://github.com/castlemilk/brainbuilder/blob/planning/microlearning-research-backlog-2026-11-07/research/brainbuilder-workbench/reports/search_queue.csv)

**Validation**

Dry-run the review packet against the existing source-import or audio hypothesis and check that its proposed action cites both supporting observations and material limitations.

**Risks and limits**

A cadence can create activity without changing decisions. Proposed frequency is not a user-authorized schedule, and stale competitor pricing must be rechecked when used rather than merely relabeled fresh.
