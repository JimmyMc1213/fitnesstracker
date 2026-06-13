---
name: RN-7-01 Nutrition core extract + tab dashboard
epic: RN-7
story: 01
status: done
swarm_order: 1
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.01: Nutrition core extract + tab dashboard

Status: ready-for-dev

## Story

**As a** developer  
**I want** nutrition pure logic in `packages/core` and a macro dashboard on the Nutrition tab  
**So that** RN log-food UI stories share one tested foundation and users see live macro totals

## Acceptance Criteria

1. **Given** PWA nutrition modules, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged API and colocated Vitest passes
2. **Given** onboarded user with `nutritionTargets`, **When** I open Nutrition tab, **Then** placeholder is replaced with macro ring, bars, and "cal left" copy
3. **Given** logged items for today, **When** dashboard renders, **Then** totals use `effectiveNutritionTotalsForDateKey` from fitness slice
4. **Given** protein target not met, **When** dashboard renders, **Then** protein priority hint matches PWA copy
5. **Given** coach or deep link, **When** `openLogFood=1` param is set, **Then** log-food modal still opens (existing behavior preserved)
6. **Given** Maestro tab-nav, **When** `npm run test:e2e:tab-nav` runs, **Then** Nutrition tab reachable with `testID="tab-nutrition"` and `testID="open-log-food"`

## Tasks / Subtasks

- [x] Extract to `packages/core/src/nutrition/` (AC: 1)
  - [x] `nutritionLog.ts` + test (from `apps/pwa/src/fitness/nutritionLog.ts`)
  - [x] `foodMeasurements.ts` + test
  - [x] `nutritionMeals.ts` + test
  - [x] `waterIntake.ts` + test
  - [x] `servingDefaults.ts`, `macroLimits.ts` (helpers used by log flows)
  - [x] Port any missing helpers from PWA `nutritionTotals.ts` not yet in core
  - [x] Export from `packages/core/src/index.ts`; PWA files become thin re-exports
- [x] Replace `(tabs)/nutrition.tsx` placeholder (AC: 2–4)
  - [x] Reuse `MacroRing` from `components/home/MacroRing.tsx` (size ~132 for tab parity)
  - [x] Add `MacroBar` rows for protein/carbs/fat (extract shared component or inline match Home tokens)
  - [x] Wire `useFitnessState` + `localDateKey` + `effectiveNutritionTotalsForDateKey`
  - [x] Preserve `openLogFood` effect + `testID="open-log-food"` button
  - [x] Remove "ships in RN-7" placeholder copy
- [x] Run gates (AC: 1, 6)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/nutrition.tsx` | `TabPlaceholderScreen` | Macro dashboard |
| `packages/core/src/nutrition/` | `nutritionTotals.ts` only | Full nutrition domain extract |
| `apps/pwa/src/fitness/nutritionLog.ts` | Source of truth | Re-export from core |
| `FitnessProvider` | RN-5 done | Read/write nutrition slice via `setFitnessState` |

**Blocks RN-7-02..09** — no log-food UI until core extract lands.

### PWA parity reference

```16:23:apps/pwa/src/fitness/screens/ScreenNutrition.tsx
export function ScreenNutrition({ state, setState, logFoodOpenRequest, ... }: ScreenProps) {
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    todayKey,
  );
```

```54:106:apps/pwa/src/fitness/screens/ScreenNutrition.tsx
// Macro ring + bars card + protein priority paragraph
```

### Architecture compliance

- Route: `(tabs)/nutrition` per `architecture-rn-migration.md` §3
- Log Food: `(modals)/log-food` — do not implement modal content here (RN-7-02)
- Reuse Home `MacroRing` / animation hook — do not fork ring logic

### Anti-patterns

- **Do not** port `LogFoodScreen` monolith in this story
- **Do not** wire cloud sync (RN-OFFLINE)
- **Do not** add water tracker or today food log yet (RN-7-08, RN-7-09)
- **Do not** break `npm run test:e2e:coach-nutrition` or `npm run test:e2e:tab-nav`

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # until PWA tests move with re-exports
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
npm run test:e2e:coach-nutrition
```

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-01
- PWA: `ScreenNutrition.tsx`, `nutritionLog.ts`, `foodMeasurements.ts`, `nutritionMeals.ts`, `waterIntake.ts`
- Mobile: `app/(tabs)/nutrition.tsx`, `components/home/MacroRing.tsx`, `context/FitnessContext.tsx`
