# Sprint 7 — Nutrition OS v2 (Chunk 1)

**Planned:** 2026-05-23  
**Last updated:** 2026-06-12  
**Epic:** `epic-fti-sprint-7`  
**Goal:** Replace scattered fuel logging (Nutrition tab today list + Home quick-log sheet) with a Cal AI–style Nutrition tab (rings + hydration only) and a full-screen Log Food overlay. Manual add and recently-logged re-log work without external APIs; Home becomes read-only for fuel progress.

**Epic spec:** [`epics.md`](../planning-artifacts/epics.md) Epic 7  
**Master checklist:** [`nutrition-os-v2-checklist.md`](nutrition-os-v2-checklist.md) (Chunk 1 = phases 0.3, 1, 2, 8, 10 partial)  
**Tracking:** [`sprint-status.yaml`](sprint-status.yaml)  
**Retro:** [`epic-fti-sprint-7-retro-2026-05-23.md`](epic-fti-sprint-7-retro-2026-05-23.md)

---

## Sprint goal (one sentence)

Users log fuel from one place — Nutrition tab → Log Food overlay — while Home shows read-only progress and coach "log fuel" tasks route to the same path.

---

## BMad / Linear alignment

| Field | Value |
|-------|--------|
| Epic key | `epic-fti-sprint-7` |
| Branch (shipped) | `epic-fti-sprint-7/nutrition-os-v2-chunk-1` → PR [#29](https://github.com/JimmyMc1213/fitnesstracker/pull/29) merged |
| BMad order | **FTI-57 → FTI-58 → FTI-59** (one story per PR target) |
| Linear order | **FTI-51 → FTI-52 → FTI-53** |
| Story files | `fti-57-*.md` (exists); FTI-58/59 traceability in epics + Linear |
| Gate (every story) | `npm run build` + `npm test` |
| Gate (epic close) | `npm run test:e2e` (3 smokes; nutrition-log-food replaces fuel-quick-log) |

**Kickoff:** `create story and dev FTI-57` → then FTI-58 → FTI-59

---

## Starting point (Sprint 6 complete)

| Item | Status | Notes |
|------|--------|-------|
| Sprint 6 epic | **Done** | ScreenWorkout phase 1, rule-based coach notes, workout E2E |
| Nutrition tab (pre-S7) | **Legacy** | Today/Saved tabs, quick-add chips, today list on main tab |
| Home fuel logging | **Live** | `HomeFuelQuickLogSheet` + `+ Log` on `HomeFuelStrip` |
| Coach fuel routing | **Home sheet** | `hit_protein` / post-workout tasks open Home quick-log |
| `NutritionLoggedItem` | **Minimal** | No `loggedAtMs`, `servingLabel`, `source`, `externalId` |
| Playwright fuel E2E | **Home path** | `e2e/fuel-quick-log.spec.ts` (broken after S7 strip) |
| USDA / OFF search | **Not started** | Sprint 8 scope |
| ScreenWorkout phase 2 | **Deferred** | Nutrition OS priority over workout extraction |

---

## Execute in this order

```
FTI-57 → FTI-58 → FTI-59 → epic-fti-sprint-7-retrospective
```

| # | Story | Story file | Scope | PR target | Status |
|---|-------|------------|-------|-----------|--------|
| 1 | **FTI-57** | `fti-57-nutrition-tab-log-food-shell-data-model.md` | Data model, strip Nutrition tab, Log Food shell | 1 PR | **done** |
| 2 | **FTI-58** | *(epics.md only)* | Remove Home logging; coach → Nutrition + Log Food | 1 PR | **done** |
| 3 | **FTI-59** | *(epics.md only)* | E2E partial + fuel-quick-log refresh | 1 PR | **done** |
| 4 | Retro | `epic-fti-sprint-7-retrospective` | Process + Sprint 8 handoff | — | **done** |

**Shipped:** Single epic PR #29 (FTI-57–59 bundled). Post-merge polish: Log Food page-transition animation; tab label **Favorite foods** (was Saved foods).

---

## FTI-57 — Nutrition tab strip + Log Food shell + data model

**Story file:** `fti-57-nutrition-tab-log-food-shell-data-model.md`  
**Linear:** FTI-51  
**Checklist phases:** 0.3, 1, 2

**Deliverables:**

- Extend `NutritionLoggedItem`: optional `servingLabel`, `source`, `externalId`, `loggedAtMs`; legacy backfill in `normalizeNutritionItemsByDay`
- Persist + cloud merge include new fields (`mergePersistedFitnessSlices.ts`)
- Strip `ScreenNutrition.tsx`: keep rings, P/C/F bars, pace hint, `WaterTrackerCard`; remove Today/Saved tabs, quick-add chips, today list, add-custom form, whole-day manual totals
- FAB (`+`) below hydration opens full-screen `LogFoodScreen` overlay
- Log Food shell: Back, title "Log Food", tabs All · My foods · My meals · Favorite foods (empty OK); search placeholder UI-only; Recently logged + Manual Add
- `getRecentlyLoggedFoods()` dedupe by name, sort by `loggedAtMs`; one-tap re-log via `+`
- Manual add form → log today → close overlay → rings update; streak/coach pace pipeline unchanged

**Key files:** `apps/pwa/src/fitness/ScreenNutrition.tsx`, `LogFoodScreen.tsx`, `nutritionLog.ts`, `types.ts`

**Story gate:** `npm run build` + `npm test` (workout E2E still pass; Home fuel E2E may fail until FTI-59)

---

## FTI-58 — Remove Home logging + coach routing to Log Food

**Linear:** FTI-52  
**Checklist phase:** 8  
**Depends on:** FTI-57

**Deliverables:**

- Remove `HomeFuelQuickLogSheet` usage from `ScreenHome`; remove `+ Log` from `HomeFuelStrip`
- `HomeFuelStrip` read-only protein/kcal progress only
- Deprecate/remove `HomeFuelQuickLogSheet.tsx` if unused
- Update `coachTaskActions.ts`: `hit_protein` and post-workout "Log fuel" → Nutrition tab + open Log Food (`openLogFood: true` nav state)
- Colocated unit tests for coach task routing (`coachTaskActions.test.ts`)

**Key files:** `ScreenHome.tsx`, `HomeFuelStrip.tsx`, `coachTaskActions.ts`, `FitnessApp.tsx`

**Story gate:** `npm run build` + `npm test`

---

## FTI-59 — Nutrition OS v2 E2E partial + fuel-quick-log refresh

**Linear:** FTI-53  
**Checklist phase:** 10 (partial)  
**Depends on:** FTI-58

**Deliverables:**

- E2E: Nutrition tab shows rings + hydration only (no legacy today/saved UI)
- E2E: FAB opens Log Food overlay
- E2E: Manual add → close → macro totals update visible
- E2E: Coach fuel task navigates to Nutrition + opens Log Food
- Replace `e2e/fuel-quick-log.spec.ts` with `e2e/nutrition-log-food.spec.ts`
- Vitest for `getRecentlyLoggedFoods()` if not covered in FTI-57

**Story gate:** `npm run build` + `npm test` + `npm run test:e2e`

---

## Sprint 7 scope locks

### IN SCOPE
- Nutrition tab strip (rings + hydration + FAB only)
- Full-screen Log Food overlay (manual add + recently logged)
- Data model extensions + persist/sync for new fields
- Home fuel strip read-only after FTI-58
- Coach fuel tasks route to Nutrition + Log Food
- E2E refresh for new logging path
- Search bar UI shell (placeholder only — no API calls)
- Primary CTA = lime green (`--pos` / `#4ade80`)

### OUT OF SCOPE
- USDA / Open Food Facts search (Sprint 8)
- My foods / Favorite foods tab wiring (Sprint 8)
- My meals meal prep (Sprint 9)
- Barcode scan, voice log, AI natural-language parse (future backlog)
- Cal AI visual polish pass (Sprint 9)
- ScreenWorkout phase 2 (Sprint 10)
- FTI-55 LLM coach notes (cancelled Sprint 6)
- Native App Store wrapper
- New Home cards beyond existing fuel strip (read-only)
- CI pipeline E2E gate (deferred to Sprint 10 / FTI-68)

---

## Definition of done (epic)

1. Nutrition tab shows macro rings, hydration, and FAB only — no inline logging UI.
2. Log Food overlay supports manual add and recently-logged re-log; empty tabs OK with placeholder copy.
3. Home fuel strip is read-only; no Home quick-log sheet.
4. Coach "log fuel" / protein tasks open Nutrition + Log Food.
5. `NutritionLoggedItem` extended fields persist and sync; legacy logs load without migration breakage.
6. `npm run build` + `npm test` + `npm run test:e2e` pass at merge.

**Epic status:** **done** (2026-05-23, PR #29 merged)

---

## Dev workflow (per story)

1. `create story and dev FTI-XX` (or dev from existing story file)
2. One focused PR per story (target — epic shipped as single PR #29)
3. `npm run build` + `npm test` before merge; `npm run test:e2e` on FTI-59
4. Update `sprint-status.yaml` story → `done`
5. Update `nutrition-os-v2-checklist.md` for completed phases
6. Next story in order

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Home E2E breaks when quick-log removed | FTI-59 replaces fuel-quick-log spec with nutrition-log-food |
| Empty Log Food tabs feel broken | Expected in S7; Sprint 8 wires My foods / search |
| Search placeholder sets false expectations | Sprint 8 ships USDA/OFF; interim copy acceptable |
| Single epic PR hard to review/bisect | Retro action: restore one-story-per-PR in Sprint 8+ |
| Legacy nutrition rows missing `loggedAtMs` | `stableLegacyNutritionLoggedAtMs` backfill in normalize |

---

## Handoff to Sprint 8 (Epic 8)

Sprint 8 (Chunk 2) picks up:
- USDA Edge Function + debounced All-tab search (FTI-60)
- Open Food Facts merge + branded results (FTI-61)
- My foods + Favorite foods tabs + search E2E (FTI-62)

**Next epic plan:** Sprint 8 scope locks already in `sprint-status.yaml` (FTI-60 → 61 → 62).

---

## Next action

Epic 7 is **complete**. To continue the Nutrition OS roadmap:

Say: **`sprint plan epic 8`** or **`create story and dev FTI-60`**
