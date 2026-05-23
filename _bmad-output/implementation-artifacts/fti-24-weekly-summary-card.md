# Story 1.13: Weekly summary card (FTI-24)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a weekly recap card,
so that I see workouts, volume, and nutrition consistency at a glance.

## Acceptance Criteria

1. **Visibility:** Weekly summary card visible on home (today view) and progress tab.
2. **Workouts:** Shows workouts completed vs planned for the current week (Mon–Sun).
3. **Volume:** Shows total volume lifted for the week (lb·reps from completed sessions).
4. **Nutrition:** Shows count of days nutrition targets were hit (90% cal + protein).
5. **Week reset:** Week boundary resets each Monday (local calendar).
6. **Data source:** Stats derive from persisted `workoutHistory`, `workoutsCompletedByDay`, and nutrition logs (Supabase JSONB sync).

## Tasks / Subtasks

- [x] **Task 1: Weekly summary data layer** (AC: 2, 3, 4, 5, 6)
  - [x] Add `weeklySummary.ts` with Monday week bounds and `buildWeeklySummary(state, todayKey)`
  - [x] Count completed workout days, sum session volume, count nutrition goal days
  - [x] Planned workouts from `onboardingProfile.workoutDaysPerWeek` (default 5)

- [x] **Task 2: Weekly summary card UI** (AC: 1, 2, 3, 4)
  - [x] Add `WeeklySummaryCard.tsx` with stat grid matching app card styling
  - [x] Respect weight unit for volume display (kg conversion like workout summary)

- [x] **Task 3: Surface on Home and Progress** (AC: 1)
  - [x] Render on `ScreenHome` when viewing today (below streak header)
  - [x] Render on `ScreenProgress` near top (after header / weigh-in)

- [x] **Task 4: Verification** (AC: all)
  - [x] Run `npm run build` (project quality gate)

## Dev Notes

### Primary implementation targets

- **`src/fitness/weeklySummary.ts`**, week bounds (Monday start), aggregation
- **`src/fitness/WeeklySummaryCard.tsx`**, presentation component
- **`src/fitness/screens/ScreenHome.tsx`**, **`src/fitness/screens/ScreenProgress.tsx`**

### Week boundary

- Use **Monday** as week start (distinct from streak calendar which uses Sunday).
- Week includes Mon through Sun containing `todayKey`.

### Planned workouts

- `state.onboardingProfile?.workoutDaysPerWeek ?? 5`

### Completed workouts

- Count distinct `dayKey` values in `workoutHistory` within the week where the day has at least one session.

### Volume

- Sum `w * r` for all done sets across sessions in the week (canonical lbs).

### Nutrition days hit

- Reuse `nutritionGoalHitForDateKey` from `dailyStreak.ts` for each day in the week.

### Architecture & constraints

- **Quality gate:** `npm run build` only. No Vitest/Playwright.
- **No new persistence**, read-only aggregation from existing AppState fields.
- **Scope discipline:** Final story in sprint-1 epic.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.13]
- [Source: src/fitness/dailyStreak.ts#nutritionGoalHitForDateKey]
- [Source: src/fitness/workoutHistory.ts]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-24/weekly-summary-card

## Senior Developer Review (AI)

- Build gate: `npm run build` PASS
- Monday week boundary implemented separately from Sunday-based streak calendar (intentional per AC)
- Read-only aggregation, no new Supabase fields; data flows from existing synced JSONB slices
- Volume display follows `WorkoutSummarySheet` kg conversion pattern

## Review Follow-ups (AI)

- [x] R1: Confirmed nutrition goal uses shared 90% cal+protein helper from dailyStreak

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Added `buildWeeklySummary` with Mon–Sun bounds and session volume aggregation from `workoutHistory`
- Card shows workouts X/Y, volume, and fuel days on target; surfaces on Home (today) and Progress

### File List

- src/fitness/weeklySummary.ts (new)
- src/fitness/WeeklySummaryCard.tsx (new)
- src/fitness/screens/ScreenHome.tsx
- src/fitness/screens/ScreenProgress.tsx
- _bmad-output/implementation-artifacts/fti-24-weekly-summary-card.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-05-21: Implemented weekly summary card (FTI-24), final sprint-1 story
