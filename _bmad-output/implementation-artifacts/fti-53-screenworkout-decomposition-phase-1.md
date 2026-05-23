# Story 6.2: ScreenWorkout decomposition phase 1 (FTI-53)

Status: done

## Story

As a developer,
I want session header, lifting exercise card, and finish flow extracted from `ScreenWorkout.tsx`,
so coach-note wiring does not grow the monolith further.

## Acceptance Criteria

1. **Extract session header** — timer, edit mode toggle, Finish workout button, title input, metadata → `WorkoutSessionHeader.tsx`
2. **Extract lifting exercise card** — large `renderItem` body in `SortableExerciseList` → `WorkoutExerciseCard.tsx`
3. **Extract finish confirm sheet** — `EmptyFinishConfirmSheet` → `EmptyFinishConfirmSheet.tsx` (finish/summary trigger wiring stays in `ScreenWorkout`)
4. **Zero behavior change** — all 83 Vitest tests pass
5. **Playwright workout smoke** (FTI-52) still passes
6. **`ScreenWorkout.tsx` reduced** by meaningful line count; no new UI surfaces

## Tasks / Subtasks

- [x] **Task 1: Create `src/fitness/workout/` modules** (AC: 1–3)
  - [x] 1.1 `WorkoutSessionHeader.tsx`
  - [x] 1.2 `WorkoutExerciseCard.tsx`
  - [x] 1.3 `EmptyFinishConfirmSheet.tsx`

- [x] **Task 2: Wire extractions in `ScreenWorkout.tsx`** (AC: 1–3, 6)
  - [x] 2.1 Replace inline header block with `WorkoutSessionHeader`
  - [x] 2.2 Replace `renderItem` body with `WorkoutExerciseCard`
  - [x] 2.3 Import `EmptyFinishConfirmSheet` from workout module

- [x] **Task 3: Verification** (AC: 4, 5)
  - [x] 3.1 `npm test` — 83/83 passed
  - [x] 3.2 `npm run test:e2e` — 3/3 passed (including workout-session-smoke)

## Dev Agent Record

### Agent Model Used

Composer (bmad-swarm epic-6)

### Completion Notes List

- Extracted three focused modules under `src/fitness/workout/` with callback props — no behavior change
- `ScreenWorkout.tsx` reduced from 1428 → 1033 lines (−395 lines, −28%)
- `formatElapsed` co-located with session header; `formatExercisePr` co-located with exercise card
- Finish/summary trigger wiring (`requestFinishWorkout`, `endSessionToIdle`, `showEmptyFinishConfirm` state) remains in `ScreenWorkout`

### File List

- `src/fitness/workout/WorkoutSessionHeader.tsx` (new)
- `src/fitness/workout/WorkoutExerciseCard.tsx` (new)
- `src/fitness/workout/EmptyFinishConfirmSheet.tsx` (new)
- `src/fitness/screens/ScreenWorkout.tsx` (modified)

### Change Log

- 2026-05-23: FTI-53 ScreenWorkout decomposition phase 1

## Senior Developer Review (AI)

No findings — pure extraction refactor, all quality gates green.
