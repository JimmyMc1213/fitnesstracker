---
name: RN-10-04 Fuel targets + Hydration + Goal panels
epic: RN-10
story: 04
status: ready-for-dev
swarm_order: 4
swarm_branch: epic-rn-10/settings-account
---

# Story 10.04: Fuel targets + Hydration + Goal panels

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10-04 -->

## Story

**As a** user  
**I want** to edit macro targets, hydration goal, and weight goal in Settings  
**So that** nutrition and progress views use my updated targets (ST-06, ST-07, ST-08)

## Acceptance Criteria

1. **Given** Fuel targets panel, **When** I edit cal/P/C/F inputs, **Then** values clamp per `clampMacroInputString` / `clampMacroValue` and persist to `nutritionTargets`
2. **Given** Hydration panel, **When** I pick preset or enter custom volume, **Then** `waterDailyTargetOz` normalizes via `normalizeWaterDailyTargetOz` and respects `unitPreferences.volumeUnit`
3. **Given** Goal panel with dirty draft, **When** I tap back, **Then** discard confirm sheet appears (`DiscardGoalChangesConfirmSheet`)
4. **Given** valid goal draft, **When** I tap Save in header, **Then** save confirm sheet appears; on confirm `applyGoalSettingsDraft` updates `onboardingProfile` + `progressGoal` + `nutritionTargets`
5. **Given** invalid goal weight for cut/bulk, **When** Save tapped, **Then** save disabled (`isGoalWeightValid` false)
6. **Given** fuel target change, **When** I open Nutrition tab, **Then** macro rings / calorie target reflect new `nutritionTargets.cal` (RN-7 integration)
7. **Given** goal save, **When** I open Progress tab, **Then** goal range card reflects updated `progressGoal` (RN-8 integration)

## Tasks / Subtasks

- [ ] Create `FuelTargetsPanel.tsx` (AC: 1)
  - [ ] Four numeric inputs bound to local state; commit on blur or explicit save per PWA
  - [ ] Port macro input behavior from PWA fuel-targets section
  - [ ] `testID="settings-fuel-cal"` etc.
- [ ] Create `HydrationPanel.tsx` (AC: 2)
  - [ ] Preset chips from `waterTargetPresets` + custom input
  - [ ] Display formatted volume via `formatVolumeFromOz` / `formatWaterPreset`
  - [ ] Port from PWA hydration section + `waterIntake.ts`
- [ ] Create `GoalPanel.tsx` + confirm sheets (AC: 3–5)
  - [ ] Port `GoalSettingsPicker` → `components/settings/GoalSettingsPicker.tsx` (or `components/onboarding/` if reusable)
  - [ ] Port `DiscardGoalChangesConfirmSheet`, `SaveGoalConfirmSheet` from PWA `GoalSettingsConfirmSheets.tsx`
  - [ ] Draft state: `goalDraft` initialized on panel open from `onboardingProfile`
  - [ ] Header Save button when dirty (PWA `settings-sheet-header--with-action`)
  - [ ] Use `applyGoalSettingsDraft`, `isGoalSettingsDirty`, `isGoalWeightValid` from `@newyouai/core` (RN-10-01)
- [ ] Wire `[panel].tsx` for `fuel-targets`, `hydration`, `goal`
- [ ] Run typecheck + `npm run test --workspace=@newyouai/core`

## Dev Notes

### Current state

| Item | Today | This story |
|------|-------|------------|
| RN-8-04 targets grid | Read-only `NutritionTargetsGrid` | Becomes editable source via this story |
| RN-7 nutrition | Reads `nutritionTargets` | Verify after fuel edit |
| `goalSettings` | PWA-only until RN-10-01 | Core extract prerequisite |
| `waterIntake.ts` | PWA-only | Port pure helpers to core OR import from PWA via upcoming extract — prefer core if touching tests |

### PWA parity reference

```498:521:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// Hub Goals & tracking: fuel-targets, hydration, goal rows
```

Search `ScreenSettings.tsx` for `panel === "fuel-targets"`, `"hydration"`, `"goal"` renderers.

```370:377:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// requestGoalPanelExit — dirty draft → discard confirm
```

### Implementation guidance

- **Goal panel exit:** Intercept hardware back + header back when `isGoalSettingsDirty(saved, goalDraft)` — show discard sheet before pop.
- **Maintain branch:** When goal is `maintain`, clear `goalWeightLbs` and `pace` per `normalizeGoalProfilePatch`.
- **Hydration:** `waterDailyTargetOz` stored in oz internally; display converts via volume unit.
- **Fuel:** On save, update fitness state immutably; no separate API call (local persist).

### Anti-patterns

- **Do not** make Progress targets grid editable inline (RN-8 stays read-only display; edit lives here)
- **Do not** recalculate nutrition targets manually — use `applyGoalSettingsDraft` / `calculateNutritionTargets` chain from core
- **Do not** skip confirm sheets on goal save/discard

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
# Manual: change calories → Nutrition dashboard updates
# Manual: goal discard with dirty draft shows confirm
```

### References

- [rn-8-04-avg-calories-goal-targets.md](rn-8-04-avg-calories-goal-targets.md) — read-only until this story
- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) — fuel targets deferred to RN-10
- PWA: `goalSettings.ts`, `GoalSettingsPicker.tsx`, `waterIntake.ts`, `macroLimits.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
