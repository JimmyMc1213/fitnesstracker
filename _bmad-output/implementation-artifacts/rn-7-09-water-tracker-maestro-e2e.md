---
name: RN-7-09 Water tracker + Maestro E2E
epic: RN-7
story: 09
status: done
swarm_order: 9
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.09: Water tracker + Maestro E2E + epic polish

Status: done

## Story

**As a** QA engineer / user  
**I want** water tracking and a Maestro nutrition smoke flow  
**So that** FR-M5 nutrition parity is regression-safe and epic RN-7 can close

## Acceptance Criteria

1. **Given** Nutrition tab, **When** rendered, **Then** `WaterTrackerCard` shows target, quick-add, and today's entries
2. **Given** quick-add, **When** tapped, **Then** `appendWaterLogEntry` updates `waterLogByDay` respecting `unitPreferences.volumeUnit`
3. **Given** water entry, **When** removed, **Then** `removeWaterLogEntry` updates slice
4. **Given** seeded user (`fuelQuickLogPersistSeed`), **When** Maestro runs `rn-nutrition-log.yaml`, **Then** manual add, search, meal, and recent re-log cases pass
5. **Given** epic close, **When** regression runs, **Then** auth-all + tab-nav + coach-nutrition + onboarding + workout-session remain green
6. **Given** epic complete, **When** audited, **Then** all RN-7 placeholder copy removed and Maestro testIDs stable

## Test plan (Maestro)

**Prerequisites:** JDK 17+, Maestro CLI, iOS simulator + dev client, Supabase creds, mock food search env.

```bash
# Terminal 1
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH=true EXPO_PUBLIC_E2E_FITNESS_SEED=nutrition-log npx expo start --dev-client --port 8082

# Terminal 2
cd apps/mobile && npm run test:e2e:nutrition-log
```

**Epic close regression sweep:**

```bash
npm run test:e2e:nutrition-log --workspace=@newyouai/mobile
npm run test:e2e:auth-all --workspace=@newyouai/mobile
npm run test:e2e:tab-nav --workspace=@newyouai/mobile
npm run test:e2e:coach-nutrition --workspace=@newyouai/mobile
npm run test:e2e:onboarding --workspace=@newyouai/mobile
npm run test:e2e:workout-session --workspace=@newyouai/mobile
npm run typecheck --workspace=@newyouai/mobile
```

**Port Playwright cases from** `apps/pwa/e2e/nutrition-log-food.spec.ts`:

| Case | Key assertion |
|------|----------------|
| Manual add | 2000 → 1700 cal left; swipe delete restores 2000 |
| Search → serving | chicken → 1835 cal left, 51/180g protein |
| My meals | E2E prep bowl → 1650 cal left, 63/180g |
| Recent re-log | Light breakfast → 1800 cal left, 40/180g |

## Tasks / Subtasks

- [x] Port `WaterTrackerCard` (AC: 1–3)
  - [x] Quick-add oz buttons, entry list, target from `waterDailyTargetOz`
  - [x] Unit display from `state.unitPreferences.volumeUnit`
- [x] E2E seeds (AC: 4)
  - [x] `fuelQuickLogPersistSeed`, `mealLogPersistSeed` in `lib/e2e/fitnessPersistSeed.ts`
  - [x] Extend `E2eFitnessSeedName` with `nutrition-log`
  - [x] Wire `EXPO_PUBLIC_E2E_FITNESS_SEED=nutrition-log`
- [x] Maestro flow (AC: 4)
  - [x] Create `.maestro/rn-nutrition-log.yaml` porting 4 Playwright tests
  - [x] Stable testIDs documented in story + plan
- [x] Scripts + epic close (AC: 5–6)
  - [x] `npm run test:e2e:nutrition-log` + `run-nutrition-log-maestro.mjs` (mirror workout-session runner)
  - [x] Remove remaining placeholder strings
  - [x] Update `sprint-status-rn-migration.yaml`: all RN-7 stories done, epic `done`

## Dev Notes

### Dependencies

**All RN-7-01..08 complete.** Full log flows must work before Maestro.

### PWA parity reference

```108:117:apps/pwa/src/fitness/screens/ScreenNutrition.tsx
<WaterTrackerCard
  dateKey={todayKey}
  targetOz={state.waterDailyTargetOz}
  entries={waterEntries}
  onAddOz={(oz) => setState((s) => appendWaterLogEntry(s, todayKey, oz))}
  onRemoveEntry={(entryId) => setState((s) => removeWaterLogEntry(s, todayKey, entryId))}
/>
```

Seeds:

```142:169:apps/pwa/e2e/helpers/seed.ts
fuelQuickLogPersistSeed / mealLogPersistSeed
```

### Anti-patterns

- **Do not** mark epic done without Maestro green
- **Do not** skip full regression sweep
- **Do not** rely on live food-search in CI — mock env required

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-09
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M5 row
- PWA: `WaterTrackerCard.tsx`, `waterIntake.ts`, `nutrition-log-food.spec.ts`
- Mobile pattern: `scripts/run-coach-nutrition-maestro.mjs`, `run-epic-rn6-close.mjs`
