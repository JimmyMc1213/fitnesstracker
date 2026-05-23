# Story 1.10: Swap exercise mid-workout (FTI-21)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user during a session,
I want to swap one exercise for another,
so that I can adapt when equipment is unavailable.

## Acceptance Criteria

1. **Swap entry:** Swap option is accessible on each exercise card during an active lifting workout (not only in template edit).
2. **Search/browse:** Tapping Swap opens exercise search/browse (builtin catalog + user's custom exercises), matching the add-exercise UX.
3. **Single exercise:** Selecting a replacement swaps only that exercise row; other exercises are unchanged.
4. **Preserve logged work:** Other exercises and logged sets on the swapped row (weights, reps, done flags, set count, target string) stay intact.
5. **Inherit targets:** Swapped exercise keeps the original row's `target` and `sets` structure, only `name` / optional `label` change.
6. **Session only:** Swap mutates `state.workout.exercises` only; `workoutTemplates` and saved routines are not updated.

## Tasks / Subtasks

- [x] **Task 1: Exercise swap picker UI** (AC: 2)
  - [x] Create `ExerciseSwapSheet.tsx`: modal sheet with search input, custom + catalog lists (reuse `EXERCISE_DB` + `state.customExercises` filtering pattern from `ScreenWorkout`)
  - [x] Cancel closes without changes

- [x] **Task 2: Session swap action** (AC: 3, 4, 5, 6)
  - [x] Add `swapExerciseInSession(exerciseId, name, label?)` in `ScreenWorkout.tsx`: map exercises by id, preserve `id`, `target`, `sets`; update `name` / `label` only
  - [x] Clear or retarget active rest timer if swapping the exercise that owns it
  - [x] Do not call template/routine persistence helpers

- [x] **Task 3: Exercise card Swap control** (AC: 1)
  - [x] Add Swap button on each lifting-phase exercise card (hidden when `sessionEditMode` remove UI is active)
  - [x] Wire `swapExerciseId` state → open `ExerciseSwapSheet` for that row

- [x] **Task 4: Verification** (AC: all)
  - [x] Manual: swap one exercise mid-session, sets/targets/logged data preserved; template unchanged after session end
  - [x] Run `npm run build` (project quality gate)

## Dev Notes

### Primary implementation targets

- **New:** `src/fitness/ExerciseSwapSheet.tsx`
- **`src/fitness/screens/ScreenWorkout.tsx`**, lifting exercise cards ~947-1012; add-exercise search ~1197-1360 (mirror filter logic)

### Reference implementation

- **`OnboardingTemplateReview.tsx`**, swap preserves exercise `id`, replaces name via picker (template context; do not persist templates from mid-workout swap)
- **`ScreenWorkout.tsx` `addExerciseToSession`**, catalog + custom exercise lists

### Architecture & constraints

- **Session-only mutation**, only `setState` on `workout.exercises`; never `workoutTemplates`.
- **No new persisted fields**, swap is ephemeral session editing.
- **Quality gate:** `npm run build` only. No Vitest/Playwright.
- **Scope discipline:** Do not implement FTI-22+ (PR board, streaks, weekly summary).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.10]
- [Source: _bmad-output/project-context.md#Framework-Specific Rules]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-21/swap-exercise-mid-workout

## Senior Developer Review (AI)

- Build gate: `npm run build` PASS
- All ACs implemented; session swap preserves `target` and `sets`; templates untouched
- Rest timer retargets exercise name when swapping active row

## Review Follow-ups (AI)

- [x] F1 (LOW): Swap sheet copy clarifies session-only scope, addressed in sheet subtitle

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- `ExerciseSwapSheet` mirrors add-exercise catalog/custom search with bottom-sheet UX
- `swapExerciseInSession` updates name/label only; preserves id, target, sets, and logged set data
- Swap control on exercise card header; hidden during remove/edit mode

### File List

- src/fitness/ExerciseSwapSheet.tsx
- src/fitness/screens/ScreenWorkout.tsx
- _bmad-output/implementation-artifacts/fti-21-swap-exercise-mid-workout.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-21: FTI-21 mid-workout exercise swap, searchable picker sheet, session-only name/label replacement with preserved sets/targets
