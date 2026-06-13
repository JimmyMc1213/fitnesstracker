---
name: RN-7-02 Log Food modal shell + tab navigation
epic: RN-7
story: 02
status: done
swarm_order: 2
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.02: Log Food modal shell + tab navigation

Status: ready-for-dev

## Story

**As a** user logging food  
**I want** the Log Food modal with tab navigation matching PWA  
**So that** I can browse All, My foods, My meals, and Favorite foods sections

## Acceptance Criteria

1. **Given** Nutrition tab or coach fuel task, **When** Log Food opens, **Then** stub copy is replaced with modal shell matching PWA header
2. **Given** modal open, **When** I view tabs, **Then** labels are **All**, **My foods**, **My meals**, **Favorite foods** (PWA `tabLabel` copy)
3. **Given** modal header, **When** rendered, **Then** Close, Manual Add, and Scan entry points visible (Manual/Scan stubs until RN-7-07)
4. **Given** each tab selected, **When** content area renders, **Then** section placeholder or empty state is shown (lists wired in RN-7-03+)
5. **Given** Maestro flows, **When** coach-nutrition or tab-nav runs, **Then** `testID="modal-log-food"` and `testID="modal-close"` remain stable

## Tasks / Subtasks

- [x] Replace `(modals)/log-food.tsx` stub (AC: 1–3)
  - [x] Create `components/nutrition/LogFoodScreen.tsx` shell (or `LogFoodModal.tsx`)
  - [x] Tab state: `all | myFoods | myMeals | saved` (PWA `LogFoodTab` type)
  - [x] Header row: title "Log Food", close → `router.back()`
  - [x] Secondary actions: Manual Add, Scan (navigate to stub screens or no-op with toast)
  - [x] Keyboard-safe `ScrollView` / `KeyboardAvoidingView`
- [x] Wire modal to fitness context (AC: 4)
  - [x] Accept `dateKey` defaulting to today via `localDateKey`
  - [x] Pass `state` / `setFitnessState` for downstream stories
- [x] Preserve Maestro testIDs (AC: 5)
  - [x] Re-run `npm run test:e2e:coach-nutrition` and `npm run test:e2e:tab-nav`

## Dev Notes

### Dependencies

**Requires RN-7-01 complete** — core nutrition exports available.

### PWA parity reference

```390:403:apps/pwa/src/fitness/LogFoodScreen.tsx
function tabLabel(t: LogFoodTab): string {
  switch (t) {
    case "all": return "All";
    case "myFoods": return "My foods";
    case "myMeals": return "My meals";
    case "saved": return "Favorite foods";
```

```1972:1985:apps/pwa/src/fitness/LogFoodScreen.tsx
// Tab bar with role="tab" buttons
```

### Current mobile state

```6:31:apps/mobile/app/(modals)/log-food.tsx
// Stub: title + close + "ships in RN-7" — replace entirely
```

Coach routing already opens this modal via `openNutritionLogFood()` and `openLogFood=1` param on nutrition tab.

### Anti-patterns

- **Do not** implement search, picker, or log persistence in this story
- **Do not** rename tab testIDs used by Maestro without updating flows
- **Do not** port 2,400-line PWA file wholesale — shell + tabs only

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:coach-nutrition
npm run test:e2e:tab-nav
```

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-02
- PWA: `LogFoodScreen.tsx` header + tab chrome
- Mobile: `app/(modals)/log-food.tsx`, `lib/openNutritionLogFood.ts`
