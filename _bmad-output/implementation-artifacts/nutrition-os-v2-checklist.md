# Nutrition OS v2 — Master Checklist

**Last updated:** 2026-05-23 (Sprint 8 planned)  
**Current chunk:** Sprint 8 (Chunk 2 of 3) — **planned**  
**Progress:** 38 / 47 steps complete (S7 done; S8–9 remain)

---

## How to read this

- Steps follow **phase order** (the roadmap you understand).
- **[S7] [S8] [S9]** = which sprint owns that step (for planning only — read top to bottom).
- `[ ]` = not done · `[x]` = done · `[~]` = in progress
- **This file is updated when each story/issue is completed.**

### Chunk map (sprints ↔ phases)

| Chunk | Sprint | Phases in this chunk |
|-------|--------|----------------------|
| **1** | Sprint 7 | 0 (partial), 1, 2, 8, 10 (partial) |
| **2** | Sprint 8 | 0 (rest), 3, 4, 5, 7 |
| **3** | Sprint 9 | 6, 9, 10 (rest) |

### Story map (for dev tracking)

| Story | Chunk | Covers |
|-------|-------|--------|
| FTI-57 | S7 | Phase 0.3, 1, 2 |
| FTI-58 | S7 | Phase 8 |
| FTI-59 | S7 | Phase 10 (E2E partial) |
| FTI-60 | S8 | Phase 0.2, 3 |
| FTI-61 | S8 | Phase 4 |
| FTI-62 | S8 | Phase 5, 7, 0.3 finish |
| FTI-63 | S9 | Phase 6 |
| FTI-64 | S9 | Phase 9 |
| FTI-65 | S9 | Phase 10 (full) |

---

## Phase 0 — Planning & setup

### 0.1 — Product docs
- [x] Update PRD with Nutrition OS v2 scope `[S7]`
- [x] Add Sprint 7–9 epic to `epics.md` `[S7]`
- [x] Add stories to `sprint-status.yaml` `[S7]`
- [x] Create FTI-57 story file (first dev story) `[S7]`

### 0.2 — API keys & backend proxy
- [ ] Sign up for USDA FoodData Central API key (data.gov) `[S8]`
- [ ] Create Supabase Edge Function: `food-search` (proxies USDA + OFF) `[S8]`
- [ ] Add server-side env: `USDA_FDC_API_KEY` (never in client) `[S8]`
- [ ] Define shared types: `FoodSearchResult`, `FoodServing` `[S8]`

### 0.3 — Data model extensions
- [x] Extend `NutritionLoggedItem`: `servingLabel`, `source`, `externalId`, `loggedAtMs` `[S7]`
- [ ] Add `NutritionMeal` type + `nutritionMeals` on `AppState` `[S8/S9]`
- [x] Migration: existing logs keep working; default `loggedAtMs` for old items `[S7]`
- [x] Persist slice + cloud sync include new fields (S7 fields) `[S7]` · full meal sync `[S8/S9]`

---

## Phase 1 — Nutrition main tab (rings + hydration only)

### 1.1 — Strip the nutrition tab
- [x] Keep: macro ring hero, P/C/F bars, macro pace hint `[S7]`
- [x] Keep: `WaterTrackerCard` (hydration) `[S7]`
- [x] Remove: Today / Saved segment tabs `[S7]`
- [x] Remove: quick-add protein chips `[S7]`
- [x] Remove: today's log list on main tab `[S7]`
- [x] Remove: add custom item form on main tab `[S7]`
- [x] Remove: whole-day manual totals fallback on main tab `[S7]`

### 1.2 — Add FAB (+ button)
- [x] Floating `+` button below hydration card `[S7]`
- [x] Opens full-screen Log Food overlay (not bottom sheet) `[S7]`

### 1.3 — Return flow
- [x] After food logged → close Log Food → back on Nutrition tab `[S7]`
- [x] Macro ring animates with updated totals `[S7]`
- [x] Streak / coach pace still update via existing logging pipeline `[S7]`

