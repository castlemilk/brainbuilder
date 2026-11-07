# Truthful course activity completion

Implements [BB-ENG-001 / issue #5](https://github.com/castlemilk/brainbuilder/issues/5). Scope: shared completion rules, web and native adapters, local web storage migration and regression coverage. This does not introduce the learning-evidence ledger or a server reward system.

## Behavior

The Algorithms & Data Structures curriculum has 41 required lessons in version `1`. Completing a lesson adds only that valid lesson ID. Course completion requires every required lesson, in any order. The capstone has no special power to complete skipped lessons. The button consistently says **Complete lesson**; after a capstone completed early, **Continue course** returns to an outstanding lesson.

`Course.version` identifies the completion requirements. Authors must bump it when required lessons or their completion conditions change. Enrollment schema `1` also snapshots the required IDs. The reader checks both version and ID-set equality, so changing requirements without bumping the version cannot silently count old claims. Reordering the same set does not invalidate activity.

`completeEnrollmentLesson` is a pure transition shared by both clients. Unknown IDs cannot enroll, add a completion or produce a reward transition. Saved status and the number of arbitrary keys are never proof of completion. Only literal `true` values for current required lesson IDs count. An empty course is never complete.

On web, a first completion awards 14 XP, or 50 XP when that action completes the last outstanding requirement. The latter replaces the normal lesson award, preserving the existing reward amounts while correcting their trigger. Repeated actions award nothing. The event adapter advances its current enrollment reference before scheduling React state and rewards; no reward is performed inside a React updater that can be replayed. Native currently has no course-completion XP mutation; its activity transition is idempotent.

## Migration policy

The prior web format stored only `status` and `completedLessons`. It recorded no course version or assessment attempts. The old capstone handler could set all lesson flags, so its all-complete summaries cannot distinguish actual completion from skipped lessons.

| Stored record | Current activity | Preserved history / visible explanation |
| --- | --- | --- |
| Current schema, matching course/version/required set | Retain valid required `true` claims; derive status | Existing history is retained; obsolete IDs cannot contribute |
| Legacy partial record with active status | Retain valid partial activity labels | Original claimed IDs and status are archived with `legacy-partial` and unknown version; UI explicitly says no saved assessment evidence |
| Legacy record claiming complete, or claiming every current required lesson | Start current confirmed activity at zero | Preserve original IDs/status with `legacy-completion-unverified`; UI explains possible skipped lessons and asks the learner to confirm this version lesson by lesson |
| Different course/version/required set or unsupported record schema | Start current activity at zero | Preserve claims and original version with a migration reason and visible notice |
| Malformed record with no usable lesson map | No restored enrollment | No completion, reward or assessment is inferred |

Migration is repeatable: loading the normalized record again does not append the same history or reset newly confirmed activity. Historical claims remain available in the stored enrollment even after reconfirmation. Other course entries in the web storage map are preserved. No historical answers, timestamps, quiz scores or attempts are fabricated, and existing XP is not reconstructed or corrected from the old summary.

Native enrollment currently lasts for the component session; it does not persist the old format. Both clients use the same new enrollment type and completion transition. Durable native storage and cross-device reconciliation remain separate backlog work.

## Meaning of progress

These flags represent the application's activity-completion condition. They do **not** prove recall, delayed retention, transfer or mastery. Existing quiz gates and lab callbacks remain in place. The separate learning-evidence contract must govern any future checked-evidence claim; a certificate label here is the prototype's completion display, not a new credentialing system.

## Verification

The regression suite covers capstone-first behavior, forward/reverse/rotated ordering, duplicate actions, obsolete IDs, non-boolean claims, malformed storage, empty curricula, mismatched versions and required sets, and repeatable legacy migration. Web interaction tests verify one reward for repeated actions under Strict Mode, the first lesson completing the course when it is the last outstanding requirement, and visible uncertain-history handling. Native interaction tests verify capstone-first counts and all 41 lessons completed in reverse order.

The existing browser journey scenarios now expect two completed lessons after the first lesson and capstone, with no course-complete or certificate claim. Their old 24-lesson native assertions were updated to the current 41-lesson curriculum. Updating those scenarios is not a claim that browsers or physical devices were exercised.

A local dependency-free smoke run against the actual shared TypeScript module passed 85 assertions across all six permutations of a three-lesson fixture, repeated actions, migration, unknown IDs and changed versions. The full workspace tests, type checks and builds are run by the pull request's Application CI. Consult its exact-commit check results for validation status. The local offline dependency install was unavailable because the package cache was incomplete.
