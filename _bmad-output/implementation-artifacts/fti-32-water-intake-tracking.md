# Story 2.5: Water intake tracking (FTI-32)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to log daily water intake against a target on the home dashboard,
so hydration is part of my coached daily check-in.

## Acceptance Criteria

1. **Home visibility:** Given the user is on the Home tab, when viewing today, then a water tracker card is visible on the dashboard (below weigh-in, above Fuel macros).

2. **Quick-add:** Given the water tracker is visible for today, when the user taps **+8 oz** or **+16 oz**, then that amount is added to today's total immediately and persisted with a timestamp.

3. **Custom amount:** Given the water tracker is visible for today, when the user enters a positive amount (oz) and taps Add (or submits), then that amount is logged and the input clears.

4. **Progress visual:** Given today's logged total and configured target, when the card renders, then a progress bar (or ring) shows current vs target with numeric labels (e.g. `32 / 64 oz`); bar caps at 100% fill when over target but still shows actual total.

5. **Settings target:** Given the user opens Settings from Home, when they edit the daily water target, then the value persists and syncs (default **64 oz** ≈ 2 L); preset chips (48 / 64 / 80 / 96 oz) plus custom numeric input.

6. **Daily reset:** Given local calendar day changes at midnight (`localDateKey`), when the user opens Home on a new day, then today's total starts at 0 while prior days' logs remain in persisted history keyed by date.

7. **Timestamped logs:** Given any add action, when state updates, then a `WaterLogEntry` is appended with `loggedAtMs` (and syncs via Supabase JSONB — no SQL migration).

8. **Historical view:** Given the user selects a past date on the home week strip, when viewing that date, then the water card shows that day's total and progress read-only (no quick-add / custom input).

9. **Build gate:** `npm run build` passes with strict TypeScript.

## Tasks / Subtasks

- [x] **Task 1: Water domain + persistence pipeline** (AC: 5, 6, 7)
  - [x] 1.1 Add to `src/fitness/types.ts`:
    ```ts
    export type WaterLogEntry = {
      id: string;
      /** Fluid ounces — canonical storage unit */
      amountOz: number;
      loggedAtMs: number;
    };
    ```
  - [x] 1.2 Add `waterLogByDay: Record<string, WaterLogEntry[]>` and `waterDailyTargetOz: number` to `AppState`
  - [x] 1.3 Create `src/fitness/waterIntake.ts` with:
    - `DEFAULT_WATER_DAILY_TARGET_OZ = 64`
    - `WATER_QUICK_ADD_OZ = [8, 16] as const`
    - `WATER_TARGET_PRESETS_OZ = [48, 64, 80, 96] as const`
    - `normalizeWaterDailyTargetOz(raw): number` — clamp 16–256, default 64
    - `normalizeWaterLogEntry(raw): WaterLogEntry | null`
    - `normalizeWaterLogByDay(raw): Record<string, WaterLogEntry[]>`
    - `mergeWaterLogByDay(local, remote)` — union entries by `id` per day (same pattern as `mergeNutritionItemsByDay`)
    - `totalWaterOzForDateKey(waterLogByDay, dateKey): number` — sum `amountOz` for day
    - `appendWaterLogEntry(state, dateKey, amountOz): AppState` — new entry with `crypto.randomUUID()` + `Date.now()`
    - `formatWaterOz(oz): string` and `formatWaterLitersFromOz(oz): string` (1 fl oz ≈ 0.0295735 L) for muted secondary labels
  - [x] 1.4 Wire through `persistFitnessSlice.ts` — add both fields to `PersistedFitnessSlice` Pick + `sliceFromAppState()`
  - [x] 1.5 Default in `buildAppStateFromPersisted()` via `normalizeWaterLogByDay(p?.waterLogByDay)` and `normalizeWaterDailyTargetOz(p?.waterDailyTargetOz)`
  - [x] 1.6 Merge in `mergePersistedFitnessSlices.ts` — `waterLogByDay: mergeWaterLogByDay(...)`, target: prefer `remote.waterDailyTargetOz ?? local` after normalize (same as rest timer / notification remote-wins for scalar prefs)

