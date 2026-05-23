# Story 3.8: Context-aware notification copy (FTI-38)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user who receives workout and nutrition reminders,
I want notification bodies to reference my actual session and fuel status,
so reminders feel like coaching nudges instead of generic alerts.

## Acceptance Criteria

1. **Workout reminder body:** Given a training day with a scheduled template, when `buildWorkoutNotificationPayload(state)` runs, then `body` comes from `getNotificationBody(ctx, "workout")` and references today's session name (not the static scheduler string).

2. **Nutrition reminder body:** Given no nutrition logged today, when `buildNutritionNotificationPayload(state)` runs, then `body` comes from `getNotificationBody(ctx, "nutrition")` and reflects protein gap or goal-hit status (not the static scheduler string).

3. **Titles unchanged:** Given FTI-34 contract, when payloads build, then `title`, `tag`, and `icon` remain owned by `notificationScheduler.ts` ("Workout day" / "Nutrition check-in").

4. **Scheduler behavior unchanged:** Given reminder firing rules, when `shouldFireWorkoutReminder` / `shouldFireNutritionReminder` run, then enablement, timing, and dedupe logic are unchanged.

5. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] **Task 1: Wire coach engine into payload builders** (AC: 1, 2, 3)
  - [x] 1.1 Import `buildCoachContext`, `getNotificationBody` from `./coachEngine`.
  - [x] 1.2 `buildWorkoutNotificationPayload` — build ctx for today, set `body = getNotificationBody(ctx, "workout")`.
  - [x] 1.3 `buildNutritionNotificationPayload` — build ctx for today, set `body = getNotificationBody(ctx, "nutrition")`.

- [x] **Task 2: Update scheduler tests** (AC: 1, 2, 5)
  - [x] 2.1 Workout payload test — expect engine copy (template + streak phrasing), not legacy static string.
  - [x] 2.2 Nutrition payload test — expect protein-gap or goal-hit copy from engine.

- [x] **Task 3: Verification** (AC: 4, 5)
  - [x] 3.1 `npm test` (65 tests) + `npm run build`.

## Dev Notes

### Why FTI-38 follows FTI-36

FTI-34 exported `getNotificationBody(ctx, kind)` but explicitly deferred `notificationScheduler.ts` wiring. **FTI-38 connects the engine to live notification bodies.**

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → FTI-33 ✅ → FTI-37 ✅ → FTI-35 ✅ → FTI-36 ✅ → **FTI-38** → FTI-39.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| Replace `body` in payload builders | Title / tag / icon changes |
| Scheduler unit test updates | `checkAndFireDueNotifications` async integration |
| | Playwright E2E |
| | LLM / FTI-13 |

### Circular import note

`coachEngine.ts` imports `isTrainingDay` from `notificationScheduler.ts`. Wiring bodies creates a module cycle; both sides use exports only at call time (no top-level side effects) — verified by build gate.

## Senior Developer Review (AI)

- Wired `buildCoachContext` + `getNotificationBody` into both payload builders; optional `now` param for test determinism.
- Titles/tags/icons unchanged; firing rules untouched.
- No findings requiring code changes after review.

## File List

- `src/fitness/notificationScheduler.ts` — wire `getNotificationBody`
- `src/fitness/notificationScheduler.test.ts` — context-aware body assertions
- `_bmad-output/implementation-artifacts/fti-38-context-aware-notification-copy.md` — story file
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status update

## Change Log

- 2026-05-23: FTI-38 — context-aware notification bodies via coach engine
