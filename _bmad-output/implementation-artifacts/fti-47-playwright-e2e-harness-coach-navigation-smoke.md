# Story 5.1: Playwright E2E harness + coach navigation smoke (FTI-47)

Status: done

## Story

As a developer,
I want Playwright smoke tests for Home coach navigation and fuel quick-log,
so regressions in the highest-traffic coached flows are caught before merge.

## Acceptance Criteria

1. **Playwright initialized:** Given the repo, when `npm run test:e2e` runs, then Playwright executes headless against the Vite dev/preview server without manual setup.

2. **Coach task → Nutrition smoke:** Given a seeded app state with a nutrition coach task on Home, when the user taps the task CTA, then the Nutrition tab is active and macro content is visible.

3. **Fuel quick-log smoke:** Given Home with fuel quick-log available, when the user opens the quick-log sheet and taps a preset, then today's macro totals update (DOM or data attribute assertion).

4. **Vitest unchanged:** Given existing unit tests, when `npm test` runs, then all 76+ Vitest tests still pass — no Playwright/Vitest conflict.

5. **Build gate:** `npm run build` passes.

6. **Scope guard:** No Nutrition tab rebuild (FTI-49), no coachEngine refactor (FTI-48), no LLM / FTI-13.

## Tasks / Subtasks

- [ ] **Task 1: Playwright setup** (AC: 1)
  - [ ] 1.1 Add `@playwright/test` dev dependency.
  - [ ] 1.2 Add `playwright.config.ts` — baseURL, webServer hook for `vite preview` or dev.
  - [ ] 1.3 Add `npm run test:e2e` script to `package.json`.

- [ ] **Task 2: Test fixtures / seed** (AC: 2, 3)
  - [ ] 2.1 Route or query param to load deterministic fixture state (reuse `testFixtures/appStateFixtures.ts` patterns or localStorage seed).
  - [ ] 2.2 Document fixture approach in story Dev Agent Record.

- [ ] **Task 3: Coach navigation smoke** (AC: 2)
  - [ ] 3.1 `e2e/coach-task-nutrition.spec.ts` — tap coach task → assert Nutrition tab active.

- [ ] **Task 4: Fuel quick-log smoke** (AC: 3)
  - [ ] 4.1 `e2e/fuel-quick-log.spec.ts` — open sheet → tap preset → assert macro delta visible.

- [ ] **Task 5: Verification** (AC: 4, 5)
  - [ ] 5.1 `npm run build` + `npm test` + `npm run test:e2e`.

## Dev Notes

### Why FTI-47 runs first

Sprint 3 retro: "Never add navigation-heavy features without E2E." Sprint 4 deferred nutrition rebuild; Sprint 5 opens with the same Vitest-first pattern as FTI-40.

**Execution order:** FTI-47 → 48 → 49 → 50 → 51.

### Key files

- `package.json` — scripts + devDependency
- `playwright.config.ts` — new
- `e2e/` — new smoke specs
- `src/fitness/coachTaskActions.ts` — task routing under test
- `src/fitness/HomeFuelQuickLogSheet.tsx` — quick-log under test

### References

- Sprint 3 retro action #6 (Playwright smoke)
- Linear: [FTI-41](https://linear.app/ftiness-tracker/issue/FTI-41/playwright-e2e-harness-coach-navigation-smoke)
- [Source: _bmad-output/implementation-artifacts/epic-fti-sprint-3-retro-2026-05-23.md]

## Dev Agent Record

### Agent Model Used

(pending)

### Completion Notes List

(pending)

### File List

(pending)
