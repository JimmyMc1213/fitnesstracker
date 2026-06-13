---
name: RN-7-06 My Meals + meal editor
epic: RN-7
story: 06
status: done
swarm_order: 6
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.06: My Meals + meal editor

Status: done

## Story

**As a** user  
**I want** to create saved meals and log them in one tap  
**So that** recurring meal combos are fast to track

## Acceptance Criteria

1. **Given** My meals tab, **When** opened, **Then** `nutritionMeals` list shows name and total calories
2. **Given** meal row, **When** tapped, **Then** `buildLoggedItemFromMeal` logs combined macros and modal closes
3. **Given** create meal flow, **When** user adds ingredients, **Then** meal draft accumulates items with `sumMealMacros` preview
4. **Given** saved meal, **When** user edits/deletes, **Then** `updateNutritionMeal` / `removeNutritionMeal` with confirm
5. **Given** `mealLogPersistSeed` data, **When** E2E meal "E2E prep bowl" tapped, **Then** totals match Playwright expectations (1650 cal left, 63/180g protein)

## Tasks / Subtasks

- [x] My meals tab list (AC: 1–2)
  - [x] Row: meal name + cal summary
  - [x] Tap → log via `buildLoggedItemFromMeal` + RN-7-04 toast
  - [x] Swipe/delete with confirm
- [x] Meal editor subflow (AC: 3–4)
  - [x] Create/edit meal name
  - [x] Add ingredients: search, my foods, favorites, manual (picker context `mealIngredient`)
  - [x] `appendNutritionMeal`, `updateNutritionMeal`, `removeNutritionMeal`
  - [x] Ingredient list with remove + running macro total
- [x] Prepare E2E seed shape (AC: 5)
  - [x] Document `mealLogPersistSeed` port for RN-7-09

## Dev Notes

### Dependencies

**Requires RN-7-04, RN-7-05** (ingredient pickers reuse search/my foods paths).

### PWA parity reference

```59:77:apps/pwa/e2e/nutrition-log-food.spec.ts
await page.getByRole("tab", { name: "My meals" }).click();
await page.getByRole("button", { name: /E2E prep bowl 350 cal/i }).click();
await expect(page.getByText("1650 cal left")).toBeVisible();
```

```152:169:apps/pwa/e2e/helpers/seed.ts
export function mealLogPersistSeed(dateKey = localDateKey()) { ... }
```

Core: `nutritionMeals.ts` — `appendNutritionMeal`, `buildLoggedItemFromMeal`, `sumMealMacros`, `mealItemFromPreset`, `mealItemFromUserFood`.

### Anti-patterns

- **Do not** log individual meal ingredients to today's log — log one combined row per PWA
- **Do not** skip delete confirm ("Past logs will stay in your history" copy)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-06
- PWA: `LogFoodScreen.tsx` myMeals + meal editor subflows, `nutritionMeals.ts`
