# Brainbuilder delivery backlog

**67 proposed tasks across seven tracks**, prepared as a planning snapshot on 2026-11-07. The backlog connects the twelve-screen experience, reviewed learning content, research operations, engineering and release evidence.

**Linked planning snapshot.** All 67 tasks link to their canonical GitHub issues. GitHub issues hold live execution status after publication; the labels below remain the dated planning snapshot. Creating an issue does not start or complete the task.

The backlog preserves the warm tactile identity and prioritizes a useful start, recoverable interruption and manageable return. Exposure, private self-report, checked answers, delayed checks and application remain distinct. Source import and broader expansion retain their later decision gates.

## Tracks

| Track | Tasks | Ready | Blocked | Discovery | Later |
| --- | --- | --- | --- | --- | --- |
| [UX — Product experience and navigation](UX.md) | 8 | 1 | 6 | 0 | 1 |
| [LRN — Learning content and evidence](LRN.md) | 10 | 2 | 7 | 0 | 1 |
| [DES — Design identity accessibility and prototypes](DES.md) | 6 | 2 | 4 | 0 | 0 |
| [ENG — Engineering and platform delivery](ENG.md) | 17 | 2 | 12 | 2 | 1 |
| [QA — Quality and release evidence](QA.md) | 8 | 1 | 7 | 0 | 0 |
| [RES — Research operations and validation](RES.md) | 10 | 6 | 3 | 0 | 1 |
| [GTM — Positioning and commercial validation](GTM.md) | 8 | 5 | 2 | 0 | 1 |

## Status semantics

| Status | Count | Meaning |
| --- | --- | --- |
| ready | 19 | The scoped work has no recorded unmet task dependency or additional prerequisite. It is available to start; it is not started, assigned or completed by this label. |
| blocked | 41 | One or more listed task dependencies or additional prerequisites must be resolved before the scoped execution can proceed. |
| discovery | 2 | A defined question or feasibility decision needs investigation before committing to the resulting implementation or operation. |
| later | 5 | Work is intentionally deferred, generally until the core routine and its expansion decision are supported. Its dependencies and gates still apply. |

These are planning classifications. They do not authorize participant contact, study spending or other operations whose explicit prerequisites remain recorded. All acceptance criteria are unchecked, and this export assigns no owners or delivery dates.

## Priority and phase

| Priority | Count | Meaning |
| --- | --- | --- |
| P0 | 40 | First-priority foundations, correctness, preparation or evidence needed for the proposed routine. |
| P1 | 22 | Next-priority pilot capabilities, validation and operational learning. |
| P2 | 5 | Deferred expansion or optional capabilities requiring further evidence. |

| Phase | Count | Purpose |
| --- | --- | --- |
| foundation | 43 | Prepare and build the bounded core routine, contracts, content and validation tools. |
| pilot | 19 | Deliver the selected-cohort pilot and assess observed behavior, learning signals and operations. |
| expansion | 5 | Consider wider capabilities only after the stated evidence and decision gates. |

## Effort semantics

| Estimate | Count | Meaning |
| --- | --- | --- |
| S | 8 | A relatively small, bounded change, review or preparation task. |
| M | 44 | A coordinated piece of work across a flow, content set or several components. |
| L | 15 | A larger implementation, content effort or study with multiple stages. |

S, M and L are **relative planning estimates only**. They are not person-days, promises or a delivery schedule. Re-estimate after the relevant technical, content or study unknowns are resolved. Sample sizes and time budgets inside tasks remain proposed operating choices unless the task explicitly calls for a later decision.

## Selected ready priorities

These first-priority tasks are currently ready with no recorded task dependencies or additional prerequisites. They can be prepared in parallel where the work is independent. The list is a suggested starting set, not an assignment or deadline.

| Task | Effort | Why start here |
| --- | --- | --- |
| [BB-ENG-001 — Make lesson and course completion truthful on web and native](https://github.com/castlemilk/brainbuilder/issues/5) | S | Correct inflated completion on both clients before using progress as an outcome. |
| [BB-LRN-004 — Define honest exposure, self-report, checked and delayed-check semantics](https://github.com/castlemilk/brainbuilder/issues/10) | M | Agree what exposure, self-report and checked learning observations mean. |
| [BB-LRN-001 — Define stable concepts, outcomes and prerequisites for the existing material](https://github.com/castlemilk/brainbuilder/issues/9) | M | Identify the stable concepts and concrete outcomes the existing material supports. |
| [BB-RES-002 — Audit the evidence taxonomy, provenance and denominators before expanding collection](https://github.com/castlemilk/brainbuilder/issues/12) | M | Audit source provenance and denominators before expanding the evidence corpus. |
| [BB-RES-003 — Prepare the discovery interview, screening and recruitment pack](https://github.com/castlemilk/brainbuilder/issues/13) | M | Prepare a reviewable discovery and recruitment pack; participant contact remains separately gated. |
| [BB-UX-001 — Replace competing entry points with Today, Paths, Saved and Progress](https://github.com/castlemilk/brainbuilder/issues/15) | M | Give the product one clear navigation structure for the proposed routine. |
| [BB-DES-001 — Codify Brainbuilder's warm tactile visual system for the new screens](https://github.com/castlemilk/brainbuilder/issues/3) | S | Preserve the existing warm tactile identity across the new screens. |
| [BB-DES-004 — Define the accessibility acceptance and device review matrix](https://github.com/castlemilk/brainbuilder/issues/4) | S | Make accessibility and device expectations observable before implementation spreads. |
| [BB-ENG-003 — Make Go Connect and TypeScript contracts reproducibly generated](https://github.com/castlemilk/brainbuilder/issues/6) | M | Establish reproducible contracts before extending learning APIs. |
| [BB-QA-007 — Run existing browser flows and platform export checks in CI](https://github.com/castlemilk/brainbuilder/issues/11) | M | Establish evidence from existing browser flows and platform export checks. |

## Dependencies and additional prerequisites

Task dependencies link to the prerequisite issue in linked mode and to its repository section in draft mode. Additional prerequisites preserve decisions, access, release readiness or authorization that a dependency ID alone does not satisfy. Completing a prerequisite does not automatically complete or authorize its dependent task.

The integrated dependency graph is validated as acyclic. The JSON preserves a topological ordering for sequencing. The detailed pages retain every problem statement, scope item, acceptance criterion, dependency, additional prerequisite, evidence link, validation plan and risk from the integrated source.

## Source and maintenance

Reviewed implementation baseline: [abf70fa012356038ffa5a2c4092584d452724e5e](https://github.com/castlemilk/brainbuilder/tree/abf70fa012356038ffa5a2c4092584d452724e5e).

Planning Space: [Brainbuilder Space](https://chatgpt.com/space/page_6aeec28f5a7c8191894cd9f4ad93f3d1).

Machine-readable snapshot: [backlog.json](backlog.json).

After publication, use the canonical GitHub issues for live task updates and link decision or validation evidence there. Regenerate this snapshot when its source records change; exporting alone does not read live issue state or reconcile completed work.

**Source notes**

- Planning snapshot, not completed implementation.
- GitHub issues are the live task status after publication.
- S/M/L are relative planning estimates; no delivery dates or owners assigned.
