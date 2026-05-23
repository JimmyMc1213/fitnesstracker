# Story 3.4: In-session coach prominence + set autofill (FTI-37)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user logging a workout,
I want the coach expanded by default with sets prefilled from my last session,
so I feel coached during the workout, not after.

## Acceptance Criteria

1. **Coach card expanded on training days:** Given the user is in an **active lifting session** (`workout.sessionPhase === "lifting"`) on a **training day** (per `isTrainingDay(now, state.workoutTemplates, daysPerWeek)`), when `WorkoutCoachCard` mounts, then it renders **expanded** (coach note, warm-up, mobility visible without a tap). Given a rest day or empty off-plan session, when the card mounts, then default remains **collapsed** (current behavior).

2. **User can collapse:** Given the coach card is expanded, when the user taps the header toggle, then the card collapses and `aria-expanded` reflects state. Given collapsed, when the user taps again, then content re-expands. Collapse preference is **session-local only** (React `useState`), no new persist fields.

3. **Set autofill from last logged session:** Given `state.workoutHistory` contains a prior session where exercise `"Bench Press"` (matching `name` + optional `label` via `exerciseNoteKey`) logged done sets `{135×8, 135×8, 135×7}`, when the user starts today's template or adds that exercise mid-session, then each working set row is prefilled with those **weight × reps** values (`done: false`, inputs show values, not blank placeholders). Given **no** prior history for an exercise, when sets are created, then behavior matches today's `blankSets()` (zeros / em-dash placeholders).

4. **Autofill set-count alignment:** Given last session had 4 logged sets but today's template defines 3 sets, when autofill runs, then the **3 template sets** receive the first 3 historical w/r pairs. Given template has **more** sets than history, when autofill runs, then extra sets inherit the **last historical** w/r pair (same pattern as `resizeWorkoutSets` in `data.ts`).

5. **Mid-workout paths covered:** Autofill applies when starting from a routine template (`startTemplateWorkout`), adding an exercise (`addExerciseToSession`, `saveDraftCustomAndAddToSession`), and **swapping** an exercise (`ExerciseSwapSheet` confirm path), not only template start.

6. **Overload tips unchanged:** Given an active workout with exercises, when `WorkoutCoachCard` renders `overloadTip`, then the string still comes from `progressiveOverloadInsight(state.workout)` in `coach.ts`: **no** duplication of overload heuristics in UI or `coachEngine.ts`. Existing `coach.test.ts` branches remain green.

7. **Optional, pre-workout brief from engine:** Given today is a training day and the user opens **routine preview** (`RoutinePreviewSheet`) for today's matching template **or** lands on Workout tab idle with a today template available, when preview/idle renders, then a one-line coach brief surfaces using **`getHomeCoachPlan(buildCoachContext(...)).headline`** (and optional first incomplete `start_workout` task `rationale`), engine copy verbatim, no hardcoded strings. Home `TodaysCoachPlanCard` already shows engine headline in `ScreenHeader.subtitle`; optional AC satisfied if preview sheet also shows brief before "Start".

8. **No persistence changes:** Given MVP scope, when FTI-37 ships, then no new `AppState` fields, no `persistFitnessSlice` changes, autofill reads `workoutHistory` only.

9. **Build gate:** `npm run build` passes. `npm test` passes (new autofill tests + existing 42+ suite unchanged for `coach.ts` / `coachEngine.ts`).

## Tasks / Subtasks

- [x] **Task 1: Pure autofill module** (AC: 3, 4, 8)
  - [x] 1.1 Create `src/fitness/workoutAutofill.ts`: pure functions, no React:
    - `findLastLoggedExerciseSets(history, name, label?): WorkoutSet[] | null`: scan `getWorkoutHistorySorted(history)` newest-first; match exercise via `exerciseNoteKey(name, label)` against `ex.name` + `ex.label`; return cloned sets with `done: false` (w/r from history; history stores canonical lbs per `unitPreferences.ts`).
    - `autofillSetsForTemplateCount(templateSetCount: number, lastSets: WorkoutSet[] | null): WorkoutSet[]`: map index-by-index; pad extras with last historical w/r; return `blankSets()` equivalent when `lastSets` is null/empty.
    - `autofillExerciseSets(exercise: WorkoutExercise, history): WorkoutExercise`: apply to exercise.sets.length.
  - [x] 1.2 Export from single file; import `exerciseNoteKey` from `./exerciseNotes`, history helpers from `./workoutHistory`.
  - [x] 1.3 Document in module header: uses `workoutHistory` (per-set data), **not** `exerciseSessionHistoryByKey` (best-only snapshots).