---

## Phase 2 — Log Food screen shell (Cal AI layout)

### 2.1 — Build `LogFoodScreen` overlay
- [x] Back arrow ← closes without logging `[S7]`
- [x] Title: "Log Food" `[S7]`
- [x] Tab bar: All · My foods · My meals · Favorite foods `[S7]`
- [x] Search bar with placeholder "Describe what you ate" (UI only in S7) `[S7]`
- [x] "Recently logged" section with food rows `[S7]`
- [x] Each row: name, calories, serving, `+` quick-add button `[S7]`
- [x] Bottom: Manual Add button (no Voice Log) `[S7]`
- [x] Empty states on tabs not yet wired (S7) `[S7]`

### 2.2 — Manual Add flow
- [x] Form: name + calories + P/C/F + optional serving label `[S7]`
- [x] Save → log to today → close Log Food → rings update `[S7]`
- [x] Auto-save to My foods library (basic — full tab in S8) `[S7/S8]`

### 2.3 — Recently logged logic
- [x] `getRecentlyLoggedFoods()` — dedupe by name, sort by `loggedAtMs` `[S7]`
- [x] Tap `+` on row → one-tap re-log → close → rings update `[S7]`
- [x] Existing user data shows in recently logged (migrate keep) `[S7]`

---

## Phase 3 — USDA food database search

### 3.1 — Search service
- [ ] Client `foodSearchService.ts` calls Supabase Edge Function `[S8]`
- [ ] Edge function hits USDA `/foods/search` `[S8]`
- [ ] Map response → id, name, brand, cal, p, c, f, defaultServing, source `[S8]`

### 3.2 — Search UX (All tab)
- [ ] Debounced search while typing (~300ms) `[S8]`
- [ ] Results list with calories + brand `[S8]`
- [ ] Tap result → serving picker (size affects macros) `[S8]`
- [ ] Confirm → log → close Log Food → rings update `[S8]`

### 3.3 — Error & empty states
- [ ] Loading spinner during search `[S8]`
- [ ] "No results" empty state `[S8]`
- [ ] Offline / API error message + retry `[S8]`

---

## Phase 4 — Open Food Facts (branded / packaged foods)

### 4.1 — Extend edge function
- [ ] Parallel search: USDA + Open Food Facts `[S8]`
- [ ] Merge + rank results; dedupe similar names `[S8]`

### 4.2 — Branded results
- [ ] Show brand in results (e.g. "Cane's Sauce · Raising Cane's") `[S8]`
- [ ] Serving from OFF per-100g or default portion `[S8]`

---

## Phase 5 — My foods tab

### 5.1 — My foods list
- [ ] Tab shows user-created manual entries + saved search foods `[S8]`
- [ ] Tap row → log again `[S8]`
- [ ] Edit / delete user foods `[S8]`

### 5.2 — Save from search
- [ ] Optional "Save to My foods" when logging from database (without logging today) `[S8]`

---

## Phase 6 — My meals (meal prep)

### 6.1 — Create meal flow
- [ ] "Create meal" from My meals tab `[S9]`
- [ ] Add items from: search results, My foods, or manual entry `[S9]`
- [ ] Set meal name; macros = sum of items `[S9]`
- [ ] Save to `nutritionMeals` `[S9]`

### 6.2 — Log meal
- [ ] One tap on saved meal → log as single item (meal name + total macros) `[S9]`
- [ ] Show in recently logged `[S9]`

### 6.3 — Edit / delete meals
- [ ] Edit ingredients / rename meal `[S9]`
- [ ] Delete meal from library `[S9]`

---

## Phase 7 — Saved foods tab

### 7.1 — Wire existing presets
- [ ] Saved foods tab uses `nutritionPresets` `[S8]`
- [ ] Tap `+` → log → close → rings update `[S8]`
- [ ] Remove from saved (does not delete log history) `[S8]`

