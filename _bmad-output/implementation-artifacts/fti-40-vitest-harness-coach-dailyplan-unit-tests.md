# Story 3.1: Vitest harness + pure-module unit tests (FTI-40)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a developer,
I want Vitest coverage on coach and scheduling pure modules,
so Sprint 3 domain logic ships with regression safety.

## Acceptance Criteria

1. **Vitest bootstrap:** Given the project has no test runner today, when FTI-40 merges, then Vitest is configured, `npm test` runs a headless suite (`vitest run`), and swarm/CI gate becomes `npm run build` **and** `npm test`.

2. **`coach.ts` coverage:** Given representative `WorkoutState` fixtures, when `progressiveOverloadInsight()` is called, then tests assert all five message branches: no exercises, incomplete set (w+r / w-only / empty), no completed sets, and completed-set progression summary.

3. **`dailyPlan.ts` pure helpers:** Given fixed `Date` inputs (use `vi.setSystemTime` or explicit `Date` constructors — no `localStorage`), when pure exports run, then tests cover `localDateKey`, `formatDateKeyEyebrow`, `arizonaCalendarDateKey`, `isArizonaEightPmOrLater`, `formatDailyPlanSubtitle`, and `generateDailyTasksForDate` (weekday vs Saturday vs Sunday task shapes; deterministic task ids `${dateKey}_*`).

4. **`notificationScheduler.ts` pure logic:** Given minimal `AppState` fixtures and mocked `getNotificationPermission()`, when `isTrainingDay`, `shouldFireWorkoutReminder`, `shouldFireNutritionReminder`, `buildWorkoutNotificationPayload`, and `buildNutritionNotificationPayload` run, then tests cover training-day resolution (template labels vs default schedule), time-gate behavior, already-completed / already-fired / permission-denied guards, and payload shape (`title`, `body`, `tag`, `icon`).

5. **Fixture scaffold for FTI-34:** Given `coachEngine.ts` does not exist yet, when FTI-40 completes, then a reusable `AppState` fixture module exists (minimal builders for training day, rest day, macro-logged day, workout-completed day) documented for FTI-34 snapshot tests — **do not** implement `coachEngine.ts` or `coachEngine.test.ts` in this story.

6. **Scope guard:** No Playwright E2E, no React component tests, no changes to product UI behavior — test infrastructure and pure-module tests only.

7. **Build gate:** `npm run build` and `npm test` both pass with strict TypeScript unchanged.

## Tasks / Subtasks

- [x] **Task 1: Vitest + npm scripts** (AC: 1, 7)
  - [x] 1.1 Add devDependencies: `vitest` (latest 3.x stable compatible with Vite ^5.4) — no `@testing-library/*` yet (no component tests this story).
  - [x] 1.2 Extend `vite.config.ts` with Vitest `test` block: `environment: "node"`, `include: ["src/**/*.test.ts"]`, `globals: false` (prefer explicit `import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"`).
  - [x] 1.3 Add `"test": "vitest run"` and optional `"test:watch": "vitest"` to `package.json` scripts.
  - [x] 1.4 Ensure `tsc -b` still passes — Vitest types via `vitest/config` triple-slash in `vite.config.ts` or separate `vitest.config.ts` importing base Vite config; do **not** weaken `tsconfig.app.json` strict flags.
  - [x] 1.5 Run `npm test` locally — must exit 0 before marking done.

- [x] **Task 2: Shared test fixtures** (AC: 4, 5)
  - [x] 2.1 Create `src/fitness/testFixtures/appStateFixtures.ts` exporting:
    - `minimalAppState(overrides?: Partial<AppState>): AppState` — uses `buildAppStateFromPersisted({})` or equivalent minimal persisted slice from `buildAppState.ts` / `defaultSeed.ts` patterns; keep fixture lean (notification prefs, workout templates, empty nutrition maps).
    - `trainingDayAppState({ dateKey, templateName?, daysPerWeek? })` — Mon–Fri training template on file.
    - `workoutCompletedAppState(dateKey)` — `workoutsCompletedByDay[dateKey] = true`.
    - `nutritionLoggedAppState(dateKey, totals?)` — at least one `nutritionItemsByDay[dateKey]` row or manual totals.
    - `workoutStateFixtures` object for `coach.ts`: `empty`, `incompleteWithWeightReps`, `incompleteWeightOnly`, `incompleteBlankSet`, `allSetsDone`.
  - [x] 2.2 Create `src/fitness/testFixtures/workoutStateFixtures.ts` if cleaner separation from AppState fixtures.
  - [x] 2.3 Document in fixture file header: consumed by FTI-34 `coachEngine.test.ts` snapshot tests — do not import React or DOM APIs.

