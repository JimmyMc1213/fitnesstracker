---
name: RN-6-09 Confirm sheets bundle
epic: RN-6
story: 09
status: done
swarm_order: 9
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.09: Confirm sheets bundle

Status: ready-for-dev

## Story

**As a** user  
**I want** confirmation dialogs for destructive or ambiguous workout actions  
**So that** I don't accidentally lose session progress (PWA confirm sheet parity)

## Acceptance Criteria

1. **Given** active session, **When** I cancel workout, **Then** `CancelWorkoutConfirmSheet` confirms and returns to idle without history entry
2. **Given** Finish with zero logged sets, **When** tapped, **Then** `EmptyFinishConfirmSheet` blocks or confirms per PWA rules
3. **Given** delete exercise action, **When** confirmed, **Then** `DeleteExerciseConfirmSheet` removes exercise from session
4. **Given** start new session while one active, **When** prompted, **Then** `ReplaceActiveWorkoutConfirmSheet` handles replace
5. **Given** finish with reordered exercises, **When** template order changed, **Then** `UpdateTemplateOrderConfirmSheet` offers save to template
6. **Given** save/history flows, **When** triggered, **Then** `SaveWorkoutConfirmSheet`, `SaveHistoryWorkoutSheet`, `RenameRoutineSheet` behave per PWA

## Tasks / Subtasks

- [ ] Shared bottom sheet / modal confirm component pattern (AC: all)
- [ ] Port confirm sheets from `apps/pwa/src/fitness/workout/*ConfirmSheet.tsx` (AC: 1–6)
- [ ] Wire RN-6-03 finish button to empty-finish sheet (AC: 2)
- [ ] Wire RN-6-04 finish path to template order update prompt (AC: 5)
- [ ] Wire idle dashboard routine actions to rename/delete confirms (AC: 6)
- [ ] `testID`s on primary confirm/cancel buttons for future Maestro

## Dev Notes

### Previous story intelligence

- RN-6-03 stubbed zero-set finish — replace with real sheet here
- RN-6-04 sets `pendingTemplateOrderUpdatePrompt` on finish — surface UI here

### PWA parity reference

PWA confirm sheets (10+): `CancelWorkoutConfirmSheet`, `EmptyFinishConfirmSheet`, `DeleteExerciseConfirmSheet`, `ReplaceActiveWorkoutConfirmSheet`, `SaveWorkoutConfirmSheet`, `SaveHistoryWorkoutSheet`, `UpdateTemplateOrderConfirmSheet`, `RenameRoutineSheet`.

Use `@gorhom/bottom-sheet` only if already in project — otherwise match existing modal pattern from Home `WeighInSheet` / RN-5.

### Anti-patterns

- **Do not** use destructive actions without confirm
- **Do not** duplicate confirm copy — match PWA strings for Maestro stability

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: cancel session → confirm → idle with no history append.

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-09
- PWA: `workout/*ConfirmSheet.tsx`, `workout/RenameRoutineSheet.tsx`
