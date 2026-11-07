# First implementation batch

7 November 2026 · Brainbuilder

Four foundation tasks now have concrete reviewable deliverables. The application change is in [PR #71](https://github.com/castlemilk/brainbuilder/pull/71); the three preparation tasks are in this documentation packet. None of these statements means that a branch has been merged, a release deployed or a participant study conducted.

## Delivered work

| Task | Deliverable | Validation |
| --- | --- | --- |
| [BB-ENG-001 / #5](https://github.com/castlemilk/brainbuilder/issues/5) | Shared versioned completion rule, web/native adapters, uncertain legacy history and accurate completion/reward transitions | PR #71: 74 tests, all workspace typechecks, shared/web builds and Go checks passed on its first implementation commit. A later review correction resolves the migration notice after reconfirmation; use the latest PR check for its final status. |
| [BB-LRN-001 / #9](https://github.com/castlemilk/brainbuilder/issues/9) | [Concept inventory and authoring contract](../learning/concept-map/README.md): 13 units, 41 lessons, 205 blocks, 56 candidate concepts, 126 prerequisite edges, 201 pinned source spans and two worked mappings | Strict pinned-baseline check passed; current completion-fix checkout passed with explicitly reported source-file divergence and 100 unchanged relocated spans. Four negative probes rejected broken identities, cycles and references. |
| [BB-LRN-004 / #10](https://github.com/castlemilk/brainbuilder/issues/10) | [Evidence semantics v1.0.0](../learning/evidence-contract/README.md), 50 synthetic observations, six traces and ten expected aggregation snapshots | Fixture checker and 27 focused consistency tests passed. |
| [BB-RES-003 / #13](https://github.com/castlemilk/brainbuilder/issues/13) | [Discovery preparation pack](../../research/discovery/README.md): protocol, screener, unsent invitations, consent draft, moderator guide, observations, operations and synthesis | Eleven synthetic walkthrough cases passed their routing/consent checks. Real participant count is zero. |

All 40 relative Markdown references across the three preparation directories resolved in the integrated checkout. These checks establish document/reference consistency, not subject approval or live product behavior.

## Product decisions made concrete

- A final-position lesson cannot complete skipped lessons. Only all required activities in the enrolled course version complete the course.
- Historical completion claims remain distinct from verified current activity. Lesson completion still does not establish mastery.
- Concepts have stable identities independent of their lesson, prompt, format or session. Missing prerequisites remain explicit.
- Exposure, private confidence, recognition, produced recall, delayed checks and application have distinct meanings. Hint/reveal context, assessment revisions, real intervals and denominators remain visible.
- Discovery starts with a real recent episode and existing alternatives. Work fluency, interview preparation and curiosity remain separate candidate jobs.
- The first discovery wave targets four people per job. Its audience choice is provisional; it cannot satisfy a five-person within-job confirmation rule without a separately authorized follow-up sample.

## New source findings in the backlog

The baseline backlog contained 67 tasks and 300 acceptance criteria. Three source findings add 12 criteria, bringing the tracked task total to **70 with 312 criteria**. The original repository export remains a dated planning snapshot; canonical issues hold live execution status.

| Added task | Finding | Next check |
| --- | --- | --- |
| [BB-LRN-011 / #72](https://github.com/castlemilk/brainbuilder/issues/72) | Big-O question and keyed answer are unrelated | Align outcome, question, choices and explanation; exercise both clients |
| [BB-LRN-012 / #73](https://github.com/castlemilk/brainbuilder/issues/73) | Bubble-sort copy/nonmutation contract conflicts with its in-place space claim | State the memory convention and align the shown implementation, quiz and lab |
| [BB-LRN-013 / #74](https://github.com/castlemilk/brainbuilder/issues/74) | Jump-search prose says backward scan while code advances forward | Match the worked indices, boundaries and explanations |

The exact source references and reproduction steps are in [review-gaps.md](../learning/concept-map/review-gaps.md). Resolve affected content before including it in a reviewed pilot path.

## Next work sequence

1. Review the completion change and foundation contracts, keeping their implementation and content-review limits explicit.
2. Correct the three tracked source defects before curating a pilot path.
3. Implement [the four-destination navigation](https://github.com/castlemilk/brainbuilder/issues/15), [shared evidence event contracts](https://github.com/castlemilk/brainbuilder/issues/25) and [coherent short-session variants](https://github.com/castlemilk/brainbuilder/issues/27) against the accepted meanings.
4. Establish [durable checkpoints](https://github.com/castlemilk/brainbuilder/issues/31) and [browser/platform CI](https://github.com/castlemilk/brainbuilder/issues/11) before claiming reliable on-the-go resume or native release behavior.
5. Resolve the discovery pack's named launch decisions before contacting participants. Use their observed needs to select the first cohort and reviewed content path.

No owner or deadline is assigned by this sequence. The current native enrollment is in memory; durable storage, offline synchronization, real audio and physical-device verification remain separate tasks. The candidate concepts and rubrics still require product/subject review. All discovery materials remain unsent.
