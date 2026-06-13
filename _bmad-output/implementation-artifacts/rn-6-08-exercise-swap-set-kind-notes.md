---
name: RN-6-08 Exercise swap set kind notes
epic: RN-6
story: 08
status: done
swarm_order: 8
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.08: Exercise swap + set kind + notes sheets

Status: ready-for-dev

## Story

**As a** user customizing my session  
**I want** to swap exercises, change set kinds, and edit notes  
**So that** mid-session adjustments match PWA behavior

## Acceptance Criteria

1. **Given** exercise card menu, **When** I choose Swap, **Then** `ExerciseSwapSheet` opens with search and replaces exercise sets
2. **Given** set row menu, **When** I change set kind, **Then** `SetKindPickerSheet` updates warm-up/working/drop set
3. **Given** exercise notes action, **When** I edit notes, **Then** `ExerciseNotesEditSheet` persists via `exerciseNotes` helpers
4. **Given** swap completes, **When** new exercise added, **Then** session coach note regenerates for that exercise id
5. **Given** add exercise from session, **When** search completes, **Then** `RoutineExerciseSearchSheet` adds row with blank autofill sets

## Tasks / Subtasks

- [ ] Port `ExerciseSwapSheet` + search list (AC: 1, 4)
- [ ] Port `SetKindPickerSheet` using `normalizeWorkoutSetKind` from core (AC: 2)
- [ ] Port `ExerciseNotesEditSheet` (AC: 3)
- [ ] Port `ExerciseActionSheet` / overflow menu on exercise card (AC: 1–3)
- [ ] Complete `RoutineExerciseSearchSheet` if still stub from RN-6-05 (AC: 5)
- [ ] Regenerate `sessionCoachNotesByExerciseId` entry on swap/add (AC: 4)

## Dev Notes

### Previous story intelligence (RN-6-05/07)

- Exercise card must expose action menu trigger
- Session notes pipeline from RN-6-07

### PWA parity reference

PWA: `ExerciseSwapSheet.tsx`, `workout/SetKindPickerSheet.tsx`, `ExerciseNotesEditSheet.tsx`, `workout/ExerciseActionSheet.tsx`, `RoutineExerciseSearchSheet.tsx`.

### Anti-patterns

- **Do not** implement confirm sheets here (RN-6-09) — delete exercise can stub alert until RN-6-09

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-08
- PWA: swap/set kind/notes sheets
