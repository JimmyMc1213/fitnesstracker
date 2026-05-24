# Epic Retrospective: FTI Sprint 9

**Epic key:** `epic-fti-sprint-9`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Nutrition OS v2 - Chunk 3. My meals meal prep, Cal AI visual polish, full unit + E2E gate to ship the Nutrition OS v2 roadmap.

| Metric | Value |
| --- | --- |
| Stories completed | 3 / 3 shipped |
| PRs | [#31](https://github.com/JimmyMc1213/fitnesstracker/pull/31) FTI-63 · [#32](https://github.com/JimmyMc1213/fitnesstracker/pull/32) FTI-64 · FTI-65 (this story) |
| Quality gate (at close) | `npm run build` + `npm test` (136) + `npm run test:e2e` (5) |
| Test automation | Vitest **136 tests** (+15 from Sprint 8); Playwright **5 E2E smokes** (+1 saved-meal log) |
| Epic status | **done** |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-63-my-meals-meal-prep-data-model | FTI-57 | `NutritionMeal` library, create/edit/delete meals, one-tap log |
| fti-64-log-food-cal-ai-visual-polish | FTI-58 | Dark cards, tab underline, safe-area, search cache, ring re-animate |
| fti-65-nutrition-os-v2-full-test-persistence-gate | FTI-59 | Meal E2E, Phase 10 checklist complete, build gate |

**Execution order:** FTI-63 → 64 → 65 (as planned)

**Nutrition OS v2:** All 47 checklist steps complete across Sprints 7–9.

---

## Sprint 8 retro follow-through

| # | Sprint 8 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Run sprint planning for Sprint 9 | ✅ Done | epics.md Epic 9 + nutrition-os-v2-checklist |
| 2 | Deploy Edge Function + USDA secret | ⏳ Ops prep | Code on main; secret deploy still manual |
| 3 | Restore one-story-per-PR OR accept epic PR waiver | ✅ Done | PRs #31, #32, FTI-65 - three separate story PRs |
| 4 | My meals as S9 headline | ✅ Done | FTI-63 shipped first |
| 5 | Cal AI polish in S9 | ✅ Done | FTI-64 |
| 6 | Full test gate in S9 | ✅ Done | FTI-65 |

---

## What went well

- **Chunk 3 delivered the user-visible gap:** My meals went from placeholder to full meal-prep flow.
- **One-story-per-PR restored** after four consecutive epic PRs - easier review and safer merges.
- **Test pyramid held:** Unit coverage for meals, search cache, and merge; E2E covers manual add, search→log, and saved-meal log.
- **Design system consistency:** Lime `--pos` CTAs and dark Cal AI cards carry through Log Food.

## What could improve

- **Edge Function deploy** remains manual ops - not blocking dev but blocks live USDA search in production.
- **Recently logged re-log E2E** still not covered (carried from Sprint 7/8).
- **CI e2e gate** still local-only - no GitHub Actions workflow yet.

## Action items (post-Sprint 9)

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Deploy `food-search` Edge Function + `USDA_FDC_API_KEY` to Supabase | Jimmymccarthy | High |
| 2 | Scaffold CI pipeline with `npm test` + `npm run test:e2e` | Jimmymccarthy | Medium |
| 3 | Add Playwright: recently logged one-tap re-log | Backlog | Low |
| 4 | Plan next epic (ScreenWorkout phase 2 vs barcode/voice backlog) | Product | Medium |

---

## Team quotes

**Alice (Product Owner):** "Nutrition OS v2 is shippable. My meals was the last big user story in the roadmap."

**Charlie (Senior Dev):** "Three focused PRs beat one epic dump. Keep that rhythm."

**Dana (QA Engineer):** "Five E2E smokes cover the critical paths. CI would make this durable."

**Amelia (Developer):** "Sprint 9 closed the checklist. Time to pick the next epic deliberately."

---

**Readiness for next epic:** ✅ Nutrition OS v2 complete on `main`. Choose: workout architecture phase 2, barcode scan, or native wrapper (all previously out of scope).
