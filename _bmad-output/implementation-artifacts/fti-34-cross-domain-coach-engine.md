# Story 3.2: Cross-domain coach engine (FTI-34)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user,
I want one coach voice that references my workout history, macro pace, weigh-in trend, and streak,
so guidance feels personal across the app.

## Acceptance Criteria

1. **Pure module:** Given FTI-34 merges, when `coachEngine.ts` is imported anywhere, then it exports only pure functions, no React imports, no `localStorage`, no `setState`, no side effects (matches `dailyPlan.ts` / `notificationScheduler.ts` convention).

2. **`buildCoachContext` snapshot:** Given `AppState` + `dateKey` (+ optional `now` for deterministic tests), when `buildCoachContext(state, dateKey, now?)` runs, then it returns a read-only `CoachContext` object precomputing all cross-domain inputs the engine needs (training-day flag, today's template, macro totals vs targets, protein gap, streak count, week index, weigh-in recency/trend, workout-completed flag) without mutating `state`.

3. **`getHomeCoachPlan` output:** Given a `CoachContext` for a training day with an incomplete workout, when `getHomeCoachPlan(ctx)` runs, then it returns `{ headline, subline?, tasks, insightStrip? }` where:
   - `headline` references today's session (template name or split label), not a generic greeting
   - `tasks` contains **at most 3** items sorted by `priority` ascending (lower = higher priority)
   - Training-day primary task kind is `start_workout` with session time estimate when template has exercises (reuse `estimatedSessionLabel` / `formatEstimatedSessionMinutes`)
   - Rest-day / Saturday / Sunday contexts produce appropriate `rest_day` or recovery copy, no bogus "Start workout" CTA
   - `insightStrip` (when present) synthesizes **≥2 domains** (e.g. streak + protein gap, or weigh-in trend + workout adherence)

4. **`getPostWorkoutRecap`:** Given a `CoachContext` and a `CompletedWorkoutSession` (or session id resolvable from `ctx.state.workoutHistory`), when `getPostWorkoutRecap(ctx, session)` runs, then it returns a non-empty deterministic string referencing session title and at least one of: volume, set completion, streak update, or next-session nudge.

5. **`getWeighInReaction`:** Given a `CoachContext` and a new `WeightEntry`, when `getWeighInReaction(ctx, entry)` runs, then it returns a `CoachAdjustment | null` with coach `message` string (and optional rule-based `macroNudge` metadata for FTI-37: **no persist write** in this story). Returns `null` only when entry is invalid/duplicate for the same day.

6. **`getNotificationBody`:** Given a `CoachContext` and `kind: "workout" | "nutrition"`, when `getNotificationBody(ctx, kind)` runs, then it returns context-aware copy referencing today's session name or protein remaining (not the static strings currently in `buildWorkoutNotificationPayload` / `buildNutritionNotificationPayload`). Title generation stays in `notificationScheduler.ts` (FTI-38 wires bodies only).

7. **Reuse `coach.ts`:** Given pre-workout or in-session overload context is needed, when building copy, then `coachEngine` **may call** `progressiveOverloadInsight()` from `./coach.ts`: do **not** duplicate overload heuristics.

8. **No persistence changes:** Given MVP scope, when the engine ships, then no new `AppState` fields, no `persistFitnessSlice` changes, no Supabase schema changes, engine is a derived view only.

9. **Unit tests (FTI-40 harness):** Given `appStateFixtures.ts` from FTI-40, when `coachEngine.test.ts` runs via `npm test`, then snapshot-style assertions cover:
   - Training day Monday: headline + `start_workout` task + optional insight strip
   - Workout already completed today: no duplicate start-workout task; post-workout or fuel task surfaces
   - Rest day Sunday: rest/recovery headline, no gym CTA
   - Protein gap scenario: `hit_protein` task with grams remaining
   - `getPostWorkoutRecap` with fixture session
   - `getWeighInReaction` with 7-day trend fixture
   - `getNotificationBody` workout + nutrition kinds
   - All tests pass alongside existing FTI-40 suite

10. **Build gate:** `npm run build` and `npm test` both pass with strict TypeScript unchanged.

## Tasks / Subtasks

- [x] **Task 1: Types + module scaffold** (AC: 1, 8)
  - [x] 1.1 Create `src/fitness/coachEngine.ts` with exported types (finalize sprint-change-proposal §7.3 contract):
    - `CoachTaskKind`: `"start_workout" | "log_weigh_in" | "hit_protein" | "rest_day" | "post_workout_review"`
    - `CoachTask`: `{ kind, label, rationale?, ctaLabel?, completed, priority }`
    - `HomeCoachPlan`: `{ headline, subline?, tasks: CoachTask[], insightStrip? }`: max 3 tasks surfaced
    - `CoachContext`: read-only snapshot (document fields in module header JSDoc)
    - `CoachAdjustment`: `{ message: string; macroNudge?: { deltaCal?: number; reason: string } }`: metadata only, no persist
    - `CoachNotificationKind`: `"workout" | "nutrition"` (alias if needed for FTI-38)
  - [ ] 1.2 No React/DOM imports; only `./types`, `./coach`, `./dailyPlan`, `./notificationScheduler` (`isTrainingDay`), `./nutritionTotals`, `./dailyStreak`, `./estimateSessionDuration`, `./weeklySummary`, `./data` as needed.
  - [ ] 1.3 Export all public functions from single file, no barrel re-export elsewhere yet.

- [x] **Task 2: `buildCoachContext`** (AC: 2)
  - [ ] 2.1 Signature: `buildCoachContext(state: AppState, dateKey: string, now?: Date): CoachContext`.
  - [ ] 2.2 Parse `dateKey` → local `Date` at noon (same pattern as `weeklySummary.parseDateKeyNoonLocal`: inline or small helper).
  - [ ] 2.3 Precompute:
    - `isTrainingDay(now, state.workoutTemplates, daysPerWeek)` from `notificationScheduler.ts`
    - `todayTemplate`: matching `WorkoutRoutineTemplate | null` via weekday `dayLabel`
    - `workoutCompletedToday`: `state.workoutsCompletedByDay[dateKey] === true`
    - `nutritionTotals`: `effectiveNutritionTotalsForDateKey(...)` + `proteinGap = max(0, targets.p - totals.p)`
    - `streakCount`: `computeFitnessCheckInStreak(state, dateKey)` from `dailyStreak.ts`
    - `weekIndex`: `planWeekIndex(now, state.planStartIso)` from `./data`
    - `recentWeightTrend`: last 7 days from `state.weightLog` (simple delta or avg, rule-based, not full TDEE)
    - `weeklySummary`: optional `buildWeeklySummary(state, dateKey)` for insight strip
  - [ ] 2.4 Store **reference** to original `state` on context for recap/history lookups, treat as read-only; never mutate.
  - [ ] 2.5 Accept injectable `now` defaulting to `new Date()` for test determinism when `dateKey === localDateKey(now)`.

- [x] **Task 3: `getHomeCoachPlan`** (AC: 3, 7)
  - [ ] 3.1 Build candidate `CoachTask[]` from context signals:
    - Training day + not completed → `start_workout` (priority 1): label like `Start ${template.name}` + `estimatedSessionLabel(template)` when exercises exist
    - Protein gap > 0 and not goal hit → `hit_protein` (priority 2): `"Hit ${targets.p}g protein (${gap}g left)"`
    - Scheduled weigh-in day (Sunday per daily plan convention OR no weigh-in this week) → `log_weigh_in` (priority 3)
    - Workout completed → `post_workout_review` or fuel task instead of start
    - Rest/active recovery → `rest_day` with mobility/walk copy
  - [ ] 3.2 Set `completed: true` on tasks already satisfied (workout done, protein goal hit, weigh-in logged today).
  - [ ] 3.3 Sort by `priority`, slice to **max 3** for `HomeCoachPlan.tasks`.
  - [ ] 3.4 Headline rules:
    - Training: `"${template.name}, progression window"` or split-appropriate variant referencing week/streak
    - Rest: recovery/rest headline referencing streak or week index
    - Post-workout: praise + next habit nudge
  - [ ] 3.5 Subline: evolve `homePlanSubline` pattern, week index + optional streak (`streakMotivationLabel`), do **not** import React; copy logic or call `homePlanSubline(state, now)` from `./homeGreeting` if pure.
  - [ ] 3.6 `insightStrip`: one line combining ≥2 domains when data exists (e.g. `"${streak}-day streak, ${proteinGap}g protein left to hit today's floor"` or weigh-in trend + workout count from weekly summary).
  - [ ] 3.7 Optional: if building pre-workout insight and `state.workout` has active exercises, delegate overload tip via `progressiveOverloadInsight(state.workout)`: do not fork overload strings.

- [x] **Task 4: `getPostWorkoutRecap`** (AC: 4)
  - [ ] 4.1 Signature: `getPostWorkoutRecap(ctx: CoachContext, session: CompletedWorkoutSession): string`.
  - [ ] 4.2 Include session `title`, `durationSec` (formatted), done set count, total volume (reuse `weeklySummary.sessionVolumeLbs` pattern or inline).
  - [ ] 4.3 Reference streak if eligibility updated today; nudge protein if gap remains.
  - [ ] 4.4 Deterministic string, no randomness; same inputs → same output.

- [x] **Task 5: `getWeighInReaction`** (AC: 5)
  - [ ] 5.1 Signature: `getWeighInReaction(ctx: CoachContext, entry: WeightEntry): CoachAdjustment | null`.
  - [ ] 5.2 Compare `entry.weightLbs` to 7-day average or prior entry, emit rule-based messages (hold calories, slight deficit nudge, training consistency praise).
  - [ ] 5.3 Populate optional `macroNudge` metadata for FTI-37 UI, **do not** write to `state.adjustmentHistory` or persist.
  - [ ] 5.4 Return `null` if `entry.dateKey` already exists in log (duplicate-day guard).

- [x] **Task 6: `getNotificationBody`** (AC: 6)
  - [ ] 6.1 Signature: `getNotificationBody(ctx: CoachContext, kind: CoachNotificationKind): string`.
  - [ ] 6.2 `"workout"`: reference template name + optional streak ("Push day, 5-day streak on the line").
  - [ ] 6.3 `"nutrition"`: reference protein gap or "log today's fuel" when empty.
  - [ ] 6.4 Do **not** modify `notificationScheduler.ts` in this story, FTI-38 integrates; export is ready for import.

- [x] **Task 7: Test fixtures extension** (AC: 9)
  - [ ] 7.1 Extend `src/fitness/testFixtures/appStateFixtures.ts`:
    - `restDayAppState(dateKey)`: Sunday or non-training day for 5-day split
    - `weighInTrendAppState(entries: WeightEntry[])`: 7-day trend for reaction tests
    - `workoutHistoryAppState(sessions: CompletedWorkoutSession[])`: for recap tests
  - [ ] 7.2 Keep fixtures pure, no new DOM/React imports.

- [x] **Task 8: `coachEngine.test.ts`** (AC: 9, 10)
  - [ ] 8.1 Create `src/fitness/coachEngine.test.ts` colocated with module.
  - [ ] 8.2 Use fixed `Date` / `dateKey` pairs (document in comments, follow FTI-40 weekday discipline; verify with `new Date(y, m-1, d).getDay()`).
  - [ ] 8.3 Test matrix:
    - `buildCoachContext`: training vs rest day flags
    - `getHomeCoachPlan`: Mon training headline contains template name; tasks length ≤ 3; start_workout present when incomplete
    - `getHomeCoachPlan`: workout completed → no start_workout with `completed: false`
    - `getHomeCoachPlan`: Sunday rest headline; no start_workout task
    - `getHomeCoachPlan`: protein gap task with correct remaining grams
    - `getHomeCoachPlan`: insightStrip present when streak + protein gap both non-zero
    - `getPostWorkoutRecap`: non-empty string with session title
    - `getWeighInReaction`: message for downward trend; null for duplicate day
    - `getNotificationBody`: workout + nutrition kinds differ from generic scheduler strings
  - [ ] 8.4 Prefer explicit `expect(...).toMatch(/substring/)` over brittle full-string snapshots unless copy is frozen.
  - [ ] 8.5 Run `npm test`: all tests green (existing 30 + new).

- [x] **Task 9: Verification & scope guard** (AC: 8, 10)
  - [ ] 9.1 Run `npm run build`: must pass.
  - [ ] 9.2 Run `npm test`: must pass.
  - [ ] 9.3 **Out of scope:** `ScreenHome.tsx`, `WorkoutCoachCard.tsx`, `notificationScheduler.ts` wiring, persist pipeline, those are FTI-33, FTI-37, FTI-38.
  - [ ] 9.4 **Out of scope:** LLM / FTI-13, Playwright E2E, new `AppState` fields.

## Dev Notes

### Why FTI-34 is second in Sprint 3

Epic 3 pivot (sprint-change-proposal-2026) identified the gap: modules like `coach.ts`, `homeGreeting.ts`, and `dailyPlan.ts` operate in silos, no cross-domain synthesis. FTI-40 established Vitest + fixtures; **FTI-34 delivers the engine** that FTI-33 (Home UI), FTI-37 (weigh-in UX), FTI-38 (notifications), and FTI-39 (weekly narrative) consume.

**Execution order:** FTI-40 ✅ → **FTI-34** → FTI-33 → FTI-37 → FTI-35 → FTI-36 → FTI-38 → FTI-39.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `coachEngine.ts` pure module + types | Home UI restructure (FTI-33) |
| `coachEngine.test.ts` + fixture extensions | Wire engine into `ScreenHome.tsx` |
| Read-only derived view from existing AppState | Persist `coachMacroNudges` (FTI-37 spike, metadata in `CoachAdjustment` only) |
| Export `getNotificationBody` for FTI-38 | Modify `notificationScheduler.ts` bodies |
| Call `progressiveOverloadInsight()` when appropriate | Duplicate overload logic |
| | LLM / FTI-13 |
| | Playwright E2E |

### Module contract (authoritative)

From sprint-change-proposal-2026 §7.3, finalize types in implementation:

```typescript
export type CoachTaskKind =
  | "start_workout"
  | "log_weigh_in"
  | "hit_protein"
  | "rest_day"
  | "post_workout_review";

export type CoachTask = {
  kind: CoachTaskKind;
  label: string;
  rationale?: string;
  ctaLabel?: string;
  completed: boolean;
  priority: number;
};

export type HomeCoachPlan = {
  headline: string;
  subline?: string;
  tasks: CoachTask[];       // max 3 surfaced
  insightStrip?: string;
};

export function buildCoachContext(state: AppState, dateKey: string, now?: Date): CoachContext;
export function getHomeCoachPlan(ctx: CoachContext): HomeCoachPlan;
export function getPostWorkoutRecap(ctx: CoachContext, session: CompletedWorkoutSession): string;
export function getWeighInReaction(ctx: CoachContext, entry: WeightEntry): CoachAdjustment | null;
export function getNotificationBody(ctx: CoachContext, kind: CoachNotificationKind): string;
```

**Note:** Proposal used `sessionId: string` and `WeightLogEntry`: align with existing types: `CompletedWorkoutSession` (has `id`) and `WeightEntry` from `./types`.

### AppState inputs (read-only slices)

| Slice | Engine use |
| --- | --- |
| `workoutHistory`, `workoutsCompletedByDay` | Recap, completion tasks, adherence insight |
| `nutritionManualByDay`, `nutritionItemsByDay`, `nutritionTargets` | Protein gap, fuel tasks, notification copy |
| `weightLog` | Weigh-in reaction, trend insight |
| `fitnessStreakSnapshot`, `streakEligibleByDay` | Streak headline / insight strip |
| `onboardingProfile`, `workoutTemplates`, `planStartIso` | Training day, template match, week index |
| `workout` (active session) | Optional `progressiveOverloadInsight()` input |
| `notificationPreferences` | **Not** engine input, FTI-38 only |

### Existing modules to reuse (do not reimplement)

| Module | Reuse |
| --- | --- |
| `coach.ts` | `progressiveOverloadInsight(w)`: in-session/pre-workout overload copy |
| `notificationScheduler.ts` | `isTrainingDay(date, templates, daysPerWeek)` |
| `nutritionTotals.ts` | `effectiveNutritionTotalsForDateKey(...)` |
| `dailyStreak.ts` | `computeFitnessCheckInStreak`, `nutritionGoalHitForDateKey`, `streakMotivationLabel` |
| `estimateSessionDuration.ts` | `estimatedSessionLabel`, `formatEstimatedSessionMinutes` |
| `weeklySummary.ts` | `buildWeeklySummary` for cross-domain insight |
| `homeGreeting.ts` | `homePlanSubline(state, date)` for subline baseline |
| `data.ts` | `planWeekIndex`, `SPLIT`, `PLAN_START_ISO` |

### FTI-40 fixture scaffold (ready)

`src/fitness/testFixtures/appStateFixtures.ts` exports:
- `minimalAppState(overrides?)`
- `trainingDayAppState({ dateKey, templateName?, daysPerWeek? })`
- `workoutCompletedAppState(dateKey)`
- `nutritionLoggedAppState(dateKey, totals?)`
- `workoutStateFixtures` (for `coach.ts`: not primary here)

**Extend** with rest-day, weigh-in trend, and workout-history builders in Task 7.

### Copy voice guidelines

- Deterministic rule-based strings, **no LLM**, no randomness, no `Math.random()`
- Coach tone: direct, actionable, references user's actual data (template name, grams, streak count)
- Cross-domain insight strip is the Epic 3 cohesion test, must combine ≥2 of: workout, nutrition, weigh-in, streak
- Match existing copy density in `coach.ts` and `dailyPlan.ts` life lines, concise, not paragraph-length

### Priority / task ordering logic (recommended)

| Priority | Kind | Condition |
| --- | --- | --- |
| 1 | `start_workout` | Training day + workout not completed |
| 1 | `rest_day` | Rest/active recovery day (primary anchor) |
| 2 | `hit_protein` | Protein gap > 0 and goal not hit |
| 2 | `post_workout_review` | Workout completed, fuel not logged |
| 3 | `log_weigh_in` | Sunday or weekly weigh-in due, no entry today |

Slice to top 3 after sort. Mark `completed: true` when already satisfied so UI (FTI-33) can strike through.

### Weigh-in reaction rules (MVP, rule-based)

No full adaptive TDEE (deferred Sprint 4+). Suggested thresholds:
- **≥7 entries in 7 days:** compare week avg to prior week avg
- Loss faster than ~1.5 lb/week → "hold calories" message + optional `macroNudge.deltaCal: +100`
- Gain or plateau 2+ weeks → training adherence nudge
- First weigh-in of week → consistency praise

Return `CoachAdjustment | null`; FTI-37 renders message on Home.

### Notification body vs scheduler

FTI-34 exports `getNotificationBody(ctx, kind)` only. Current scheduler (`buildWorkoutNotificationPayload`) uses static copy, **leave unchanged** until FTI-38 replaces `body` field with engine output. Titles/tags/icons stay in scheduler.

### Testing standards (Vitest 3.2.4)

- Colocate: `src/fitness/coachEngine.test.ts`
- Environment: `node` (configured in `vite.config.ts`)
- Explicit imports from `"vitest"`: `globals: false`
- Fixed dates: always verify weekday when picking fixture dates (FTI-40 lesson: May 22 2026 = Friday)
- Gate: `npm run build` + `npm test`

Example pattern:

```typescript
import { describe, it, expect } from "vitest";
import { buildCoachContext, getHomeCoachPlan } from "./coachEngine";
import { trainingDayAppState } from "./testFixtures/appStateFixtures";

describe("getHomeCoachPlan", () => {
  it("surfaces start_workout on training day", () => {
    const dateKey = "2026-05-18"; // Monday
    const state = trainingDayAppState({ dateKey, templateName: "Push" });
    const ctx = buildCoachContext(state, dateKey, new Date(2026, 4, 18, 9, 0));
    const plan = getHomeCoachPlan(ctx);
    expect(plan.headline).toMatch(/Push/i);
    expect(plan.tasks.some((t) => t.kind === "start_workout" && !t.completed)).toBe(true);
    expect(plan.tasks.length).toBeLessThanOrEqual(3);
  });
});
```

### Previous story learnings (FTI-40)

- Vitest 3.2.4 installed; 30 tests passing, extend, do not break
- `appStateFixtures` uses `buildAppStateFromPersisted({})`: prefer extending over hand-rolling AppState
- Mock `notificationPermission` only in scheduler tests, not needed for coachEngine
- Arizona timezone helpers live in `dailyPlan.ts`: use only if engine needs Phoenix calendar (weigh-in stretch); otherwise `localDateKey` suffices for MVP

### Git / branch expectations

Swarm branch: `story/fti-34-cross-domain-coach-engine`. Pure TS module + tests, no UI files expected; low conflict with `main`.

### Project Structure Notes

- New files: `src/fitness/coachEngine.ts`, `src/fitness/coachEngine.test.ts`
- Extend: `src/fitness/testFixtures/appStateFixtures.ts`
- Do **not** add dependencies, pure TS only
- Do **not** modify `persistFitnessSlice.ts` or Supabase types
- Architecture.md already documents `coachEngine.ts` as FTI-34: no doc update required in this story unless contract diverges

### Parallel implementation groups

Dev agent may parallelize after Task 1-2 complete:

| Group | Tasks | Depends on |
| --- | --- | --- |
| **A, Foundation** | Task 1, Task 2 |, |
| **B, Home plan** | Task 3 | A |
| **C, Session recap** | Task 4 | A |
| **D, Check-in + notifications** | Task 5, Task 6 | A |
| **E, Fixtures + tests** | Task 7, Task 8 | B, C, D |
| **F, Verify** | Task 9 | E |

Groups **B, C, D** can run in parallel once `CoachContext` is stable.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`: Story 3.2 FTI-34]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026.md`: §7.3 Module contract, §7.4 AppState inputs, §7.5 coach.ts relationship]
- [Source: `_bmad-output/planning-artifacts/architecture.md`: Cross-domain coach layer, Vitest gate]
- [Source: `_bmad-output/planning-artifacts/prd.md`: Coaching model, Sprint 3 goals]
- [Source: `_bmad-output/implementation-artifacts/fti-40-vitest-harness-coach-dailyplan-unit-tests.md`: Fixture scaffold, test patterns]
- [Source: `src/fitness/coach.ts`, `homeGreeting.ts`, `dailyPlan.ts`, `notificationScheduler.ts`, `dailyStreak.ts`, `nutritionTotals.ts`, `estimateSessionDuration.ts`, `weeklySummary.ts`]
- [Source: `src/fitness/testFixtures/appStateFixtures.ts`]
- [Linear: FTI-34](https://linear.app/ftiness-tracker/issue/FTI-34/cross-domain-coach-engine)

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm orchestrator)

### Debug Log References

- `npm test`: 42 tests passing (12 new coachEngine tests)
- `npm run build`: clean

### Completion Notes List

- Implemented pure `coachEngine.ts` with `buildCoachContext`, `getHomeCoachPlan`, `getPostWorkoutRecap`, `getWeighInReaction`, `getNotificationBody`
- Extended `appStateFixtures.ts` with rest day, weigh-in trend, workout history, and training-with-exercises builders
- Added `coachEngine.test.ts` covering all AC scenarios
- No UI or persist changes, engine-only per scope

### File List

- `src/fitness/coachEngine.ts` (new)
- `src/fitness/coachEngine.test.ts` (new)
- `src/fitness/testFixtures/appStateFixtures.ts` (extended)
- `_bmad-output/implementation-artifacts/fti-34-cross-domain-coach-engine.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-23: Story file created (ready-for-dev), cross-domain coach engine module + tests
- 2026-05-23: Implemented coachEngine module + 12 unit tests; story done
