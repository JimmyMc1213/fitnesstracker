---
name: RN-5-03 Fuel carousel + macro rings
epic: RN-5
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-5/home-coach
---

# Story 5.03: Fuel carousel + animated macro rings

Status: ready-for-dev

## Story

**As an** onboarded user  
**I want** to see my daily fuel progress with an animated calorie ring  
**So that** I can track macros at a glance and jump to logging

## Acceptance Criteria

1. **Given** today or historical date, **When** fuel slide renders, **Then** calorie `MacroRing` shows progress toward `nutritionTargets.cal`
2. **Given** nutrition totals change, **When** ring animates, **Then** Reanimated drives smooth progress (parity with PWA CSS animation)
3. **Given** fuel slide, **When** I view macro bars, **Then** protein/carbs/fat bars reflect totals vs targets
4. **Given** today view, **When** I tap `[+ Log]`, **Then** app navigates to nutrition tab (no quick-log overlay)
5. **Given** carousel, **When** I swipe, **Then** I alternate between fuel slide (1) and coach slide (2) with dot indicators

## Tasks / Subtasks

- [ ] Port `MacroRing` + `MacroBar` RN components (AC: 1–3)
  - [ ] Reanimated shared value for ring sweep; `testID="macro-ring-cal"`
  - [ ] Port or adapt `useAnimatedMacroProgress` hook
- [ ] Implement fuel slide in `HomeDashboardCarousel` (AC: 1, 4, 5)
  - [ ] `effectiveNutritionTotalsForDateKey` for active date
  - [ ] Kcal remaining label; "Fuel · Today" vs "Fuel" label
  - [ ] Horizontal `FlatList`/`ScrollView` paging; height 196px parity
- [ ] Wire `[+ Log]` → `router.push("/(tabs)/nutrition")` (AC: 4)
- [ ] Run `npm run typecheck --workspace=@newyouai/mobile`

## Dev Notes

### Dependencies

- RN-5-01 fitness state (nutrition totals, targets)
- RN-5-02 carousel host with coach slide already present

### PWA parity reference

- `HomeDashboardCarousel.tsx` fuel slide (`FuelSlide`)
- `shared.tsx` `MacroRing`, `useAnimatedMacroProgress`

### Anti-patterns

- **Do not** add `HomeFuelQuickLogSheet` (removed from PWA)
- **Do not** implement log-food modal content (RN-7)

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- FTI-31 animated macro rings story for animation reference
