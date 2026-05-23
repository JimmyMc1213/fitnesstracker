# Story 6.5: waterIntake tests + weigh-in macro nudge persist (FTI-56)

Status: done

## Story

As a developer,
I want `waterIntake.ts` unit tests and persistence of weigh-in macro nudges on save,
so Sprint 2-3 retro debt is closed and Home coach copy survives refresh without recomputing away.

## Acceptance Criteria

1. **Vitest for `waterIntake.ts`:** normalize/append/merge helpers covered (`normalizeWaterDailyTargetOz`, `normalizeWaterLogEntry`, `normalizeWaterLogByDay`, `mergeWaterLogByDay`, `appendWaterLogEntry`, `removeWaterLogEntry`, `totalWaterOzForDateKey`).
2. **Weigh-in macro guidance persists:** When user saves weigh-in, attach `macroNudge` (+ optional coach message) to `WeightEntry` at save time so Home display survives refresh.
3. **`getWeighInReactionForDisplay` prefers persisted fields** on entry when present.
4. **No UI redesign.**
5. **All quality gates pass** (`npm test`, `npm run test:e2e`, `npm run build`).

## Tasks / Subtasks

- [x] **Task 1: `waterIntake.test.ts`** (AC: 1)
  - [x] 1.1 Colocated Vitest suite for normalize/append/merge helpers.
- [x] **Task 2: Persist coach fields on weigh-in save** (AC: 2)
  - [x] 2.1 Extend `WeightEntry` with optional `macroNudge` and `coachMessage`.
  - [x] 2.2 `WeighInSheet` save computes reaction via `getWeighInReaction` and persists on entry.
  - [x] 2.3 `normalizeWeightLog` in `buildAppState.ts`; merge preserves coach fields in `mergePersistedFitnessSlices.ts`.
- [x] **Task 3: Display prefers persisted copy** (AC: 3)
  - [x] 3.1 `getWeighInReactionForDisplay` returns persisted `coachMessage` / `macroNudge` when set.
  - [x] 3.2 Unit test in `coachEngine.test.ts`.
- [x] **Task 4: Quality gates** (AC: 5)
  - [x] 4.1 `npm test`
  - [x] 4.2 `npm run test:e2e`
  - [x] 4.3 `npm run build`

## Dev Agent Record

### File List

- `src/fitness/types.ts`: `WeightEntry` coach persist fields
- `src/fitness/WeighInSheet.tsx`: save attaches coach reaction
- `src/fitness/coachEngine.ts`: display prefers persisted fields
- `src/fitness/buildAppState.ts`: `normalizeWeightLog`
- `src/fitness/mergePersistedFitnessSlices.ts`: merge coach fields
- `src/fitness/waterIntake.test.ts`: new unit tests
- `src/fitness/coachEngine.test.ts`: persisted display test

### Change Log

- 2026-05-23: FTI-56: waterIntake Vitest + weigh-in macro nudge persist at save time.
