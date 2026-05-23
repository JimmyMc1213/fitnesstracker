# Story 3.6: Check-in triggered micro-adjustments (FTI-36)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user who logs my weekly weigh-in,
I want the coach to react on Home with trend-based guidance,
so my plan adapts without MacroFactor-level complexity.

## Acceptance Criteria

1. **Coach reaction on Home after weigh-in:** Given the user has logged a weigh-in for **today** (local date), when Home renders for today, then a coach reaction block appears on or below the weigh-in card using **`getWeighInReactionForDisplay`** (engine copy verbatim, no hardcoded strings in UI).

2. **Save-time reaction (Progress tab):** Given the user saves a **new** weigh-in in `WeighInSheet`, when `setState` commits, then `getWeighInReaction` runs against pre-save context and returns non-null for first log of the day (duplicate same-day update returns null, unchanged FTI-34 behavior).

3. **7-day trend micro-nudges:** Given sufficient weight history, when reaction rules fire, then copy reflects rule-based guidance (aggressive loss → hold calories + optional `macroNudge.deltaCal`; gain/plateau → adherence nudge; stable → encouragement). **No persist write** of macro targets, metadata display only.

4. **Macro nudge display:** Given `CoachAdjustment.macroNudge` is present, when the reaction renders, then a secondary line surfaces the delta (e.g. "+100 cal suggested") and reason, informational only.

5. **Historical date guard:** Given the user is viewing a past/future date on Home, when weigh-in card shows that day's entry, then coach reaction is **not** shown (today-only coaching surface).

6. **No new persist fields:** Given MVP scope, when FTI-36 ships, then no new `AppState` fields or `persistFitnessSlice` changes.

7. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] **Task 1: Display-safe weigh-in reaction export** (AC: 2, 3)
  - [x] 1.1 Refactor `getWeighInReaction`: extract `buildWeighInReaction(ctx, entry)` internal; keep duplicate-day guard on `getWeighInReaction` only.
  - [x] 1.2 Export `getWeighInReactionForDisplay(ctx, entry)`: skips duplicate guard for Home when entry already in log.
  - [x] 1.3 Extend `coachEngine.test.ts`: display variant returns message for logged entry; save variant still null on duplicate.

- [x] **Task 2: WeighInCoachReaction component** (AC: 1, 4)
  - [x] 2.1 Create `src/fitness/WeighInCoachReaction.tsx`: compact coach-styled block (reuse TodaysCoachPlanCard / coach green tokens).
  - [x] 2.2 Accept `adjustment: CoachAdjustment`; render message + optional macro nudge line.

- [x] **Task 3: ScreenHome wiring** (AC: 1, 5)
  - [x] 3.1 Compute `weighInReaction` via `getWeighInReactionForDisplay` when `isViewingToday && dayEntry && coachCtx`.
  - [x] 3.2 Render `WeighInCoachReaction` below weigh-in card when reaction non-null.

- [x] **Task 4: Verification** (AC: 6, 7)
  - [x] 4.1 Grep, no persist/types changes.
  - [x] 4.2 `npm test` (65 tests) + `npm run build`.

## Dev Notes

### Why FTI-36 follows FTI-35

FTI-34 implemented `getWeighInReaction` (pure engine). FTI-33/37 explicitly deferred Home UI wiring. **FTI-36 surfaces check-in coaching on Home** after weigh-in.

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → FTI-33 ✅ → FTI-37 ✅ → FTI-35 ✅ → **FTI-36** → FTI-38 → FTI-39.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `getWeighInReactionForDisplay` | Persist macro target changes |
| `WeighInCoachReaction` on Home | Full adaptive TDEE (Sprint 4+) |
| Macro nudge copy (display only) | FTI-38 notification bodies |
| | Playwright E2E |
| | LLM / FTI-13 |

### Display vs save API

`getWeighInReaction` returns `null` when an entry already exists for the day (update path). Home must use `getWeighInReactionForDisplay` to show reaction for today's logged entry when user returns from Progress tab.

## Senior Developer Review (AI)

- Refactored weigh-in reaction into shared `buildWeighInReaction` with separate save vs display exports, avoids duplicate-check blocking Home UI.
- No findings requiring code changes after review.

## File List

- `src/fitness/coachEngine.ts`: `buildWeighInReaction`, `getWeighInReactionForDisplay`
- `src/fitness/coachEngine.test.ts`: display variant test
- `src/fitness/WeighInCoachReaction.tsx`: new component
- `src/fitness/screens/ScreenHome.tsx`: wire reaction below weigh-in card
- `_bmad-output/implementation-artifacts/fti-36-check-in-triggered-micro-adjustments.md`: story file
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: status update

## Change Log

- 2026-05-23: FTI-36: Home weigh-in coach reaction UI + display-safe engine export
