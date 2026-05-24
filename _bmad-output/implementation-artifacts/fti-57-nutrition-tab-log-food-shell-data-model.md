# Story 7.1: Nutrition tab strip + Log Food shell + data model (FTI-57)

Status: done

## Story

As a user,
I want a focused Nutrition tab with macro rings, hydration, and a Log Food flow for manual logging and re-logging recent foods,
so fuel tracking has one clear entry point without clutter on the main tab.

## Acceptance Criteria

1. **Data model:** `NutritionLoggedItem` extended with optional `servingLabel`, `source`, `externalId`, `loggedAtMs`; legacy persisted rows load without errors (default `loggedAtMs` when missing).

2. **Persist + sync:** New fields flow through persist slice normalization and cloud merge (`normalizeNutritionItemsByDay`, `mergePersistedFitnessSlices.ts`).

3. **Nutrition tab strip:** Keep macro ring hero, P/C/F bars, macro pace hint, and `WaterTrackerCard`. Remove Today/Saved segment tabs, quick-add protein chips, today's log list, add-custom form, and whole-day manual totals fallback.

4. **FAB:** Floating `+` below hydration opens full-screen Log Food overlay (not bottom sheet).

5. **Log Food shell:** Back closes without logging; title "Log Food"; tab bar All · My foods · My meals · Saved foods (empty states OK in S7); search placeholder "Describe what you ate" (UI only, no API); Recently logged rows with name, calories, serving, `+` quick-add; bottom Manual Add button.

6. **Manual add:** Form: name + calories + P/C/F + optional serving label → log to today → close overlay → rings/totals update.

7. **Recently logged:** `getRecentlyLoggedFoods()` dedupes by name, sorts by `loggedAtMs`; tap `+` re-logs in one tap → close → rings update; existing user logs appear after migration defaults.

8. **Return flow:** After any successful log, overlay closes and user remains on Nutrition tab; streak and coach pace pipelines unchanged (`appendNutritionLoggedItem`, `applyStreakEligibility`).

9. **Quality gate:** `npm run build` + `npm test` pass. Existing workout-session E2E still pass (Home fuel quick-log E2E may fail until FTI-59 - expected).

## Tasks / Subtasks

- [x] **Task 1: Extend types + normalization** (AC: 1, 2)
  - [x] 1.1 Add optional fields to `NutritionLoggedItem` in `types.ts`
  - [x] 1.2 Update `buildNutritionLoggedItem` to accept/set `loggedAtMs` (default `Date.now()`)
  - [x] 1.3 Backfill defaults in `normalizeNutritionItemsByDay` for legacy rows
  - [x] 1.4 Verify merge in `mergePersistedFitnessSlices.ts`

- [x] **Task 2: Recently logged helper** (AC: 7)
  - [x] 2.1 `getRecentlyLoggedFoods(itemsByDay)` in `nutritionLog.ts` (or colocated module)
  - [x] 2.2 Colocated Vitest for dedupe + sort

- [x] **Task 3: Strip `ScreenNutrition`** (AC: 3, 4)
  - [x] 3.1 Remove segment tabs, today list, quick-add chips, manual totals fallback
  - [x] 3.2 Add FAB + overlay open state
  - [x] 3.3 Keep rings, pace copy, water card

- [x] **Task 4: Build `LogFoodScreen` overlay** (AC: 5, 6, 7, 8)
  - [x] 4.1 New component under `src/fitness/` (e.g. `LogFoodScreen.tsx`)
  - [x] 4.2 Tab shell + empty states for unwired tabs
  - [x] 4.3 Recently logged section with one-tap re-log
  - [x] 4.4 Manual Add sub-flow / form
  - [x] 4.5 Wire close → Nutrition tab with updated totals

- [x] **Task 5: Verification** (AC: 9)
  - [x] 5.1 `npm run build` + `npm test`
  - [x] 5.2 Manual smoke: log manual item → rings update; re-log from recently logged

## Dev Notes

- **Checklist:** `nutrition-os-v2-checklist.md` phases 0.3, 1, 2
- **Do not** wire USDA/OFF search (Sprint 8) or remove Home quick-log (FTI-58)
- **Reuse:** `MacroRing`, `PrimaryButton`, `appendNutritionLoggedItem`, `effectiveNutritionTotalsForDateKey`
- **Partial impl today:** `ScreenNutrition.tsx` has Today/Saved segments and inline logging to remove
- **blocks:** FTI-58 (Home removal), FTI-59 (E2E)

## References

- linear: FTI-51
- story_key: fti-57-nutrition-tab-log-food-shell-data-model
- epic: epic-fti-sprint-7
- depends_on: Sprint 6 complete (FTI-49 Nutrition tab baseline)

## Dev Agent Record

### Agent Model Used

_(filled on implementation)_

### Completion Notes List

_(filled on implementation)_

### File List

_(filled on implementation)_

### Change Log

- 2026-05-23: Sprint 7 planning - story file created
