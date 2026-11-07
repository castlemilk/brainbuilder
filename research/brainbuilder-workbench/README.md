# Brainbuilder research workbench

A runnable, local evidence ledger for deciding which on-the-go learning problems Brainbuilder should solve. It uses **Python 3.10+ and SQLite from the standard library**, with no package installation or API key required for the CLI.

The workbench makes no network requests. A researcher uses approved search tools or permitted source exports, checks the source, and imports the observations. Search links help repeat discovery; they do not imply any searches have run. There is no scheduler, scraper, paid service, or outreach integration.

## Start here

Open a terminal in this directory:

```bash
python3 bb_research.py init
python3 bb_research.py ingest data/evidence_seed.json
python3 bb_research.py status --as-of 2026-11-07
python3 bb_research.py export --as-of 2026-11-07 --out reports/2026-11-07
```

The seed file is the source-backed research snapshot assembled for this project. If you are using the workbench without that snapshot, import your own evidence file instead. The tool never inserts example customer evidence into the production database.

Open `reports/2026-11-07/report.html` in a browser. It has text search and evidence-kind, review-state, and segment filters. It works offline. Summary tables describe the complete captured corpus; filtering cards does not silently change their denominator.

The database is `data/research.sqlite`. Use a different path by putting `--db` before the command:

```bash
python3 bb_research.py --db data/another-study.sqlite init
```

## Public snapshot and new research

This repository intentionally includes the reviewed public-source seed, its SQLite database, raw discovery provenance and dated reports. The local `.gitignore` allows those named files and ignores new files under `data/` and `reports/` until they are deliberately reviewed and allowlisted. Runtime caches and SQLite transaction sidecars are excluded.

Keep participant identifiers, interview responses, consent material and private study exports in a separate location such as `private/`. Use a separate database for that work:

```bash
python3 bb_research.py --db private/study.sqlite init
```

Do not ingest private study material into the tracked `data/research.sqlite` or overwrite the tracked public exports with it: ignore rules do not protect modifications to already tracked files. Notebook execution outputs have been cleared for publication; the analysis cells and public snapshot remain available to rerun.

Product direction, the behavior specification and generated boards live in [the microlearning documentation](../../docs/microlearning/Brainbuilder-Review-and-Microlearning-Plan.md) and [wireframe gallery](../../docs/microlearning/wireframes/README.md).

## What the tool does

- Imports JSON arrays, JSONL, and CSV with strict field and date validation.
- Keeps source observations separate from interpretations, workarounds, payment evidence, counterevidence, and proposed product decisions.
- Normalizes tracked URLs and groups Reddit comments by their parent thread, including localized Reddit hosts. Generic sources can supply an explicit `thread_url`.
- Counts distinct captured customer threads. Competitor claims, learning research, founder hypotheses, rejected records, and multiple comments in a thread cannot inflate those counts.
- Separates assistant source checks, human source checks, unreviewed records, snippets, abstracts, and full-text access.
- Records known search coverage while leaving unrecorded counts unknown.
- Links supporting, contradicting, or contextual evidence to hypotheses without converting a mention into validated demand.
- Flags old captures, preserves evidence revisions, and exports a searchable HTML report plus portable JSON and spreadsheet-friendly CSV.

## What the counts mean

**Captured thread counts are a description of this exploratory corpus, not estimates of the market.** A discussion thread is not a unique person. Multiple sources can come from the same person, commercial campaign, or community; use `thread_url` to group known crossposts and mention residual dependence in provenance notes.

The main customer-thread count includes captured, non-rejected customer observations, including those still awaiting a source check. The adjacent **source-checked** count includes only `review_status=verified`. The **human-checked** count additionally requires `reviewer_type=human`. An assistant check is never displayed as a human check.

`verified` means the recorded source was inspected to the stated access depth. It does **not** verify the truth of an anonymous account, representative demand, willingness to pay, causal learning improvement, or product-market fit. A verified snippet remains a snippet. Review quality is a research judgment, not a probability or market-size score.

Problem rows count a thread once within each problem. Their totals can overlap and must not be summed as distinct demand. The tool uses one dominant `problem` label per observation; use a controlled vocabulary when you want comparable themes and preserve the original wording in `observation`.

Freshness is measured from `retrieved_at`, not publication age. A fresh capture of an old study is not a new study. A recent product page is still a vendor claim. Change the 90-day default when appropriate:

```bash
python3 bb_research.py export --as-of 2026-11-07 --stale-days 30 --out reports/current
```

## Evidence import contract

