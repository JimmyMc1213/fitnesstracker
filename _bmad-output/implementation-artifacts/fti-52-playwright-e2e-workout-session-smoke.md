# Story 6.1: Playwright workout session smoke (FTI-52)

Status: done

## Story

As a developer,
I want Playwright smoke tests for the workout session loop,
so set-logging and finish-flow regressions are caught before session-coaching changes land.

## Acceptance Criteria

1. **Workout session smoke:** Workout tab → start today's session → mark one set complete → finish workout → summary visible
2. **Headless + webServer:** Tests run headless; dev server bootstrapped in Playwright config
3. **Existing E2E pass:** Coach-navigation + fuel quick-log E2E still pass
4. **Build + unit gates:** `npm run build` + `npm test` unchanged

## Tasks / Subtasks

- [x] **Task 1: Workout session seed** (AC: 1)
  - [x] 1.1 `workoutSessionPersistSeed()` in `e2e/helpers/seed.ts` with routine + exercise + sets

- [x] **Task 2: Workout session smoke spec** (AC: 1, 2)
  - [x] 2.1 `e2e/workout-session-smoke.spec.ts`: start → Done → Finish → summary assertions

- [x] **Task 3: Verification** (AC: 3, 4)
  - [x] 3.1 `npm run build` + `npm test` + `npm run test:e2e`

## Dev Agent Record

### Agent Model Used

Composer (bmad-swarm epic-6)

### Completion Notes List

- Added deterministic workout routine seed for E2E (single exercise, three sets)
- Smoke covers full session loop through `WorkoutSummarySheet` ("Workout complete")
- Mirrors FTI-47 fixture pattern via `seedPersist` + localStorage

### File List

- `e2e/helpers/seed.ts`
- `e2e/workout-session-smoke.spec.ts`

### Change Log

- 2026-05-23: FTI-52 workout session Playwright smoke (Sprint 6 opener)

## Senior Developer Review (AI)

No findings, new E2E only, no production code changes.
