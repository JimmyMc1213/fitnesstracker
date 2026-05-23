# Story 1.12: Streak tracker (FTI-23)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a visible streak for workouts or nutrition goals,
so that consistency feels rewarding.

## Acceptance Criteria

1. **Home dashboard:** Streak count visible on home dashboard with motivating visual (not a plain number only).
2. **Increment rules:** Streak increments when a workout is completed **or** nutrition goal is hit for the day (90%+ of calorie and protein targets).
3. **Reset rules:** Streak resets on a missed day (no workout finish and no nutrition goal hit).
4. **Supabase persistence:** Streak eligibility and snapshot stored per user via JSONB sync (`streakEligibleByDay`, `fitnessStreakSnapshot`).
5. **Week calendar:** Home week rings reflect streak progress (full = streak day secured).

## Tasks / Subtasks

- [x] **Task 1: Streak eligibility data layer** (AC: 2, 3, 4)
  - [x] Add `nutritionGoalHitForDateKey`, `dayEligibleForStreak`, `applyStreakEligibility` in `dailyStreak.ts`
  - [x] Add `streakEligibleByDay` + `fitnessStreakSnapshot` to `AppState` and persistence pipeline
  - [x] Backfill eligibility on load; merge with OR semantics across devices

- [x] **Task 2: Hook streak updates on user actions** (AC: 2, 4)
  - [x] Refresh streak after `finishWorkout`
  - [x] Refresh streak after nutrition logging in `ScreenNutrition`

- [x] **Task 3: Home streak UI polish** (AC: 1, 5)
  - [x] Use streak-specific week progress in `StreakWeeklyHeader`
  - [x] Add motivational copy / milestone styling on streak pill
  - [x] Update `DayProgressSheet` checklist with streak criteria

- [x] **Task 4: Verification** (AC: all)
  - [x] Run `npm run build` (project quality gate)

## Dev Notes

### Primary implementation targets

- **`src/fitness/dailyStreak.ts`**, eligibility, streak count, snapshot recompute
- **`src/fitness/types.ts`**, new persisted fields
- **`src/fitness/persistFitnessSlice.ts`**, **`buildAppState.ts`**, **`mergePersistedFitnessSlices.ts`**
- **`src/fitness/finishWorkout.ts`**, **`src/fitness/screens/ScreenNutrition.tsx`**
- **`src/fitness/StreakWeeklyHeader.tsx`**, **`src/fitness/DayProgressSheet.tsx`**

### Nutrition goal hit definition

- Effective day totals from `effectiveNutritionTotalsForDateKey`
- Hit when `cal >= 0.9 * target.cal` **and** `protein >= 0.9 * target.p`
- Workout finish (`workoutsCompletedByDay[dateKey]`) also qualifies

### Architecture & constraints

- **Quality gate:** `npm run build` only. No Vitest/Playwright.
- **Scope discipline:** Do not implement FTI-24 (weekly summary).
- **Persistence:** Follow mandatory pipeline in `project-context.md`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.12]
- [Source: _bmad-output/project-context.md#Persistence pipeline]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-23/streak-tracker

## Senior Developer Review (AI)

- Build gate: `npm run build` PASS
- Streak eligibility narrowed from generic check-ins to workout finish OR nutrition goal hit (90% cal + protein)
- Persisted `streakEligibleByDay` + `fitnessStreakSnapshot` sync via existing Supabase JSONB pipeline
- Home UI: milestone motivation label, hot-streak gradient at 7+ days, amber partial rings for in-progress days

## Review Follow-ups (AI)

- [x] R1: Refined streak rules to match epic AC (workout OR nutrition goal, not weigh-in/habits alone)

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Added persisted streak eligibility map and snapshot with backfill on load
- Hooked streak refresh on workout finish and nutrition logging
- Enhanced home streak pill with motivation copy and milestone styling

### File List

- `src/fitness/dailyStreak.ts` (modified)
- `src/fitness/types.ts` (modified)
- `src/fitness/persistFitnessSlice.ts` (modified)
- `src/fitness/buildAppState.ts` (modified)
- `src/fitness/mergePersistedFitnessSlices.ts` (modified)
- `src/fitness/finishWorkout.ts` (modified)
- `src/fitness/screens/ScreenNutrition.tsx` (modified)
- `src/fitness/StreakWeeklyHeader.tsx` (modified)
- `_bmad-output/implementation-artifacts/fti-23-streak-tracker.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- 2026-05-21: FTI-23: Streak tracker with Supabase-synced eligibility, nutrition goal rules, and home UI polish
- 2026-05-21: Streak day sheet simplified, streak-only default glance, full habit log collapsed; split getDayStreakSummary / getDayHabitProgress; dedupe weigh-in
