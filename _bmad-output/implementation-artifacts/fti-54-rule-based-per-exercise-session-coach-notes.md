# Story 6.3: Rule-based per-exercise session coach notes (FTI-54)

Status: done

## Story

As a user starting a workout,
I want a short coaching note per exercise based on my last session,
so in-session guidance feels personal without waiting on an API.

## Acceptance Criteria

1. **Pure note builder:** Given `workoutHistory` and a `WorkoutExercise`, when `getExerciseSessionNote(ctx, exercise)` runs, then it returns deterministic copy from `exerciseSessionNotes.ts` (re-exported via `coachEngine.ts`) using the same history source as `workoutAutofill`.

2. **Progressive overload vs generic:** Given prior logged sets for the exercise, when the note is built, then copy references last session weights/reps and progression guidance. Given no history, when the note is built, then a generic rep-range tip is returned.

3. **Exercise card surface:** Given an active lifting session with session notes, when `WorkoutExerciseCard` renders, then each exercise shows its note with blue coach styling (`COACH_BLUE_MUTED` + Coach label).

4. **Session-scoped persistence:** Given notes are generated once at template start, empty start, add-exercise, or swap, when the session ends (`finishWorkout` / `endSessionToIdle`), then `sessionCoachNotesByExerciseId` is cleared. Field is not persisted across sessions.

5. **Colocated Vitest:** Given `exerciseSessionNotes.test.ts`, when `npm test` runs, then note builder branches and `coachEngine` re-export are covered.

6. **E2E gate:** Given Playwright workout smoke, when `npm run test:e2e` runs, then all specs pass.

## Tasks / Subtasks

- [x] **Task 1: Pure module**: `src/fitness/exerciseSessionNotes.ts` with `getExerciseSessionNote`, `buildSessionCoachNoteForExercise`, `buildSessionCoachNotesByExerciseId`; re-export from `coachEngine.ts`.
- [x] **Task 2: WorkoutState**: Add optional `sessionCoachNotesByExerciseId?: Record<string, string>` to `types.ts`; strip on idle in `buildAppState.ts`, `finishWorkout.ts`.
- [x] **Task 3: ScreenWorkout wiring**: Generate notes in `startTemplateWorkout`, `startEmptyWorkout`, `addExerciseToSession`, `saveDraftCustomAndAddToSession`, `swapExerciseInSession`; clear on `endSessionToIdle`; remove key on `removeExerciseFromSession`.
- [x] **Task 4: WorkoutExerciseCard**: `sessionCoachNote` prop with blue coach styling.
- [x] **Task 5: Tests**: `exerciseSessionNotes.test.ts` (5 tests); `npm test` 99 passed.
- [x] **Task 6: E2E**: `npm run test:e2e` 3 passed.

## Dev Agent Record

### Implementation Plan

- Submodule `exerciseSessionNotes.ts` shares `findLastLoggedExerciseSets` with autofill, no parallel history scan.
- Notes keyed by exercise instance `id` so mid-session adds/swaps get fresh copy without regenerating existing rows.
- Session-only field on `WorkoutState`; cleared whenever session returns to idle.

### Debug Log

- None.

### Completion Notes

- Rule-based per-exercise coach notes ship on `WorkoutExerciseCard` with session-scoped storage.
- Progressive overload copy when history exists; generic tip when none.
- Vitest + Playwright gates green.

## File List

- `src/fitness/exerciseSessionNotes.ts` (new)
- `src/fitness/exerciseSessionNotes.test.ts` (new)
- `src/fitness/coachEngine.ts`
- `src/fitness/types.ts`
- `src/fitness/screens/ScreenWorkout.tsx`
- `src/fitness/workout/WorkoutExerciseCard.tsx`
- `src/fitness/finishWorkout.ts`
- `src/fitness/buildAppState.ts`

## Change Log

- 2026-05-23: FTI-54: rule-based per-exercise session coach notes (session-scoped, history-driven).
