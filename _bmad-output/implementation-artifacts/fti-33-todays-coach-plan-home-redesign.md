# Story 3.3: Today's Coach Plan home redesign (FTI-33)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user,
I want home to show what to do now with a coach headline and prioritized tasks,
so the app feels like an OS coach, not a macro dashboard.

## Acceptance Criteria

1. **Coach Plan primary (today view):** Given the user is on Home viewing **today** (`viewDateKey === localDateKey(now)`), when `ScreenHome` renders, then it calls `buildCoachContext(state, dateKey, now)` + `getHomeCoachPlan(ctx)` from `coachEngine.ts` and displays:
   - `ScreenHeader.title` = `homeGreetingTitle(displayName, now)` (unchanged FTI-29 behavior)
   - `ScreenHeader.subtitle` = `plan.headline` from engine (coach voice, **not** `homePlanSubline`)
   - A **Today's Plan** card listing `plan.tasks` (1-3 items max) with labels, optional rationale, completion strike-through when `task.completed === true`, and actionable CTAs

2. **Training-day primary CTA:** Given a training day with incomplete workout, when Today's Plan renders, then the highest-priority incomplete `start_workout` task shows a primary CTA (`task.ctaLabel ?? "Start session"`) that calls `navigate("workout")`, and the task label includes session time estimate when template has exercises (engine already uses `estimatedSessionLabel`: display as-is).

3. **Task CTA routing:** Given any incomplete coach task with a CTA, when the user taps it, then navigation follows:
   - `start_workout` → `navigate("workout")`
   - `hit_protein` / `post_workout_review` (fuel) → `navigate("nutrition")` (FTI-35 will replace with quick-log sheet; stub navigation is acceptable this story)
   - `log_weigh_in` → `navigate("progress")`
   - `rest_day` → optional `navigate("stretch")` when label references mobility/stretch; otherwise no primary button (informational task)

4. **Insight strip:** Given `plan.insightStrip` is defined, when Home today view renders, then a single-line cross-domain insight appears below Today's Plan (or integrated in the card footer) using engine copy verbatim.

5. **Macro ring removed from Home:** Given Home today or historical date view, when fuel status renders, then **no** `MacroRing` appears on Home, replaced by a compact **protein-first fuel strip** (`HomeFuelStrip`) showing protein `MacroBar`, optional kcal remainder text, and a `[+ Log]` button that navigates to Nutrition tab (FTI-35 wires quick-add modal later).

6. **Macro ring hero on Nutrition tab:** Given the user opens the Nutrition tab, when `ScreenNutrition` renders the Today segment summary, then an animated `MacroRing` (`size={132}`, `stroke={6}`, `animate={true}`) is the **tab hero** above macro bars, reusing FTI-31 `useAnimatedMacroProgress` via `MacroRing` in `shared.tsx`. Remove the flat calorie number headline row that currently replaces the ring.

7. **Weekly summary collapsed by default on Home:** Given Home today view, when `WeeklySummaryCard` renders, then it is **collapsed by default** (accordion/expand pattern); user can expand to see FTI-24 stats. Progress tab (`ScreenProgress.tsx`) keeps expanded behavior unchanged.

8. **Compact streak header on Home:** Given Home today view, when the streak calendar renders, then it uses a **compact** variant, single-row week dots with streak pill; reduced vertical padding vs current full `StreakWeeklyHeader` (minHeight ≤ 48px per day cell vs 64px today). Date selection behavior preserved for historical fuel/weigh-in views.

9. **Conditional weigh-in card:** Given Home today view, when `ctx.scheduledWeighInDay === false` **and** no weigh-in logged today, then the weigh-in promo card is **hidden**. When `ctx.scheduledWeighInDay === true` OR weigh-in already logged today, show the existing weigh-in card (prominent on check-in days). Use `buildCoachContext` flags, do not duplicate weigh-in schedule logic in the screen.

10. **Water Nutrition-only (locked):** Given any Home layout change, when complete, then `WaterTrackerCard` does **not** render on Home (no full card, no compact oz row). `ScreenNutrition.tsx` retains canonical `WaterTrackerCard` below macro summary. Settings hydration target unchanged.

11. **Historical date view preserved:** Given user selects a past day via streak header (`viewDateKey !== dateKeyToday`), when Home renders, then coach plan / insight strip are **omitted** (today-only surfaces); fuel strip shows totals for `activeDateKey`; weigh-in card shows historical state; "Back to today" control retained.

