# Epic Retrospective: FTI Sprint 8

**Epic key:** `epic-fti-sprint-8`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Nutrition OS v2 — Chunk 2. USDA + Open Food Facts search via Supabase Edge Function; All-tab debounced search with serving picker; My foods library; Favorite foods tab; search→log E2E.

| Metric | Value |
| --- | --- |
| Stories completed | 3 / 3 shipped |
| PR | [#30](https://github.com/JimmyMc1213/fitnesstracker/pull/30) `epic-fti-sprint-8/nutrition-os-chunk-2` — **merged to `main`** |
| Quality gate (at merge) | `npm run build` + `npm test` (121) + `npm run test:e2e` (4) |
| Test automation | Vitest **121 tests** (+13 from Sprint 7); Playwright **4 E2E smokes** (+1 search→log) |
| Epic status | **done** |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-60-usda-food-search-edge-function-all-tab | FTI-54 | Edge Function + USDA search + All tab + serving picker |
| fti-61-open-food-facts-merge-branded-results | FTI-55 | OFF parallel fetch, merge/rank/dedupe, branded sublines |
| fti-62-my-foods-favorite-foods-tabs-search-e2e | FTI-56 | `NutritionUserFood`, My foods / Favorite foods tabs, search E2E |

**Execution order:** FTI-60 → 61 → 62 (as planned)

**Post-merge polish (same session):** Logged-food edit opens full Log Food serving/manual screen instead of inline mini-edit (local WIP on feature branch).

---

## Sprint 7 retro follow-through

| # | Sprint 7 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Mark epic-fti-sprint-7-retrospective → done | ✅ Done | sprint-status |
| 2 | Run sprint planning for Sprint 8 | ✅ Done | epics.md Epic 8 + Linear FTI-54–56 |
| 3 | Create FTI-60 story file before swarm | ✅ Done | fti-60-usda-food-search-edge-function-all-tab.md |
| 4 | Restore one-story-per-PR OR accept epic PR waiver | ❌ Not done | Single epic PR #30 again (fourth consecutive) |
| 5 | Scaffold CI `test:e2e` gate | ❌ Not done | Local gate only |
| 6 | Backfill FTI-58/59 story files | ❌ Not addressed | Sprint 7 carryover |
| 7 | Add Playwright: recently logged re-log | ❌ Not done | Deferred |
| 8 | Clearer empty-state copy on unwired tabs | ✅ Partial | My meals still placeholder; My foods + Favorite foods wired |
| 9 | Remove/isolate local WIP tests | ⏳ Partial | No broken tests on main at merge |
| 10 | Reconcile design-token scope lock comments | ⏳ Partial | FAB uses `--pos`; docs still mixed |

**Continuity insight:** Sprint 8 delivered the planned search + library chunk. Process gaps (single epic PR, no CI E2E, missing story files for FTI-61/62) persist.

---

## What went well

1. **Scope locks held.** My meals meal prep, Cal AI visual polish, barcode, and voice log stayed out of Sprint 8.

2. **Search infra landed end-to-end.** `food-search` Edge Function proxies USDA + OFF; client `foodSearchService.ts` with debounce, loading, error/retry, and serving picker with g/oz/custom units.

3. **Resilient merge layer.** `foodSearchMerge.ts` ranks and dedupes; partial API failure still returns available results (Vitest covered).

4. **My foods + Favorite foods wired.** `NutritionUserFood` persist slice; save-from-search; edit/delete in My foods; Favorite foods uses `nutritionPresets`.

5. **Measurement math is testable.** `foodMeasurements.ts` + Vitest for multiplier, serving labels, and picker edit reconstruction.

6. **E2E extended cleanly.** Fourth Playwright spec covers search → serving → log → rings update without bloating the suite.

7. **Tab bar hides during Log Food overlay.** `FitnessApp` tracks overlay open state — no double chrome during full-screen log flow.

---

## Challenges and growth areas

1. **Single epic PR (fourth consecutive).** PR #30 bundles FTI-60–62. Review and bisect remain harder than one-story PRs despite repeated retro action items.

2. **Edge Function deploy is manual.** `USDA_FDC_API_KEY` must be set in Supabase secrets; PR merge does not deploy the function — ops step before production search works.

3. **Story file gap for FTI-61 and FTI-62.** Only FTI-60 has a full story artifact; FTI-61/62 traceability lives in epics.md and Linear.

4. **My meals still placeholder.** Tab shows "coming in a future update" — expected per scope lock but users may tap it expecting functionality.

5. **CI E2E gate still missing.** Quality verified locally at merge; no GitHub Actions `test:e2e` — recurring debt since Sprint 5.

6. **Logged-food edit UX gap at merge.** Inline mini-edit on Today food log was clunky; full-screen edit flow implemented post-PR (needs follow-up PR).

7. **Nutrition checklist lag.** Phase 3–7 steps not yet checked off in `nutrition-os-v2-checklist.md` until retro closeout.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| Edge Function is the right seam for API keys | USDA key never touches client; OFF fetched server-side in parallel |
| Serving picker scales macros correctly | `computeServingMultiplier` + `scaleMacros` reused across log and edit |
| My foods drives retention before meals | Save-from-search + re-log delivers library value without meal prep |
| Epic PRs ship faster but repeat process debt | Sprints 5–8 all used single epic PRs despite retro action items |
| Partial failure tolerance matters for dual-API search | OFF timeout shouldn't blank USDA results |
| Edit should reuse log flow, not inline forms | User feedback: edit → same grams/serving screen as initial log |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| Deploy `food-search` Edge Function + USDA key | High | Required for production search |
| Logged-food edit via full Log Food screen | Medium | WIP post-merge; ship as small PR |
| CI `test:e2e` in GitHub Actions | Medium | Carried since Sprint 5 |
| Story files for FTI-61, FTI-62 | Medium | Backfill Dev Agent Records |
| My meals (Sprint 9 / FTI-63) | High | Next chunk |
| E2E: recently logged re-log | Low | Not yet in Playwright |
| Backfill FTI-58/59 story files | Low | Sprint 7 carryover |
| Cal AI visual polish (S9) | Medium | Phase 9 checklist |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Mark `epic-fti-sprint-8-retrospective` → `done` in sprint-status | Dev | High |
| 2 | Close Linear FTI-54, FTI-55, FTI-56 with PR #30 link | Dev | High |
| 3 | Run `bmad-sprint-planning` for Sprint 9 (Nutrition OS Chunk 3) | Jimmymccarthy | High |
| 4 | Deploy Edge Function + verify USDA key in Supabase | Jimmymccarthy | High |
| 5 | Ship logged-food edit PR (full serving screen) | Dev | Medium |
| 6 | Restore one-story-per-PR for Sprint 9 OR accept epic PR with waiver | Jimmymccarthy | High |
| 7 | Scaffold CI `test:e2e` gate | Dev | Medium |
| 8 | Update nutrition-os-v2-checklist Phases 3–7 | Dev | Medium |
| 9 | Backfill FTI-61/62 story files | Dev | Low |
| 10 | Add Playwright: recently logged re-log | Dev | Low |

---

## Next epic preparation

**Sprint 9:** Nutrition OS v2 — Chunk 3 (see `nutrition-os-v2-checklist.md`).

Planned scope:
- My meals (meal prep) — FTI-63
- Cal AI visual polish — FTI-64
- Full test/persistence finish — FTI-65

**Out of scope for S9:** Barcode, voice log, AI natural-language parse, native wrapper.

### Dependencies on Sprint 8 work

| Sprint 8 deliverable | Sprint 9 dependency |
| --- | --- |
| `food-search` Edge Function | Meal items can pull from search results |
| `NutritionUserFood` library | Meal builder adds from My foods |
| Serving picker + measurements | Meal ingredient portions reuse same math |
| Favorite foods (`nutritionPresets`) | Stable; no S9 regression |
| 121 Vitest + 4 E2E | CI gate should pin counts after S9 |
| Log Food tab shell | My meals tab replaces placeholder |

### Critical preparation before Sprint 9 kickoff

1. **Deploy Edge Function** and smoke-test search in production/preview
2. **FTI-63 story file** before `/bmad-swarm`
3. **Decide PR granularity** — epic vs one-story PRs
4. **Ship logged-food edit** — small UX win before meal prep

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Strong at merge | 121 Vitest + 4 E2E; local triple gate |
| Deployment | ⏳ Partial | PR on `main`; Edge Function deploy pending |
| Stakeholder acceptance | ⏳ Assumed | Search + My foods live after deploy |
| Technical health | ✅ Improved | Full logging path with external data |
| Unresolved blockers | ⏳ Edge Function deploy | Not a code blocker for S9 planning |

**Readiness for Sprint 9:** ✅ Sprint 8 complete on `main`. Deploy search infra, then plan Chunk 3 (My meals).

---

## Significant discoveries

**Epic update required for Sprint 9:** YES — My meals is the user-visible tab still empty; prioritize FTI-63 early in S9.

1. **Dual-API search works with graceful degradation.** OFF + USDA merge is the right pattern for branded + whole foods.
2. **Serving picker is reusable for edit.** Same screen for log and edit reduces UX inconsistency.
3. **Fourth single-PR epic is entrenched.** Explicit waiver or enforced one-story PRs needed for S9.
4. **Edge Function deploy is a separate ship step.** Merge ≠ production search until secrets + deploy.

---

## Team closing notes

**Alice (Product Owner):** "Search makes Log Food feel real. My meals is the obvious Sprint 9 headline."

**Charlie (Senior Dev):** "Keep measurement math in `foodMeasurements.ts`. Meal prep should compose those helpers, not fork them."

**Dana (QA Engineer):** "Search E2E is the right fourth spec. I want edit-serving E2E once the UX PR lands."

**Elena (Junior Dev):** "Save to My foods without logging today is a nice power-user flow."

**Amelia (Developer):** "Sprint 8 done and merged. Retro marked; deploy Edge Function, then plan Sprint 9."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-8-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-8-retrospective` → `done`
