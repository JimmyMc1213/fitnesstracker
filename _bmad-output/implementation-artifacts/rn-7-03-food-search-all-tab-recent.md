---
name: RN-7-03 Food search All tab + recently logged
epic: RN-7
story: 03
status: done
swarm_order: 3
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.03: Food search (All tab) + recently logged

Status: done

## Story

**As a** user  
**I want** to search the food database and re-log recent items from the All tab  
**So that** I can quickly find foods without typing full nutrition data

## Acceptance Criteria

1. **Given** All tab, **When** I type 2+ characters, **Then** debounced search calls Edge Function via `@newyouai/api-client` `searchFood`
2. **Given** search results, **When** list renders, **Then** food name and calories shown; skeleton shown while loading
3. **Given** auth missing or rate limited, **When** search fails, **Then** user sees PWA-parity error copy (`FoodSearchError` codes)
4. **Given** prior logs exist, **When** All tab opens, **Then** "Recently logged" section lists items via `getRecentlyLoggedFoods`
5. **Given** `EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH=true`, **When** query includes "chicken", **Then** mock returns "Grilled chicken breast" (Maestro parity)
6. **Given** result tapped, **When** picker not yet wired, **Then** serving picker slot opens (stub OK — RN-7-04 completes log)

## Tasks / Subtasks

- [x] Mobile food search adapter (AC: 1–3)
  - [x] `apps/mobile/lib/foodSearchService.ts` wrapping `searchFood` + Supabase session check
  - [x] Port `sanitizeFoodSearchQuery`, in-memory cache from PWA (optional, match behavior)
  - [x] `EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH` mock mirroring PWA `e2eMockResults`
- [x] All tab UI (AC: 1–4)
  - [x] Search `TextInput` with `testID` / accessibilityLabel "Search foods"
  - [x] Debounce 300ms, min length 2
  - [x] Result rows tappable → open serving picker state
  - [x] Recently logged rows with "Log again {name}" pattern
  - [x] Curated foods section from `curatedFoods.ts` (port to core or mobile lib)
- [x] Error/empty states (AC: 3)
  - [x] Auth required, rate limit, unavailable messages

## Dev Notes

### Dependencies

**Requires RN-7-01, RN-7-02.** Serving picker completion in RN-7-04.

### PWA parity reference

```61:90:apps/pwa/src/fitness/foodSearchService.ts
export async function searchFoods(query: string): Promise<FoodSearchResult[]>
```

```33:57:apps/pwa/src/fitness/foodSearchService.ts
// VITE_E2E_MOCK_FOOD_SEARCH chicken mock
```

E2E expectation from Playwright:

```48:49:apps/pwa/e2e/nutrition-log-food.spec.ts
await page.getByLabel("Search foods").fill("chicken");
await expect(page.getByText("Grilled chicken breast")).toBeVisible({ timeout: 10_000 });
```

### Api-client (already extracted)

```43:63:packages/api-client/src/invoke/foodSearch.ts
export async function searchFood(client: SupabaseClient, query: string)
```

### Anti-patterns

- **Do not** duplicate Edge Function invoke logic outside api-client
- **Do not** require live USDA/OFF in Maestro — use mock env flag
- **Do not** append to nutrition log until RN-7-04 picker confirms

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/api-client   # if adapter helpers added
npm run test --workspace=@newyouai/core         # if curated foods moved to core
```

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-03
- PWA: `LogFoodScreen.tsx` All tab, `foodSearchService.ts`, `FoodSearchSkeletonList.tsx`, `curatedFoods.ts`
- Mobile: `lib/supabase.ts` or existing auth client pattern from RN-2
