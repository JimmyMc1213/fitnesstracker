# Story 10.3: CI pipeline + E2E depth gate (FTI-68)

Status: done

## Story

As a developer,
I want GitHub Actions running build/test/e2e and Playwright coverage for coach notes and recently logged re-log,
so quality gates are durable beyond local dev.

## Acceptance Criteria

1. **CI workflow:** `.github/workflows/ci.yml` runs `npm run build`, `npm test`, `npm run test:e2e` on push/PR to `main`.

2. **E2E - coach note:** Workout session smoke asserts per-exercise coach note visible after session start (FTI-54 behavior).

3. **E2E - recently logged:** Nutrition tab → Log Food → tap `+` on recently logged row → rings update.

4. **Quality gate:** `npm run build` + `npm test` (136+) + `npm run test:e2e` (6) pass locally and in CI.

5. **Sprint 10 retrospective** documented; no ScreenWorkout behavior changes in this story.

## Tasks / Subtasks

- [x] **Task 1: CI workflow** (AC: 1)
  - [x] 1.1 Create `.github/workflows/ci.yml` with build, unit, e2e jobs

- [x] **Task 2: E2E depth** (AC: 2, 3)
  - [x] 2.1 Workout smoke: seed workoutHistory, assert coach note copy
  - [x] 2.2 Nutrition: recently logged re-log test
  - [x] 2.3 Fix nutrition e2e for swipe-to-delete + search selector

- [x] **Task 3: Sprint close** (AC: 4, 5)
  - [x] 3.1 Full quality gate passes locally
  - [x] 3.2 Sprint 10 retrospective documented

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Added GitHub Actions CI: build + 139 Vitest + 6 Playwright on push/PR to main
- Workout smoke asserts progressive overload coach note from prior session history
- New recently-logged re-log E2E; fixed swipe-delete and search strict-mode failures
- Sprint 10 retro documented

### File List

- `.github/workflows/ci.yml` (new)
- `e2e/workout-session-smoke.spec.ts` (modified)
- `e2e/nutrition-log-food.spec.ts` (modified)
- `e2e/helpers/seed.ts` (modified)
- `_bmad-output/implementation-artifacts/epic-fti-sprint-10-retro-2026-05-23.md` (new)
- `_bmad-output/implementation-artifacts/fti-68-ci-pipeline-e2e-depth-gate.md` (new)
