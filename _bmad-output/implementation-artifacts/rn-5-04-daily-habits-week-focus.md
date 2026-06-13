---
name: RN-5-04 Daily habits + week focus
epic: RN-5
story: 04
status: ready-for-dev
swarm_order: 4
swarm_branch: epic-rn-5/home-coach
---

# Story 5.04: Daily habits + week focus

Status: ready-for-dev

## Story

**As an** onboarded user  
**I want** to see and check off daily habits and weekly focus commitments on Home  
**So that** I stay accountable to my plan

## Acceptance Criteria

1. **Given** habit templates from onboarding, **When** Home renders today, **Then** `HomeDailyHabitsCard` lists active habits for the date
2. **Given** a non-mobility habit, **When** I toggle it, **Then** `habitsDoneByDay` persists and UI updates
3. **Given** mobility habit, **When** I tap it, **Then** `onMobilityPress` fires (preview wired in RN-5-06)
4. **Given** week focus commitments, **When** today view and data present, **Then** `HomeWeekFocusCard` renders below weigh-in zone
5. **Given** historical date, **When** habits render, **Then** toggles are read-only

## Tasks / Subtasks

- [ ] Port `HomeDailyHabitsCard` RN component (AC: 1–3, 5)
  - [ ] `testID="home-daily-habits"`; per-habit toggle testIDs
  - [ ] Steps target display from `stepsTarget`
- [ ] Port `HomeWeekFocusCard` (AC: 4)
  - [ ] Week number from `planWeekIndex`; commitments from state
- [ ] Wire habit toggle + `buildHabitsForDateKey` persist (AC: 2)
  - [ ] `isMobilityHabit` guard on toggle
  - [ ] `saveDailyHabitTemplates` for template edits (if PWA parity includes edit affordance)
- [ ] Place cards below carousel per PWA `ScreenHome` order (AC: 1)
- [ ] Run typecheck

## Dev Notes

### Data from RN-4

`finishOnboarding` seeds `habitTemplates`, `stepsTarget`, `planStartIso`. Week focus may be empty until Sunday check-in — card should no-op gracefully.

### PWA parity reference

- `HomeDailyHabitsCard.tsx`, `HomeWeekFocusCard.tsx`
- `mobilityHabit.ts`, `buildHabitsForDateKey`, `habitsForDateKey`

### Anti-patterns

- **Do not** remove habits tab (already removed in PWA FTI-44 — habits live on Home only)
- **Do not** implement full mobility flow (RN-5-06 preview shell)

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
