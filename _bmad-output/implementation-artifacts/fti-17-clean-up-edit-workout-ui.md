# Story 1.7: Clean up edit workout UI (FTI-17)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user editing a routine,
I want labeled fields and consistent spacing,
so that edit mode feels polished and safe.

## Acceptance Criteria

1. **Labeled set/rep fields:** Target and set-count inputs in each exercise card have visible uppercase field labels (TARGET, SETS) using the shared label typography.
2. **Coach/routine note shows fully:** The routine “Notes / focus” textarea displays full content without awkward truncation (multi-line, resizable, adequate min height).
3. **No note/Progress rows in editor:** Remove `ExerciseNoteRow` (Add note) from `WorkoutRoutineEditor`; Progress is live-workout-only (FTI-19) and must not appear here.
4. **Drag handle tap target ≥ 44px:** Reorder grip in the routine editor meets minimum 44×44px touch target.
5. **Delete demoted + confirmed:** Delete routine is visually secondary (muted text/link style); confirmation dialog names the routine before delete executes.
6. **Save button matches design system:** Save routine uses lime green (`#34C759`) with dark text — same primary action pattern as workout Finish / Keep training.
7. **Consistent card spacing:** Exercise cards use 16px inner padding; 12px gap between cards in the sortable list.

## Tasks / Subtasks

- [x] **Task 1: Field labels & spacing** (AC: 1, 7)
  - [x] Add TARGET / SETS labels above target and set-count inputs using `labelStyle` from `workoutUiTokens.ts`
  - [x] Set exercise card `padding: 16`; `SortableExerciseList` `gap={12}`

- [x] **Task 2: Routine notes & remove note row** (AC: 2, 3)
  - [x] Expand focus textarea (rows ≥ 4, minHeight, vertical resize)
  - [x] Remove `ExerciseNoteRow`, `exerciseNotesByKey`, `onNotePress` from `WorkoutRoutineEditor`
  - [x] Remove editor-scoped note sheet wiring in `ScreenWorkout.tsx`

- [x] **Task 3: Drag handle, save, delete polish** (AC: 4, 5, 6)
  - [x] Add optional `tapSize` to `ExerciseDragHandle` (default 32); pass `tapSize={44}` in editor
  - [x] Save routine button: `#34C759` background, `#0a0a0a` text
  - [x] Demote delete to muted underlined text; confirm with routine name

- [x] **Task 4: Verification** (AC: all)
  - [x] Run `npm run build` (project quality gate)

## Dev Notes

### Primary target

- **`src/fitness/screens/WorkoutRoutineEditor.tsx`** — routine edit UI
- **`src/fitness/SortableExerciseList.tsx`** — optional `tapSize` on drag handle
- **`src/fitness/screens/ScreenWorkout.tsx`** — remove editor note sheet props
- **`src/fitness/workoutUiTokens.ts`** — reuse `labelStyle`; add `ACCENT_GREEN`, `CARD_PADDING`, `EDITOR_LIST_GAP` if helpful

### Scope discipline

- Do **not** change live workout lifting UI (`ScreenWorkout` lifting phase) — FTI-19 done
- Do **not** implement FTI-18 drag animation in this story
- Quality gate: **`npm run build` only** — no Vitest/Playwright/dev server

### Design tokens

| Element | Spec |
| --- | --- |
| Card padding | 16px |
| List gap | 12px |
| Field labels | 10px uppercase, 0.08em letter-spacing, 600 weight |
| Save primary | `#34C759` bg, `#0a0a0a` text |
| Delete secondary | ~35% white, 13px, underline, no filled red button |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-17-Clean-up-edit-workout-ui-FTI-17]
- [Source: _bmad-output/implementation-artifacts/fti-19-workout-screen-ui-cleanup.md]
- linear: FTI-17
- story_key: fti-17-clean-up-edit-workout-ui

## Dev Agent Record

### Agent Model Used

Composer (bmad-swarm)

### Debug Log References

### Completion Notes List

- Added TARGET / SETS / LABEL field labels with shared `labelStyle`; card padding 16px, list gap 12px.
- Expanded routine focus textarea (4 rows, minHeight 96, vertical resize, pre-wrap).
- Removed Add note row and editor note sheet wiring; exercise notes remain editable during live workouts only.
- Drag handle `tapSize={44}` in editor; save uses `ACCENT_GREEN`; delete demoted with named confirm dialog.
- Removed unused `ExerciseNoteRow` editor variant after AC 3.
- Quality gate: `npm run build` passed.

### File List

- src/fitness/screens/WorkoutRoutineEditor.tsx (modified)
- src/fitness/SortableExerciseList.tsx (modified)
- src/fitness/screens/ScreenWorkout.tsx (modified)
- src/fitness/workoutUiTokens.ts (modified)
- src/fitness/ExerciseNoteRow.tsx (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- _bmad-output/implementation-artifacts/fti-17-clean-up-edit-workout-ui.md (new)

## Senior Developer Review (AI)

- Removed dead `ExerciseNoteRow` editor variant after note row removed from routine editor (AC 3).
- Delete confirm now includes routine name for safer destructive action (AC 5).
- Quality gate: `npm run build` passed.

## Review Follow-ups (AI)

- [x] F1: Remove unused `ExerciseNoteRow` editor variant
- [x] F2: Named delete confirmation dialog