- [x] **Task 2: Autofill unit tests** (AC: 3, 4, 9)
  - [x] 2.1 Create `src/fitness/workoutAutofill.test.ts` colocated with module.
  - [x] 2.2 Fixture: `workoutHistoryAppState` from `testFixtures/appStateFixtures.ts` with session containing Bench 135×8, 135×8, 135×7.
  - [x] 2.3 Test `findLastLoggedExerciseSets`: returns most recent session when multiple exist; matches label disambiguation; returns null when no match.
  - [x] 2.4 Test `autofillSetsForTemplateCount`: 3 sets from 4 historical; 5 sets from 3 historical (pad with last); null history → zeros.
  - [x] 2.5 Run `npm test`: all green.

- [x] **Task 3: Wire autofill in `ScreenWorkout.tsx`** (AC: 3, 4, 5)
  - [x] 3.1 Extract shared helper `buildSetsForExercise(name, label, setCount, history)` replacing raw `blankSets()` calls, delegates to `workoutAutofill.ts`.
  - [x] 3.2 Update `startTemplateWorkout`: after `cloneExercisesForNewSession`, map exercises through autofill using `state.workoutHistory`.
  - [x] 3.3 Update `addExerciseToSession` and `saveDraftCustomAndAddToSession`: autofill on add.
  - [x] 3.4 Update swap-exercise confirm handler, autofill sets for replacement exercise.
  - [x] 3.5 **Do not** autofill on in-progress set edits or re-expanding collapsed card, only on exercise creation/swap/template start.

- [x] **Task 4: `WorkoutCoachCard` default expanded** (AC: 1, 2)
  - [x] 4.1 Add prop `defaultExpanded?: boolean` (default `false` for backward compatibility).
  - [x] 4.2 Initialize `useState(!defaultExpanded)` for `collapsed`: when `defaultExpanded === true`, card starts open.
  - [x] 4.3 When expanded by default, hide or shorten collapsed-only teaser line ("Tap for coach note…"), expanded content visible immediately.
  - [x] 4.4 In `ScreenWorkout.tsx` lifting view, compute `isTrainingDayToday` via `isTrainingDay(...)`; pass `defaultExpanded={shouldDefaultExpandCoachCard(isTrainingDayToday, w.splitId, todayTemplateId)}` so off-plan/empty sessions stay collapsed.

- [x] **Task 5: Preserve `coach.ts` overload path** (AC: 6)
  - [x] 5.1 Confirm `overloadTip={progressiveOverloadInsight(w)}` unchanged in lifting render path.
  - [x] 5.2 Run `npm test`: `coach.test.ts` five branches still pass; no new overload logic in `coachEngine.ts` for in-session tips.

- [x] **Task 6: Optional pre-workout brief (engine copy)** (AC: 7)
  - [x] 6.1 In `ScreenWorkout.tsx` idle phase (or `RoutinePreviewSheet`), import `buildCoachContext`, `getHomeCoachPlan` from `./coachEngine` and `localDateKey` from `./dailyPlan`.
  - [x] 6.2 When `isTrainingDay` and preview template matches today's weekday `dayLabel`, render compact coach brief block: `plan.headline` + optional `start_workout` task `rationale` (first incomplete).
  - [x] 6.3 Style: reuse coach card tokens from `workoutUiTokens.ts` (`COACH_BLUE_LABEL`, muted body), consistent with `WorkoutCoachCard`.
  - [x] 6.4 **Do not** add new `coachEngine` exports unless brief logic exceeds 5 lines, prefer reusing `getHomeCoachPlan`.

- [x] **Task 7: Scope guard & verification** (AC: 8, 9)
  - [x] 7.1 Grep, no new persist fields in `types.ts` / `persistFitnessSlice.ts`.
  - [x] 7.2 Run `npm run build` + `npm test` (57 tests pass).
  - [x] 7.3 Manual matrix verified via unit tests + code review fixes (off-plan collapse gated).
  - [x] 7.4 **Out of scope:** FTI-36 weigh-in micro-adjustments, FTI-38 notifications, post-workout recap banner, Playwright E2E, persist collapse preference, LLM / FTI-13.

## Dev Notes

### Why FTI-37 follows FTI-33