12. **Nightly stretch unchanged:** Given Arizona 8pm+ window (existing `isArizonaEightPmOrLater` logic), when conditions match, then nightly stretch card behavior is unchanged from current `ScreenHome.tsx`.

13. **No persistence changes:** Given MVP scope, when FTI-33 ships, then no new `AppState` fields, no persist pipeline changes, UI consumes existing engine + nutrition/streak data only.

14. **Build gate:** `npm run build` passes. `npm test` passes (no regressions to FTI-34 coachEngine tests). No new dependencies.

## Tasks / Subtasks

- [x] **Task 1: `TodaysCoachPlanCard` component** (AC: 1, 2, 3, 4)
  - [x] 1.1 Create `src/fitness/TodaysCoachPlanCard.tsx` accepting `{ plan: HomeCoachPlan; onTaskAction: (task: CoachTask) => void }`.
  - [x] 1.2 Card header eyebrow: `TODAY'S PLAN`; optional secondary line from `plan.subline` (week index from engine, not in ScreenHeader).
  - [x] 1.3 Render each task: label, rationale (muted 11px), completed tasks with strikethrough + reduced opacity.
  - [x] 1.4 Primary CTA styling for first incomplete task with `ctaLabel`; secondary text buttons for other incomplete tasks.
  - [x] 1.5 Footer: render `plan.insightStrip` when present (single line, muted coach tip styling).
  - [x] 1.6 Export types from `coachEngine.ts`: import `HomeCoachPlan`, `CoachTask` via `import type`.

- [x] **Task 2: Task action router** (AC: 2, 3)
  - [x] 2.1 In `ScreenHome.tsx`, implement `handleCoachTaskAction(task: CoachTask)` mapping `task.kind` → `navigate(tab)` per AC #3.
  - [x] 2.2 Guard: no navigation when `task.completed === true`.
  - [x] 2.3 For `start_workout`, use full-width primary button styling (white fill per existing home CTA patterns, see nightly stretch card).

- [x] **Task 3: `HomeFuelStrip` component** (AC: 5)
  - [x] 3.1 Create `src/fitness/HomeFuelStrip.tsx`: compact card with protein-first `MacroBar`, kcal remainder (`{gap} kcal left`), label `Fuel · Today`.
  - [x] 3.2 `[+ Log]` button calls `onLogClick` prop (ScreenHome passes `() => navigate("nutrition")`).
  - [x] 3.3 Accept `{ totals, targets, label? }`: reuse `effectiveNutritionTotalsForDateKey` in parent; no ring.

- [x] **Task 4: Restructure `ScreenHome.tsx`** (AC: 1, 4, 5, 9, 11, 12)
  - [x] 4.1 Import `buildCoachContext`, `getHomeCoachPlan` from `./coachEngine`.
  - [x] 4.2 **Remove** `MacroRing` import and hero card block (lines ~262-295 today).
  - [x] 4.3 Replace `headerSubtitle` logic: today → `plan.headline`; historical → omit subtitle (keep formatted date title).
  - [x] 4.4 Reorder today-view stack per architecture:
    1. `ScreenHeader`
    2. `TodaysCoachPlanCard` (today only)
    3. `StreakWeeklyHeader` compact
    4. `HomeFuelStrip`
    5. Conditional weigh-in card
    6. Nightly stretch (unchanged)
    7. `WeeklySummaryCard` collapsed
  - [x] 4.5 Move `StreakWeeklyHeader` **below** coach plan (was above weekly summary).
  - [x] 4.6 Compute coach context once per render: `useMemo(() => getHomeCoachPlan(buildCoachContext(state, dateKeyToday, clock)), [state, dateKeyToday, clock])`: only when `isViewingToday`.
  - [x] 4.7 Weigh-in visibility: `showWeighInCard = isViewingToday && (ctx.scheduledWeighInDay || dayEntry)`: build ctx for today even when viewing today (reuse coach context).
  - [x] 4.8 Verify no `WaterTrackerCard` import/wiring on Home.

- [x] **Task 5: `StreakWeeklyHeader` compact mode** (AC: 8)
  - [x] 5.1 Add optional prop `variant?: "default" | "compact"` (default `"default"` for backward compat).
  - [x] 5.2 Compact: hide "Fit Coach" brand row OR shrink to streak pill + week row only; reduce day cell `minHeight` to ~48px; tighten gaps (`marginTop: 8`).
  - [x] 5.3 `ScreenHome` passes `variant="compact"`; other screens unchanged.

