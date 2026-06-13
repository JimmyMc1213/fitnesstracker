---
name: RN-8-04 Average calories + goal range + fuel updates + targets
epic: RN-8
story: 04
status: done
swarm_order: 4
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.04: Average calories + goal range + fuel updates + targets

Status: done

## Story

**As a** user  
**I want** to see average calories, goal weight progress, fuel adjustment history, and macro targets on Progress  
**So that** I understand nutrition trajectory alongside body weight and training data

## Acceptance Criteria

1. **Given** PWA `averageCalTracker.ts`, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged and Vitest passes
2. **Given** `nutritionItemsByDay` (RN-7), **When** avg calories card renders, **Then** 7-day average vs target matches PWA `AverageCalTrackerCard`
3. **Given** `progressGoal` from onboarding, **When** goal range card renders, **Then** current → lo–hi range, % bar, and pace copy match PWA
4. **Given** `adjustmentHistory` entries, **When** fuel updates section renders, **Then** up to 6 rows show cal change + weekly rate
5. **Given** `nutritionTargets`, **When** targets grid renders, **Then** read-only calories/protein/carbs/fat grid matches PWA (edit in RN-10)
6. **Given** no `progressGoal`, **When** goal card renders, **Then** "Complete onboarding…" empty state (PWA copy)

## Tasks / Subtasks

- [x] Extract `averageCalTracker.ts` to `packages/core/src/progress/` + test (AC: 1)
  - [x] Export from core; PWA re-export
- [x] Port `AverageCalTrackerCard` (AC: 2)
  - [x] Wire `nutritionItemsByDay`, `nutritionTargets`, `todayKey`
  - [x] `testID="progress-avg-calories"`
- [x] Goal range + fuel updates blocks (AC: 3–4, 6)
  - [x] `goalPct` calculation from PWA `ScreenProgress` (cutBarStart, goalLo/Hi)
  - [x] `adjustmentHistory.slice(0, 6)` list with `formatWeeklyRateLbsPerWeek`
  - [x] `testID="progress-goal-range"`
- [x] Targets grid (AC: 5)
  - [x] 2×2 grid; footer "Steps: Settings" copy
  - [x] `testID="progress-targets-grid"`
- [x] Section order on Progress: weight → pics (RN-8-05) slot → avg cal → sunday history (RN-8-07) → workouts (RN-8-03) — adjust layout as sections land

## Dev Notes

### Dependencies

**Requires RN-8-01**. **RN-7** nutrition slice required for avg calories. Can ship before RN-8-03 if calendar not yet merged — insert sections in PWA order when integrating.

### PWA parity reference

```232:341:apps/pwa/src/fitness/screens/ScreenProgress.tsx
// AverageCalTrackerCard, goal range card, adjustmentHistory, targets grid
```

### Anti-patterns

- **Do not** make targets editable (RN-10 settings panels)
- **Do not** duplicate nutrition dashboard from Nutrition tab — Progress shows summary cards only
- **Do not** implement progress pics section here (RN-8-05)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-04
- PWA: `AverageCalTrackerCard.tsx`, `averageCalTracker.ts`, `ScreenProgress.tsx`
- Core: `nutrition/nutritionTotals.ts` (RN-7)
