# Story 1.2: Experience level (FTI-26)

Status: done

## Story

As a new user,
I want to select my training experience level during onboarding,
so that generated workout templates use appropriate starting weights and rep ranges.

## Acceptance Criteria

1. Experience level screen in onboarding (after unit preferences)
2. Three options: Beginner, Intermediate, Advanced
3. Selection saves to persisted slice (Supabase JSONB via sync)
4. Workout templates generated during onboarding use experience level for starting weights and rep ranges
5. Beginner: higher reps, lower weights; Advanced: lower reps, heavier weights

## Tasks / Subtasks

- [x] Task 1: Domain + persistence (AC: 3)
  - [x] Add `ExperienceLevel` to `types.ts`, `persistFitnessSlice.ts`, `buildAppState.ts`, `mergePersistedFitnessSlices.ts`
  - [x] Add `experienceLevel.ts` with labels, defaults, and normalization
- [x] Task 2: Template generation (AC: 4, 5)
  - [x] Add `workoutTemplatesForExperience.ts` — adjust rep ranges and starting weights per level
  - [x] Wire generation on onboarding continue
- [x] Task 3: Onboarding screen + gate (AC: 1, 2)
  - [x] `ExperienceLevelOnboardingScreen.tsx` + `ExperienceLevelPicker.tsx`
  - [x] `ExperienceLevelGate` in `FitnessApp.tsx` after `UnitPreferencesGate`
  - [x] On continue: set level, mark chosen, regenerate `workoutTemplates`

## Dev Notes

- Follow FTI-25 patterns: gate component, card UI, segment buttons, legacy skip via workout history / weight log / Jimmy plan.
- Canonical storage: `experienceLevel` string enum. No test runner — gate is `npm run build`.
- Full multi-step onboarding (FTI-14) comes later; this story adds the experience step only.
- linear: FTI-26

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-12-Experience-level-FTI-26]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/implementation-artifacts/fti-25-unit-preference-lbskg-in-onboarding-and-settings.md]

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/types.ts
- src/fitness/experienceLevel.ts
- src/fitness/workoutTemplatesForExperience.ts
- src/fitness/ExperienceLevelPicker.tsx
- src/fitness/ExperienceLevelOnboardingScreen.tsx
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/FitnessApp.tsx
- src/fitness/jimmy-seed-data.ts

### Completion Notes List

- Experience level persists through localStorage + Supabase sync pipeline.
- On continue, templates regenerate with adjusted rep ranges and suggested starting weights.
- Legacy/Jimmy users skip the gate via existing fitness data heuristics.
- `npm run build` passes (only automated gate).

## Senior Developer Review (AI)

- Verified persistence pipeline and merge for `experienceLevel` / `experienceLevelChosen`.
- Legacy skip uses workout completions, weight log, or Jimmy plan templates — avoids regressing demo users.
- Template generation scales baseline weights (70% beginner, 115% advanced) and shifts rep ranges ±2.

### Review Follow-ups (AI)

- [x] Improve legacy skip heuristic for Jimmy seed users (buildAppState + jimmy-seed-data)

## Change Log

- 2026-05-20: FTI-26 experience level onboarding, persistence, and template generation
