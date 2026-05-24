# Story: Workout week calendar picker (FTI-71)

Status: done

## Story

As a new Gymmy user setting up my program,
I want to pick which days of the week I train on a Mon–Sun calendar with a "Pick for me" option,
so my split matches my real schedule instead of a generic days-per-week count.

## Acceptance Criteria

1. **`WorkoutWeekCalendarPicker`** — Mon–Sun toggle row, multi-select, 3–6 days required.
2. **Live hint** — `"N days selected · {splitLabel}"` (e.g. 4 days → Upper/Lower).
3. **Pick for me** — Selects a valid spread; 4-day default Mon, Tue, Thu, Fri.
4. **Continue disabled** until 3–6 days selected.
5. **Persists** — `onboardingProfile.trainingWeekdays` + derived `workoutDaysPerWeek`.
6. **Onboarding step 7** — Replaces days-per-week chips with calendar picker.
7. **Template build** — On continue to templates, align `dayLabel` to selected weekdays.
8. **Tests** — Toggle, pick-for-me, validation, split labels.
9. **Build gate** — `npm test` + `npm run build` pass.

## Tasks / Subtasks

- [x] workoutWeekCalendar.ts logic + tests
- [x] WorkoutWeekCalendarPicker.tsx component
- [x] Wire OnboardingFlow schedule step
- [x] alignTemplatesToTrainingWeekdays helper

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/workoutWeekCalendar.ts
- src/fitness/workoutWeekCalendar.test.ts
- src/fitness/WorkoutWeekCalendarPicker.tsx
- src/fitness/OnboardingFlow.tsx
- _bmad-output/implementation-artifacts/fti-71-workout-week-calendar-picker.md
