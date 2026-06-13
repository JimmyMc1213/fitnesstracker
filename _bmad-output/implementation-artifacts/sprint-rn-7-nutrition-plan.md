# Sprint RN-7 — Nutrition OS

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 9 story files created)  
**Epic:** `epic-rn-7`  
**Swarm branch:** `epic-rn-7/nutrition-os`  
**Goal:** Replace the `(tabs)/nutrition` placeholder and `(modals)/log-food` stub with PWA-parity Nutrition OS — macro dashboard, full Log Food modal (search, serving picker, my foods/meals/favorites, manual entry, barcode), today's food log with edit/delete undo, water tracker, and Maestro `rn-nutrition-log.yaml`.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M5 (Nutrition)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/nutrition`, `(modals)/log-food`  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-7 (9 stories)  
**PWA reference:** `ScreenNutrition.tsx`, `LogFoodScreen.tsx`, `TodayFoodLogCard.tsx`, `WaterTrackerCard.tsx`, `foodSearchService.ts`, `BarcodeScanner.tsx`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user opens Nutrition, sees live macro rings and today's log, opens Log Food to search or manually add items (including barcode and saved meals), edits or deletes logged items with undo, tracks water intake, and Maestro `rn-nutrition-log.yaml` passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-7` |
| Branch | `epic-rn-7/nutrition-os` |
| Start story | **RN-7-01** (`rn-7-01-nutrition-core-extract-dashboard.md`) |
| Story files | Create under `implementation-artifacts/rn-7-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (api stories) | `npm run test --workspace=@newyouai/api-client` when touching `packages/api-client` |
| Gate (epic close) | `rn-nutrition-log.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` + `npm run test:e2e:coach-nutrition` + `npm run test:e2e:onboarding` + `npm run test:e2e:workout-session` green |

**Kickoff:** `/bmad-swarm epic-rn-7` or `dev this story rn-7-01-nutrition-core-extract-dashboard.md`

**Swarm order (strict):**

```
RN-7-01 → RN-7-02 → RN-7-03 → RN-7-04 → RN-7-05 → RN-7-06 → RN-7-07
  → RN-7-08 → RN-7-09 → epic-rn-7-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-6 | **Done** | Foundation through workout domain complete |
| `(tabs)/nutrition` | **Placeholder** | `TabPlaceholderScreen`; `testID="tab-nutrition"`; `openLogFood` param wired |
| `(modals)/log-food` | **Stub** | Close button + "ships in RN-7" copy; `testID="modal-log-food"` |
| Coach → nutrition routing | **Done (RN-5)** | `openNutritionLogFood`, `rn-coach-nutrition.yaml` opens modal shell |
| Home fuel carousel | **Done (RN-5)** | Macro rings on Home; Nutrition tab gets full dashboard (N-01) |
| `FitnessProvider` / nutrition slice | **Done (RN-5)** | `nutritionItemsByDay`, `nutritionTargets`, presets, user foods, meals in persist |
| `packages/core/nutrition` | **Partial** | `nutritionTotals.ts` only; `nutritionLog`, `foodMeasurements`, `nutritionMeals`, `waterIntake` still PWA-only |
| `packages/api-client` | **Partial** | `searchFood` extracted (RN-1-07); barcode lookup + mobile search adapter still PWA-only |
| PWA `LogFoodScreen.tsx` | **2,400+ lines** | Vertical slice stories avoid big-bang port |
| Barcode | **PWA `getUserMedia` + zxing** | RN: `expo-camera` + barcode module (RN-7-07) |
| Maestro nutrition flow | **Missing** | Port `nutrition-log-food.spec.ts` → `rn-nutrition-log.yaml` |
| E2E mock search | **PWA `VITE_E2E_MOCK_FOOD_SEARCH`** | Mirror as `EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH` for Maestro |

---

## Execute in this order

| # | Story | Story file | PWA section | PR target | Status |
|---|-------|------------|-------------|-----------|--------|
| 1 | **RN-7-01** | `rn-7-01-nutrition-core-extract-dashboard.md` | Core extract + N-01 dashboard | 1 PR | ready-for-dev |
| 2 | **RN-7-02** | `rn-7-02-log-food-modal-shell-tabs.md` | N-02 modal + tabs | 1 PR | ready-for-dev |
| 3 | **RN-7-03** | `rn-7-03-food-search-all-tab-recent.md` | N-03 search + recent | 1 PR | ready-for-dev |
| 4 | **RN-7-04** | `rn-7-04-serving-picker-log-toast.md` | N-07 serving + log | 1 PR | ready-for-dev |
| 5 | **RN-7-05** | `rn-7-05-my-foods-favorites-tabs.md` | N-04, N-06 | 1 PR | ready-for-dev |
| 6 | **RN-7-06** | `rn-7-06-my-meals-meal-editor.md` | N-05, N-09 | 1 PR | ready-for-dev |
| 7 | **RN-7-07** | `rn-7-07-manual-entry-barcode-scanner.md` | N-08, N-10 | 1 PR | ready-for-dev |
| 8 | **RN-7-08** | `rn-7-08-today-food-log-edit-delete.md` | TodayFoodLogCard | 1 PR | ready-for-dev |
| 9 | **RN-7-09** | `rn-7-09-water-tracker-maestro-e2e.md` | N-11 + Maestro | 1 PR | ready-for-dev |
| 10 | Retro | `epic-rn-7-retrospective` | — | — | optional |