- [x] **Task 2: WaterTrackerCard component** (AC: 1, 2, 3, 4, 8)
  - [x] 2.1 Create `src/fitness/WaterTrackerCard.tsx` — props: `{ dateKey, targetOz, entries, readOnly, onAddOz: (oz: number) => void }`
  - [x] 2.2 Card shell: `.card`, `IconDroplet` (from `icons.tsx`), section label **Hydration** / **Hydration · Today**
  - [x] 2.3 Progress bar — reuse `MacroBar` pattern from `shared.tsx` (horizontal `.barTrack` / `.barFill`) with water tint fill `rgba(10,132,255,0.85)` and track matching existing bars; show `total / target oz` with muted `≈ X L` when target is default-scale
  - [x] 2.4 Quick-add row: two pill buttons **+8 oz** and **+16 oz** using Rest timer preset button styling from `SettingsSheet.tsx` (hidden when `readOnly`)
  - [x] 2.5 Custom amount: numeric `<input type="number" min="1" max="128" step="1">` + **Add** button; validate `amountOz > 0`; clear input on success; disable when `readOnly`

- [x] **Task 3: Home dashboard integration** (AC: 1, 2, 3, 6, 8)
  - [x] 3.1 Import `WaterTrackerCard` in `src/fitness/screens/ScreenHome.tsx`
  - [x] 3.2 Place card after weigh-in button block (~line 160) and before Sunday prep / nightly stretch / Fuel card
  - [x] 3.3 Derive `entries = state.waterLogByDay[activeDateKey] ?? []`, `total` via `totalWaterOzForDateKey`, `readOnly = !isViewingToday`
  - [x] 3.4 `onAddOz` calls `setState((s) => appendWaterLogEntry(s, dateKeyToday, oz))` — always log to **today** even if UI ever reused elsewhere; use `dateKeyToday` not `activeDateKey` for mutations

- [x] **Task 4: Settings hydration target** (AC: 5)
  - [x] 4.1 Add `<SectionLabel>Hydration</SectionLabel>` + explanatory copy in `SettingsSheet.tsx` (after Reminders, before Equipment — match settings density)
  - [x] 4.2 Preset chips from `WATER_TARGET_PRESETS_OZ` (same selected-state styling as Rest timer presets)
  - [x] 4.3 Custom target `<input type="number">` bound to `state.waterDailyTargetOz` with `normalizeWaterDailyTargetOz` on commit/blur; show muted `≈ X L` helper under input

- [x] **Task 5: Verification** (AC: all)
  - [x] 5.1 Run `npm run build` — must pass `tsc -b` and Vite build
  - [x] 5.2 Manual smoke: Home → tap +8/+16 → bar updates; custom add; Settings change target → Home reflects; switch to yesterday on week strip → read-only; confirm reload persists entries

- [x] **Review Follow-ups (AI)**
  - [x] F1/F2: Custom add validation UX — disable Add for invalid/>128 oz; inline error "Enter 1–128 oz"
  - [x] F3: `normalizeWaterDailyTargetOz` coerces numeric strings via `Number(raw)`
  - [x] F4: Home `viewDateKey` rolls forward to new today when user was viewing today at midnight
  - [x] F6: Added sprint-status.yaml to File List

## Senior Developer Review (AI)

**Reviewer:** BMAD Swarm | **Date:** 2026-05-21 | **Recommendation:** APPROVED (after fixes)

| ID | Severity | Finding | Resolution |
| --- | --- | --- | --- |
| F1 | MEDIUM | Add button enabled for >128 oz with silent failure | Fixed: `isCustomValid` disables button; validation shows error |
| F2 | MEDIUM | No feedback on invalid custom input | Fixed: inline error state cleared on input change |
| F3 | MEDIUM | Target normalize ignored numeric strings | Fixed: `Number(raw)` coercion before clamp |
| F4 | MEDIUM | Midnight rollover left water card read-only | Fixed: `prevTodayKeyRef` rolls `viewDateKey` when user was on today |
| F5 | LOW | No unit tests for water helpers | Deferred — project has no test runner |
| F6 | LOW | sprint-status.yaml missing from File List | Fixed |

**AC validation:** All 9 ACs met. Build PASS.

## Change Log

- 2026-05-21: Water intake tracking — domain helpers, persistence pipeline, Home card, Settings hydration target
- 2026-05-21: Review fixes — custom add UX, target normalize coercion, midnight viewDateKey rollover

## Dev Notes

### Scope & placement

- **In scope:** Home water tracker card, settings daily target, full persistence pipeline, timestamped per-entry logs keyed by local calendar day.
- **Out of scope:** Streak eligibility for water, habit template sync (`habit-water` in seed data remains independent), animated ring (FTI-31 owns macro ring animation — use horizontal bar here), unit preference for ml-only display, undo/delete individual water entries (v2), Supabase SQL migration.
- **Home layout order (today):** Greeting → week strip → weekly summary → weigh-in → **water tracker** → Sunday prep (if Sunday) → nightly stretch (if window) → Fuel macros.

