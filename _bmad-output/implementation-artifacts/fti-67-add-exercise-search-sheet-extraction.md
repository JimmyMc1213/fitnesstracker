# Story 10.2: Add-exercise search sheet extraction (FTI-67)

Status: done

## Story

As a developer,
I want the inline add-exercise search panel extracted from the lifting phase of `ScreenWorkout.tsx`,
so exercise catalog search is isolated and testable alongside `ExerciseSwapSheet`.

## Acceptance Criteria

1. **Extract add-exercise panel** → `AddExerciseSearchSheet.tsx` under `src/fitness/workout/`: custom exercise draft form, catalog + custom filter lists, open/close state driven by parent.

2. **Preserve filtering logic** for `EXERCISE_DB` + `state.customExercises` (same behavior as today).

3. **Callbacks:** `addExerciseToSession`, `saveDraftCustomAndAddToSession`, close/reset handlers remain wired from `ScreenWorkout`.

4. **Zero behavior change**; Playwright workout smoke still passes.

5. **`ScreenWorkout.tsx` reduced** further; `ExerciseSwapSheet` unchanged unless import cleanup needed.

## Tasks / Subtasks

- [x] **Task 1: Create `AddExerciseSearchSheet.tsx`** (AC: 1, 2)
  - [x] 1.1 Move add-exercise panel JSX from `ScreenWorkout.tsx` into new module
  - [x] 1.2 Internal query + draft state; filtering via `EXERCISE_DB` + `customExercises` props
  - [x] 1.3 Callback props: `onAddExercise`, `onSaveCustomAndAdd`, `onClose`

- [x] **Task 2: Wire extraction in `ScreenWorkout.tsx`** (AC: 3, 5)
  - [x] 2.1 Replace inline panel with `<AddExerciseSearchSheet ... />` when `showExSearch`
  - [x] 2.2 Remove unused local state (`exQuery`, `draftExName`, `draftExLabel`) and filter derivations

- [x] **Task 3: Verification** (AC: 4)
  - [x] 3.1 `npm test`: 136+ passed
  - [x] 3.2 `npm run build` passes
  - [x] 3.3 Workout smoke e2e passes

## Dev Notes

- **Pattern:** Follow `ExerciseSwapSheet` filtering; inline card UI (not bottom sheet)
- **Do not** change `ExerciseSwapSheet` behavior
- **partial_impl:** lifting-phase add-exercise block in `ScreenWorkout.tsx`
- **blocks:** FTI-68

## References

- linear: FTI-61
- story_key: fti-67-add-exercise-search-sheet-extraction
- epic: epic-fti-sprint-10
- depends_on: FTI-66

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Extracted add-exercise search panel into `AddExerciseSearchSheet.tsx` following `ExerciseSwapSheet` filtering pattern
- Internal query/draft state; parent drives open/close via `showExSearch`
- ScreenWorkout.tsx reduced further; 139 tests + build pass

### File List

- `src/fitness/workout/AddExerciseSearchSheet.tsx` (new)
- `src/fitness/screens/ScreenWorkout.tsx` (modified)
- `_bmad-output/implementation-artifacts/fti-67-add-exercise-search-sheet-extraction.md` (new)