Sprint 3 pivot (sprint-change-proposal-2026) identified coaching as **thin in-session**: `WorkoutCoachCard` defaults collapsed and set rows start empty despite `workoutHistory` (FTI-15) and `coachEngine` (FTI-34) on Home. **FTI-37 closes the in-session gap** while FTI-35/36 extend fuel and check-in coaching.

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → FTI-33 ✅ → **FTI-37** → FTI-35 → FTI-36 → FTI-38 → FTI-39.

**Dependencies:** FTI-34 (`coachEngine` for optional brief), FTI-40 (Vitest harness + fixtures). Both **done**.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `workoutAutofill.ts` + unit tests | FTI-36 `getWeighInReaction` Home UI |
| `WorkoutCoachCard` default expanded on training days | Persist coach collapse preference |
| Autofill on template start / add / swap | Autofill on manual set row edit |
| `coach.ts` overload tips (unchanged) | Duplicate overload in `coachEngine` |
| Optional engine brief in preview/idle | Full ScreenHome rework (FTI-33 done) |
| | New `AppState` fields |
| | Playwright E2E |

### Current implementation state (read before editing)

**`WorkoutCoachCard.tsx` (line 35):**
```typescript
const [collapsed, setCollapsed] = useState(true);
```
Always collapsed on mount, **change** via `defaultExpanded` prop.

**`ScreenWorkout.tsx` set creation:**
- `blankSets()` returns three `{ w: 0, r: 0, done: false }` rows.
- `startTemplateWorkout` uses `cloneExercisesForNewSession(tpl.exercises)`: template sets are zeros from `newTemplateExerciseLine`.
- `overloadTip = progressiveOverloadInsight(w)` at line ~567, **keep**.

**History data for autofill:**
- `CompletedWorkoutSession.exercises[].sets` in `workoutHistory` retains per-set w/r (done sets only in `buildCompletedWorkoutSession` via `snapshotSets`).
- `exerciseSessionHistoryByKey` stores **bestWeight/bestReps only**, insufficient for per-set autofill; do **not** use for AC #3.

**Weight storage:** Canonical **lbs** in state; display via `formatSetWeight` / `parseSetWeightInput` (`unitPreferences.ts`). Autofill copies stored lbs values, no conversion needed.

### Autofill algorithm (recommended)

```typescript
// workoutAutofill.ts, illustrative

export function findLastLoggedExerciseSets(
  history: CompletedWorkoutSession[] | undefined,
  name: string,
  label?: string,
): WorkoutSet[] | null {
  const key = exerciseNoteKey(name, label);
  for (const session of getWorkoutHistorySorted(history)) {
    for (const ex of session.exercises) {
      if (exerciseNoteKey(ex.name, ex.label) !== key) continue;
      if (ex.sets.length === 0) continue;
      return ex.sets.map((s) => ({ w: s.w, r: s.r, done: false }));
    }
  }
  return null;
}

export function autofillSetsForTemplateCount(
  count: number,
  lastSets: WorkoutSet[] | null,
): WorkoutSet[] {
  if (!lastSets?.length) {
    return Array.from({ length: count }, () => ({ w: 0, r: 0, done: false }));
  }
  const out: WorkoutSet[] = [];
  for (let i = 0; i < count; i++) {
    const src = lastSets[Math.min(i, lastSets.length - 1)];
    out.push({ w: src.w, r: src.r, done: false });
  }
  return out;
}
```

### Training-day detection

Reuse existing pure helper (same as FTI-34 engine):

```typescript
import { isTrainingDay } from "./notificationScheduler";

const daysPerWeek = state.onboardingProfile.daysPerWeek ?? 5;
const trainingToday = isTrainingDay(new Date(), state.workoutTemplates, daysPerWeek);
```

Alternative: `buildCoachContext(state, localDateKey(new Date())).isTrainingDay` if context already exposes flag, avoid duplicate template logic in screen.

### `WorkoutCoachCard` API change

```typescript
type WorkoutCoachCardProps = {
  overloadTip: string;
  sessionTip?: string;
  activeRoutine?: WorkoutRoutineTemplate;
  mobilityItems: readonly string[];
  warmupItems: readonly string[];
  defaultExpanded?: boolean; // NEW, true on training days during lifting
};
```

Pattern matches `WeeklySummaryCard.defaultCollapsed` from FTI-33 (inverse semantics).

### Optional pre-workout brief, wiring options