---

## RN-7-01 — Nutrition core extract + tab dashboard

**Story file:** `rn-7-01-nutrition-core-extract-dashboard.md`

**Deliverables:**

- Extract to `packages/core/src/nutrition/` (PWA re-exports unchanged):
  - `nutritionLog.ts` + colocated Vitest (from `apps/pwa/src/fitness/nutritionLog.ts`)
  - `foodMeasurements.ts` + test
  - `nutritionMeals.ts` + test
  - `waterIntake.ts` + test
  - `servingDefaults.ts`, `macroLimits.ts` helpers used by log flows
  - Extend `nutritionTotals.ts` if PWA has helpers not yet ported
- Replace `(tabs)/nutrition.tsx` placeholder with `NutritionScreen` dashboard:
  - Date header, macro ring (reuse Home carousel ring component or shared `MacroRing`)
  - Macro bars (protein/carbs/fat), "cal left", protein priority copy
  - FAB / `open-log-food` button preserved
  - Wire `useFitnessState` + `effectiveNutritionTotalsForDateKey`
- Keep `openLogFood` deep link param behavior (coach + tab-nav Maestro)

**PWA ref:** `ScreenNutrition.tsx` macro card block (lines 54–106), `nutritionTotals.ts`  
**Core ref:** Port existing PWA Vitest before UI beyond dashboard shell

**Story gate:** typecheck + `npm run test --workspace=@newyouai/core` green

---

## RN-7-02 — Log Food modal shell + tab navigation

**Story file:** `rn-7-02-log-food-modal-shell-tabs.md`

**Deliverables:**

- Replace `(modals)/log-food.tsx` stub with `LogFoodScreen` shell
- Tab bar: **All**, **My Foods**, **My Meals**, **Favorites** (PWA label "Saved" → match PWA copy)
- Header: close, title "Log Food", entry points for Manual Add and Scan (stubs until RN-7-07)
- Tab content slots (empty lists OK with section headers)
- Keyboard-safe scroll container; preserve `testID="modal-log-food"` and `testID="modal-close"`
- Optional: hide tab bar while modal open (verify `rn-tab-navigation.yaml` still passes)

**PWA ref:** `LogFoodScreen.tsx` tab state + header chrome  
**Deps:** RN-7-01 core exports for future tab wiring

**Story gate:** typecheck; re-run `npm run test:e2e:coach-nutrition` (modal still opens)

---

## RN-7-03 — Food search (All tab) + recently logged

**Story file:** `rn-7-03-food-search-all-tab-recent.md`

**Deliverables:**

- Mobile `foodSearchService` adapter in `apps/mobile/lib/` wrapping `@newyouai/api-client` `searchFood`
- Debounced search input (`MIN_SEARCH_LEN=2`, `SEARCH_DEBOUNCE_MS=300`)
- Curated foods list (`curatedFoods.ts` → core or mobile lib)
- Recently logged section via `getRecentlyLoggedFoods`
- Search skeleton, empty/error states (`FoodSearchError` auth/rate-limit copy)
- `EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH=true` mock for Maestro (mirror PWA chicken result)
- Tapping result opens serving picker slot (RN-7-04 wires confirm)

**PWA ref:** `LogFoodScreen.tsx` All tab, `foodSearchService.ts`, `FoodSearchSkeletonList.tsx`  
**Api ref:** `packages/api-client/src/invoke/foodSearch.ts` (already extracted)

**Story gate:** typecheck + api-client tests if extended

---

## RN-7-04 — Serving picker + log item flow + food added toast

**Story file:** `rn-7-04-serving-picker-log-toast.md`

**Deliverables:**

- Serving picker sheet/modal: measurement list, quantity input, macro preview
- `buildNutritionLoggedItem`, `appendNutritionLoggedItem`, `canAppendNutritionItem`
- On log: close modal, patch fitness slice, update nutrition tab totals live
- `FoodAddedToast` with undo (`removeNutritionLoggedItem`)
- Re-log from recent (one-tap, no picker when safe)

