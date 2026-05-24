# Story: dailyPlan split hotfix + hydration gate (FTI-69)

Status: done

## Story

As a Gymmy user on a 3/4/6-day split,
I want Home daily tasks to reflect my actual training schedule,
so I see the correct workout (or rest day) today — not a hardcoded Mon–Fri program.

## Acceptance Criteria

1. **`dailyPlan.ts` uses user templates:** `generateDailyTasksForDate` resolves gym tasks via `isTrainingDay` + `templateForDate` from [`trainingCalendar.ts`](src/fitness/trainingCalendar.ts), not hardcoded `SPLIT` Mon–Fri mapping.
2. **Rest days:** Non-training weekdays show rest/recovery copy; Sunday retains weekly check-in life tasks.
3. **Sync migration:** `migrateTrainingSchedule` runs synchronously inside `buildAppStateFromPersisted` before `loadTasksForToday`; backfills `trainingWeekdays` and aligns template `dayLabel`s.
4. **Migration write-back:** On first load, if migration is dirty, persisted slice is saved before Home renders.
5. **Hydration gate:** Home/onboarding shell does not render until initial cloud pull completes (or 5s timeout / no Supabase / no session).
6. **Tests:** Unit tests cover 3-day Tue training, 3-day Wed rest, and 5-day Wed training with templates.
7. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] Task 1: Fix `dailyPlan.ts` + thread `daysPerWeek` through callers
- [x] Task 2: Add `migrateTrainingSchedule.ts` + `trainingWeekdays` on profile
- [x] Task 3: Wire migration in `buildAppState.ts` + initial write-back
- [x] Task 4: Hydration gate in `FitnessApp` + `fitnessCloudSync`
- [x] Task 5: Unit tests + verification

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Removed hardcoded `splitForWeekday` from dailyPlan; gym tasks now use user templates + `isTrainingDay`.
- Added sync `migrateTrainingSchedule` / `migratePersistedFitnessSlice` with `trainingWeekdays` backfill on `OnboardingProfile`.
- Initial load writes migrated slice when dirty; hydration splash blocks UI until first cloud pull (5s max) or no-sync path.
- 143 unit tests pass; build passes.

### File List

- src/fitness/dailyPlan.ts
- src/fitness/dailyPlan.test.ts
- src/fitness/trainingCalendar.ts
- src/fitness/migrateTrainingSchedule.ts
- src/fitness/migrateTrainingSchedule.test.ts
- src/fitness/onboardingProfile.ts
- src/fitness/types.ts
- src/fitness/buildAppState.ts
- src/fitness/fitnessCloudSync.ts
- src/fitness/FitnessSyncContext.tsx
- src/fitness/FitnessApp.tsx
- src/fitness/OnboardingFlow.tsx
- src/fitness/SettingsSheet.tsx
- src/fitness/nutritionPipeline.ts
