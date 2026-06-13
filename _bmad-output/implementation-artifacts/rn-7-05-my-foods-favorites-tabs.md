---
name: RN-7-05 My Foods + Favorite foods tabs
epic: RN-7
story: 05
status: ready-for-dev
swarm_order: 5
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.05: My Foods + Favorite foods tabs

Status: done

## Story

**As a** user  
**I want** to manage saved foods and favorites  
**So that** I can quickly log items I eat regularly

## Acceptance Criteria

1. **Given** My foods tab, **When** opened, **Then** `nutritionUserFoods` list renders with name and macros
2. **Given** user food row, **When** tapped, **Then** serving picker opens (or direct log if single serving)
3. **Given** user food, **When** delete confirmed, **Then** `removeNutritionUserFoodFromState` updates slice
4. **Given** Favorite foods tab, **When** opened, **Then** starred presets and user foods show via `isNutritionFavorite`
5. **Given** logged item, **When** user saves to My foods, **Then** `nutritionUserFoodFromLoggedItem` adds entry
6. **Given** favorite toggle, **When** tapped, **Then** `toggleNutritionFavoriteInState` updates presets

## Tasks / Subtasks

- [x] My foods tab (AC: 1–3, 5)
  - [x] List `state.nutritionUserFoods`
  - [x] Tap → picker → log flow (reuse RN-7-04)
  - [x] Delete with confirm sheet (port `DeleteConfirmSheet` pattern)
  - [x] Edit user food macros (sheet matching PWA)
- [x] Favorite foods tab (AC: 4, 6)
  - [x] Merge favorites from presets + user foods
  - [x] Star/unstar toggle
  - [x] Tap to log
- [x] Save-to-my-foods entry point from picker post-log (AC: 5)

## Dev Notes

### Dependencies

**Requires RN-7-04** (picker + log pipeline).

### PWA parity reference

PWA tab key is `saved` with label **Favorite foods** — not "Favorites".

Core helpers: `appendNutritionUserFoodToState`, `updateNutritionUserFoodInState`, `removeNutritionUserFoodFromState`, `nutritionUserFoodFromLoggedItem`, `toggleNutritionFavoriteInState`, `isNutritionFavorite`, `touchNutritionPresetById`.

### Anti-patterns

- **Do not** implement meal editor here (RN-7-06)
- **Do not** break existing All-tab search (regression smoke on tab switch)

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
```

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-05
- PWA: `LogFoodScreen.tsx` myFoods + saved tabs, `DeleteConfirmSheet.tsx`
- Core: `nutritionLog.ts`, `nutritionTotals.ts`
