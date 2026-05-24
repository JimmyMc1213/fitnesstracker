# Story 8.1: USDA search + Edge Function + All-tab wiring (FTI-60)

Status: done

## Story

As a user,
I want to search a food database from the Log Food screen and log a selected item with the correct serving,
so I can track meals without manual macro entry for common foods.

## Acceptance Criteria

1. **API setup:** USDA FoodData Central API key stored server-side only (`USDA_FDC_API_KEY` on Supabase Edge Function env); never in client bundle.

2. **Edge Function:** `food-search` Supabase Edge Function proxies USDA `/foods/search`; returns normalized `FoodSearchResult[]`.

3. **Shared types:** `FoodSearchResult`, `FoodServing` (id, name, brand, cal, p, c, f, defaultServing, source, externalId).

4. **Client service:** `foodSearchService.ts` calls Edge Function with debounced query (~300ms).

5. **All tab UX:** Search bar triggers search while typing; results list shows name, calories, brand; tap result → serving picker (size scales macros); confirm → log with `source` + `externalId` + `servingLabel` → close overlay → rings update.

6. **Recently logged:** Search-logged foods appear in recently logged via existing pipeline.

7. **States:** Loading spinner during search; "No results" empty state; offline/API error message with retry.

8. **Quality gate:** `npm run build` + `npm test` pass. Existing nutrition E2E still pass (search E2E deferred to FTI-62).

## Tasks / Subtasks

- [ ] **Task 1: Edge Function scaffold** (AC: 1, 2, 3)
  - [ ] 1.1 Create `supabase/functions/food-search/index.ts`
  - [ ] 1.2 Map USDA `/foods/search` response → `FoodSearchResult`
  - [ ] 1.3 Document `USDA_FDC_API_KEY` in `.env.example` (server-side note only)
  - [ ] 1.4 Shared types module (client-importable + function)

- [ ] **Task 2: Client search service** (AC: 4)
  - [ ] 2.1 `foodSearchService.ts` with debounced fetch
  - [ ] 2.2 Error mapping for network/API failures

- [ ] **Task 3: Log Food All tab** (AC: 5, 6, 7)
  - [ ] 3.1 Replace local-only search filter with API results when query length ≥ 2
  - [ ] 3.2 Results list UI (name, kcal, brand)
  - [ ] 3.3 Serving picker sub-flow; scale macros by serving multiplier
  - [ ] 3.4 Confirm → `buildNutritionLoggedItem` with metadata → close → rings update
  - [ ] 3.5 Loading, empty, and error states

- [ ] **Task 4: Verification** (AC: 8)
  - [ ] 4.1 `npm run build` + `npm test`
  - [ ] 4.2 Manual smoke: search "chicken" → pick serving → log → rings update

## Dev Notes

- **Checklist:** `nutrition-os-v2-checklist.md` phases 0.2, 3
- **Do not** wire Open Food Facts yet (FTI-61) or My foods tab (FTI-62)
- **Reuse:** `LogFoodScreen.tsx`, `buildNutritionLoggedItem`, `appendNutritionLoggedItem`, `PrimaryButton`
- **partial_impl:** Search input exists but filters recently logged only; extend All tab
- **blocks:** FTI-61, FTI-62

## References

- linear: FTI-54
- story_key: fti-60-usda-food-search-edge-function-all-tab
- epic: epic-fti-sprint-8
- depends_on: Sprint 7 complete (FTI-57 Log Food shell + data model)

## Dev Agent Record

### Agent Model Used

_(filled on implementation)_

### Completion Notes List

_(filled on implementation)_

### File List

_(filled on implementation)_

### Change Log

- 2026-05-23: Sprint 8 planning - story file created
