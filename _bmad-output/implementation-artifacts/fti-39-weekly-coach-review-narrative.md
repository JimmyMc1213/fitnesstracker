# Story 3.9: Weekly coach review narrative (FTI-39)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user reviewing my week,
I want the weekly summary card to include a coach-written recap and next-week focus line,
so I know what to prioritize when the new week starts (day-7 retention hook).

## Acceptance Criteria

1. **`getWeeklyCoachReview` export:** Given FTI-34 coach engine, when `getWeeklyCoachReview(ctx: CoachContext)` runs, then it returns `{ narrative: string; nextWeekFocus: string }` — both non-empty, deterministic (same inputs → same output), no side effects.

2. **Cross-domain narrative:** Given a `CoachContext` with `weeklySummary` populated, when `narrative` builds, then it synthesizes **≥2 domains** from: workouts completed vs planned, nutrition days hit, total volume, streak count, and/or weight trend (reuse `ctx.weeklySummary`, `ctx.streakCount`, `ctx.recentWeightTrend` — do not duplicate aggregation logic from `weeklySummary.ts`).

3. **Next-week focus:** Given the same context, when `nextWeekFocus` builds, then it returns a single actionable line (e.g. hit planned sessions, close protein gaps, maintain weigh-in cadence) keyed off the weakest signal this week — not generic filler.

4. **WeeklySummaryCard UI:** Given today view on Home or Progress tab, when `WeeklySummaryCard` renders, then it shows the coach `narrative` and `nextWeekFocus` below the stat grid in both expanded and collapsed-default modes (collapsed header unchanged; expand reveals stats + coach copy).

5. **No persistence changes:** Given MVP scope, when FTI-39 ships, then no new `AppState` fields, no Supabase schema changes — derived view only via existing `buildCoachContext`.

6. **Unit tests:** Given FTI-40 harness, when `coachEngine.test.ts` runs, then tests cover: strong week (workouts + fuel on pace), weak training week, weak nutrition week, and stable nextWeekFocus determinism.

7. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] **Task 1: `getWeeklyCoachReview` in coachEngine** (AC: 1, 2, 3, 5)
  - [x] 1.1 Export type `WeeklyCoachReview = { narrative: string; nextWeekFocus: string }`.
  - [x] 1.2 Implement `getWeeklyCoachReview(ctx: CoachContext): WeeklyCoachReview` in `src/fitness/coachEngine.ts`.
  - [x] 1.3 Narrative branches: workouts behind plan, nutrition behind plan, strong adherence praise, optional weight-trend clause when `recentWeightTrend.entryCount >= 2`.
  - [x] 1.4 `nextWeekFocus`: pick weakest domain (training < planned, nutrition < 4/7, or maintenance when on pace).

- [x] **Task 2: Wire WeeklySummaryCard** (AC: 4, 5)
  - [x] 2.1 Import `buildCoachContext`, `getWeeklyCoachReview` in `WeeklySummaryCard.tsx`.
  - [x] 2.2 `useMemo` coach review from `state` + `todayKey`.
  - [x] 2.3 Render narrative (body copy) + nextWeekFocus (accent label "Next week") below stat grid; match existing card typography (no new design system).

- [x] **Task 3: Unit tests** (AC: 6)
  - [x] 3.1 Add `describe("getWeeklyCoachReview")` block in `coachEngine.test.ts`.
  - [x] 3.2 Strong week fixture — narrative mentions workouts + fuel; focus is maintenance-oriented.
  - [x] 3.3 Weak training week — narrative + focus nudge sessions.
  - [x] 3.4 Weak nutrition week — focus nudge protein logging.
  - [x] 3.5 Determinism — same ctx called twice → identical strings.

- [x] **Task 4: Verification** (AC: 7)
  - [x] 4.1 `npm test` (69 tests) + `npm run build`.

## Dev Notes

### Why FTI-39 is last in Sprint 3

FTI-34 exported `buildCoachContext` with `weeklySummary` precomputed. FTI-24 shipped stats-only `WeeklySummaryCard`. **FTI-39 adds the coach voice layer** — narrative recap + next-week focus for retention.

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → FTI-33 ✅ → FTI-37 ✅ → FTI-35 ✅ → FTI-36 ✅ → FTI-38 ✅ → **FTI-39**.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `getWeeklyCoachReview` pure function | LLM / FTI-13 AI notes |
| WeeklySummaryCard coach copy block | New Progress tab section |
| `coachEngine.test.ts` coverage | Playwright E2E |
| Home + Progress card (existing surfaces) | Push notification for weekly review |
| | SundayReviewSheet fuel math changes |

## Senior Developer Review (AI)

- Adversarial review: all ACs implemented; no CRITICAL/HIGH blockers.
- F1 (LOW): Sunday weigh-in focus branch untested — acceptable for Could-priority story; branch guarded by `ctx.isSunday`.
- F2 (LOW): Strong-week narrative omits weight trend even when entries exist — trend clause reserved for mixed/weak weeks; acceptable.
- F3 (LOW): Coach copy hidden until expand on Home — matches AC 4 by design.

## Review Follow-ups (AI)

- [x] Verified collapsed Home behavior matches AC (expand reveals coach copy)
- [x] Confirmed no AppState / persist changes
- [x] Full test suite green (69 tests)

## Dev Agent Record

### Agent Model Used

Composer (bmad-swarm orchestrator)

### Completion Notes List

- Added `getWeeklyCoachReview` to `coachEngine.ts` with training/fuel/volume/streak/trend synthesis.
- Wired coach narrative + next-week focus into `WeeklySummaryCard` below stat grid.
- Added 4 unit tests for strong week, weak training, weak nutrition, determinism.

### File List

- `src/fitness/coachEngine.ts` — `getWeeklyCoachReview`, `WeeklyCoachReview` type
- `src/fitness/coachEngine.test.ts` — weekly review tests
- `src/fitness/WeeklySummaryCard.tsx` — coach narrative UI
- `_bmad-output/implementation-artifacts/fti-39-weekly-coach-review-narrative.md` — story file
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status update

## Change Log

- 2026-05-23: Story created for FTI-39 — weekly coach review narrative
- 2026-05-23: FTI-39 implemented — coach weekly review on WeeklySummaryCard; 69 tests green
