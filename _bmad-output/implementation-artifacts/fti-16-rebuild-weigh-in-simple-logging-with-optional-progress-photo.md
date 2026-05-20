# Story 1.5: Rebuild weigh-in (FTI-16)

Status: done

## Story

As a user,
I want simple weight logging with an optional progress photo,
so that I can track trend without a 7-day average cut workflow.

## Acceptance Criteria

1. Weigh-in button accessible from progress page
2. User inputs weight (respects unit preference from Story 1.1)
3. Optional photo upload attached to log entry
4. Entry saves to Supabase with timestamp (`loggedAtIso` on `WeightEntry`)
5. Progress page shows weight trend line from all entries
6. All 7-day average calculation logic removed from codebase

## Tasks / Subtasks

- [x] Task 1: Weigh-in domain + sheet (AC: 1, 2, 3, 4)
  - [x] Add `loggedAtIso` to `WeightEntry`; merge prefers latest timestamp in `mergeWeightLog`
  - [x] Create `WeighInSheet.tsx` (weight input, optional photo, save)
- [x] Task 2: Progress + Home UX (AC: 1, 5)
  - [x] `ScreenProgress`: Log weigh-in button opens sheet; keep trend chart from `weightLog`
  - [x] `ScreenHome`: compact today status + navigate to Progress (remove duplicate full form)
- [x] Task 3: Remove 7-day average workflow (AC: 6)
  - [x] Remove Week avg section from `ScreenProgress`
  - [x] Simplify `weeklyAdjustment.ts` (drop `MIN_WEIGH_INS_PER_WEEK`, `averageWeightInRange`); Sunday review uses week mean when ≥2 days logged per week
  - [x] Update `SundayReviewSheet` and `dailyPlan.ts` copy

## Dev Notes

- Canonical weight stays `weightLbs`; display via `unitPreferences`.
- Gate: `npm run build` only.
- linear: FTI-16

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-15-Rebuild-weigh-in-FTI-16]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used

Composer

### File List

- src/fitness/WeighInSheet.tsx
- src/fitness/types.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/weeklyAdjustment.ts
- src/fitness/screens/ScreenProgress.tsx
- src/fitness/screens/ScreenHome.tsx
- src/fitness/SundayReviewSheet.tsx
- src/fitness/dailyPlan.ts

### Completion Notes List

- Weigh-in primary flow on Progress via `WeighInSheet`; Home shows status and links to Progress tab.
- `loggedAtIso` set on save; syncs via existing `weightLog` JSONB pipeline.
- Removed 7-day-per-week gate and Progress “Week avg” table; Sunday review compares week means with ≥2 logged days per week.
- `npm run build` passes.

## Senior Developer Review (AI)

- Verified weigh-in respects `unitPreferences`; canonical lbs unchanged.
- Removed `MIN_WEIGH_INS_PER_WEEK` and `averageWeightInRange`; no remaining 7-day cut workflow in app code.
- Sunday review still uses week-over-week means (not per-entry trend) with a lower bar (2 days) — intentional simplification vs. 7/7 requirement.

## Review Follow-ups (AI)

- [x] TypeScript: restore `setState` on `ScreenHome` for `SettingsSheet`
- [x] Remove unused import on `ScreenProgress`
