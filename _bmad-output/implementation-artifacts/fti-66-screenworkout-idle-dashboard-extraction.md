# Story 10.1: ScreenWorkout idle dashboard extraction (FTI-66)

Status: ready-for-dev

## Story

As a developer,
I want the workout idle phase (routine list, preview, empty states) extracted from `ScreenWorkout.tsx`,
so further workout UX work does not grow the monolith.

## Acceptance Criteria

1. **Extract idle UI** → `WorkoutIdleDashboard.tsx` under `src/fitness/workout/`: Start empty workout CTA, routine cards, empty state, restore-default actions, `RoutinePreviewSheet` wiring.

2. **Callback props** for `startEmptyWorkout`, `startTemplateWorkout`, `setEditingRoutineId`, `setPreviewRoutineId`, and restore-template actions via `setState`.

3. **Zero behavior change**; all 136+ Vitest tests pass.

4. **Playwright workout smoke** (FTI-52) still passes.

5. **`ScreenWorkout.tsx` reduced** by meaningful line count (~150+ lines); no new UI surfaces.

## Tasks / Subtasks

- [ ] **Task 1: Create `WorkoutIdleDashboard.tsx`** (AC: 1, 2)
  - [ ] 1.1 Move idle-phase JSX from `ScreenWorkout.tsx` (~lines 582–749) into new module
  - [ ] 1.2 Accept props: `state`, `preWorkoutCoach`, `previewRoutineId`, `setPreviewRoutineId`, `setEditingRoutineId`, `startEmptyWorkout`, `startTemplateWorkout`, `setState`
  - [ ] 1.3 Keep `RoutinePreviewSheet` render inside dashboard or as sibling per cleanest split

- [ ] **Task 2: Wire extraction in `ScreenWorkout.tsx`** (AC: 1, 5)
  - [ ] 2.1 Replace idle branch body with `<WorkoutIdleDashboard ... />`
  - [ ] 2.2 Preserve `phase === "idle"` guard and editor/preview early returns above idle render

- [ ] **Task 3: Verification** (AC: 3, 4)
  - [ ] 3.1 `npm test`: 136+ passed
  - [ ] 3.2 `npm run test:e2e`: workout-session-smoke still passes
  - [ ] 3.3 Manual smoke: idle → preview routine → start → finish still works

## Dev Notes

- **Pattern:** Follow FTI-53 (`WorkoutSessionHeader`, `WorkoutExerciseCard`) — callback props, no behavior change
- **Do not** extract add-exercise search (FTI-67) or lifting phase in this story
- **Do not** change routine editor or history page flows
- **partial_impl:** idle branch at `ScreenWorkout.tsx` lines ~582–749
- **blocks:** FTI-67

## References

- linear: FTI-60
- story_key: fti-66-screenworkout-idle-dashboard-extraction
- epic: epic-fti-sprint-10
- depends_on: Sprint 9 complete (FTI-63–65)
- related: FTI-53 phase-1 decomposition

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
