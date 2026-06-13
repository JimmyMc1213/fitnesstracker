---
name: RN-7-08 Today food log + edit/delete undo
epic: RN-7
story: 08
status: ready-for-dev
swarm_order: 8
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.08: Today food log + edit/delete undo

Status: done

## Story

**As a** user on the Nutrition tab  
**I want** to see today's logged foods and edit or delete them  
**So that** I can correct mistakes without opening Log Food blindly

## Acceptance Criteria

1. **Given** Nutrition tab, **When** items logged today, **Then** `TodayFoodLogCard` lists rows with name and macros
2. **Given** food row, **When** tapped, **Then** Log Food reopens in edit mode via `loggedItemToPickerEdit`
3. **Given** food row, **When** swipe-to-delete, **Then** item removed with undo toast (PWA swipe parity)
4. **Given** no items today, **When** card renders, **Then** empty state with CTA to log food
5. **Given** delete undo, **When** triggered, **Then** item restored in `nutritionItemsByDay`

## Tasks / Subtasks

- [x] Port `TodayFoodLogCard` (AC: 1, 4)
  - [x] Section below macro card on `(tabs)/nutrition.tsx`
  - [x] Row layout: name, serving, macro summary
  - [x] `testID`s for Maestro: food name visible, edit affordance
- [x] Edit flow (AC: 2)
  - [x] Pass `editItem` into Log Food modal
  - [x] `updateNutritionLoggedItem` on save
- [x] Swipe delete (AC: 3, 5)
  - [x] `react-native-gesture-handler` Swipeable or equivalent
  - [x] Undo via same toast pattern as RN-7-04
  - [x] Port swipe distance behavior from PWA E2E pointer events test

## Dev Notes

### Dependencies

**Requires RN-7-04** (log/edit/undo primitives). Water card slot reserved for RN-7-09 below this card.

### PWA parity reference

```27:37:apps/pwa/e2e/nutrition-log-food.spec.ts
await expect(page.getByText("E2E shake")).toBeVisible();
// swipe delete → "2000 cal left" restored
```

```119:120:apps/pwa/src/fitness/screens/ScreenNutrition.tsx
<TodayFoodLogCard dateKey={todayKey} ... />
```

Handlers: `todayFoodLogHandlers(setState, todayKey)` pattern from PWA.

### Anti-patterns

- **Do not** implement water tracker in this story (RN-7-09)
- **Do not** delete without undo toast
- **Do not** break macro dashboard from RN-7-01 when list updates

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
```

Manual: log manual item → see row → swipe delete → undo.

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-08
- PWA: `TodayFoodLogCard.tsx`, `ScreenNutrition.tsx`
- Core: `nutritionLog.ts` (`updateNutritionLoggedItem`, `loggedItemToPickerEdit`)
