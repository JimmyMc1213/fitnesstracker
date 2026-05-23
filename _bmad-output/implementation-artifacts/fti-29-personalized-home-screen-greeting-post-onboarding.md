# Story 2.1: Personalized home greeting (FTI-29)

Status: done

## Story

As a user who completed onboarding,
I want a personalized home greeting that references my plan,
so the app feels coached and personal from day one.

## Acceptance Criteria

1. **Name:** Greeting uses user's first name from profile (`displayName`).
2. **Time of day:** Morning / afternoon / evening variants (not hardcoded "Morning").
3. **Plan subline:** Subline references selected split and current program week (e.g. "Week 1 of your 5-day split").
4. **Fallback:** Graceful copy when name or onboarding profile is missing.
5. **Today only:** Enhanced greeting on home when viewing today; historical date view keeps date title.

## Tasks / Subtasks

- [ ] **Task 1: Greeting helpers** (AC: 2, 3, 4)
  - [ ] Add `homeGreeting.ts` with `timeOfDayGreeting(date)`, `homePlanSubline(state, date)`, `homeGreetingTitle(name, date)`
  - [ ] Reuse `planWeekIndex` from `data.ts` + `onboardingProfile.workoutDaysPerWeek` + `workoutDaysLabel` from `workoutSplitByDays.ts`

- [ ] **Task 2: ScreenHeader subtitle** (AC: 3)
  - [ ] Optional `subtitle` prop on `ScreenHeader` in `shared.tsx` (muted secondary line under title)

- [ ] **Task 3: Wire ScreenHome** (AC: 1, 2, 5)
  - [ ] Replace hardcoded `Morning, ${name}` with helpers when `isViewingToday`
  - [ ] Pass plan subline as `subtitle` on today view

- [ ] **Task 4: Verification** (AC: all)
  - [ ] Run `npm run build`

## Dev Notes

### Partial implementation

- `ScreenHome.tsx` already shows `Morning, ${greetingName}`: extend, do not duplicate header layout.
- `displayName` persisted via standard pipeline; set during onboarding.
- `planStartIso` set on onboarding complete in `OnboardingFlow.tsx`: use for week index.

### Subline copy

- Prefer: `Week {planWeekIndex} of your {N}-day split` using `workoutDaysLabel(days)` or `{N}-day split` shorthand.
- If no `onboardingProfile`: omit subline or use neutral "Your coached fitness plan".

### Architecture

- **Quality gate:** `npm run build` only.
- **No new persistence** unless week tracking needs a new field (it should not, `planStartIso` exists).
- **Scope:** Do not implement FTI-30+ in this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: src/fitness/data.ts#planWeekIndex]
- [Source: src/fitness/workoutSplitByDays.ts#workoutDaysLabel]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-29/personalized-home-screen-greeting-post-onboarding

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
