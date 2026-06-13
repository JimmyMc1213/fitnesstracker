---
name: RN-6-02 Idle dashboard + routines
epic: RN-6
story: 02
status: ready-for-dev
swarm_order: 2
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.02: Idle dashboard + routine cards

Status: done

## Story

**As an** onboarded user  
**I want** the Workout tab idle view to show my routines and today's training focus  
**So that** I can start a session from the correct template

## Acceptance Criteria

1. **Given** `sessionPhase === "idle"`, **When** I open Workout, **Then** idle dashboard renders (not a stub label)
2. **Given** training day per calendar + `workoutTemplates`, **When** idle loads, **Then** today's routine card is highlighted with coach brief preview
3. **Given** routine list, **When** I tap a routine, **Then** pre-workout preview / start path is available (full start RN-6-03)
4. **Given** header, **When** I tap History, **Then** I navigate to `(app)/workout/history`
5. **Given** header Templates action, **When** tapped, **Then** starter templates entry opens (full sheet RN-6-10 if stub)
6. **Given** coach `start_workout` from Home, **When** routed to Workout tab, **Then** idle dashboard is visible with today's routine

## Tasks / Subtasks

- [x] Port `WorkoutIdleDashboard` → `apps/mobile/components/workout/WorkoutIdleDashboard.tsx` (AC: 1–3)
  - [x] Routine cards from `state.workoutTemplates`
  - [x] `isTrainingDay` + `templateForDate` from `@newyouai/core` (`trainingCalendar.ts`)
  - [x] `buildPreWorkoutCoachBrief` preview block (port or import from core if extracted)
- [x] Workout screen header (AC: 4–5)
  - [x] Templates button + History icon matching PWA header actions
  - [x] `ScreenHeader` pattern from Home tab
- [x] Wire idle into RN-6-01 phase shell (AC: 1)
- [x] Routine action sheet shell — rename/duplicate/delete handlers stub to RN-6-10 (AC: 3)
- [x] `testID`s: `workout-idle`, `workout-routine-{id}`, `workout-start-{id}`

## Dev Notes

### Previous story intelligence (RN-6-01)

- Phase shell + `useFitnessState` must be merged first
- Core extract provides shared history/autofill helpers for later stories

### PWA parity reference

`apps/pwa/src/fitness/workout/WorkoutIdleDashboard.tsx` — routine cards, today's workout CTA, coach blue brief card, header Templates + History.

Data seeded by RN-4 onboarding: `workoutTemplates`, `onboardingProfile.workoutDaysPerWeek`, `planStartIso`.

### Anti-patterns

- **Do not** implement full session start logic (RN-6-03)
- **Do not** implement routine editor (RN-6-10)
- **Do not** duplicate `trainingCalendar` logic — import from core

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

Manual: post-onboarding user sees ≥1 routine card on Workout tab.

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-02
- PWA: `WorkoutIdleDashboard.tsx`, `preWorkoutCoachBrief.ts`
- Mobile: `lib/coachTaskActions.ts` (`start_workout` → `/(tabs)/workout`)
