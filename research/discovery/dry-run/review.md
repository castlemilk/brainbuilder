# Internal dry run and preparation review

**BB-RES-003 · v0.1 · 7 November 2026**

## What was tested

This was an **assistant-run internal walkthrough of eleven invented scenarios**, followed by structural checks of the files. It involved no real participants, interviews, outreach, recording, payments or external writes. The planned 45-minute duration has not been tested with people.

Fixtures are in [synthetic-fixtures.json](synthetic-fixtures.json). They are explicitly marked synthetic, have zero real participants, use SYN identifiers and are excluded from evidence import. They are not appended to the workbench database and must never be used as customer observations, evidence of demand or product-validation results.

The walkthrough applied the written screener, cohort definitions, moderator sequence, consent choices and retention/withdrawal rules. A one-off local Python check then evaluated the expected routing/consent outcomes, checked the relevant document structure and compared the source database checksum.

## Scenario results

| Case | Situation exercised | Walkthrough result |
| --- | --- | --- |
| SYN-01 | Employed interview candidate; 90-minute session; likes a book; declines audio/recontact | INT is the primary cohort, WORK is only secondary. Long-session satisfaction remains valid evidence. Notes only; no future contact. |
| SYN-02 | Current work need; confidential artifact; typed format | WORK remains eligible if the agreed format is supported. Generic description is sufficient; no employer, repository or screenshot is requested. |
| SYN-03 | Curiosity about a nontechnical topic; satisfied with books; prefers commute entertainment | CUR remains eligible. Record content mismatch and contrary evidence; do not manufacture a short-session or paid-product need. |
| SYN-04 | Employed certification-only learner | Outside the defined jobs for this wave. Employment does not convert an exam episode into current-work fluency. |
| SYN-05 | Age-scope question not answered | Stop screening without collecting a birth date, identity document or substantive learning story. |
| SYN-06 | Strong AI enthusiasm but no concrete recent learning attempt | Outside the recency criterion. Enthusiasm does not substitute for behavior or trigger a product pitch. |
| SYN-07 | Work and interview purposes remain ambiguous | Pending clarification. Do not force a primary job to fill a quota or count the same person twice. |
| SYN-08 | Direct report of researcher | Pause/stop for the power relationship; the default wave excludes it. No employer/manager identity is needed in analysis. |
| SYN-09 | Audio accepted but research notes declined | Do not start the substantive interview or audio. Optional recording does not replace participation/notes agreement. |
| SYN-10 | Audio consent withdrawn mid-session; prior audio deletion requested; early end | Stop and delete applicable audio, confirm whether notes may continue, record a partial session and concept not shown. No future contact without its separate opt-in. |
| SYN-11 | Withdrawal at day 21; audio already deleted; notes and internal quote still present | Locate the linked notes/quote and remove them under the proposed seven-day action target, by day 28. The contact key remains available through the withdrawal window; audio deletion alone is insufficient. |

All eleven routing/consent expectations passed the local scenario check. This confirms consistency of these written branches and fixtures; it is not a user test of the research script or a verification of any live form, meeting platform or storage service.

## Leading questions and unnecessary data corrected

| Risk identified | Correction in the final draft | Where |
| --- | --- | --- |
| The baseline opener assumed the person wanted to learn with only a few minutes available | Start with the most recent concrete attempt; ask actual time and setting afterward | Moderator M03–M06; screener S03 |
| Recruiting only people who struggle with time or dislike their current tools would preselect the answer | Neutral invitations explicitly welcome satisfying, long, unfinished and abandoned attempts; no pain or AI-interest screening score | Files 01–03 |
| Employment and overlapping motivations could inflate two cohorts | Classify the primary purpose of the index episode; record secondary tags without adding people | Protocol section 3; SYN-01/SYN-07 |
| A balanced four-per-cohort wave cannot meet the earlier five-within-one-cohort heuristic | Make the first-wave focus provisional; require a separate approved follow-up if five remains a gate | Protocol section 6; synthesis section 5 |
| Product reactions or hypothetical price answers could contaminate behavioral discovery | Actual episode, alternatives and historical spending precede the optional neutral concept; hypothetical paid-decision prompt is optional and explicitly tagged HYP | Moderator M03–M13 |
| A broad “consent to interview/recording” could bundle independent choices | Participation/notes, audio and future contact are separate; optional choices default to No | Information C01–C03/O01–O02; SYN-09 |
| “Show me proof” could collect confidential documents, receipts or account information | Description is enough; sharing is optional; no copy retained by default | Moderator M05/M11; operations section 5 |
| Exact identity and health data were unnecessary for the decision | Use adult yes/no, approximate timing, broad topic and format preference; exclude birth date, income, diagnosis, employer/client identity and account details | Screener and protocol section 5 |
| Deleting the identity key too early could make a promised withdrawal window unusable | Retain the link through day 30, delete by day 37 after timely requests; separately delete audio by day 14 | Information/operations retention tables; SYN-11 |
| A friendly ending could be treated as permission for ongoing contact | One optional future-study contact expires at day 30; no marketing, automatic enrollment or repeated unanswered reminders | Invitations and consent O02 |
| A polished rehearsal could be mistaken for eleven real interviews | Explicit synthetic metadata, separate rehearsal directory, no evidence import and repeated zero-participant label | This report and fixture metadata |

These are drafting corrections and scenario checks, not observations about how real participants respond.

## Structural verification

The local checks performed on 7 November 2026 established:

- Eleven uniquely identified synthetic cases parse as JSON and explicitly exclude evidence import.
- All eleven routing outcomes match the written scope; required notes agreement takes precedence over an optional audio choice.
- Actual episode M03 and alternatives M09 precede historical-spend M11, concept M12 and optional hypothetical prompt M13.
- Participant information contains separate C01, C02, C03, O01 and O02 choices.
- Participant information and operations both include the same proposed 14-day audio limit, 30-day window, day-37 contact-key limit, 90-day notes/consent period and 12-month findings review.
- The launch-decision table contains eleven decisions, each marked Unresolved.
- Local links resolve after this report is added.
- The original research database is unchanged.

Source database: brainbuilder-research-workbench/data/research.sqlite.

SHA-256 before and after preparation:
bd2827e20e269b4576bd7646f6be878656f5c6594a2cc9e1eaaaafc50155afd0

The checks do not establish compliance with any law, adequacy of a particular service's privacy controls, actual usability/timing of the script or the validity of later study conclusions.

## Prepared versus pending

**Prepared:** balanced protocol, inclusion/exclusion rules, neutral screener, unsent invitations, participant information/consent draft, moderator sequence, pseudonymous observation template, data/access/withdrawal operations, synthesis template and this internal rehearsal.

**Pending before participant execution:** named responsible people and contact, explicit route/contact authorization, geography and collection dates, incentive/no-incentive terms and any spend approval, restricted tools and access, final retention/backup/withdrawal commitments, final consent version/method, optional recording/processing decision, actual accommodations/contact limits and a decision on later cohort confirmation.

No participant data, consent, completed interview, price test or research result exists in this preparation pack. [The launch checklist](../09-launch-decisions.md) remains the execution gate.

