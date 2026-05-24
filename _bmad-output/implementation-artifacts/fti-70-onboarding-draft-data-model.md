# Story: Onboarding draft + profile data model (FTI-70)

Status: done

## Story

As a new Gymmy user,
I want onboarding progress saved automatically and new profile fields ready for v2,
so I can resume mid-flow after closing the app and future screens have the data they need.

## Acceptance Criteria

1. **`OnboardingDraft`** persisted in fitness slice with version, stepIndex, and in-progress wizard state.
2. **Resume:** Reload during onboarding opens at saved `stepIndex` when draft version matches.
3. **Profile fields:** `dateOfBirth`, `goalWeightLbs`, `pace` on `OnboardingProfile` with normalize + legacy `age` fallback.
4. **`subscriptionTier`** on AppState (`'free' | 'pro' | null`); cleared draft on onboarding finish.
5. **Pace → macros:** Optional pace adjusts cut/bulk calories relative to balanced defaults.
6. **`progressGoalFromOnboarding`** uses explicit `goalWeightLbs` when set.
7. **Merge/sync:** `onboardingDraft` and `subscriptionTier` merge in cloud sync pipeline.
8. **Tests:** Draft normalize/merge, DOB age derivation, pace macro adjustment.
9. **Build gate:** `npm test` + `npm run build` pass.

## Tasks / Subtasks

- [x] Types + onboardingDraft.ts normalize/build
- [x] onboardingProfile + nutritionCalculator extensions
- [x] persist / buildAppState / merge
- [x] OnboardingFlow save + resume
- [x] Unit tests

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/types.ts
- src/fitness/onboardingDraft.ts
- src/fitness/onboardingDraft.test.ts
- src/fitness/onboardingProfile.ts
- src/fitness/onboardingProfile.test.ts
- src/fitness/nutritionCalculator.ts
- src/fitness/nutritionCalculator.test.ts
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/OnboardingFlow.tsx
- src/fitness/FitnessApp.tsx