- [x] **Task 3: `coach.test.ts`** (AC: 2)
  - [x] 3.1 Create `src/fitness/coach.test.ts` colocated with `coach.ts`.
  - [x] 3.2 Test `progressiveOverloadInsight()` for each branch (see AC #2); assert substring matches on exercise name / weight where applicable — exact full-string match optional but branch coverage mandatory.
  - [x] 3.3 Use `WorkoutState` from fixtures; primary exercise is `w.exercises[0]` per implementation.

- [x] **Task 4: `dailyPlan.test.ts`** (AC: 3)
  - [x] 4.1 Create `src/fitness/dailyPlan.test.ts`.
  - [x] 4.2 Test `localDateKey(new Date(2026, 4, 22))` → `"2026-05-22"` (month is 0-indexed in JS Date).
  - [x] 4.3 Test `formatDateKeyEyebrow("2026-05-22")` returns uppercase weekday + month pattern (e.g. contains `FRI` and `MAY`).
  - [x] 4.4 Test `arizonaCalendarDateKey` with a known UTC instant that maps to a specific Phoenix calendar day (document chosen instant in test comment).
  - [x] 4.5 Test `isArizonaEightPmOrLater` — one case before 20:00 Phoenix, one at/after 20:00 Phoenix.
  - [x] 4.6 Test `generateDailyTasksForDate`:
    - Wednesday (training day): includes gym task with `navigateTo: "workout"`, nutrition tasks, life tasks; ids prefixed with dateKey.
    - Saturday: active-recovery copy, no `navigateTo: "workout"` on first gym task.
    - Sunday: rest + Sunday check-in life tasks.
  - [x] 4.7 **Out of scope:** `loadTasksForToday` / `persistTasksForToday` (localStorage side effects) — defer unless trivial `vi.stubGlobal("localStorage", ...)` mock added; not required for AC.

- [x] **Task 5: `notificationScheduler.test.ts`** (AC: 4)
  - [x] 5.1 Create `src/fitness/notificationScheduler.test.ts`.
  - [x] 5.2 `vi.mock("./notificationPermission", () => ({ getNotificationPermission: vi.fn(() => "granted") }))` at top; reset in `beforeEach`.
  - [x] 5.3 Test `isTrainingDay`:
    - Template with `dayLabel: "Mon"` → true on a Monday `Date`.
    - Empty templates + `daysPerWeek: 5` → true Mon–Fri per `DEFAULT_TRAINING_DAYS`.
    - Rest day (e.g. Sunday with 5-day default) → false.
  - [x] 5.4 Test `shouldFireWorkoutReminder`:
    - Returns false when permission not granted (mock `"denied"`).
    - Returns false when workout already completed today.
    - Returns false when `lastFiredWorkoutReminderDateKey === todayKey`.
    - Returns false before reminder time; true at/after `workoutReminderTime` on training day.
  - [x] 5.5 Test `shouldFireNutritionReminder` — analogous guards + fires when no nutrition logged and time passed.
  - [x] 5.6 Test payload builders — `buildWorkoutNotificationPayload` includes template name when Monday template matches; `buildNutritionNotificationPayload` stable title/body/tag.
  - [x] 5.7 **Out of scope:** `checkAndFireDueNotifications` async integration (calls `showFitcoachNotification` + `setState`) — FTI-38 may extend; not required here.

- [x] **Task 6: Verification & docs touch** (AC: 1, 6, 7)
  - [x] 6.1 Run `npm run build` — must pass.
  - [x] 6.2 Run `npm test` — all tests green.
  - [x] 6.3 Update `project-context.md` Testing Rules only if Vitest version or script names differ from placeholder — optional single-line version pin.
  - [x] 6.4 Do **not** add GitHub Actions in this story (no `.github/` today) — swarm gate is local `npm test`.

## Dev Notes

### Why FTI-40 runs first

Sprint 2 retro flagged **zero automated tests** across 5+ new pure modules (`notificationScheduler`, `waterIntake`, `estimateSessionDuration`, `weeklySummary`, `dailyStreak`). Epic 3 adds `coachEngine.ts` (FTI-34) — a cross-domain pure module that **must not** ship without regression safety. FTI-40 establishes the harness before domain expansion.

**Execution order:** FTI-40 → FTI-34 → FTI-33 → … per `sprint-status.yaml`.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| Vitest config + `npm test` | Playwright E2E (Sprint 4+) |
| `coach.ts`, `dailyPlan.ts`, `notificationScheduler.ts` unit tests | React component / hook tests (`useAnimatedMacroProgress` = P2 later) |
| `testFixtures/appStateFixtures.ts` for FTI-34 | `coachEngine.ts` implementation (FTI-34) |
| | `coachEngine.test.ts` (FTI-34 uses fixtures from this story) |
| | `waterIntake.ts` tests (optional P2 — retro item; not AC) |
| | CI workflow YAML (no `.github/` yet) |

### Epics AC reconciliation — `coachEngine.ts`

`epics.md` lists coachEngine unit tests under FTI-40 with note *(added in FTI-34)*. **Interpretation for dev:** module and its snapshot tests land in **FTI-34**; FTI-40 delivers the **test harness + AppState fixtures** so FTI-34 can add `coachEngine.test.ts` without re-bootstrapping Vitest. Do not create stub `coachEngine.ts` to satisfy tests early.

### Current module state (read before editing)

**`src/fitness/coach.ts`** (~30 lines) — single export `progressiveOverloadInsight(w: WorkoutState): string`. Branches on `w.exercises[0]` sets: empty list, incomplete set (three sub-cases), no done sets, completed sets with max weight/reps summary. **Preserve unchanged** — tests only.

**`src/fitness/dailyPlan.ts`** — pure date helpers + `generateDailyTasksForDate`. Uses `SPLIT`, `PLAN_START_ISO`, `planWeekIndex` from `./data`. Side-effect functions `loadTasksForToday` / `persistTasksForToday` touch `localStorage` — avoid in unit tests unless mocked.

**`src/fitness/notificationScheduler.ts`** — exports `isTrainingDay`, `shouldFireWorkoutReminder`, `shouldFireNutritionReminder`, payload builders, and async `checkAndFireDueNotifications`. Depends on `getNotificationPermission()` from `./notificationPermission` — **must mock** in tests. Uses `localDateKey` from `./dailyPlan`.

**`coachEngine.ts`** — **does not exist** (FTI-34).

### Vitest + Vite setup guidance

Project uses Vite 5.4 + TypeScript 5.6 strict + ESM (`"type": "module"`). Standard pattern:

```ts
// vite.config.ts — add after existing defineConfig
/// <reference types="vitest/config" />
export default defineConfig(({ mode }) => ({
  // ...existing...
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
}));
```

Prefer **`environment: "node"`** for pure modules — no jsdom needed. If a test imports a module that touches `Notification` globally, mock at module boundary (`notificationPermission`) rather than switching to jsdom.

**Package scripts today:** only `build`, `dev`, `preview` — add `test`.

### Test file naming & placement

Colocate: `src/fitness/{module}.test.ts` next to source. Architecture mentions `coachEngine.test.ts` beside future `coachEngine.ts` — follow same pattern.

Fixtures: `src/fitness/testFixtures/` — not `__tests__/` at repo root; keeps imports as `./testFixtures/appStateFixtures` from sibling tests.

### `AppState` fixture construction

Do not hand-roll 40+ fields. Prefer:

```ts
import { buildAppStateFromPersisted } from "./buildAppState";
// buildAppStateFromPersisted({}) or minimal PersistedFitnessSlice
```

Then spread overrides for `notificationPreferences`, `workoutTemplates`, `workoutsCompletedByDay`, `nutritionItemsByDay`. Reference `defaultWorkoutRoutineTemplates` from `./data` for realistic template labels (`Mon`, `Tue`, etc.).

`WorkoutState` fixtures for coach tests need `WorkoutExercise` with `sets: { w, r, done }[]` — see `types.ts` `WorkoutExercise` / `WorkoutSet`.

### `notificationScheduler` test time helpers

Construct `Date` objects with explicit local hours for `isAtOrPastHHmm` paths, e.g.:

```ts
const mondayMorning = new Date(2026, 4, 19, 7, 0); // Mon May 19 2026 07:00 local
const mondayAfterReminder = new Date(2026, 4, 19, 9, 0);
```

Set `state.notificationPreferences.workoutReminderTime = "08:00"` (uses `normalizeTimeHHmm` internally).

### Arizona timezone tests

`isArizonaEightPmOrLater` and `arizonaCalendarDateKey` use `America/Phoenix` (no DST). Pick UTC instants documented in test comments — e.g. Phoenix 8 PM corresponds to specific UTC offset depending on season; use fixed dates in 2026 and verify against known expectations.

### Previous story / retro intelligence

- **Sprint 2 retro:** "Evaluate Vitest for pure functions" was deferred — this story fulfills that action item.
- **FTI-32 review F5:** "No unit tests for water helpers" deferred — water tests remain optional P2.
- **FTI-28 pattern:** `notificationScheduler` shipped without tests — highest-value P1 target alongside `dailyPlan`.
- **All Sprint 1–2 stories:** quality gate was `npm run build` only — FTI-40 **changes the gate** for all subsequent Sprint 3 stories.

### Git / branch expectations

Swarm will branch `story/fti-40-vitest-harness-coach-dailyplan-unit-tests`. No product UI changes expected — low conflict risk with `main`.

### Project Structure Notes

- All fitness domain code under `src/fitness/` — tests stay here, not top-level `tests/`.
- Do not add Vitest to production `dependencies`.
- `package-lock.json` must update with `npm install`.
- No new persisted fields — no persistence pipeline changes.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.1 FTI-40]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026.md` — §7.7 Testing strategy]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Quality gate, Vitest row]
- [Source: `_bmad-output/project-context.md` — Testing Rules]
- [Source: `_bmad-output/implementation-artifacts/epic-fti-sprint-2-retro-2026-05-21.md` — Vitest recommendation]
- [Source: `src/fitness/coach.ts`, `dailyPlan.ts`, `notificationScheduler.ts`]
- [Linear: FTI-40](https://linear.app/ftiness-tracker/issue/FTI-40/vitest-harness-coachdailyplan-unit-tests)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Corrected weekday assumptions in dailyPlan tests (May 22 2026 = Friday, not Thursday per story draft).

### Completion Notes List

- Vitest 3.2.4 installed; `npm test` and `npm run build` both pass (30 tests).
- Node environment for pure modules; `notificationPermission` mocked at module boundary.
- AppState + WorkoutState fixtures ready for FTI-34 coachEngine snapshot tests.

### File List

- `package.json` — added test scripts
- `package-lock.json` — vitest dependency
- `vite.config.ts` — vitest test block
- `src/fitness/coach.test.ts`
- `src/fitness/dailyPlan.test.ts`
- `src/fitness/notificationScheduler.test.ts`
- `src/fitness/testFixtures/appStateFixtures.ts`
- `src/fitness/testFixtures/workoutStateFixtures.ts`

## Senior Developer Review (AI)

Review date: 2026-05-23

**Summary:** PASS — all ACs satisfied, no product code changes, scope guard honored.

**Findings:** None blocking. Story draft weekday example (THU for 2026-05-22) was incorrect; tests use actual calendar weekdays.

## Change Log

- 2026-05-23: FTI-40 implemented — Vitest harness, fixtures, 30 unit tests across coach/dailyPlan/notificationScheduler.