---

## Phase 8 — Remove Home logging & unify coach flows

### 8.1 — Home tab cleanup
- [x] Remove `HomeFuelQuickLogSheet` from `ScreenHome` `[S7]`
- [x] Remove `+ Log` button from `HomeFuelStrip` `[S7]`
- [x] Keep fuel strip as read-only protein / kcal progress `[S7]`
- [x] Deprecate or remove `HomeFuelQuickLogSheet.tsx` if unused `[S7]`

### 8.2 — Coach task routing
- [x] "Log fuel" / nutrition coach tasks → Nutrition tab + open Log Food `[S7]`
- [x] Update `coachTaskActions.ts` `[S7]`

---

## Phase 9 — Polish & Cal AI fidelity

### 9.1 — Visual pass
- [ ] Match Cal AI: dark cards, rounded search, tab underline `[S9]`
- [ ] Row `+` buttons styled like reference `[S9]`
- [ ] Safe-area padding for FAB and bottom Manual Add `[S9]`

### 9.2 — UX polish
- [ ] Keyboard-friendly search on mobile `[S9]`
- [ ] Ring animation on return from Log Food `[S9]`
- [ ] Empty states per tab (helpful copy) `[S9]`

### 9.3 — Performance
- [ ] Cache recent searches in session memory `[S9]`
- [ ] Limit USDA/OFF to top ~20 results `[S9]`

---

## Phase 10 — Tests, persistence & ship

### 10.1 — Unit tests
- [ ] `foodSearchService` (mocked) `[S9]`
- [x] `getRecentlyLoggedFoods` `[S7/S9]`
- [ ] Meal macro summing `[S9]`
- [ ] Persist slice includes `nutritionMeals` `[S9]`
- [ ] Cloud sync merge for new fields `[S8/S9]`

### 10.2 — E2E tests
- [x] Nutrition tab shows rings + hydration only (no old logging UI) `[S7]`
- [x] FAB opens Log Food `[S7]`
- [x] Manual add → rings update `[S7]`
- [ ] Search → select → log → rings update `[S8]`
- [ ] Log saved meal → rings update `[S9]`
- [x] Coach task opens Log Food on Nutrition tab `[S7]`
- [x] Update/remove broken `fuel-quick-log` e2e tests `[S7]`

### 10.3 — Build gate
- [ ] `npm run build` passes `[S9]`
- [ ] `npm test` passes `[S9]`
- [ ] `npm run test:e2e` passes `[S9]`
- [ ] Sprint 9 retrospective done `[S9]`

---

## Future backlog (not in Sprints 7–9)

### F1 — Barcode scan
- [ ] Wire `ScreenScan` / barcode overlay into Log Food flow
- [ ] Open Food Facts lookup by barcode

### F2 — AI natural-language parse
- [ ] "2 eggs and toast" → Claude parse → confirm → log
- [ ] Product gate (same pattern as FTI-55)

### F3 — Paid food APIs
- [ ] Evaluate Nutritionix / Edamam when app has revenue
- [ ] Restaurant coverage upgrade

### F4 — Voice log
- [ ] Web Speech API → search bar or AI parse
- [ ] Graceful fallback on unsupported browsers

---

## Completion log

| Date | Story / issue | Steps checked off |
|------|---------------|-------------------|
| 2026-05-23 | Sprint 8 planning | Epic 8 + FTI-60–62 in epics.md, sprint-status.yaml, Linear FTI-54–56 |
| 2026-05-23 | FTI-57 / FTI-51 | Phases 0.3 (S7), 1, 2 — Log Food shell + data model |
| 2026-05-23 | FTI-58 / FTI-52 | Phase 8 — Home read-only + coach routing |
| 2026-05-23 | FTI-59 / FTI-53 | Phase 10 (partial) — E2E + unit tests for S7 |
