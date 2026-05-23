# Story 1.1: Unit preference (FTI-25)

Status: done

## Story

As a user,
I want to choose lbs/kg (and ft+in/cm) during onboarding and in settings,
so that all weight and measurement values match my preference.

## Acceptance Criteria

1. Unit preference screen in onboarding with lbs/kg and ft+in/cm options
2. Selection saves to persisted slice (Supabase JSONB via sync)
3. Weight displays and inputs throughout app use the selected weight unit (canonical storage remains lbs)
4. Height inputs in onboarding use ft+in or cm; canonical storage remains inches
5. Setting accessible and changeable in Settings
6. Switching units converts display values without mutating stored canonical data

## Tasks / Subtasks

- [x] Task 1: Domain + persistence (AC: 2, 6)
  - [x] Add `UnitPreferences` to `types.ts`, `persistFitnessSlice.ts`, `buildAppState.ts`, `mergePersistedFitnessSlices.ts`
  - [x] Add `unitPreferences.ts` conversion helpers (lbs↔kg, in↔cm)
- [x] Task 2: Onboarding unit step (AC: 1, 4)
  - [x] First-run `UnitOnboardingScreen` gated in `FitnessApp` (full multi-step onboarding lands in FTI-14)
- [x] Task 3: Settings + displays (AC: 3, 5)
  - [x] Unit section in `SettingsSheet.tsx`
  - [x] Update `ScreenHome`, `ScreenProgress`, `ScreenWorkout`, `SundayReviewSheet`, `workoutSummary.ts`, `WorkoutSummarySheet`

## Dev Notes

- Canonical: `weightLbs`, `heightIn`, workout set `w` in lbs. Display-only conversion.
- Defaults: lbs + ft_in. No test runner, gate is `npm run build`.
- linear: FTI-25

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-11-Unit-preference-FTI-25]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/unitPreferences.ts
- src/fitness/UnitPreferencePicker.tsx
- src/fitness/UnitOnboardingScreen.tsx
- src/fitness/types.ts
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/FitnessApp.tsx
- src/fitness/SettingsSheet.tsx
- src/fitness/screens/ScreenHome.tsx
- src/fitness/screens/ScreenProgress.tsx
- src/fitness/screens/ScreenWorkout.tsx
- src/fitness/SundayReviewSheet.tsx
- src/fitness/workoutSummary.ts
- src/fitness/finishWorkout.ts
- src/fitness/WorkoutSummarySheet.tsx

### Completion Notes List

- Canonical storage remains lbs/inches; display converts via `unitPreferences`.
- `npm run build` passes (only automated gate).

## Senior Developer Review (AI)

- Verified persistence pipeline and merge for `unitPreferences` / `unitPreferencesChosen`.
- Display paths updated for weigh-in, progress, workout sets, Sunday review, and session summary.
- First-run unit screen uses `UnitOnboardingScreen`; existing users with weight logs skip automatically.