Supply a JSON array, `{"records": [...]}`, one JSON object per JSONL line, or CSV with a header row. Unknown field names cause a useful error rather than silently dropping information. UTF-8 and UTF-8 with a BOM are supported.

| Field | Required | Format / meaning |
| --- | --- | --- |
| `source_url` | Yes | Absolute HTTP(S) link actually inspected; no credentials in the URL. |
| `title` | Yes | Human-readable source title. |
| `evidence_kind` | Yes | `customer_signal`, `competitor_claim`, `learning_research`, or `founder_hypothesis`. |
| `source_type` | Yes | `reddit`, `forum`, `app_review`, `official_product`, `research_paper`, `interview`, `support_ticket`, or `other`. |
| `retrieved_at` | Yes | Actual capture date in `YYYY-MM-DD`. |
| `observation` | Yes | What the source directly says or demonstrates, in a concise paraphrase. |
| `evidence_id` | No | Stable own ID, or automatically derived from source URL, kind, and observation. |
| `thread_url` | No | The parent conversation or known common origin; otherwise source URL grouping is used. |
| `published_at` | No | `YYYY-MM-DD` only when that complete date is known; null or empty otherwise. Keep partial dates in provenance notes. |
| `content_access` | No | `full_text`, `abstract`, `snippet`, `metadata`, or `not_reviewed` (default). |
| `provenance_notes` | No | Access method, date uncertainty, excerpt limits, promotional context, exclusions, and important caveats. |
| `segment` | No | Who is describing the problem; avoid demographic guesses. |
| `problem` | No | One consistent problem code or label. |
| `job_to_be_done` | No | The learner's context and desired outcome. |
| `inference` | No | Your interpretation or a testable product implication, separate from the observation. |
| `quote` | No | A short exact excerpt, only if verified and permitted. Prefer paraphrase. |
| `workaround` | No | A concrete behavior or tool already used. |
| `willingness_to_pay` | No | What was paid, cancelled, budgeted, or explicitly declined; unknown when not stated. |
| `negative_evidence` | No | Contradictions, acceptable alternatives, failed attempts, or reasons not to build. |
| `evidence_quality` | No | `high`, `medium`, `low`, or `unclear` (default); relative source quality only. |
| `review_status` | No | `unreviewed` (default), `verified`, or `rejected`. |
| `reviewer_type` | No | `human`, `assistant`, or `unknown` (default). |
| `reviewed_by` | Conditional | Reviewer name or role. Required for verified rows. |
| `reviewed_at` | Conditional | `YYYY-MM-DD`; required for verified rows. |
| `tags` | No | JSON list or semicolon-separated text. |
| `hypothesis_ids` | No | JSON list or semicolon-separated existing hypothesis IDs. Import hypotheses first. |

Verified rows require a reviewer type, reviewer name/role, review date, and an access level other than `not_reviewed`. Leave missing information unknown. The importer does not invent dates or upgrade review status.

### Duplicate and update behavior

Re-importing the same file is idempotent. Canonical source URL, evidence kind, and normalized observation define the content fingerprint. Rewording an observation creates a new evidence row unless you intentionally reuse its ID; this still cannot turn multiple observations in one thread into multiple independent threads.

Matching records with changed metadata are reported as `existing_needs_update` and left unchanged. Reusing an explicit ID with different content fails unless you intentionally use `--update`:

```bash
python3 bb_research.py ingest data/rechecked-evidence.json --update
```

An evidence update keeps the ID and records the previous row in `evidence_revisions`. Every input batch is validated before writing; a failed import rolls back the batch. Do not use `--update` simply to suppress an error without reviewing the difference.

## Hypotheses and search coverage

Import hypotheses from JSON/JSONL/CSV. Required fields are `hypothesis_id` and `statement`. Optional fields: `segment`, `job_to_be_done`, `riskiest_assumption`, `status`, `decision_rule`, `next_test`, `notes`. Status is `proposed`, `testing`, `supported`, `rejected`, or `paused`; it never changes automatically because of mention counts.

```bash
python3 bb_research.py import-hypotheses data/hypotheses.json
python3 bb_research.py link EVIDENCE_ID HYPOTHESIS_ID --relation supports
python3 bb_research.py import-links data/hypothesis_links.json
```

Link-file rows contain `evidence_id`, `hypothesis_id`, and `relationship` (`supports`, `contradicts`, `context`, or `unclassified`). An import through `hypothesis_ids` initially creates unclassified links. Set relationships deliberately; a source can challenge one hypothesis while informing another.

