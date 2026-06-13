---
name: RN-6-10 Routine editor weekly builder
epic: RN-6
story: 10
status: done
swarm_order: 10
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.10: Routine editor + weekly builder + templates

Status: done

## Story

**As a** user managing my training plan  
**I want** to edit routines, browse starter templates, and use the weekly builder  
**So that** my workout templates stay current like the PWA

## Acceptance Criteria

1. **Given** idle dashboard, **When** I open routine editor, **Then** full-screen `WorkoutRoutineEditor` opens with add/remove/reorder exercises
2. **Given** editor save, **When** I confirm, **Then** `workoutTemplates` updates in fitness slice
3. **Given** Templates header action, **When** opened, **Then** `WorkoutStarterTemplatesSheet` lists starters and applies to templates
4. **Given** weekly builder entry, **When** flow completes, **Then** `WeeklyRoutineBuilderFlow` updates schedule + templates via `buildWeeklyRoutine`
5. **Given** editor open, **When** viewing tabs, **Then** tab bar hidden (RN-6-01 flag)
6. **Given** routine action sheet, **When** rename/duplicate/delete, **Then** actions persist correctly

## Tasks / Subtasks

- [x] Port `WorkoutRoutineEditor` full-screen stack/modal (AC: 1–2, 5)
  - [x] `NEW_ROUTINE_EDITOR_ID` constant parity
  - [x] Notify parent `onRoutineEditorOpenChange` for tab hide
- [x] Port `WorkoutStarterTemplatesSheet` (AC: 3)
- [x] Port `WeeklyRoutineBuilderFlow` + `CreateWeeklyRoutineSheet` (AC: 4)
  - [x] Wire `applyWeeklyRoutineToState`, `profilePatchFromRoutineInputs`
  - [x] Align with `apps/mobile/lib/workout/workoutSplitByDays.ts`
- [x] Complete idle dashboard routine action sheet handlers (AC: 6)
- [x] `testID`s: `workout-routine-editor`, `workout-weekly-builder`

## Dev Notes

### Previous story intelligence (RN-6-02/09)

- Idle dashboard action sheet stubs wired here
- Rename/delete confirms from RN-6-09

### PWA parity reference

PWA: `WorkoutRoutineEditor.tsx`, `WeeklyRoutineBuilderFlow.tsx`, `CreateWeeklyRoutineSheet.tsx`, `WorkoutStarterTemplatesSheet.tsx`, `buildWeeklyRoutine.ts`.

Mobile already has `WorkoutWeekCalendarPicker` from onboarding — reuse calendar patterns.

### Anti-patterns

- **Do not** break onboarding-seeded templates shape
- **Do not** use web `@dnd-kit` in editor — reuse RN-6-04 DnD or simple reorder buttons in editor context

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/mobile   # workoutWeekCalendar tests if touched
```

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-10
- PWA: editor + weekly builder files
- Mobile: `lib/workout/workoutSplitByDays.ts`, `WorkoutWeekCalendarPicker.tsx`
