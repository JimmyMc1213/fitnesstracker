# Story 1.4: New user onboarding — workout template + nutrition (FTI-14)

Status: done

## Story

As a new user,
I want a guided onboarding flow that sets my workout split and nutrition targets,
so that I land on the home dashboard fully configured.

## Acceptance Criteria

1. Onboarding only triggers for new accounts with no existing data
2. Screens: Goal → Stats → Activity level → Workout days per week → Review & edit template → Nutrition summary (after units, experience, equipment)
3. TDEE and macros calculated from stats + activity level
4. Pre-built exercise templates loaded; user can edit order, swap exercises, adjust sets/reps before confirm
5. Nutrition targets save and populate home dashboard macro rings
6. Smooth forward/back navigation with progress indicator
7. Existing/legacy accounts skip onboarding entirely

## Tasks / Subtasks

- [x] Task 1: Domain + persistence (AC: 1, 3, 5, 7)
  - [x] `OnboardingProfile` type, `onboardingComplete`, persist pipeline
  - [x] `nutritionCalculator.ts`, `onboardingSkip.ts`, legacy email env
- [x] Task 2: Split + templates (AC: 2, 4)
  - [x] `workoutSplitByDays.ts` — 3/4/5/6 day templates from experience + equipment
- [x] Task 3: Unified OnboardingFlow (AC: 2, 4, 5, 6)
  - [x] `OnboardingFlow.tsx` with progress bar, back/continue, all steps
  - [x] Template review with reorder, swap, target edits
  - [x] Replace separate gates in `FitnessApp.tsx`
- [x] Task 4: Verification (AC: all)
  - [x] `npm run build` passes

## Dev Notes

- Unifies FTI-25/26/27 gates into one wizard; sets all `*Chosen` flags on finish.
- `?previewOnboarding=1` forces flow in DEV.
- Gate is `npm run build` only.

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Replaced three separate onboarding gates with unified `OnboardingFlow` (9 steps, progress bar, back navigation).
- Mifflin–St Jeor TDEE + goal-adjusted macros; overridable on final step.
- Split templates for 3/4/5/6 days; template review supports reorder, swap, set/target edits.
- Legacy skip via `VITE_LEGACY_USER_EMAILS`, existing fitness data, or `onboardingComplete`.

### File List

- src/fitness/types.ts
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/FitnessApp.tsx
- src/fitness/nutritionCalculator.ts
- src/fitness/onboardingSkip.ts
- src/fitness/onboardingProfile.ts
- src/fitness/workoutSplitByDays.ts
- src/fitness/OnboardingFlow.tsx
- src/fitness/OnboardingSegment.tsx
- src/fitness/OnboardingTemplateReview.tsx
- src/vite-env.d.ts
