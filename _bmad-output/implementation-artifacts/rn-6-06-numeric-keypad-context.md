---
name: RN-6-06 Numeric keypad + context
epic: RN-6
story: 06
status: done
swarm_order: 6
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.06: Numeric keypad + context

Status: ready-for-dev

## Story

**As a** user logging sets  
**I want** a bottom numeric keypad when editing weight or reps  
**So that** entry matches the PWA workout keypad UX

## Acceptance Criteria

1. **Given** active session, **When** I tap weight or reps on a set row, **Then** keypad opens focused on that field
2. **Given** keypad open, **When** I enter digits and Done, **Then** set value updates and keypad closes
3. **Given** keypad open, **When** lifting screen renders, **Then** content padding avoids keypad overlap
4. **Given** decimal entry for weight, **When** unit is lbs/kg, **Then** `workoutKeypadLogic` validation matches PWA
5. **Given** field focused, **When** list scrolls, **Then** active field scrolls into view (RN equivalent of `scrollWorkoutFieldIntoView`)

## Tasks / Subtasks

- [ ] Port `WorkoutKeypadProvider` + `useWorkoutKeypad` context (AC: 1–2)
- [ ] Port `WorkoutNumericKeypad` docked bottom sheet (AC: 1–4)
  - [ ] Extract `workoutKeypadLogic.ts` to core or `apps/mobile/lib/workout/` + tests
- [ ] Wire `WorkoutSetField` tap → open keypad with field ref (AC: 1)
- [ ] Lifting screen layout: `paddingBottom` when keypad open (AC: 3)
- [ ] Scroll-into-view helper for active set field (AC: 5)
- [ ] `testID`s: `workout-keypad`, `workout-keypad-done`, `workout-keypad-digit-{n}`

## Dev Notes

### Previous story intelligence (RN-6-05)

- Set fields must expose `onPress` handlers and field identity `{ exerciseId, setIndex, field: 'w' | 'r' }`

### PWA parity reference

PWA: `workout/WorkoutKeypadContext.tsx`, `workout/WorkoutNumericKeypad.tsx`, `workoutKeypadLogic.ts`, `workout/scrollWorkoutFieldIntoView.ts`.

Lifting screen uses class `screen--workout-keypad-open` for padding — replicate with NativeWind/style.

### Anti-patterns

- **Do not** use system keyboard for numeric entry (PWA uses custom keypad)
- **Do not** break set complete toggle from RN-6-05

### Testing requirements

```bash
npm run test --workspace=@newyouai/mobile   # keypad logic unit tests if in mobile lib
npm run typecheck --workspace=@newyouai/mobile
```

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-06
- PWA: `WorkoutKeypadContext.tsx`, `WorkoutNumericKeypad.tsx`