### Prior story learnings (Sprint 2)

- **FTI-28 / FTI-31 pattern:** New `AppState` fields require all five persistence steps; small pure helper module + thin UI wiring.
- **FTI-31:** `useAnimatedMacroProgress` + `MacroRing` are calorie-specific — do not repurpose for water unless product asks; a static or CSS-width bar is sufficient and avoids visual competition with the Fuel ring.
- **FTI-29:** Home uses `activeDateKey` / `isViewingToday` for historical date browsing — water tracker must respect the same pattern.
- **FTI-28 Settings:** SectionLabel + `.card` + preset chip buttons is the established settings control pattern.

### Persistence & architecture

- **Mandatory pipeline** for `waterLogByDay` + `waterDailyTargetOz` — types → `persistFitnessSlice.ts` → `buildAppStateFromPersisted()` → `mergePersistedFitnessSlices.ts` → auto cloud sync via existing `syncSig` effect.
- **Do not** write fitness data directly to localStorage from screens.
- **Canonical unit:** fluid ounces (`amountOz`). Default target 64 oz (~1.89 L, marketed as "64 oz / 2 L" in copy).
- **Midnight reset:** No scheduler required — empty array for new `localDateKey()`; totals computed from entries for that key only.
- **Merge policy:** Log entries union by `id` per day (both devices' adds preserved). Scalar target: normalize then prefer remote (consistent with `restTimerDefaultSeconds` / notification toggles).
- **No Tailwind, no test runner** — verification is `npm run build` + manual smoke.
- **Styling:** `.card`, inline styles, muted `rgba(255,255,255,0.45)` secondary copy — match Fuel card and Settings sections.
- **Strict TS:** satisfy `noUnusedLocals` / `noUnusedParameters`.

### Data model rationale

| Field | Shape | Notes |
| --- | --- | --- |
| `waterLogByDay` | `Record<YYYY-MM-DD, WaterLogEntry[]>` | Same day-key pattern as `nutritionItemsByDay`, `workoutsCompletedByDay` |
| `WaterLogEntry` | `{ id, amountOz, loggedAtMs }` | Satisfies AC "logs saved with timestamp"; enables future undo/history |
| `waterDailyTargetOz` | `number` | Scalar preference like `restTimerDefaultSeconds`; default 64 |

### Default values

| Field | Default |
| --- | --- |
| `waterDailyTargetOz` | `64` |
| Quick-add buttons | `8`, `16` oz |
| Target presets (settings) | `48`, `64`, `80`, `96` oz |
| Valid target range | 16–256 oz (clamp in normalize) |
| Valid single add range | 1–128 oz (reject otherwise) |

### Existing code to reuse

| Area | File | Notes |
| --- | --- | --- |
| Date keys | `dailyPlan.ts` `localDateKey()` | Day boundaries for logs and "today" |
| Progress bar | `shared.tsx` `MacroBar` | Copy bar structure; different label/color |
| Home screen | `screens/ScreenHome.tsx` | `activeDateKey`, `isViewingToday`, Fuel card placement |
| Settings sections | `SettingsSheet.tsx` | Rest timer preset chips, SectionLabel pattern |
| Icons | `icons.tsx` `IconDroplet` | Water visual |
| Entry append pattern | `screens/ScreenNutrition.tsx` | How nutrition rows append to `nutritionItemsByDay` |
| Merge by id | `mergePersistedFitnessSlices.ts` `mergeNutritionItemsByDay` | Template for `mergeWaterLogByDay` |
| Preference normalize | `restTimerPreferences.ts` | Scalar clamp + default pattern |

### Linear issue (primary product input)

- **linear:** FTI-32
- **linear_url:** https://linear.app/ftiness-tracker/issue/FTI-32/water-intake-tracking
- **Title:** Water intake tracking
- **Epic:** Sprint 2 — coaching-led OS polish

### Concerns / ambiguities for dev

1. **Bar vs ring:** Epics allow either — **default to horizontal bar** (water blue) to differentiate from calorie `MacroRing`; switch to small ring only if design review requests parity.
2. **Metric-first users:** v1 displays oz with muted L equivalent; full ml-only mode deferred unless `unitPreferences` gains volume later.
3. **Over-target display:** Bar fill caps at 100%; numeric label shows actual total (e.g. `72 / 64 oz`) — mirror macro over-target center label behavior.
4. **Historical edits:** AC implies read-only for past days; do not backfill/edit prior days in v1.
5. **Jimmy seed data:** Optional — may add sample `waterLogByDay` entries for demo seed in `jimmy-seed-data.ts` if empty state feels too bare; not required for AC.
6. **Cloud sync timing:** Rely on existing auto-save — no manual `savePersistedSlice` from Home/Settings.

### Parallel implementation groups

| Group | Tasks | Can run in parallel with |
| --- | --- | --- |
| A — Domain + persistence | Task 1 (all subtasks) | — (start here) |
| B — Tracker UI component | Task 2 | After 1.1 types + 1.3 helper signatures stubbed |
| C — Home wiring | Task 3 | After Task 2 |
| D — Settings target | Task 4 | After 1.3 (parallel with B/C) |
| E — Verification | Task 5 | After all implementation |

**Suggested parallel dev split:**
- **Dev A:** Task 1 → Task 3 tail (home `setState` wiring once card exists)
- **Dev B:** Task 2 (UI component with mock props) → Task 3 integration
- **Dev C:** Task 4 (settings) — start once `normalizeWaterDailyTargetOz` + presets exist from Task 1.3

### Project Structure Notes

```
src/fitness/
  waterIntake.ts              ← NEW (types helpers, defaults, normalize, merge, append, totals)
  WaterTrackerCard.tsx        ← NEW (home card UI)
  screens/ScreenHome.tsx      ← MODIFY (render tracker)
  SettingsSheet.tsx           ← MODIFY (Hydration section)
  types.ts                    ← MODIFY (WaterLogEntry + AppState fields)
  persistFitnessSlice.ts      ← MODIFY
  buildAppState.ts            ← MODIFY
  mergePersistedFitnessSlices.ts ← MODIFY
```

### Tech stack (no new dependencies)

| Layer | Version | Notes |
| --- | --- | --- |
| React | ^18.3.1 | Existing patterns — `useState`, inline styles |
| TypeScript | ~5.6.2 | Strict; `import type` for types |
| Supabase sync | ^2.105.4 | JSONB payload — no migration |

No web research required for new libraries; follow established Fitcoach persistence and UI conventions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Persistence pipeline]
- [Source: _bmad-output/project-context.md#Persistence pipeline]
- [Source: src/fitness/types.ts]
- [Source: src/fitness/persistFitnessSlice.ts]
- [Source: src/fitness/buildAppState.ts]
- [Source: src/fitness/mergePersistedFitnessSlices.ts]
- [Source: src/fitness/screens/ScreenHome.tsx]
- [Source: src/fitness/SettingsSheet.tsx]
- [Source: src/fitness/shared.tsx#MacroBar]
- [Source: src/fitness/dailyPlan.ts#localDateKey]
- [Source: src/fitness/restTimerPreferences.ts]
- [Source: _bmad-output/implementation-artifacts/fti-28-notification-setup-screen-in-onboarding.md]
- [Source: _bmad-output/implementation-artifacts/fti-31-animated-macro-rings-on-home-dashboard.md]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-32/water-intake-tracking

## Dev Agent Record

### Agent Model Used

Composer (autonomous dev-story)

### Debug Log References

- `npm run build` — exit 0 (tsc -b + vite build)

### Completion Notes List

- Full persistence pipeline: `WaterLogEntry` type, `waterLogByDay` + `waterDailyTargetOz` on AppState, normalize/merge/append helpers in `waterIntake.ts`
- `WaterTrackerCard` on Home (below weigh-in, above Fuel) with blue progress bar, +8/+16 quick-add, custom oz input; read-only for past dates
- Settings Hydration section with 48/64/80/96 presets + custom target input; remote-wins merge for scalar target
- Bar fill caps at 100% when over target; numeric label shows actual total

### File List

- src/fitness/types.ts (modified)
- src/fitness/waterIntake.ts (new)
- src/fitness/WaterTrackerCard.tsx (new)
- src/fitness/persistFitnessSlice.ts (modified)
- src/fitness/buildAppState.ts (modified)
- src/fitness/mergePersistedFitnessSlices.ts (modified)
- src/fitness/screens/ScreenHome.tsx (modified)
- src/fitness/SettingsSheet.tsx (modified)
- _bmad-output/implementation-artifacts/fti-32-water-intake-tracking.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