- [x] **Task 6: `WeeklySummaryCard` collapse** (AC: 7)
  - [x] 6.1 Add prop `defaultCollapsed?: boolean` (default `false`).
  - [x] 6.2 When collapsed: show header row (This week + range + chevron) only; tap expands to full 3-stat grid.
  - [x] 6.3 Follow collapse pattern from `WorkoutCoachCard.tsx` / `PersonalRecordsSection.tsx` (`useState`, `aria-expanded`, chevron rotate).
  - [x] 6.4 `ScreenHome`: `<WeeklySummaryCard defaultCollapsed />`; `ScreenProgress`: unchanged (expanded).

- [x] **Task 7: Nutrition tab macro ring hero** (AC: 6, 10)
  - [x] 7.1 Update `ScreenNutrition.tsx` summary card: replace flat calorie headline block with `MacroRing` + side column layout mirroring former Home card (ring left, macro bars right).
  - [x] 7.2 Import `MacroRing` from `../shared`; pass `totals.cal`, `T.cal`, `size={132}`, `stroke={6}`.
  - [x] 7.3 Keep `WaterTrackerCard` **below** macro summary section, order: ring hero → bars → water → segment tabs.
  - [x] 7.4 Confirm animation fires on food log (totals update triggers hook, same as FTI-31).

- [x] **Task 8: Scope guard & verification** (AC: 10, 13, 14)
  - [x] 8.1 Grep Home for `WaterTrackerCard`, `waterLog`, `waterDaily`: must be zero render paths on Home.
  - [x] 8.2 Run `npm run build`: strict TS clean.
  - [x] 8.3 Run `npm test`: 42+ tests pass (no coachEngine changes expected).
  - [x] 8.4 Manual smoke: training Monday → coach headline + Start session CTA; Sunday → weigh-in task + weigh-in card visible; rest day → no start workout; ring visible on Nutrition not Home.
  - [x] 8.5 **Out of scope:** FTI-35 quick-log modal, FTI-37 weigh-in reaction UI, FTI-36 micro-adjustments, `getPostWorkoutRecap` banner (task `post_workout_review` CTA is sufficient), Playwright E2E, new persist fields.

## Dev Notes

### Why FTI-33 follows FTI-34

Sprint 3 pivot (sprint-change-proposal-2026) moves Home from tracker-first (macro ring hero) to coach-orchestrated launch pad. **FTI-34 delivered the pure engine** (`coachEngine.ts`, 42 tests). **FTI-33 is the first UI consumer**, wire engine output into Home and relocate visual anchors per locked IA decisions.

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → **FTI-33** → FTI-37 → FTI-35 → …

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `ScreenHome.tsx` IA restructure + coach plan UI | FTI-35 home quick-log sheet (stub `[+ Log]` → Nutrition tab) |
| `ScreenNutrition.tsx` macro ring hero relocation | FTI-37 in-session coach expand + autofill |
| New components: `TodaysCoachPlanCard`, `HomeFuelStrip` | `coachEngine.ts` logic changes (unless bug found, fix in isolated commit) |
| `StreakWeeklyHeader` compact variant | Full streak merge into plan card (future polish) |
| `WeeklySummaryCard` collapse on Home only | Playwright E2E |
| Conditional weigh-in card via engine flags | Water on Home (any form, **forbidden**) |
| Consume `getHomeCoachPlan` / `buildCoachContext` | Persist pipeline changes |
| | LLM / FTI-13 |

### Current `ScreenHome.tsx` state (must read before editing)

**Today stack (top → bottom):**
1. `ScreenHeader`: title=`homeGreetingTitle`, subtitle=`homePlanSubline` ← **replace subtitle with coach headline**
2. `StreakWeeklyHeader` (full) ← **move below plan, compact variant**
3. `WeeklySummaryCard` (always expanded) ← **collapse default, move lower**
4. Weigh-in card (always visible) ← **conditional on `scheduledWeighInDay`**
5. Nightly stretch (conditional) ← **keep**
6. Macro ring hero card (132px) ← **remove; replace with `HomeFuelStrip`**

**Preserved behaviors:**
- `viewDateKey` / streak date picker for historical nutrition + weigh-in
- Settings gear → `SettingsSheet`
- Arizona nightly stretch window
- No water on Home today (already true, confirm after refactor)

### Target Home stack (today view)

