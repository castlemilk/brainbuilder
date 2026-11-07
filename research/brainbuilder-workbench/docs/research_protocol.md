# A practical evidence protocol

This protocol turns an exploratory web scan into a repeatable decision process. It does not turn convenience samples into a representative survey.

## The unit of analysis

The record is one concise source-backed observation. The demand-count unit is one captured conversation thread or known common origin, not a comment, vote, view, or person. Keep separate observations when a discussion contains materially different needs, but group them with the same `thread_url`.

Some sources require manual grouping. Hacker News comment IDs do not encode the parent thread; provide the parent URL when known. An app-store listing can contain many reviews; use a stable direct review link or the listing plus an explicit shared origin. The tool does not infer unique users or turn an app's rating total into demand for Brainbuilder.

## Before searching

Write the current decision in one sentence: “We will first serve [segment] during [moment] to achieve [outcome], unless [evidence] changes that choice.” Name the riskiest assumption. Pick search channels that could reveal both unmet need and satisfactory alternatives.

For each query, keep the exact wording, date, channel, returned scope if known, and access limitation. If the tool shows only ranked search snippets, record `snippet` and an unreviewed status until context is checked. Record a blocked source instead of inventing its contents or counts.

## Inclusion and exclusion

Prefer specific first-person behavior: the last time a person tried to learn, the source they used, the moment they stopped, the workaround they adopted, the money they paid or refused, and what happened later. A request without behavior can still be useful, but mark its limited strength.

Tag or exclude maker promotion, affiliate content, copied posts, context-free engagement bait, and sources that do not concern the target segment. A vendor page belongs under `competitor_claim`; a study belongs under `learning_research`. Neither counts as customer demand.

Seek counterevidence deliberately. Someone may prefer long-form study, enjoy summaries only for discovery, find flashcards sufficient, dislike voice interaction in public, or see no need to pay. These are product constraints, not inconvenient rows to discard.

## Record writing

- **Observation:** directly supported paraphrase, without causal or market-size claims.
- **Inference:** the interpretation and what would need testing.
- **Payment evidence:** concrete transaction, cancellation, budget, or explicit refusal; “not stated” is acceptable.
- **Negative evidence:** an alternative explanation, satisfied workaround, or reason a proposed feature may fail.
- **Provenance:** inspected content level, uncertain date, source role, excluded promotional replies, and important context.

Quotes are optional. Keep any excerpt brief, exact, necessary, and within applicable reuse limits. Do not copy entire posts, reviews, lessons, books, or papers into the database. Avoid unnecessary personal identifiers.

## Review labels

`verified` means a named reviewer checked the source against the observation at the stated access level. Set reviewer type to `assistant` for an AI source check and `human` only after a person actually reviews it. High-quality first-person detail is still a self-report. A primary abstract is still an abstract; record `abstract` instead of implying the entire paper was examined.

Use quality as an explicit judgment:

| Quality | Suggested use |
| --- | --- |
| High | Clear primary source, sufficient context for the narrow fact, limits recorded. |
| Medium | Direct but anonymous self-report or a context-limited source that supports the recorded observation. |
| Low | Snippet-only, ambiguous context, possible promotion, or weak behavioral detail. |
| Unclear | Source not yet assessed. |

This scale is not a weighting algorithm. Ten low-quality mentions do not automatically outweigh a contradictory observed behavior.

## Decision handoff

Use a source-backed hypothesis, not a popularity leaderboard. Specify the segment, context, outcome, competing explanation, proposed test, success condition, and rejection condition. Link evidence as supporting, contradicting, or contextual. Preserve contradictory sources when the hypothesis changes.

To test “continuous learning,” measure more than openings or completed lessons. Separate resuming after an interruption, recall without hints after a delay, applying the idea in a new example, and choosing to return or pay. A short study can identify usability failures and promising signals; it cannot establish broad efficacy or market size.

## Refresh and audit

Refresh vendor features when making a current comparison. Refresh customer-source context when a new decision relies on an old capture. Primary learning findings need applicability review, not automatic replacement merely because their publication date is old.

Import deliberate corrections with `--update`; previous evidence rows are retained. Export snapshots with the actual review date. Preserve unknown query counts, unreviewed sources, and access gaps in the report. Never describe the corpus as exhaustive unless the collection universe, pagination, exclusions, and reconciliation support that claim.
