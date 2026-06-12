---
name: RN-4-06 Training setup OB-11-15
epic: RN-4
story: 06
status: done
swarm_order: 6
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.06: Training setup (OB-11–15)

Status: done

## Story

**As a** user configuring training  
**I want** to set activity, experience, equipment, session length, and workout days  
**So that** my split templates match my schedule and session capacity

## Acceptance Criteria

1. **Given** step 11, **When** activity level selected, **Then** Continue advances; back locked into goal zone (except photo revisit)
2. **Given** steps 12–13, **When** experience + equipment picked, **Then** values persist to draft
3. **Given** step 14 session length, **When** option selected, **Then** Continue enables (`SESSION_LENGTH_OPTIONS` from PWA)
4. **Given** step 15 calendar, **When** fewer than 3 days selected, **Then** Continue disabled with count copy matching PWA
5. **Given** step 15 Continue, **When** weekdays valid, **Then** `buildWorkoutTemplatesForDays(..., trainingWeekdays)` runs (from `@newyouai/core`)
6. **Given** Pick for me, **When** tapped, **Then** auto-selects valid weekday set (4 days default like PWA E2E)
7. **Given** Maestro resume case (RN-4-12), **When** draft at step 15, **Then** heading "Which days can you train?" renders — **stabilize testIDs/copy**

## Tasks / Subtasks

- [x] Port activity level screen step 11 (AC: 1)
- [x] Port `ExperienceLevelPicker` → RN (AC: 2)
- [x] Port `EquipmentSetupPicker` → RN (AC: 2)
- [x] Port step 14 session length pills (AC: 3)
- [x] Port `WorkoutWeekCalendarPicker` → RN at step 15 (AC: 4–6)
  - [x] 3-day min, 6-day max, "Pick for me", selected count label
- [x] On Continue from 15: call template builder with `trainingWeekdays` (AC: 5)
- [x] Wire steps 11–15 in wizard
- [x] Run typecheck + core tests if touching builder

## Dev Notes

### PWA reference

- `ExperienceLevelPicker.tsx`, `EquipmentSetupPicker.tsx`
- Calendar in `OnboardingFlow.tsx` step **15** (~1293); session length step **14** (~1268)
- E2E: `onboarding-v2.spec.ts` resume + calendar validation

### Previous story intelligence (RN-4-05)

- Step 11 is first post-goal-lock screen — enforce `isOnboardingBackLocked` for activity when applicable
- Templates array on draft populated after step 15 Continue

### testID / Maestro contract

| Element | Suggested testID / accessibility |
|---------|----------------------------------|
| Calendar heading | accessibilityLabel matches "Which days can you train?" |
| Weekday toggle | `onboarding-calendar-day-{Mon}` |
| Continue | `onboarding-continue` (shell footer) |

### Anti-patterns

- **Do not** use post-hoc template align helper if builder accepts `trainingWeekdays` (FTI-73 lesson)
- **Do not** allow Continue with <3 days

### Testing requirements

```bash
npm run test --workspace=@newyouai/core   # workout template builder
npm run typecheck --workspace=@newyouai/mobile
```

### References

- `packages/core/src/sync/workoutTemplates.ts` — `buildWorkoutTemplatesForDays`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