Record searches actually performed:

```bash
python3 bb_research.py log-query \
  --performed-at 2026-11-07 \
  --channel "public web / forum" \
  --query 'your exact search string' \
  --notes 'Counts were not recorded; ranked search results only.' \
  --reviewer 'researcher role'
```

Add `--results-returned`, `--results-reviewed`, and `--included-threads` only when those counts were recorded for that search. Omission means unknown, never zero. The counts are nested: reviewed cannot exceed returned; included cannot exceed reviewed when both are known. Included-thread counts across searches can overlap, so they are not summed as a market denominator.

Query import fields are `query_id` (optional), `performed_at`, `channel`, `query`, `search_url`, `status` (`completed`, `planned`, or `blocked`), `results_returned`, `results_reviewed`, `included_threads`, `notes`, and `reviewer`. A planned query cannot contain performed-work counts. IDs are deterministic for a query/channel/date combination; provide explicit IDs for separate same-day runs that must remain distinct.

```bash
python3 bb_research.py import-queries data/query_log.json
python3 bb_research.py queries --out reports/search_queue.csv
```

The second command expands `config/query_matrix.csv` into a repeatable search queue with ordinary search links. **It executes zero searches.** Search results and ranking are not stable, so each real run needs its own date and scope notes.

## Notebook

Open `Research_explorer.ipynb` in an existing Jupyter environment. Jupyter is optional; the analysis cells use only Python's standard library. The notebook opens SQLite read-only, keeps evidence kinds separate, examines source-check coverage and problem counts, surfaces counterevidence, and links to the generated HTML report.

Set its `AS_OF` date when repeating the study. It does not retrieve sources, schedule work, change hypotheses, or write evidence to the database.

## Outputs and portability

| File | Purpose |
| --- | --- |
| `data/research.sqlite` | Complete working database, including evidence revisions and relationships. |
| `report.html` | Offline searchable review interface. |
| `evidence.json` | Exact strings in the supported re-import format. |
| `evidence.csv` | Spreadsheet-friendly view, including canonical URLs and freshness flags. |
| `problem_counts.csv` | Distinct-thread counts with review and access denominators. |
| `hypotheses.json` / `.csv` | Proposed or tested decision statements. |
| `hypothesis_links.json` / `.csv` | Support, contradiction, context, and unclassified links. |
| `query_log.json` / `.csv` | Actual or planned search coverage with unknown values preserved. |
| `evidence_revisions.json` | Prior versions of evidence changed through the CLI. |
| `summary.json` | Report date, freshness threshold, counts, and interpretation limits. |

CSV text that could execute as a spreadsheet formula receives a leading apostrophe. JSON preserves the exact raw text and is the preferred round-trip format. The analytical CSV includes derived columns and is intentionally not a direct evidence-import file.

To rebuild a fresh database from exports, import hypotheses, evidence, links, and query logs in that order. Preserve the original SQLite file when you need the revision audit trail; it is exported for inspection, not automatically restored by the import CLI.

## Repeatable research loop

1. Choose one segment and one decision that the evidence could change.
2. Run matched positive and negative queries from the queue. Log scope and inaccessible sources.
3. Read source context; separate first-person usage from vendor or maker promotion.
4. Import concise observations, pay evidence and counterevidence with actual access and dates.
5. Group duplicate threads, crossposts and known common origins. Review ambiguous records.
6. Link evidence to a hypothesis and choose the smallest behavioral test that could reject it.
7. Run an authorized interview or product experiment; record behavior and delayed outcomes.
8. Export a dated snapshot. Keep new results separate from the original assumptions.

See `docs/research_protocol.md`, `templates/interview_guide.md`, and `templates/experiment_template.md` for concrete operating instructions.

## Verification and extension points

Run the meaningful integrity checks:

```bash
python3 -m unittest discover -s tests -v
```

They cover duplicate/thread handling, wrong denominators, review provenance, atomic imports, revision guards, invalid dates, unknown search counts, link integrity, input formats, and HTML/CSV escaping. Synthetic records exist only inside tests and their temporary directories.

Future authorized collection adapters should output this import contract, retaining original source IDs, links, capture time, access depth, and rate-limit/access notes. Add provider-specific paging and a checkpoint to each adapter; leave inaccessible data marked as missing. Do not silently replace failed APIs with scraping, copy full copyrighted source text, or turn search-result counts into demand estimates.

Schema version is 1. The CLI refuses databases from a different schema version rather than guessing a migration. Back up the SQLite file before deliberate updates or future schema migrations.
