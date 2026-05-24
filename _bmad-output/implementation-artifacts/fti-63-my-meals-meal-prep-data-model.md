# Story 9.1: My meals meal prep + data model (FTI-63)

Status: done

## Story

As a user,
I want to create saved meals from search results, My foods, or manual entries and log them in one tap,
so meal prep foods I eat repeatedly are faster to track than logging each ingredient separately.

## Acceptance Criteria

1. **Data model:** `NutritionMeal` type with `id`, `name`, `items[]` (each item: name + macros + optional `servingLabel`, `source`, `externalId`); `nutritionMeals` on `AppState`.

2. **Persist + sync:** `nutritionMeals` included in persist slice and cloud merge (`mergePersistedFitnessSlices.ts`, `persistFitnessSlice.ts`); existing users default to empty array without migration errors.

3. **Create meal flow:** "Create meal" CTA on My meals tab; add items from: All-tab search (with serving picker), My foods list, or inline manual entry; meal name required; displayed macros = sum of item macros.

4. **Log meal:** Tap saved meal → log as single `NutritionLoggedItem` (meal name + total macros + optional composite serving label) → close overlay → rings update.

5. **Recently logged:** Logged meals appear in recently logged via existing pipeline (`getRecentlyLoggedFoods`, `appendNutritionLoggedItem`).

6. **Edit / delete:** Edit meal name and ingredients; delete meal from library (does not remove past log history).

7. **Replace placeholder:** Remove "coming in a future update" copy on My meals tab; helpful empty state when no meals saved.

8. **Quality gate:** Colocated Vitest for meal macro summing helpers; `npm run build` + `npm test` pass. No E2E required in this story (deferred to FTI-65).

## Tasks / Subtasks

- [x] **Task 1: Data model + persist** (AC: 1, 2)
  - [x] 1.1 Add `NutritionMeal` + `NutritionMealItem` types in `types.ts`
  - [x] 1.2 Add `nutritionMeals` to `AppState`, `buildAppState`, persist slice
  - [x] 1.3 Cloud merge in `mergePersistedFitnessSlices.ts`
  - [x] 1.4 Helpers: `sumMealMacros`, `appendNutritionMeal`, `updateNutritionMeal`, `removeNutritionMeal`

- [x] **Task 2: Create meal UI** (AC: 3, 7)
  - [x] 2.1 Replace My meals placeholder with list + empty state
  - [x] 2.2 Create-meal sub-flow: name field + ingredient list
  - [x] 2.3 Add ingredient from search (reuse serving picker + `foodMeasurements.ts`)
  - [x] 2.4 Add ingredient from My foods or manual inline form
  - [x] 2.5 Save meal to `nutritionMeals`

- [x] **Task 3: Log + edit + delete** (AC: 4, 5, 6)
  - [x] 3.1 Tap meal row → log composite item → close → rings update
  - [x] 3.2 Edit meal flow (rename, add/remove/adjust ingredients)
  - [x] 3.3 Delete meal with confirmation

- [x] **Task 4: Verification** (AC: 8)
  - [x] 4.1 Vitest for `sumMealMacros` and persist normalization
  - [x] 4.2 `npm run build` + `npm test`
  - [x] 4.3 Manual smoke: create meal → log → rings update → edit → delete

## Dev Notes

- **Checklist:** `nutrition-os-v2-checklist.md` phases 0.3 (finish), 6
- **Do not** fork measurement math - reuse `foodMeasurements.ts`, `scaleMacros`, serving picker from All tab
- **Do not** start Cal AI polish (FTI-64) or E2E meal spec (FTI-65) in this story
- **Reuse:** `LogFoodScreen.tsx`, `buildNutritionLoggedItem`, `appendNutritionLoggedItem`, `PrimaryButton`
- **partial_impl:** My meals tab shows placeholder at line ~1067 in `LogFoodScreen.tsx`
- **blocks:** FTI-64, FTI-65

## References

- linear: FTI-57
- story_key: fti-63-my-meals-meal-prep-data-model
- epic: epic-fti-sprint-9
- depends_on: Sprint 8 complete (FTI-60–62 search + My foods library)

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm)

### Completion Notes List

- Added `NutritionMeal` / `NutritionMealItem` types, persist slice, cloud merge, and `nutritionMeals.ts` helpers.
- Replaced My meals placeholder with full create / log / edit / delete flow in `LogFoodScreen.tsx`.
- Reused serving picker, `foodMeasurements.ts`, and existing log pipeline for composite meal rows.
- 11 Vitest cases in `nutritionMeals.test.ts`; `npm test` (134) + `npm run build` pass.

### File List

- `src/fitness/types.ts`
- `src/fitness/nutritionMeals.ts`
- `src/fitness/nutritionMeals.test.ts`
- `src/fitness/persistFitnessSlice.ts`
- `src/fitness/mergePersistedFitnessSlices.ts`
- `src/fitness/buildAppState.ts`
- `src/fitness/LogFoodScreen.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/fti-63-my-meals-meal-prep-data-model.md`