**PWA ref:** `LogFoodScreen.tsx` picker context, `FoodAddedToast.tsx`, `foodMeasurements.ts`  
**Test:** Port `nutritionLog.test.ts` cases to core in RN-7-01; add RN integration test if needed

**Story gate:** typecheck + core tests green

---

## RN-7-05 — My Foods + Favorites tabs

**Story file:** `rn-7-05-my-foods-favorites-tabs.md`

**Deliverables:**

- **My Foods** tab: list `nutritionUserFoods`, tap to log, swipe/long-press delete with confirm
- **Favorites** tab: starred presets + user foods via `isNutritionFavorite` / `toggleNutritionFavoriteInState`
- Save logged item to My Foods (`nutritionUserFoodFromLoggedItem`)
- Edit user food macros (inline or sheet — match PWA)

**PWA ref:** `LogFoodScreen.tsx` myFoods + saved tabs, `DeleteConfirmSheet.tsx`

**Story gate:** typecheck

---

## RN-7-06 — My Meals + meal editor

**Story file:** `rn-7-06-my-meals-meal-editor.md`

**Deliverables:**

- **My Meals** tab: list `nutritionMeals`, tap to log via `buildLoggedItemFromMeal`
- Meal editor flow: name, ingredients from search/user foods, `sumMealMacros`
- Create/update/delete meal with confirm sheet
- Meal draft state while editing (picker context `mealIngredient`)

**PWA ref:** `LogFoodScreen.tsx` myMeals tab + meal editor subflow, `nutritionMeals.ts`  
**E2E seed:** port `mealLogPersistSeed` for Maestro (RN-7-09)

**Story gate:** typecheck + core meal tests green

---

## RN-7-07 — Manual entry + barcode scanner

**Story file:** `rn-7-07-manual-entry-barcode-scanner.md`

**Deliverables:**

- **Manual Add** form: food name, calories, P/C/F grams, serving label; `clampMacroInputString`
- Log manual item to today's log; optional save to My Foods
- **Barcode scanner:** `expo-camera` view in modal/stack; permission prompt copy
- Extend `packages/api-client` with `lookupFoodByBarcode` (extract from PWA `foodSearchService.ts`)
- OFF/USDA barcode path → serving picker (RN-7-04)
- Community food submit from scan (`communityFoods.ts` → core if not already)
- Simulator fallback: manual barcode entry field for dev/Maestro when camera unavailable

**PWA ref:** `LogFoodScreen.tsx` manual entry, `BarcodeScanner.tsx`, `ScreenScan.tsx`  
**Native:** Add `expo-camera` to mobile if not present; document in `docs/eas-ios.md` permissions

**Story gate:** typecheck + api-client tests for barcode invoke

---

## RN-7-08 — Today food log + edit/delete undo

**Story file:** `rn-7-08-today-food-log-edit-delete.md`

**Deliverables:**

- `TodayFoodLogCard` on nutrition tab below water slot (water content RN-7-09)
- List today's `nutritionItemsByDay[todayKey]` with macros per row
- Tap row → edit (reopen log flow with `loggedItemToPickerEdit`)
- Swipe-to-delete (RN gesture handler) with undo toast — port PWA swipe behavior
- Empty state when no items logged

**PWA ref:** `TodayFoodLogCard.tsx`, `todayFoodLogHandlers` pattern  
**Maestro:** manual add + delete case from `nutrition-log-food.spec.ts` test 1

**Story gate:** typecheck

---

## RN-7-09 — Water tracker + Maestro E2E + epic polish

**Story file:** `rn-7-09-water-tracker-maestro-e2e.md`

**Deliverables:**

- `WaterTrackerCard` RN port — target oz, quick-add buttons, entry list, unit from `unitPreferences.volumeUnit`
- Wire `appendWaterLogEntry` / `removeWaterLogEntry` via fitness slice
- `.maestro/rn-nutrition-log.yaml` — port PWA `nutrition-log-food.spec.ts`:
  - Dashboard rings + manual add updates totals
  - Search → serving → log updates rings (mock search env)
  - My meals log from seed
  - Recently logged re-log
- `npm run test:e2e:nutrition-log` script in `apps/mobile`
- E2E seeds: `fuelQuickLogPersistSeed`, `mealLogPersistSeed` in `fitnessPersistSeed.ts`
- Remove placeholder copy from nutrition tab + log-food modal
- Epic regression sweep: auth-all + tab-nav + coach-nutrition + onboarding + workout-session

**PWA ref:** `WaterTrackerCard.tsx`, `waterIntake.ts`, `apps/pwa/e2e/nutrition-log-food.spec.ts`  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M5 row

