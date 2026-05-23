# Story 1.3: Equipment selection (FTI-27)

Status: done

## Story

As a new user,
I want to select available equipment during onboarding,
so that suggested exercises match what I can perform.

## Acceptance Criteria

1. Equipment selection screen in onboarding (after experience level)
2. At least 4 options: Full gym, Home gym, Dumbbells only, Bodyweight only
3. Selection saves to persisted slice (Supabase JSONB via sync)
4. Workout templates generated during onboarding only include exercises compatible with selected equipment
5. Changeable in settings post-onboarding

## Tasks / Subtasks

- [x] Task 1: Domain + persistence (AC: 3)
  - [x] Add `EquipmentSetup` to `types.ts`, `persistFitnessSlice.ts`, `buildAppState.ts`, `mergePersistedFitnessSlices.ts`
  - [x] Add `equipmentSetup.ts` with labels, defaults, and normalization
- [x] Task 2: Template filtering (AC: 4)
  - [x] Add `exerciseEquipment.ts`: compatibility map and substitutions per setup
  - [x] Add `workoutTemplateBuilder.ts`: combine experience + equipment adaptation
- [x] Task 3: Onboarding screen + gate (AC: 1, 2)
  - [x] `EquipmentOnboardingScreen.tsx` + `EquipmentSetupPicker.tsx`
  - [x] `EquipmentSetupGate` in `FitnessApp.tsx` after `ExperienceLevelGate`
  - [x] On continue: set setup, mark chosen, regenerate `workoutTemplates`
- [x] Task 4: Settings (AC: 5)
  - [x] Equipment section in `SettingsSheet.tsx` with template regeneration on change

## Dev Notes

- Follow FTI-25/26 patterns: gate component, card UI, segment-style option buttons, legacy skip via workout history / weight log / Jimmy plan.
- Canonical storage: `equipmentSetup` string enum + `equipmentSetupChosen` boolean.
- Gate is `npm run build` only, no test runner.
- linear: FTI-27

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-13-Equipment-selection-FTI-27]
- [Source: _bmad-output/project-context.md]
- [Source: _bmad-output/implementation-artifacts/fti-26-experience-level-selection-in-onboarding.md]

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/types.ts
- src/fitness/equipmentSetup.ts
- src/fitness/exerciseEquipment.ts
- src/fitness/workoutTemplateBuilder.ts
- src/fitness/EquipmentSetupPicker.tsx
- src/fitness/EquipmentOnboardingScreen.tsx
- src/fitness/persistFitnessSlice.ts
- src/fitness/buildAppState.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/FitnessApp.tsx
- src/fitness/SettingsSheet.tsx
- src/fitness/jimmy-seed-data.ts

### Completion Notes List

- Equipment setup persists through localStorage + Supabase sync pipeline.
- On continue, templates regenerate with experience level + equipment-compatible exercises (substitutions where needed).
- Legacy/Jimmy users skip the gate via existing fitness data heuristics.
- Settings allows changing equipment and regenerates templates immediately.
- `npm run build` passes (only automated gate).

## Senior Developer Review (AI)

- Verified persistence pipeline and merge for `equipmentSetup` / `equipmentSetupChosen`.
- Legacy skip reuses `hasLegacyFitnessData`: consistent with FTI-26.
- Substitution map covers all default split exercises for limited-equipment setups.

### Review Follow-ups (AI)

- [x] Jimmy seed sets `equipmentSetup: full_gym` and `equipmentSetupChosen: true`

## Change Log

- 2026-05-20: FTI-27 equipment selection onboarding, persistence, template filtering, and settings