| Surface | Recommendation |
| --- | --- |
| `RoutinePreviewSheet` | Add optional `coachBrief?: { headline: string; rationale?: string }` prop, parent computes from engine |
| Workout idle header | Subtitle under "Start Workout" when today's template exists |
| Home CTA | Already shows `plan.headline` in `ScreenHeader.subtitle` (FTI-33), no change required if preview brief ships |

Prefer **RoutinePreviewSheet**, user sees coach voice immediately before committing to session.

### Testing standards (Vitest 3.2.4)

- Colocate: `src/fitness/workoutAutofill.test.ts`
- Environment: `node` (vite.config.ts)
- Explicit `import { describe, it, expect } from "vitest"`
- Extend `workoutHistoryAppState` / inline session fixtures, follow FTI-40 weekday discipline
- Gate: `npm run build` + `npm test`

Example test:

```typescript
import { describe, it, expect } from "vitest";
import { findLastLoggedExerciseSets, autofillSetsForTemplateCount } from "./workoutAutofill";
import { workoutHistoryAppState } from "./testFixtures/appStateFixtures";

describe("workoutAutofill", () => {
  it("returns last session sets for matching exercise", () => {
    const state = workoutHistoryAppState([/* session with Bench 135×8 ×3 */]);
    const sets = findLastLoggedExerciseSets(state.workoutHistory, "Bench Press");
    expect(sets?.[0]).toEqual({ w: 135, r: 8, done: false });
  });
});
```

### Previous story learnings

**FTI-34 (coachEngine):**
- Engine is pure, optional brief **reads** `getHomeCoachPlan`, does not mutate engine
- `progressiveOverloadInsight()` may be called from engine for home insight, in-session card still uses `coach.ts` directly per AC #6
- 42 tests passing, do not break exports

**FTI-33 (Home):**
- `TodaysCoachPlanCard` + `ScreenHeader.subtitle = plan.headline`: continuity for optional brief
- Collapse accordion pattern in `WeeklySummaryCard` / `WorkoutCoachCard`: reuse `aria-expanded` + chevron

**FTI-40 (Vitest):**
- `workoutHistoryAppState(sessions)` fixture ready in `appStateFixtures.ts`
- `workoutStateFixtures` for `coach.ts`: separate from autofill history tests

### FTI-35 / FTI-36 forward compatibility

- Autofill module is independent of Home fuel quick-log (FTI-35)
- Do not wire `getWeighInReaction` UI, that's FTI-36
- `coachEngine` may gain pre-workout helper later, not required if `getHomeCoachPlan` suffices

### Project Structure Notes

| File | Action |
| --- | --- |
| `src/fitness/workoutAutofill.ts` | **NEW** |
| `src/fitness/workoutAutofill.test.ts` | **NEW** |
| `src/fitness/WorkoutCoachCard.tsx` | **UPDATE**, `defaultExpanded` prop |
| `src/fitness/screens/ScreenWorkout.tsx` | **UPDATE**, autofill wiring + training-day expand |
| `src/fitness/RoutinePreviewSheet.tsx` | **UPDATE** (optional): coach brief block |
| `src/fitness/coach.ts` | **NO CHANGE** (tests only verify) |
| `src/fitness/coachEngine.ts` | **READ ONLY** for optional brief |
| `src/fitness/workoutHistory.ts` | **READ**, reuse sort/helpers; extend only if shared helper needed |

- Screens in `src/fitness/screens/`; workout helpers at `src/fitness/*.tsx` top level
- Plain CSS + inline styles, no Tailwind
- No new npm dependencies

### Parallel implementation groups

Dev agent may parallelize after reading `ScreenWorkout.tsx`, `WorkoutCoachCard.tsx`, and `workoutHistory.ts`:

| Group | Tasks | Files | Depends on |
| --- | --- | --- | --- |
| **A, Autofill module + tests** | Task 1, Task 2 | `workoutAutofill.ts`, `workoutAutofill.test.ts` |, |
| **B, Coach card expand** | Task 4 | `WorkoutCoachCard.tsx` |, |
| **C, Overload guard** | Task 5 | verify `ScreenWorkout.tsx`, `coach.test.ts` |, |
| **D, Optional brief** | Task 6 | `RoutinePreviewSheet.tsx`, `ScreenWorkout.tsx` |, (reads coachEngine) |
| **E, Session wiring** | Task 3 | `ScreenWorkout.tsx` | A |
| **F, Integration + verify** | Task 7 | all | A, B, E; D optional |

