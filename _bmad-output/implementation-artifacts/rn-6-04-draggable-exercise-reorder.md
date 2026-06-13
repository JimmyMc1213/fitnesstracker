---
name: RN-6-04 Draggable exercise reorder
epic: RN-6
story: 04
status: done
swarm_order: 4
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.04: Draggable exercise reorder

Status: done

## Story

**As a** user in an active workout  
**I want** to drag exercises to reorder them  
**So that** my session order matches how I train (PWA `@dnd-kit` parity)

## Acceptance Criteria

1. **Given** active lifting session with 2+ exercises, **When** I long-press and drag, **Then** exercise order updates in `state.workout.exercises`
2. **Given** reorder complete, **When** I release, **Then** list scroll remains smooth (target 60fps)
3. **Given** order changed from template baseline, **When** session finishes, **Then** `pendingTemplateOrderUpdatePrompt` is set (core `finishWorkout` behavior)
4. **Given** Maestro tab-nav + active session, **When** regression runs, **Then** no tab bar regression

## Tasks / Subtasks

- [x] Add dependency `react-native-draggable-flatlist` (+ peer `react-native-gesture-handler` if not present) (AC: 1)
- [x] Create `SortableExerciseList` RN component (AC: 1–2)
  - [x] Long-press drag handle on exercise cards
  - [x] `onDragEnd` → reorder array + `setFitnessState`
  - [ ] Haptic feedback on drag start (optional `expo-haptics`) — skipped; optional
- [x] Replace static `FlatList`/`ScrollView` exercise list in lifting phase (AC: 1)
- [x] Hook `UpdateTemplateOrderConfirmSheet` trigger point — sheet UI RN-6-09 (AC: 3)
- [x] `testID`s: `workout-exercise-list`, `workout-exercise-{id}`

## Dev Notes

### Epic key story

Called out in `epics-rn-migration.md` as RN-6 differentiator vs PWA `@dnd-kit`.

### Previous story intelligence (RN-6-03)

- Active session list host must exist before DnD wiring
- `sessionBaselineExerciseOrder` captured at session start for order-change detection

### PWA parity reference

`apps/pwa/src/fitness/SortableExerciseList.tsx` — `@dnd-kit/core` + `@dnd-kit/sortable`.

### Library requirements

- Prefer **`react-native-draggable-flatlist`** (maintained, Expo-compatible)
- Ensure `GestureHandlerRootView` wraps app if not already (check `app/_layout.tsx`)
- Do **not** use web-only `@dnd-kit` in RN

### Anti-patterns

- **Do not** reorder in routine editor here (RN-6-10)
- **Do not** add manual up/down buttons as primary UX unless DnD library blocked — document in story completion notes if fallback used

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

Manual drag reorder on iOS simulator; verify order persists until finish.

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-04
- PWA: `SortableExerciseList.tsx`, `workoutTemplateOrder.ts`