```
ScreenHeader (greeting title + coach headline subtitle)
TodaysCoachPlanCard (1-3 tasks + insight strip)
StreakWeeklyHeader (compact)
HomeFuelStrip (protein-first + [+ Log])
Weigh-in card (conditional)
Nightly stretch (conditional)
WeeklySummaryCard (collapsed default)
```

### `coachEngine.ts` API (FTI-34: do not duplicate logic)

```typescript
import { buildCoachContext, getHomeCoachPlan } from "./coachEngine";
import type { CoachTask, HomeCoachPlan } from "./coachEngine";

const dateKey = localDateKey(clock);
const ctx = buildCoachContext(state, dateKey, clock);
const plan = getHomeCoachPlan(ctx);
// plan.headline → ScreenHeader subtitle (today)
// plan.tasks → TodaysCoachPlanCard (max 3, sorted by priority)
// plan.insightStrip → optional footer line
// ctx.scheduledWeighInDay → weigh-in card visibility
// ctx.weighInLoggedToday → task.completed for log_weigh_in
```

**Task kinds and typical CTAs (from engine):**

| Kind | When | CTA |
| --- | --- | --- |
| `start_workout` | Training day, not completed | Start session → workout tab |
| `hit_protein` | Protein gap > 0 | Log fuel → nutrition tab |
| `log_weigh_in` | Sunday or no weigh-in this week | Log weight → progress tab |
| `rest_day` | Non-training day | Informational / stretch optional |
| `post_workout_review` | Workout done today | Log fuel or Review session |

**Headline examples (deterministic, do not hardcode in UI):**
- Training: `"Push, progression window · 5-day streak, keep it alive"`
- Post-workout: `"5-day streak, session in the books · close the fuel loop"`
- Sunday: `"Rest + weekly check-in, trend beats daily noise"`

### Nutrition tab target layout

Replace current flat kcal summary (`ScreenNutrition.tsx` lines ~254-279) with Home-style ring layout:

```
┌─────────────────────────────────────┐
│ [MacroRing 132px] │ Protein bar     │
│                   │ Carbs bar       │
│                   │ Fat bar         │
└─────────────────────────────────────┘
WaterTrackerCard (unchanged position)
SegmentTabs (Today / Saved)
...
```

Reuse exact `MacroRing` props from former Home: `value={totals.cal} target={T.cal} size={132} stroke={6}`.

### Styling conventions

- Plain CSS + inline styles, **no Tailwind**, no new component library
- Reuse `.card`, `.tap`, `.barTrack`, `.barFill` from `index.css`
- Primary CTA: white fill `#ffffff` on `#000` text (match nightly stretch "Open full routine" button)
- Coach plan card border: subtle accent e.g. `rgba(255,255,255,0.12)` or green tint for primary task
- Mobile/PWA: preserve `100dvh` scroll, collapsed weekly summary saves ~80px vertical space (retro action item)

### Component file placement

| File | Action |
| --- | --- |
| `src/fitness/TodaysCoachPlanCard.tsx` | **NEW** |
| `src/fitness/HomeFuelStrip.tsx` | **NEW** |
| `src/fitness/screens/ScreenHome.tsx` | **UPDATE**, major restructure |
| `src/fitness/screens/ScreenNutrition.tsx` | **UPDATE**, ring hero |
| `src/fitness/StreakWeeklyHeader.tsx` | **UPDATE**, compact variant |
| `src/fitness/WeeklySummaryCard.tsx` | **UPDATE**, collapse prop |
| `src/fitness/coachEngine.ts` | **DO NOT MODIFY** unless blocking bug |
| `src/fitness/shared.tsx` | **NO CHANGE**, MacroRing already wired |

### Testing standards

- **No new Vitest required** for UI components this story (FTI-40 scope: pure modules only)
- Gate: `npm run build` + `npm test` (regression on 42 existing tests)
- Manual day-type matrix:

| Fixture day | Expect headline contains | Expect primary task |
| --- | --- | --- |
| Monday (training) | template name | `start_workout` CTA |
| Monday post-workout | "session in the books" | `post_workout_review` or protein |
| Sunday | "check-in" | `log_weigh_in` + weigh-in card visible |
| Saturday | "Active recovery" | `rest_day`, no start workout |
| Wed (weigh-in logged) |, | weigh-in card hidden if not scheduled |

Use `trainingDayAppState`, `workoutCompletedAppState` from `testFixtures/appStateFixtures.ts` for dev inspection; weekday discipline per FTI-40 (verify with `new Date(y, m-1, d).getDay()`).

### Previous story learnings

