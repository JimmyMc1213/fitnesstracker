---
name: RN-7-04 Serving picker + log flow + food added toast
epic: RN-7
story: 04
status: done
swarm_order: 4
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.04: Serving picker + log flow + food added toast

Status: done

## Story

**As a** user  
**I want** to choose a serving size and log food with undo  
**So that** my nutrition totals update accurately and mistakes are reversible

## Acceptance Criteria

1. **Given** food selected from search/recent/curated, **When** picker opens, **Then** serving measurements, quantity, and macro preview match PWA
2. **Given** valid picker state, **When** I tap Log food, **Then** item appends via `appendNutritionLoggedItem` and modal closes
3. **Given** daily item cap, **When** `canAppendNutritionItem` is false, **Then** user sees limit message (50/day)
4. **Given** successful log, **When** modal closes, **Then** Nutrition tab totals update immediately
5. **Given** food logged, **When** toast appears, **Then** Undo removes item via `removeNutritionLoggedItem`
6. **Given** recent item safe to re-log, **When** one-tap re-log, **Then** item logs without picker (PWA parity)

## Tasks / Subtasks

- [x] Serving picker UI (AC: 1)
  - [x] Sheet/modal: heading "Choose serving"
  - [x] Measurement pills from `buildMeasurements` / `foodMeasurements`
  - [x] Quantity input + live macro preview via `computeServingMultiplier`
  - [x] Primary CTA "Log food"
- [x] Log pipeline (AC: 2–4)
  - [x] `buildNutritionLoggedItem` with servingLabel, source, externalId metadata
  - [x] Patch fitness slice `nutritionItemsByDay[dateKey]`
  - [x] Close log-food modal on success (`router.back()`)
- [x] Food added toast (AC: 5)
  - [x] Port `FoodAddedToast` / `useFoodAddedToast` pattern to RN
  - [x] Undo restores previous slice state
- [x] Re-log shortcut (AC: 6)
  - [x] Wire recently logged one-tap path

## Dev Notes

### Dependencies

**Requires RN-7-01..03.** Enables end-to-end search → log for Maestro (RN-7-09).

### PWA parity reference

```48:56:apps/pwa/e2e/nutrition-log-food.spec.ts
await page.getByRole("button", { name: "Grilled chicken breast 165" }).click();
await expect(page.getByRole("heading", { name: "Choose serving" })).toBeVisible();
await page.locator("button.tap", { hasText: "Log food" }).click();
await expect(page.getByText("1835 cal left")).toBeVisible();
```

Core functions (post RN-7-01 extract):

- `buildNutritionLoggedItem`, `appendNutritionLoggedItem`, `canAppendNutritionItem`
- `removeNutritionLoggedItem`, `getRecentlyLoggedFoods`

### Anti-patterns

- **Do not** skip `clampMacroTotals` / `macroLimits` on manual macro paths
- **Do not** write directly to AsyncStorage — use `setFitnessState` only
- **Do not** implement My Foods / Meals tabs here (RN-7-05, RN-7-06)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: search chicken (mock) → pick serving → verify nutrition tab ring updates.

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-04
- PWA: `LogFoodScreen.tsx` picker section, `FoodAddedToast.tsx`, `foodMeasurements.ts`
- Core: `nutritionLog.ts`, `foodMeasurements.ts`
