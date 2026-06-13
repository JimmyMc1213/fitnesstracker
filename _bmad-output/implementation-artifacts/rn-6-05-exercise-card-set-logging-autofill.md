---
name: RN-6-05 Exercise card set logging autofill
epic: RN-6
story: 05
status: done
swarm_order: 5
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.05: Exercise card + set logging + autofill

Status: done

## Story

**As a** user in a lifting session  
**I want** to see exercise cards with set rows, previous-session hints, and complete toggles  
**So that** I can log sets like the PWA workout loop

## Acceptance Criteria

1. **Given** active session, **When** exercise list renders, **Then** each exercise shows name, target prescription, and set rows
2. **Given** prior history for exercise, **When** card renders, **Then** "Last session: {w}×{r}" placeholder copy appears (from `findLastLoggedExerciseSets`)
3. **Given** a set row, **When** I tap complete/check, **Then** `buildSetCompletionPatch` updates `done` and persists
4. **Given** incomplete set values, **When** complete tapped, **Then** `canCompleteSet` rules match PWA (weight/reps required per rules)
5. **Given** add exercise affordance, **When** tapped, **Then** search sheet opens (minimal stub OK; full RN-6-08)

## Tasks / Subtasks

- [x] Port `WorkoutExerciseCard` → `apps/mobile/components/workout/WorkoutExerciseCard.tsx` (AC: 1–4)
- [x] Port `WorkoutSetField` — display w/r, tap targets for keypad (RN-6-06 wires input) (AC: 1)
- [x] Wire autofill display from `@newyouai/core` `findLastLoggedExerciseSets` + history (AC: 2)
- [x] Set complete toggle using `buildSetCompletionPatch` / `canCompleteSet` (AC: 3–4)
- [ ] Optional: `WorkoutWarmupGroups` if low cost (AC: 1) — deferred
- [x] Add exercise button → `RoutineExerciseSearchSheet` stub route (AC: 5)
- [x] `testID`s: `workout-set-{exerciseId}-{index}-done`, `workout-add-exercise`

## Dev Notes

### Previous story intelligence (RN-6-04)

- Exercise list is draggable flat list — card component must work inside `DraggableFlatList` renderItem

### PWA parity reference

```13:32:apps/pwa/src/fitness/workoutAutofill.ts
export function findLastLoggedExerciseSets(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label?: string,
): WorkoutSet[] | null {
```

PWA: `workout/WorkoutExerciseCard.tsx`, `workout/WorkoutSetField.tsx`, `workoutPreviousSets.ts`.

### Anti-patterns

- **Do not** implement keypad UI here (RN-6-06) — set fields can show static values until keypad story
- **Do not** fork autofill logic in mobile — use core exports from RN-6-01

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: mark set done → finish workout succeeds (RN-6-03 path).

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-05
- PWA: `WorkoutExerciseCard.tsx`, `WorkoutSetField.tsx`