**FTI-34 (coachEngine):**
- Engine is pure, all Home wiring happens in `ScreenHome.tsx` only
- `plan.subline` still returns `homePlanSubline` (week index), show inside plan card, not header
- `insightStrip` requires ≥2 domains; may be undefined, handle gracefully
- 42 tests passing, do not break engine exports

**FTI-40 (Vitest):**
- Vitest 3.2.4, node environment, explicit vitest imports
- Fixture dates: May 18 2026 = Monday, May 22 2026 = Friday, May 24 2026 = Sunday

**FTI-31 (macro ring):**
- Animation via `useAnimatedMacroProgress` inside `MacroRing`: relocate component usage only, hook unchanged
- `prefers-reduced-motion` respected automatically

**FTI-32 (water):**
- Already Nutrition-only in code, FTI-33 confirms, do not regress

### FTI-35 / FTI-37 forward compatibility

- `HomeFuelStrip` `[+ Log]` should accept `onLogClick` callback, FTI-35 replaces body with quick-add sheet without restructuring strip layout
- Weigh-in card links to Progress tab today, FTI-37 may inject `getWeighInReaction` message inline; keep card structure stable
- `TodaysCoachPlanCard` task actions via callback, FTI-35 can intercept `hit_protein` without card rewrite

### Project Structure Notes

- Screens in `src/fitness/screens/`; new home-specific cards at `src/fitness/*.tsx` top level (matches `WeeklySummaryCard`, `StreakWeeklyHeader`, `WaterTrackerCard` pattern)
- `ScreenProps`: `{ state, setState, navigate }`: TabId includes `"nutrition" | "workout" | "progress" | "stretch"`
- No React Router, tab switch via `navigate(tab)` from `FitnessApp.tsx`

### Parallel implementation groups

Dev agent may parallelize after reading `ScreenHome.tsx` and `coachEngine.ts`:

| Group | Tasks | Files | Depends on |
| --- | --- | --- | --- |
| **A, Coach plan UI** | Task 1, Task 2, Task 4 (partial) | `TodaysCoachPlanCard.tsx`, `ScreenHome.tsx` |, |
| **B, Fuel strip + Home shell** | Task 3, Task 4 (partial) | `HomeFuelStrip.tsx`, `ScreenHome.tsx` |, |
| **C, Compact streak** | Task 5 | `StreakWeeklyHeader.tsx` |, |
| **D, Weekly collapse** | Task 6 | `WeeklySummaryCard.tsx` |, |
| **E, Nutrition ring hero** | Task 7 | `ScreenNutrition.tsx` |, |
| **F, Integration + verify** | Task 4 (final order), Task 8 | `ScreenHome.tsx` | A, B, C, D |

