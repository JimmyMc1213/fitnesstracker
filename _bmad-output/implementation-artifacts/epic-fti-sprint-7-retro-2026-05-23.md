# Epic Retrospective: FTI Sprint 7

**Epic key:** `epic-fti-sprint-7`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Nutrition OS v2 - Chunk 1. Strip Nutrition tab to rings + hydration + FAB; build full-screen Log Food overlay (manual add + recently logged); extend logged-item schema; remove Home quick-log; unify coach fuel routing; refresh E2E.

| Metric | Value |
| --- | --- |
| Stories completed | 3 / 3 shipped |
| PR | [#29](https://github.com/JimmyMc1213/fitnesstracker/pull/29) `epic-fti-sprint-7/nutrition-os-v2-chunk-1` - **merged to `main`** |
| Quality gate (at merge) | `npm run build` + `npm test` (108) + `npm run test:e2e` (3) |
| Test automation | Vitest **108 tests** (+8 from Sprint 6); Playwright **3 E2E smokes** (nutrition log food replaces fuel quick-log) |
| Epic status | **done** |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-57-nutrition-tab-log-food-shell-data-model | FTI-51 | Log Food overlay, data model, Nutrition tab strip |
| fti-58-remove-home-logging-coach-routing-log-food | FTI-52 | Home read-only fuel strip; coach → Nutrition + Log Food |
| fti-59-nutrition-os-v2-e2e-partial | FTI-53 | E2E refresh for new logging path |

**Execution order:** FTI-57 → 58 → 59 (as planned)

**Post-merge polish (same epic):** Log Food `page-transition` animation; tab label **Favorite foods** (was Saved foods).

---

## Sprint 6 retro follow-through

| # | Sprint 6 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Mark epic-fti-sprint-6-retrospective → done | ✅ Done | sprint-status |
| 2 | Merge PR #28 to main | ✅ Done | Sprint 7 built on merged main |
| 3 | Close FTI-46–50 in Linear | ✅ Done | Sprint 7 Linear IDs FTI-51–53 closed |
| 4 | Run sprint planning for Sprint 7 | ✅ Done | epics.md Epic 7 + nutrition-os-v2-checklist |
| 5 | Restore one-story-per-PR for Sprint 7 | ❌ Not done | Single epic PR #29 again |
| 6 | Playwright coach-note assertion (FTI-54) | ❌ Not done | Deferred; ScreenWorkout phase 2 out of S7 scope |
| 7 | Scaffold CI `test:e2e` gate | ❌ Not done | Local gate only |
| 8 | ScreenWorkout phase 2 in Sprint 7 planning | ✅ Correctly deferred | S7 scope lock: Nutrition OS priority |
| 9 | Backfill FTI-48–51 story files | ❌ Not addressed | Sprint 5 carryover |
| 10 | Reconcile design-token scope locks | ⏳ Partial | Lime-green FAB uses `--pos`; docs still mixed |

**Continuity insight:** Sprint 7 delivered the planned Nutrition OS chunk on time. Process gaps (single epic PR, missing story files for FTI-58/59, no CI E2E) repeated for a third sprint.

---

## What went well

1. **Scope locks held.** USDA/OFF, My meals wiring, barcode, voice log, and ScreenWorkout phase 2 stayed out of Sprint 7. No scope creep into Sprint 8 work.

2. **Unified logging path shipped.** Home `HomeFuelQuickLogSheet` removed; coach "Log fuel" opens Nutrition + Log Food via `navigate(..., { openLogFood: true })`. One mental model for users.

3. **Log Food shell is extensible.** `LogFoodScreen.tsx` with tab bar (All · My foods · My meals · Favorite foods), recently logged, and manual add gives Sprint 8 clear insertion points for search and preset tabs.

4. **Data model forward-compatible.** `NutritionLoggedItem` extended with `loggedAtMs`, `servingLabel`, `source`, `externalId`; legacy rows backfill via `stableLegacyNutritionLoggedAtMs`.

5. **E2E migrated cleanly.** `fuel-quick-log.spec.ts` replaced by `nutrition-log-food.spec.ts`; coach-task spec updated; all 3 Playwright specs green at merge.

6. **Epic merged and Linear synced.** FTI-51, FTI-52, FTI-53 marked Done with PR #29 attached; checklist and sprint-status updated.

7. **Fast post-merge UX polish.** Page transition on Log Food open and Favorite foods rename landed without a second PR cycle.

---

## Challenges and growth areas

1. **Single epic PR (third consecutive).** PR #29 bundles FTI-57–59. Review and bisect remain harder than one-story PRs; sprint planning called for one PR per story but swarm defaulted to epic bundle again.

2. **Story file gap for FTI-58 and FTI-59.** Only FTI-57 has a full story artifact; FTI-58/59 traceability lives in epics.md and Linear only.

3. **Empty tabs by design can feel broken.** My foods, My meals, and Favorite foods show placeholder copy until Sprint 8 - expected but worth clearer empty-state messaging in S8 opener.

4. **Search bar is UI-only.** Users may expect "Describe what you ate" to search; Sprint 8 must ship USDA/OFF quickly or add interim copy that sets expectations.

5. **CI E2E gate still missing.** Quality verified locally at merge; no GitHub Actions `test:e2e` - recurring debt since Sprint 5.

6. **Local WIP can drift from main.** Untracked `workoutTemplates.test.ts` on disk fails against main (103/108 pass locally); keep WIP tests off main or on feature branches.

7. **Design token docs vs code.** Scope locks mention lime green; Log Food FAB uses `--pos` (#4ade80) - aligned in code, comments still inconsistent.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| Nutrition tab as dashboard + Log Food as action surface works | Users get rings/hydration at a glance; logging doesn't compete for scroll space |
| Coach routing must match the single logging path | FTI-58 was as important as FTI-57 for product coherence |
| Recently logged drives re-log UX before search APIs | `getRecentlyLoggedFoods()` + one-tap `+` delivers value without USDA |
| Epic PRs ship faster but repeat process debt | Sprints 5–7 all used single epic PRs despite retro action items |
| E2E replacement beats piling specs | Removing broken fuel-quick-log and adding nutrition-log-food kept suite at 3 focused smokes |
| Post-merge polish is cheap when overlay is isolated | Animation + tab rename = one file, no schema changes |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| Wire Favorite foods tab to `nutritionPresets` | High | Sprint 8 / FTI-62 scope |
| USDA/OFF search + Supabase Edge Function | High | Sprint 8 opener |
| My foods tab (user-created + saved search) | High | Sprint 8 |
| CI `test:e2e` in GitHub Actions | Medium | Carried since Sprint 5 |
| Story files for FTI-58, FTI-59 | Medium | Backfill Dev Agent Records |
| E2E: recently logged one-tap re-log | Low | Not yet in Playwright |
| Reconcile design-token comments in epics/sprint-status | Low | Lime vs `--pos` |
| ScreenWorkout phase 2 decomposition | Medium | Still deferred; monolith ~1k lines |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Mark `epic-fti-sprint-7-retrospective` → `done` in sprint-status | Dev | High |
| 2 | Run `bmad-sprint-planning` for Sprint 8 (Nutrition OS Chunk 2) | Jimmymccarthy | High |
| 3 | Create FTI-60 story file (USDA/search opener) before swarm | Dev | High |
| 4 | Restore one-story-per-PR for Sprint 8 OR accept epic PR with explicit waiver | Jimmymccarthy | High |
| 5 | Scaffold CI `test:e2e` gate | Dev | Medium |
| 6 | Backfill FTI-58/59 story files with done status + file lists | Dev | Medium |
| 7 | Add Playwright: recently logged re-log | Dev | Low |
| 8 | Clearer empty-state copy on unwired Log Food tabs until S8 | Dev | Low |
| 9 | Remove or branch-isolate local `workoutTemplates.test.ts` WIP | Dev | Low |
| 10 | Reconcile design-token scope lock comments | Jimmymccarthy | Low |

---

## Next epic preparation

**Sprint 8:** Nutrition OS v2 - Chunk 2 (see `nutrition-os-v2-checklist.md`).

Planned scope:
- USDA FoodData Central + Open Food Facts via Supabase Edge Function
- Wire All-tab search (debounced)
- My foods tab + Favorite foods tab (`nutritionPresets`)
- Persist/cloud sync finish for new fields where needed

**Out of scope for S8 (Chunk 3 / S9):** My meals meal prep, full Cal AI polish, barcode, voice log.

### Dependencies on Sprint 7 work

| Sprint 7 deliverable | Sprint 8 dependency |
| --- | --- |
| `LogFoodScreen.tsx` tab shell | Search results plug into All tab; presets into Favorite foods |
| Extended `NutritionLoggedItem` | Search results log with `source`, `externalId`, `servingLabel` |
| `getRecentlyLoggedFoods()` | Search-selected foods also appear in recently logged |
| Home read-only + coach routing | No regression when adding search; E2E coach spec is baseline |
| 108 Vitest + 3 E2E | CI gate should pin counts after S8 |
| Nutrition tab FAB + overlay | Search confirm flow must close overlay and update rings |

### Critical preparation before Sprint 8 kickoff

1. **USDA API key + Edge Function scaffold** (checklist Phase 0.2)
2. **FTI-60 story file** before `/bmad-swarm`
3. **Decide PR granularity** - epic vs one-story PRs
4. **Favorite foods tab wiring** - user-visible win early in S8

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Strong at merge | 108 Vitest + 3 E2E; local triple gate |
| Deployment | ✅ Merged | PR #29 on `main` |
| Stakeholder acceptance | ⏳ Assumed | Log Food manual add + coach routing live |
| Technical health | ✅ Improved | Single logging path; Nutrition tab simplified |
| Unresolved blockers | ✅ None for S8 start | API key + edge function are S8 Day-1 tasks |

**Readiness for Sprint 8:** ✅ Sprint 7 complete. Plan Chunk 2 with search infra first, then tab wiring.

---

## Significant discoveries

**Epic update required for Sprint 8:** YES - prioritize Edge Function + All-tab search before meal prep (S9).

1. **Chunk 1 validated the Cal AI split.** Dashboard tab + full-screen log overlay is the right IA; Sprint 8 fills the empty tabs.
2. **Coach + Home alignment was non-optional.** Shipping Log Food without FTI-58 would have left two logging paths.
3. **Epic swarm + post-merge polish works.** Small UX fixes (animation, rename) don't need a full story if kept isolated.
4. **Third single-PR epic is a pattern, not an accident.** If review granularity matters, Sprint 8 needs an explicit process decision.

---

## Team closing notes

**Alice (Product Owner):** "Nutrition tab finally feels like a dashboard, not a spreadsheet. Sprint 8 search is the next user-visible win."

**Charlie (Senior Dev):** "`LogFoodScreen` is the right seam for USDA. Don't bolt search onto `ScreenNutrition`."

**Dana (QA Engineer):** "Nutrition E2E replaced fuel quick-log cleanly. I want recently-logged re-log in Playwright next."

**Elena (Junior Dev):** "Extending `NutritionLoggedItem` upfront saved rework. Favorite foods rename was trivial once tabs existed."

**Amelia (Developer):** "Sprint 7 done and merged. Retro marked; plan Sprint 8 with Edge Function first."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-7-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-7-retrospective` → `done`
