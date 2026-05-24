# Story: Template weekday mapping in split builder (FTI-73)

Status: in-progress

## Story

As a new Gymmy user who picks custom training weekdays,
I want my split templates to show the exact days I selected,
so the split reveal matches my real schedule without a separate alignment step.

## Acceptance Criteria

1. **`buildWorkoutTemplatesForDays`** accepts optional `trainingWeekdays?: string[]`.
2. When provided and length matches template count, `dayLabel[i] = trainingWeekdays[i]`.
3. When omitted, behavior unchanged (default split meta day labels).
4. **Unit tests** - 4-day pick Mon/Tue/Thu/Fri → templates show those labels.
5. **OnboardingFlow** passes weekdays into builder; remove redundant `alignTemplatesToTrainingWeekdays` where builder covers it.
6. **Build gate** - `npm test` + `npm run build` pass.

## Tasks / Subtasks

- [ ] Extend `buildWorkoutTemplatesForDays` with optional `trainingWeekdays`
- [ ] Add `workoutSplitByDays.test.ts` unit tests
- [ ] Update `OnboardingFlow.tsx` to use builder weekday param
- [ ] Run test + build gate

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/workoutSplitByDays.ts
- src/fitness/workoutSplitByDays.test.ts
- src/fitness/OnboardingFlow.tsx
- _bmad-output/implementation-artifacts/fti-73-template-weekday-mapping-split-builder.md
