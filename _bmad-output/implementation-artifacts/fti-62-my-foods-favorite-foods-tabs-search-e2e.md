# Story 8.3: My foods + Favorite foods tabs + search E2E (FTI-62)

Status: done

## Story

As a user,
I want My foods and Favorite foods tabs wired to my saved library and presets,
so I can re-log custom entries and favorites without searching every time.

## Acceptance Criteria

1. **Data model:** `NutritionUserFood` + `nutritionUserFoods` on `AppState`; persist + cloud sync merge
2. **My foods tab:** List manual + saved search foods; tap → log; edit / delete
3. **Save from search:** Optional "Save to My foods" on serving picker (without logging today)
4. **Favorite foods tab:** Wire to `nutritionPresets`; tap + → log; remove from favorites
5. **Empty states:** Helpful copy on My foods and Favorite foods tabs
6. **E2E:** Search → select serving → log → rings update on Nutrition tab
7. **Quality:** `npm run build` + `npm test` + `npm run test:e2e` pass

## Tasks / Subtasks

- [x] **Task 1: NutritionUserFood data model + persist/merge** (AC: 1)
- [x] **Task 2: My foods tab UI** (AC: 2, 5)
- [x] **Task 3: Save to My foods from search picker** (AC: 3)
- [x] **Task 4: Favorite foods tab** (AC: 4, 5)
- [x] **Task 5: Search E2E with mocked edge function** (AC: 6)
- [x] **Task 6: Verification** (AC: 7)

## Dev Agent Record

### Completion Notes

- Added `NutritionUserFood` type with persist slice + merge support
- Wired My foods and Favorite foods tabs in LogFoodScreen
- Manual add auto-saves to My foods library
- E2E mocks Supabase food-search for search → log flow

### File List

- src/fitness/types.ts
- src/fitness/nutritionLog.ts
- src/fitness/nutritionTotals.ts
- src/fitness/buildAppState.ts
- src/fitness/persistFitnessSlice.ts
- src/fitness/mergePersistedFitnessSlices.ts
- src/fitness/LogFoodScreen.tsx
- e2e/nutrition-log-food.spec.ts
- playwright.config.ts
- vite.config.ts
