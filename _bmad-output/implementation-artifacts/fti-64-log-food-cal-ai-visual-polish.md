# Story 9.2: Log Food Cal AI visual polish (FTI-64)

Status: done

## Story

As a user logging food,
I want the Log Food overlay to match Cal AI's dark-card layout, tab styling, and mobile-friendly interactions,
so fuel logging feels polished and native on phone.

## Acceptance Criteria

1. **Visual pass:** Dark card rows; rounded search input; active tab underline indicator; row `+` buttons match reference styling
2. **Safe area:** FAB on Nutrition tab and bottom Manual Add respect `env(safe-area-inset-bottom)` on notched devices
3. **UX polish:** Keyboard-friendly search (input focus, scroll behavior on mobile); macro ring animation on return from Log Food (reuse existing ring animation patterns)
4. **Empty states:** Per-tab helpful copy (All, My foods, My meals, Favorite foods) — no generic placeholders
5. **Performance:** Session-memory cache for recent search queries; Edge Function / client limits USDA+OFF merged results to top ~20
6. **Quality:** No regression to existing Log Food flows; `npm run build` + `npm test` pass

## Tasks / Subtasks

- [x] **Task 1: Visual pass** (AC: 1)
  - [x] 1.1 Tab underline indicator (replace pill segment control)
  - [x] 1.2 Dark card wrapper for food rows (search, recent, library tabs)
  - [x] 1.3 Rounded search input with dark fill
  - [x] 1.4 Lime `+` add buttons consistent with design system

- [x] **Task 2: Safe area + UX polish** (AC: 2, 3)
  - [x] 2.1 Verify FAB + bottom bar safe-area padding
  - [x] 2.2 Search input ref: autoFocus on All tab, enterKeyHint, scroll on focus
  - [x] 2.3 Re-trigger MacroRing animation when Log Food overlay closes

- [x] **Task 3: Performance** (AC: 5)
  - [x] 3.1 Session-memory LRU cache in `foodSearchService.ts`
  - [x] 3.2 Client-side slice to top 20 results
  - [x] 3.3 Vitest for cache hit + limit

- [x] **Task 4: Verification** (AC: 4, 6)
  - [x] 4.1 Confirm per-tab empty states (no generic placeholders)
  - [x] 4.2 `npm run build` + `npm test`

## Dev Notes

- **Checklist:** `nutrition-os-v2-checklist.md` phase 9
- **depends_on:** FTI-63 (My meals tab wired)
- **blocks:** FTI-65
- Primary CTA = lime green (`--pos` / `#4ade80`)

## References

- story_key: fti-64-log-food-cal-ai-visual-polish
- linear: FTI-58
- epic: epic-fti-sprint-9

## Dev Agent Record

### Agent Model Used

Composer (BMAD Swarm)

### Completion Notes List

- Replaced pill tabs with underline indicator; wrapped food lists in dark cards.
- Lime `+` buttons, rounded search input, FAB uses `--pos` green.
- Session LRU cache + client 20-result cap in `foodSearchService`.
- Macro ring re-animates when Log Food closes; search auto-focuses on All tab.
- Today food log edit routes through Log Food overlay (shared serving picker).

### File List

- `src/fitness/LogFoodScreen.tsx`
- `src/fitness/foodSearchService.ts`
- `src/fitness/foodSearchService.test.ts`
- `src/fitness/screens/ScreenNutrition.tsx`
- `src/fitness/TodayFoodLogCard.tsx`
- `src/fitness/foodMeasurements.ts`
- `src/fitness/foodMeasurements.test.ts`
- `_bmad-output/implementation-artifacts/nutrition-os-v2-checklist.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/fti-64-log-food-cal-ai-visual-polish.md`

### Change Log

- 2026-05-23: FTI-64 Cal AI visual polish + search cache + ring animation on close
