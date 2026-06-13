---
name: RN-8-03 Workout calendar + personal records board
epic: RN-8
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.03: Workout calendar + personal records board

Status: ready-for-dev

## Story

**As a** user  
**I want** to see my training week grid and personal records on Progress  
**So that** I can review consistency and strength progress alongside body weight

## Acceptance Criteria

1. **Given** PWA `personalRecordsBoard.ts`, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged and Vitest passes
2. **Given** `workoutHistory` from RN-6, **When** Progress renders, **Then** `WorkoutCalendarCard` shows Mon–Sun cells with completed workout indicators
3. **Given** completed sessions with logged sets, **When** PR section renders, **Then** `PersonalRecordsSection` lists exercises with best weight/reps and history expand
4. **Given** no workout history, **When** sections render, **Then** empty states match PWA tone (not placeholder copy)
5. **Given** Progress tab, **When** scrolled, **Then** sections appear below weight card with labels "Workouts" and "Personal records"

## Tasks / Subtasks

- [ ] Extract `personalRecordsBoard.ts` to `packages/core/src/progress/` + test (AC: 1)
  - [ ] `buildPersonalRecordsBoard`, `parseExerciseNoteKey`, row/history types
  - [ ] Export from core; PWA re-export
- [ ] Port `WorkoutCalendarCard` (AC: 2, 5)
  - [ ] Use `packages/core` `trainingCalendar` + `workoutHistory` slice
  - [ ] Week grid: workout done dots per day (PWA `WorkoutCalendarCard.tsx`)
  - [ ] `testID="progress-workout-calendar"`
- [ ] Port `PersonalRecordsSection` (AC: 3–4)
  - [ ] Compute rows via `buildPersonalRecordsBoard(state.workoutHistory)`
  - [ ] Expandable history rows; unit-aware weight display
  - [ ] `testID="progress-pr-board"`
- [ ] Integrate into `ProgressScreen` below weight card (AC: 5)

## Dev Notes

### Dependencies

**Requires RN-8-01** (Progress screen shell). Uses RN-6 `workoutHistory` shape — no workout editor changes.

### PWA parity reference

```249:253:apps/pwa/src/fitness/screens/ScreenProgress.tsx
<SectionLabel>Workouts</SectionLabel>
<WorkoutCalendarCard state={state} />
<SectionLabel>Personal records</SectionLabel>
<PersonalRecordsSection state={state} />
```

Core already has `packages/core/src/training/trainingCalendar.ts`.

### Anti-patterns

- **Do not** re-implement PR logic in mobile — use extracted `personalRecordsBoard`
- **Do not** add workout session UI (RN-6 done)
- **Do not** add avg calories / goal range here (RN-8-04)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # personalRecordsBoard.test.ts
npm run typecheck --workspace=@newyouai/mobile
```

Seed: fitness slice with `workoutHistory` entries from RN-6 Maestro seed pattern.

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-03
- PWA: `WorkoutCalendarCard.tsx`, `PersonalRecordsSection.tsx`, `personalRecordsBoard.ts`
- Core: `training/trainingCalendar.ts`
