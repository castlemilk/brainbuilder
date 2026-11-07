# Brainbuilder: continuous microlearning wireframe specification

Version 0.1 · 7 November 2026 · Proposal for review

## Intent

Make a short available moment sufficient to begin or resume useful learning. A lesson belongs to an ongoing goal, and a later visit helps the learner recall or apply it. The three imagegen boards illustrate twelve screens; this document defines the behavior behind them. All displayed learner numbers are examples.

The visual baseline comes from the existing [Brainbuilder design context](https://github.com/castlemilk/brainbuilder/blob/abf70fa012356038ffa5a2c4092584d452724e5e/.impeccable.md): warm tactile paper, strong type, restrained teal/ember/violet, mature playful feedback, and concrete learning interactions.

## Information architecture

| Destination | Primary purpose | Secondary functions |
|---|---|---|
| Today | Start or resume the next useful session | Adjust time, mode and reminder rhythm |
| Paths | Pursue a specific learning outcome | Discover/search topics; enter relevant labs; pause a goal |
| Saved | Keep material for a chosen purpose | Downloaded packs; saved lessons; later selected-source import |
| Progress | Understand observed learning and next practice | Activity history, optional motivational features, evidence detail |

Remove persistent global navigation from a focused lesson. Keep an accessible save-and-leave action. Opening a source, transcript or help panel must preserve the current activity state.

## Visual rules

Use warm paper backgrounds, warm dark ink and a dark teal primary action. Ember marks a relevant emphasis; violet marks a secondary learning context. Color always has a corresponding text/icon distinction. Continue the editorial heading style and clean sans-serif body; keep small instructional copy comfortably readable.

The boards explore thin ink outlines, modest offset shadows and gentle diagrammatic illustrations. In implementation, prioritize contrast, type scaling, clear focus, screen-reader labels, large touch areas, reduced motion and predictable controls. Decorative texture must not interfere with content. This is a concept specification; accessibility and native-device validation still need to be performed.

Use one dominant action per screen. Remember the previous time and mode so a returning learner sees a ready session. The visible selectors demonstrate options; they must not become mandatory setup every time. Treat time estimates as approximate and let users leave early without failure.

## Board 01 — Learn in the gaps

### 01. Choose an outcome

Offer concrete goals such as explaining technical ideas, understanding a topic, or learning from selected saved material. Let the user try a lesson before requiring an account. Optional setup should fit on one short screen and should be changeable later.

**Action:** Try my first lesson.  
**State:** Selected outcome and approximate time budget.  
**Behavior:** Choose a ready, reviewed lesson appropriate to the goal. If the requested topic has no adequate material, say so and offer an available path. Do not generate unsupported content merely to fill an empty state.

### 02. Today

Lead with a session tied to the learner's current goal. Show one sentence about the outcome and a short agenda, for example one new idea and two quick checks. Provide an obvious continuation card when a session was interrupted.

**Action:** Start 5-minute session, preselected using remembered preferences.  
**Adjustments:** Time and Read/Listen/Practice.  
**Behavior:** A shorter budget can substitute a coherent review; it should not cut a concept off mid-explanation. An unavailable mode must explain why and offer a suitable alternative.

### 03. One useful idea

Teach one concept with a concise explanation and an appropriate visual or interaction. Connect the explanation to its source or reviewed course material. Show a finite sequence and a clear next action.

**Action:** Try a quick check.  
**Secondary:** Save and leave; inspect source.  
**Behavior:** Opening the source keeps the checkpoint. A reading/listening event records exposure only. A small explanatory example must remain truthful after being shortened.

### 04. Recall before reveal

Ask a short question before showing the explanation. The learner can think privately, type, or choose “Not sure yet.” Voice can be an explicitly enabled future option.

**Action:** Reveal explanation for private practice; submit/check for typed practice.  
**Behavior:** Selecting private mode hides the text-entry affordance in the implemented UI. After reveal, let the learner self-report “I had it,” “Partly,” or “Need another pass.” Store these as self-reports. A private answer cannot be classified as objectively correct. Revealing an answer, requesting a hint or choosing a worked example must be recorded as assistance.

## Board 02 — A lesson that travels with you

### 05. Ready before you leave

Show a small pack with a total estimated duration and clear contents. Let the learner change or remove the pack. “Downloaded” must refer to verified local availability of the promised audio, transcript and any required activity data.

**Action:** Start listening.  
**States:** Not downloaded, downloading, ready, partially available, failed, removed.  
**Behavior:** Keep incomplete downloads visibly incomplete. Expose storage/removal controls. For an activity that requires a connection, explain that requirement before it begins.

### 06. Listen with room to think

Use a proper audio player with replay, skip, playback speed, transcript and visible progress. Listen-only mode remains useful by itself. Optional recall pauses should be short and easy to defer.

**Action:** Play/pause.  
**Behavior:** Validate background playback, lock-screen controls, interruption recovery and headphones on real devices. Audio completion must not mark a response correct or advance a checked-recall state. Store playback position separately from learning evidence.

### 07. Resume without friction

Show where the user stopped and a one-sentence recap. Offer the original activity and a shorter coherent restart. Keep all completed work visible and saved.

**Action:** Resume lesson.  
**Secondary:** Make this a 2-minute session; start from beginning.  
**Behavior:** Resume at a meaningful activity boundary or saved audio position. Preserve answer drafts where appropriate. An offline sync retry must not duplicate an answer or reward. A reset action must make its consequence clear.

### 08. Return after a break

Welcome the user back with one small useful refresh. Let them change their focus, pause a goal or edit a voluntary reminder rhythm. Show a manageable next step rather than a punitive backlog.

**Action:** Start gently.  
**Behavior:** The review planner caps the suggested load and reorders remaining work transparently. Preserve optional celebrations. A skipped day should not erase learning history. Reminder permission belongs after demonstrated value, with frequency and quiet-time controls.

## Board 03 — Build knowledge that stays

### 09. Follow a useful path

Use a clear learning outcome and an understandable sequence. Pair each small concept with an optional deeper activity when useful. A label such as “Revisit tomorrow” is scheduling guidance, not proof that memory expires at that time.

**Action:** Continue this path.  
**Behavior:** Preserve prerequisites while allowing sensible navigation. “Reached the last lesson,” “completed these lessons,” and “checked understanding of these concepts” are distinct states. Keep the existing labs accessible from relevant concepts.

### 10. Learn from selected material

This is a later extension. The learner intentionally selects an article, PDF excerpt or note, identifies what they want to understand, and previews the proposed lesson sequence.

**Action:** Preview 3 small lessons.  
**States:** Source available, processing, insufficient content, unsupported format, extraction failed, source changed.  
**Behavior:** Preserve source identity and version; show what material supports each explanation/question; allow correction and removal. Expose gaps when the source does not support an answer. Importing a document is not evidence that the user has read or learned it. Do not silently collect other saved material.

### 11. Try a new situation

Ask an application question whose context differs from the original example. It should assess a useful idea and its limits. For algorithms, an answer rubric might consider data order, update frequency and preprocessing costs.

**Action:** Compare my reasoning.  
**Secondary:** Show a worked example; view lesson source.  
**Behavior:** Feedback should identify what the answer established and what needs work. Keep “uncertain” available when automatic assessment cannot make a reliable judgment. During the pilot, manually audit a sample of graded answers. Avoid accepting keyword matches as sufficient understanding.

### 12. See what you can recall

Display observations with their context: checked answers, self-reported practice, elapsed time and remaining opportunities. A useful small metric could be “4 of 6 concepts recalled after 7 days,” with an expandable explanation of what was checked and when.

**Action:** Review one idea.  
**Behavior:** Count only eligible checked responses in this metric. Show the denominator, dates, assistance and any relevant intervening reviews. Provide “No delayed checks yet” for new learners. Keep self-reported practice in a separate section. Sample data in the visual must never be shipped as genuine user history.

## Session and evidence model

The existing Go/Connect and shared model can be extended with these conceptual records. Names below are proposals, not implemented interfaces:

| Record | Minimum useful information |
|---|---|
| Learning goal | Chosen outcome, subject, reason, optional target date, active/paused state |
| Concept | Stable identifier, prerequisites, intended outcome, reviewed material/source version |
| Activity | Concept, format, estimated time, attention requirements, prompt and rubric version |
| Session | Chosen budget, selected activities, mode, current checkpoint, start/end/interruption times |
| Exposure event | Material/version, read/listened, position or completion, timestamp |
| Practice attempt | Prompt/version, submitted or private, response, assistance, self-report or assessed outcome |
| Review plan | Next suggested revisit, scheduling rationale, workload cap, learner overrides |
| Sync event | Stable event ID, local/server timestamps, conflict/retry state, acknowledgement |

Use stable event IDs so a retry does not create another observation. Rebuilding a progress view should produce the same result from the same recorded events. Keep a lesson's educational completion separate from a decorative reward counter.

## Prototype evaluation

Ask a participant to start learning with little time, switch to audio, stop unexpectedly, resume, and return after several missed days. Observe the action they choose; avoid teaching the controls during the task. Ask them to explain the progress labels in their own words.

Evaluate one subject with reviewed content before expanding the catalog. Define success around a meaningful first action, recoverable interruptions, repeat use, appropriate delayed checks and a later application task. A static wireframe can reveal navigation and comprehension issues, but cannot establish habit formation, learning efficacy or willingness to pay.

## Visual-delivery notes

Three concept boards were generated using the requested built-in imagegen tool and are delivered in the conversation. The exact prompts are preserved in `Brainbuilder-Image-Prompts.md`. Text and interaction details in this specification take precedence over illustrative shorthand in the raster images. The first implementation pass should validate responsive layouts, accessibility, content accuracy and native playback behavior.
