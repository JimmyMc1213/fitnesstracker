# Story 3.5: Home fuel quick-log + coach pace (FTI-35)

Status: done

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

## Story

As a user on the Home dashboard,
I want one-tap protein logging and coach copy that references my macro pace,
so I can close the fuel loop without leaving Home.

## Acceptance Criteria

1. **Quick-log sheet from fuel strip:** Given the user is viewing **today** on Home, when they tap `[+ Log]` on `HomeFuelStrip`, then a bottom sheet (`HomeFuelQuickLogSheet`) opens with protein-first quick-add chips (+25/+30/+40/+50g) — **not** navigation to the Nutrition tab.

2. **Quick-log from coach tasks:** Given an incomplete `hit_protein` task or `post_workout_review` with CTA `"Log fuel"`, when the user taps the task CTA, then the same quick-log sheet opens (FTI-33 stub navigation replaced).

3. **Writes existing nutrition model:** Given a quick-add or saved favorite is tapped, when the sheet commits, then a row is appended to `nutritionItemsByDay[dateKey]` and presets update via `upsertNutritionPresetList` / `touchNutritionPresetById` — same persistence path as Nutrition tab; no new `AppState` fields.

4. **Saved favorites:** Given `nutritionPresets` includes items with protein > 0, when the sheet renders, then up to 5 recency-sorted favorites appear as one-tap rows below the protein chips.

5. **Coach plan updates after log:** Given protein is logged via quick-log, when Home re-renders, then `TodaysCoachPlanCard` reflects updated totals (protein task completes or gap shrinks) via existing `getHomeCoachPlan` / `buildCoachContext` — no duplicate coach state.

6. **Macro pace in coach copy:** Given protein gap > 0, when `hit_protein` task rationale is built, then copy references time-weighted **macro pace** (`buildMacroPaceSnapshot`) — e.g. "On pace", "Xg behind pace", or "Protein floor hit — on pace for today."

7. **Full log escape hatch:** Given the sheet is open, when the user taps "Open full Nutrition log", then the sheet closes and `navigate("nutrition")` runs.

8. **Historical view guard:** Given the user is viewing a past/future date on Home, when fuel strip renders, then `[+ Log]` is hidden (unchanged FTI-33 behavior).

9. **Build gate:** `npm run build` and `npm test` pass.

## Tasks / Subtasks

- [x] **Task 1: Shared nutrition log helpers** (AC: 3)
  - [x] 1.1 Create `src/fitness/nutritionLog.ts` — `newNutritionItemId`, `PROTEIN_QUICK_ADD_PRESETS`, `appendNutritionLoggedItem`, `appendNutritionPresetToDay`, `topProteinPresetsForQuickLog`
  - [x] 1.2 Colocate `nutritionLog.test.ts`

- [x] **Task 2: Macro pace module** (AC: 6)
  - [x] 2.1 Create `src/fitness/macroPace.ts` — `buildMacroPaceSnapshot(ctx)` pure time-weighted protein pace
  - [x] 2.2 Wire into `coachEngine.ts` `hit_protein` task rationale
  - [x] 2.3 Colocate `macroPace.test.ts`; extend `coachEngine.test.ts` rationale assertion

- [x] **Task 3: Home quick-log sheet** (AC: 1, 4, 7)
  - [x] 3.1 Create `src/fitness/HomeFuelQuickLogSheet.tsx` — bottom sheet pattern (WeighInSheet), protein chips, favorites, MacroBar summary, full-log link
  - [x] 3.2 Export `canOpenHomeFuelQuickLog` guard

- [x] **Task 4: ScreenHome wiring** (AC: 1, 2, 5, 8)
  - [x] 4.1 State `fuelQuickLogOpen`; `[+ Log]` opens sheet
  - [x] 4.2 `TodaysCoachPlanCard` intercepts fuel tasks via `coachTaskOpensFuelQuickLog`
  - [x] 4.3 Sheet receives `dateKeyToday`, `setState`, `onOpenFullLog`

- [x] **Task 5: Coach task routing** (AC: 2)
  - [x] 5.1 Add `coachTaskOpensFuelQuickLog` to `coachTaskActions.ts`
  - [x] 5.2 Colocate `coachTaskActions.test.ts`

- [x] **Task 6: Verification** (AC: 9)
  - [x] 6.1 `npm test` (64 tests)
  - [x] 6.2 `npm run build`

## Dev Notes

### Why FTI-35 follows FTI-37

FTI-33 stubbed `[+ Log]` and fuel coach tasks → Nutrition tab. FTI-37 closed the in-session gap. **FTI-35 closes the Home fuel friction gap** — one tap from coach plan or fuel strip.

**Execution order:** FTI-40 ✅ → FTI-34 ✅ → FTI-33 ✅ → FTI-37 ✅ → **FTI-35** → FTI-36 → FTI-38 → FTI-39.

### Scope boundaries

| In scope | Out of scope |
| --- | --- |
| `HomeFuelQuickLogSheet` + protein chips | Custom macro form on Home (Nutrition tab) |
| Saved preset favorites (top 5) | Barcode / scan logging |
| `macroPace` coach copy on `hit_protein` | Persist pace preferences |
| `nutritionLog.ts` shared append helpers | ScreenNutrition refactor (optional follow-up) |
| Coach task → sheet routing | FTI-36 weigh-in micro-adjustments |
| | Playwright E2E |

### Forward compatibility

- `HomeFuelStrip.onLogClick` unchanged API — ScreenHome swaps handler body only
- `TodaysCoachPlanCard` unchanged — ScreenHome intercepts `onTaskAction`
- FTI-36 may extend coach reactions on weigh-in; FTI-38 notification bodies already use protein gap

### References

- [Linear: FTI-35](https://linear.app/ftiness-tracker/issue/FTI-35/home-fuel-quick-log-coach-pace)
- [Source: `_bmad-output/implementation-artifacts/fti-33-todays-coach-plan-home-redesign.md`]
- [Source: `_bmad-output/implementation-artifacts/fti-34-cross-domain-coach-engine.md`]
- [Source: `src/fitness/HomeFuelStrip.tsx`, `screens/ScreenHome.tsx`, `screens/ScreenNutrition.tsx`]

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm orchestration)

### Completion Notes List

- Added `HomeFuelQuickLogSheet` with protein quick-add chips and saved favorites.
- Shared append helpers in `nutritionLog.ts`; macro pace copy in `macroPace.ts` wired to coach engine.
- Home fuel strip and coach fuel tasks open quick-log sheet; full Nutrition tab remains available.
- 64 tests green; build passes.

### File List

- `src/fitness/nutritionLog.ts` (NEW)
- `src/fitness/nutritionLog.test.ts` (NEW)
- `src/fitness/macroPace.ts` (NEW)
- `src/fitness/macroPace.test.ts` (NEW)
- `src/fitness/HomeFuelQuickLogSheet.tsx` (NEW)
- `src/fitness/coachTaskActions.ts` (UPDATED)
- `src/fitness/coachTaskActions.test.ts` (NEW)
- `src/fitness/coachEngine.ts` (UPDATED)
- `src/fitness/coachEngine.test.ts` (UPDATED)
- `src/fitness/screens/ScreenHome.tsx` (UPDATED)

## Change Log

- 2026-05-23: Story created + implemented (BMAD Swarm next) — Home fuel quick-log + coach macro pace