**Groups A, B, C, D can run in parallel.** Group E requires A. Group F is final merge + gates.

### Concerns / ambiguities

| Item | Resolution |
| --- | --- |
| sprint-change-proposal swaps FTI-36/FTI-37 labels in §6 table | **epics.md Story 3.4 is authoritative**, this story is in-session coach (FTI-37) |
| PRD non-goals mention "FTI-37 micro-adjustments" | Naming collision, micro-adjustments are **FTI-36** in epics; ignore for this story |
| History stores done sets only in snapshots | Sufficient for autofill, incomplete sets not persisted to history |
| Persist collapsed coach preference | **Out of scope**, session-local `useState` only |
| `exerciseSessionHistoryByKey` vs `workoutHistory` | Use **workoutHistory** for per-set autofill |

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`: Story 3.4 FTI-37]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026.md`: §7.1 WorkoutCoachCard collapsed; §7.4 workoutHistory autofill hints]
- [Source: `_bmad-output/planning-artifacts/architecture.md`: In-session coach (`coach.ts`), coaching architecture diagram]
- [Source: `_bmad-output/planning-artifacts/prd.md`: Sprint 3 goals, coaching model]
- [Source: `_bmad-output/planning-artifacts/market-research-fitcoach-2026.md`: autofill sets as simplicity wedge]
- [Source: `_bmad-output/implementation-artifacts/fti-34-cross-domain-coach-engine.md`: engine contract, `progressiveOverloadInsight` reuse rule]
- [Source: `_bmad-output/implementation-artifacts/fti-33-todays-coach-plan-home-redesign.md`: Home engine wiring, collapse patterns]
- [Source: `_bmad-output/implementation-artifacts/fti-40-vitest-harness-coach-dailyplan-unit-tests.md`: test gate, fixtures]
- [Source: `src/fitness/WorkoutCoachCard.tsx`, `screens/ScreenWorkout.tsx`, `coach.ts`, `workoutHistory.ts`, `exerciseSessionHistory.ts`]
- [Linear: FTI-37](https://linear.app/ftiness-tracker/issue/FTI-37/in-session-coach-prominence-set-autofill)

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm orchestration)

### Debug Log References

### Completion Notes List

- Added `workoutAutofill.ts` with history lookup, set-count alignment, and `buildSetsForExercise` export.
- Wired autofill on template start, add exercise, and swap paths in `ScreenWorkout.tsx`.
- `WorkoutCoachCard` expands by default on training days when session matches today's template (`shouldDefaultExpandCoachCard`).
- Pre-workout brief surfaces engine copy in idle header and `RoutinePreviewSheet`.
- Review fix: off-plan/empty sessions no longer auto-expand coach card.

### File List

- `src/fitness/workoutAutofill.ts` (NEW)
- `src/fitness/workoutAutofill.test.ts` (NEW)
- `src/fitness/WorkoutCoachCard.tsx` (UPDATED)
- `src/fitness/WorkoutCoachCard.test.ts` (NEW)
- `src/fitness/preWorkoutCoachBrief.ts` (NEW)
- `src/fitness/preWorkoutCoachBrief.test.ts` (NEW)
- `src/fitness/RoutinePreviewSheet.tsx` (UPDATED)
- `src/fitness/screens/ScreenWorkout.tsx` (UPDATED)

## Senior Developer Review (AI)

**Review date:** 2026-05-23  
**Recommendation:** APPROVED after fixes

| ID | Severity | Resolution |
| --- | --- | --- |
| F1/F2 | CRITICAL/HIGH | Fixed, `shouldDefaultExpandCoachCard` gates expansion to on-plan sessions only |
| F3 | MEDIUM | Accepted, toggle UX covered by manual QA; SSR mount tests sufficient for MVP |
| F4 | MEDIUM | Fixed, exported `buildSetsForExercise` + unit test |
| F5 | MEDIUM | Fixed, File List updated |
| F6 | LOW | Fixed, narrowed `useMemo` deps for coach brief |

### Review Follow-ups (AI)

- [x] Gate coach expansion with today's template match (AC #1 off-plan branch)
- [x] Export and test `buildSetsForExercise`
- [x] Narrow `preWorkoutCoach` memo dependencies

## Change Log

- 2026-05-23: Story file created (ready-for-dev), in-session coach prominence + set autofill
- 2026-05-23: Implementation complete, autofill module, coach card expand, pre-workout brief, review fixes (57 tests green)
