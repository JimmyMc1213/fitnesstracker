# Epic Retrospective: FTI Sprint 10

**Epic key:** `epic-fti-sprint-10`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Workout architecture phase 2 + quality pipeline. Finish `ScreenWorkout.tsx` decomposition (idle dashboard + add-exercise search); scaffold CI with build/test/e2e gates; expand Playwright coverage.

| Metric | Value |
| --- | --- |
| Stories completed | 3 / 3 shipped |
| Quality gate (at close) | `npm run build` + `npm test` (139) + `npm run test:e2e` (6) |
| Test automation | Vitest **139 tests**; Playwright **6 E2E smokes** (+1 recently-logged re-log; coach note assertion in workout smoke) |
| Epic status | **done** |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-66-screenworkout-idle-dashboard-extraction | FTI-60 | Idle dashboard extracted; ~181 lines removed from monolith |
| fti-67-add-exercise-search-sheet-extraction | FTI-61 | Add-exercise search panel isolated alongside ExerciseSwapSheet |
| fti-68-ci-pipeline-e2e-depth-gate | FTI-62 | GitHub Actions CI, coach-note + recently-logged E2E depth |

**Execution order:** FTI-66 → 67 → 68 (as planned)

---

## What went well

- FTI-53 callback-prop pattern scaled cleanly to idle dashboard and add-exercise search extractions with zero behavior change
- CI workflow mirrors local gate (`build` → `test` → `test:e2e`) with empty Supabase env for headless runs
- E2E fixes for swipe-to-delete and search strict-mode keep nutrition tests aligned with current UI

## Challenges

- Playwright swipe interactions require pointer events (not mouse) for `SwipeableFoodLogRow`
- Coach note assertion needed history seed + specific copy match to avoid strict-mode collisions with WorkoutCoachCard

## Action items (Sprint 11+)

| # | Action | Owner |
| --- | --- | --- |
| 1 | ScreenWorkout phase 3 (history page, routine editor shell) when workout UX priority returns | PO |
| 2 | Barcode / voice / AI natural-language food log (backlog) | PO |
| 3 | Expand E2E to 7+ if additional nutrition/workout flows ship in S11 | QA |

---

## Epic status: **DONE**
