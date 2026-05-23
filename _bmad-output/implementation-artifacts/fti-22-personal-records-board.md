# Story 1.11: Personal records board (FTI-22)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see all my PRs in one place,
so that I can celebrate progress across exercises.

## Acceptance Criteria

1. **Progress tab entry:** PR board is accessible from the Progress tab (dedicated section with exercise list).
2. **Exercise coverage:** Lists all exercises with logged session history (`exerciseSessionHistoryByKey`).
3. **Summary row:** Each exercise shows best weight, best reps, and date of the overall best set.
4. **Expand history:** Tap a row to expand full PR/session history for that exercise (newest first).
5. **Auto-detection:** PR detection reuses existing `buildWorkoutSessionSummary` / `personalBestsAfterSession` logic, no duplicate PR rules.
6. **Workout summary highlight:** New PRs on the finished workout summary screen are visually emphasized (badge + accent border).

## Tasks / Subtasks

- [x] **Task 1: PR board data layer** (AC: 2, 3, 4, 5)
  - [x] Create `personalRecordsBoard.ts`: aggregate rows from `exerciseSessionHistoryByKey`, resolve display names from `workoutHistory`, compute PR flags per session snapshot
  - [x] Export `buildPersonalRecordsBoard()` returning sorted rows with expandable history entries

- [x] **Task 2: PR board UI on Progress tab** (AC: 1, 3, 4)
  - [x] Create `PersonalRecordsSection.tsx`: collapsible exercise rows, empty state when no history
  - [x] Wire into `ScreenProgress.tsx` below Workouts section

- [x] **Task 3: Workout summary PR highlight** (AC: 6)
  - [x] Enhance `WorkoutSummarySheet.tsx` PR rows with accent border and session PR count when `summary.prs.length > 0`

- [x] **Task 4: Verification** (AC: all)
  - [x] Run `npm run build` (project quality gate)

## Dev Notes

### Primary implementation targets

- **New:** `src/fitness/personalRecordsBoard.ts`, `src/fitness/PersonalRecordsSection.tsx`
- **`src/fitness/screens/ScreenProgress.tsx`**, add SectionLabel + board
- **`src/fitness/WorkoutSummarySheet.tsx`**, PR highlight styling

### Existing PR infrastructure (reuse, do not duplicate)

- **`workoutSummary.ts`**, `buildWorkoutSessionSummary`, `personalBestsAfterSession`, `sessionBestForExercise`, `normalizeExerciseKey`
- **`exerciseSessionHistory.ts`**, per-exercise session snapshots keyed by `exerciseNoteKey(name, label)`
- **`finishWorkout.ts`**, updates bests + history on finish; summary already includes `prs[]`

### Data model notes

- History keys: `exerciseNoteKey` (lowercase name + optional label). Resolve display casing from `workoutHistory` exercises when available.
- Weights stored in **lbs** internally; format with `formatSetWeight` + `weightUnitLabel` for display.
- **No new persisted fields**, board reads existing `exerciseSessionHistoryByKey` and `workoutHistory`.

### Architecture & constraints

- **Quality gate:** `npm run build` only. No Vitest/Playwright.
- **Scope discipline:** Do not implement FTI-23 (streak) or FTI-24 (weekly summary).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.11]
- [Source: _bmad-output/project-context.md#Framework-Specific Rules]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-22/personal-records-board

## Senior Developer Review (AI)

- Build gate: `npm run build` PASS
- All ACs implemented; PR detection mirrors `buildWorkoutSessionSummary` rules in history annotation
- Component file named `PersonalRecordsSection.tsx` to avoid TS casing clash with `personalRecordsBoard.ts`

## Review Follow-ups (AI)

- [x] F1 (LOW): Resolved macOS case-insensitive import clash by renaming UI component file

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Added PR board data aggregation and expandable Progress tab section
- Enhanced workout summary PR rows with green accent border and "N new" badge

### File List

- `src/fitness/personalRecordsBoard.ts` (new)
- `src/fitness/PersonalRecordsSection.tsx` (new)
- `src/fitness/screens/ScreenProgress.tsx` (modified)
- `src/fitness/WorkoutSummarySheet.tsx` (modified)
- `_bmad-output/implementation-artifacts/fti-22-personal-records-board.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-05-21: FTI-22: Personal records board on Progress tab; workout summary PR highlight