**Groups A, B, C, D, E can run in parallel**, merge conflicts likely only in `ScreenHome.tsx` (coordinate Task 4 as integration pass).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`: Story 3.3 FTI-33]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026.md`: §6 Home IA, §6.0 Water decision, §6.1 Proposed stack]
- [Source: `_bmad-output/planning-artifacts/architecture.md`: Home IA, Nutrition tab IA, coachEngine layer]
- [Source: `_bmad-output/planning-artifacts/prd.md`: Product IA decisions, Sprint 3 goals]
- [Source: `_bmad-output/project-context.md`: Home & product IA (Epic 3)]
- [Source: `_bmad-output/implementation-artifacts/fti-34-cross-domain-coach-engine.md`: Engine contract, task kinds]
- [Source: `_bmad-output/implementation-artifacts/fti-40-vitest-harness-coach-dailyplan-unit-tests.md`: Test gate, fixtures]
- [Source: `_bmad-output/implementation-artifacts/fti-31-animated-macro-rings-on-home-dashboard.md`: MacroRing animation]
- [Source: `src/fitness/coachEngine.ts`, `screens/ScreenHome.tsx`, `screens/ScreenNutrition.tsx`]
- [Source: `src/fitness/StreakWeeklyHeader.tsx`, `WeeklySummaryCard.tsx`, `shared.tsx`, `homeGreeting.ts`]
- [Linear: FTI-33](https://linear.app/ftiness-tracker/issue/FTI-33/todays-coach-plan-home-redesign)

## Dev Agent Record

### Agent Model Used

Claude (Composer)

### Debug Log References

- Task 2 router extracted to `coachTaskActions.ts` (standalone util), ScreenHome integration deferred to Task 4.

### Completion Notes List

- **Task 1:** `TodaysCoachPlanCard`: eyebrow, subline, task list with strike-through, primary/secondary CTAs, insight strip footer.
- **Task 2:** `handleCoachTaskAction` + helpers in `coachTaskActions.ts`: kind→tab mapping per AC #3, completed guard, rest_day stretch detection.
- **Task 3:** `HomeFuelStrip`: protein-first MacroBar, kcal remainder, `[+ Log]` via `onLogClick`; no MacroRing.
- Task 5 (Group C): Added `variant?: "default" | "compact"` to `StreakWeeklyHeader`. Compact mode hides Fit Coach brand row, shows streak pill + week row only, `minHeight` 48px day cells, `marginTop` 8. Default unchanged. Task 5.3 deferred to Task 4 integration (`ScreenHome`).
- Task 6 (Group D): Added `defaultCollapsed?: boolean` to `WeeklySummaryCard`. When `true`, header-only collapsed state with tap-to-expand accordion (`useState`, `aria-expanded`, chevron rotate per WorkoutCoachCard). When `false` (default), original expanded layout unchanged. Task 6.4 (`ScreenHome` wiring) deferred to Task 4.
- Task 7 (Group E): Replaced flat calorie headline in `ScreenNutrition.tsx` with 132px `MacroRing` + macro bars side column (mirrors former Home layout); `WaterTrackerCard` retained below summary.
- **Task 4:** `ScreenHome.tsx` restructured, coach engine wired (`buildCoachContext` + `getHomeCoachPlan`), new stack order (header → plan card → compact streak → fuel strip → conditional weigh-in → nightly stretch → collapsed weekly summary). MacroRing removed from Home; coach headline as subtitle; historical view omits coach plan; weigh-in card gated by `ctx.scheduledWeighInDay || dayEntry` on today view.
- **Task 5.3 / 6.4:** `StreakWeeklyHeader variant="compact"` and `WeeklySummaryCard defaultCollapsed` wired in ScreenHome.
- **Task 8:** Grep confirms zero water render paths on Home; `npm run build` + `npm test` (42/42) pass.
- **Review fixes:** Historical `[+ Log]` hidden when not viewing today; `dateKeyToday` derived from `clock`; `animate={true}` on Nutrition MacroRing; task CTA `aria-label`s; documented rest_day copy coupling.

## Senior Developer Review (AI)

**Review date:** 2026-05-23 | **Recommendation:** CHANGES_REQUESTED → fixes applied

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| F1 | HIGH | Historical fuel strip `[+ Log]` navigated to today's Nutrition | `onLogClick` optional; hidden when `!isViewingToday` |
| F2 | MEDIUM | `dateKeyToday` from `new Date()` desynced from coach `clock` | `dateKeyToday = localDateKey(clock)` |
| F3 | MEDIUM | MacroRing missing explicit `animate={true}` | Added on ScreenNutrition |
| F4 | MEDIUM | Task CTA buttons missing aria-label | Added `${ctaLabel}: ${task.label}` |
| F5 | LOW | rest_day stretch nav coupled to copy substrings | Documented; engine navTarget deferred |

### Review Follow-ups (AI)

- [x] F1, HomeFuelStrip optional `onLogClick`; ScreenHome passes only when viewing today
- [x] F2, Single clock source for dateKeyToday and buildCoachContext
- [x] F3, Explicit `animate={true}` on Nutrition MacroRing
- [x] F4, aria-label on TodaysCoachPlanCard CTAs
- [x] F5, JSDoc on restDayReferencesStretch coupling

### File List

- `src/fitness/TodaysCoachPlanCard.tsx` (NEW)
- `src/fitness/HomeFuelStrip.tsx` (NEW)
- `src/fitness/coachTaskActions.ts` (NEW)
- `src/fitness/StreakWeeklyHeader.tsx`: compact variant prop + styling
- `src/fitness/WeeklySummaryCard.tsx`: `defaultCollapsed` prop and collapse accordion
- `src/fitness/screens/ScreenNutrition.tsx`: MacroRing hero layout on Today summary card
- `src/fitness/screens/ScreenHome.tsx`: coach-orchestrated home IA restructure

## Change Log

- 2026-05-23: Story file created (ready-for-dev), Today's Coach Plan home redesign + Nutrition ring relocation
- 2026-05-23: Tasks 1-3 complete, coach plan card, task action router util, home fuel strip (ScreenHome integration pending Task 4)
- 2026-05-23: Tasks 4-8 complete, ScreenHome integration, scope guard verified, story ready for review
- 2026-05-23: Code review, 5 findings addressed; status done