**Story gate:** Maestro green + regression suite green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Nutrition tab FR-M5 (N-01 … N-11) | Cloud sync / hydration restore (RN-OFFLINE) |
| Extract nutrition pure logic to `packages/core` | Nutrition settings panels — fuel targets, hydration prefs (RN-10) |
| Log Food modal all four tabs + manual + barcode | Home water tracker card (was PWA home; RN-5 fuel carousel only) |
| Today food log edit/delete with undo | Progress avg calories chart (RN-8) |
| Water tracker on Nutrition tab | Community food moderation admin UI |
| Maestro `rn-nutrition-log.yaml` | Playwright (PWA maintenance only) |
| E2E mock food search for CI/simulator | Live USDA/OFF in Maestro (use mock flag) |
| Coach `openLogFood` deep link (existing) | LLM meal suggestions (not in PWA) |
| Barcode via `expo-camera` | Scan tab as separate route (PWA `ScreenScan` — fold into Log Food) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, signed-in test user, mock food search env for search case

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — mock search recommended for CI/local Maestro
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH=true EXPO_PUBLIC_E2E_FITNESS_SEED=coach-nutrition npx expo start --dev-client --port 8082

# Terminal 2 — regression + epic gate
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log    # add in RN-7-09
```

**Nutrition testing:** Seed must include `nutritionTargets`, empty or seeded `nutritionItemsByDay`, optional `nutritionMeals` for meal case. Reuse `fuelQuickLogPersistSeed` / `mealLogPersistSeed` patterns from PWA `e2e/helpers/seed.ts`.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

When touching `packages/api-client`:

```bash
npm run test --workspace=@newyouai/api-client
```

### Epic close (RN-7-09)

- [ ] `rn-nutrition-log.yaml` green (manual add, search, meal, recent re-log cases)
- [ ] `npm run test:e2e:auth-all` green
- [ ] `npm run test:e2e:tab-nav` green
- [ ] `npm run test:e2e:coach-nutrition` green (coach fuel → nutrition + log modal)
- [ ] `npm run test:e2e:onboarding` green
- [ ] `npm run test:e2e:workout-session` green
- [ ] Manual: nutrition dashboard shows live totals after log
- [ ] Manual: barcode scan on device OR manual barcode fallback on simulator
- [ ] Manual: water quick-add updates tracker
- [ ] `epic-rn-7` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-7/nutrition-os`
2. Run `/bmad-create-story` for RN-7-01, then swarm or `dev this story rn-7-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-7-09: run nutrition-log + full Maestro regression + mark epic `done`

---

## Definition of done (epic)

1. Nutrition tab shows macro ring, bars, cal left, and protein priority (not placeholder).
2. Log Food modal supports All / My Foods / My Meals / Favorites tabs with PWA-parity flows.
3. User can search food, pick serving, and see totals update on nutrition tab.
4. User can manually add food, log saved meals, and re-log recent items.
5. Barcode scan resolves to serving picker (device) or manual fallback (simulator).
6. Today's food log supports edit and swipe-delete with undo toast.
7. Water tracker adds/removes entries against daily target.
8. Maestro nutrition-log + auth-all + tab-nav + coach-nutrition + onboarding + workout-session green.

---

## Unblocks

| Downstream | Needs from RN-7 |
|------------|-----------------|
| RN-8 Progress | `nutritionItemsByDay` for avg calories; logged food history shape |
| RN-10 Settings | Fuel targets + hydration panels read same slice keys |
| RN-PARITY | FR-M5 trace row + `rn-nutrition-log.yaml` evidence |
| RN-5 (follow-on) | Home `[+ Log]` can deep-link into populated log-food flow |
| RN-6 (follow-on) | Post-workout fuel task lands on working log-food UI |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Nutrition logic not in core yet | RN-7-01 blocks all log UI — strict swarm order |
| `LogFoodScreen` monolith (2,400 lines) | Vertical slice RN-7-02→09; shared picker/toast in RN-7-04 |
| Barcode on simulator | Manual barcode text field + Maestro uses mock/search path |
| Live food-search in E2E | `EXPO_PUBLIC_E2E_MOCK_FOOD_SEARCH` mirrors PWA mock |
| Camera permissions / dev client | Document in RN-7-07; EAS preview profile for device QA |
| api-client missing barcode | Extend in RN-7-07 before scanner UI |
| Modal + tab bar interaction | Re-run `rn-tab-navigation.yaml` after RN-7-02 |
| Home vs Nutrition duplicate rings | Reuse shared macro components from RN-5; don't fork animation logic |
| RN-5 still in review | RN-7 can branch from main; rebase before epic close |

---

## Next action

**`/bmad-swarm epic-rn-7`** — starts at **RN-7-01** on branch `epic-rn-7/nutrition-os`.

Or: `dev this story rn-7-01-nutrition-core-extract-dashboard.md`
