# Learning-evidence contract

**BB-LRN-004 · product semantics version 1.0.0 · 7 November 2026**

This deliverable defines what Brainbuilder may say about a learning observation. It separates exposure, private self-report, checked responses, delayed checks and application. It does not change the app, grade an answer, implement event storage or establish learning efficacy.

The [contract](contract-v1.0.0.md) is a versioned candidate for product review and the input to [BB-ENG-002](https://github.com/castlemilk/brainbuilder/issues/25). API types, persistence, authentication, synchronization and production metrics remain their own implementation tasks. [BB-LRN-004 / issue #10](https://github.com/castlemilk/brainbuilder/issues/10) is the task this directory addresses.

## Files

| File | Purpose |
| --- | --- |
| [contract-v1.0.0.md](contract-v1.0.0.md) | Product meanings, allowed claims, assessment states, assistance rules, timing and aggregation. |
| [worked-traces-v1.0.0.json](worked-traces-v1.0.0.json) | 50 synthetic observations, six worked traces and ten explicit expected aggregation snapshots. |
| [check_contract.py](check_contract.py) | Read-only, standard-library consistency checker for these examples. |
| [test_contract.py](test_contract.py) | Focused positive and negative checks for false credit, timing, revisions, assistance and denominators. |

**Every learner, response, judgment, timestamp and result in the fixtures is fictional.** The fixture field `origin: learner` models the learner-record branch of a rule; it is not a claim that the row came from a person. The top-level `fixture_only: true` marker is required. Do not import these records into real learner history. Prompt/rubric definitions are illustrative and unapproved, not a reviewed pilot course.

## Run the checks

Python 3.10+; no dependencies, network requests, credentials, database or installed application required. From the repository root:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 docs/learning/evidence-contract/check_contract.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s docs/learning/evidence-contract -p 'test_contract.py' -v
```

For the full derived exclusions and interval context, use:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 docs/learning/evidence-contract/check_contract.py --json
```

The checker reads the committed fixture and writes only to standard output/error. It rejects invalid source/prompt/rubric references, correctness fields on private/exposure records, invented elapsed intervals, omitted known practice and contradictory expected aggregates. It deduplicates delivery copies, preserves the first check opportunity, carries help across a private-to-typed switch and applies assessment revisions as of a stated cutoff. It is a semantic example checker, not a production validator or scoring engine.

### Recorded validation

On 7 November 2026, using Python 3.12.14:

- The fixture checker passed all 50 observations, six traces and ten explicitly authored report expectations.
- All **27 focused consistency tests passed**.
- The JSON-output mode reproduced the expected ratios and full exclusion/interval context.
- All eight relative documentation links resolved. Only this new documentation directory was written for BB-LRN-004; application behavior was not exercised or changed by this deliverable.

## Worked results

| Snapshot | Expected fixture result | Interpretation |
| --- | --- | --- |
| R01 exposure/private | No eligible checks; denominator 0 | Reading, listening and private ratings supply no checked-recall credit. |
| R02 primary responses | 1 correct / 3 eligible checks | One partial and one incorrect answer stay in the denominator. Twenty other observations and a duplicate delivery do not inflate it. |
| R03 → R04 → R05 manual review | No eligible checks → 0/1 → 1/1 | One answer receives successive, retained judgments. It is never three attempts. |
| R06 late grading | No eligible delayed checks | An answer submitted 270 seconds after its anchor remains immediate even if graded eight days later. |
| R07 delayed context | 3/4 | Actual intervals fit an explicitly chosen 7–9-day reporting window; one eligible record has intervening practice and another has unknown history. |
| R08 no recorded repractice | 1/2 | The narrower filter excludes that recorded practice and the unknown history. Outside practice remains unknown. |
| R09 explicit offsets | 1/1; 90,000 seconds | The actual offset-aware interval is 25 hours, not an assumed calendar day. |
| R10 fresh application | 1/2 | A repeated scenario, unknown prior exposure and a worked-example-assisted answer are excluded. |

These are counts of **primary check opportunities**, not counts of concepts, learners, permanent mastery or improvement. A zero denominator is not 0% knowledge. Full exclusion reasons and outcome splits are retained in the fixture expectations and checker output.

## Acceptance coverage and handoff

| BB-LRN-004 acceptance criterion | Evidence here |
| --- | --- |
| Separate read/listened exposure, private self-report, checked response, delayed response and application | Contract sections 2–5; traces T01–T06. |
| Private thinking/listen-only completion have no objective correctness field or checked credit | Contract section 2; R01; rejection tests for extra correctness/assessment fields. |
| Explicit hint, reveal, worked example, skip, uncertainty and partial states | Contract sections 3–4; T02 and T03, including manual/disputed/pending states. |
| Delayed observations preserve real time, prompt version and intervening practice | Contract section 5; T04/T05; exact elapsed/offset/history checks. |
| Eligible numerators/denominators exclude demo, duplicate and ineligible assistance/private records | Contract section 6; all ten report expectations, including retries and inherited assistance. |

This establishes a reviewable semantic contract and internally consistent examples. Product adoption of the meanings, subject-matter curation, rubric calibration, the pilot's measurement protocol and implemented runtime behavior remain separate review/implementation gates. No external issue, PR, Page or learner data is modified by these files or commands.
