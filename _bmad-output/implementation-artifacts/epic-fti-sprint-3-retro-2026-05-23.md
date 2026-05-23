# Epic Retrospective: FTI Sprint 3

**Epic key:** `epic-fti-sprint-3`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Ship deterministic coaching orchestration across Home, Workout, check-in, notifications, and weekly review — one cross-domain `coachEngine` that turns existing app data into actionable coach copy without LLM dependency.

| Metric | Value |
| --- | --- |
| Stories completed | 8 / 8 |
| PRs merged | 8 (FTI-40–FTI-39 via PRs #18–#25) |
| Quality gate | `npm run build` + `npm test` on every story |
| Test automation | Vitest — **69 tests** (from 0 at Sprint 2 end) |
| Epic status | **done** — all stories on `main` |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-40-vitest-harness-coach-dailyplan-unit-tests | FTI-40 | Test harness + regression safety |
| fti-34-cross-domain-coach-engine | FTI-34 | Pure coaching brain (`coachEngine.ts`) |
| fti-33-todays-coach-plan-home-redesign | FTI-33 | Home IA — Today's Coach Plan |
| fti-37-in-session-coach-prominence-set-autofill | FTI-37 | In-session coach + set autofill |
| fti-35-home-fuel-quick-log-coach-pace | FTI-35 | Home fuel quick-log + macro pace |
| fti-36-check-in-triggered-micro-adjustments | FTI-36 | Weigh-in coach reactions on Home |
| fti-38-context-aware-notification-copy | FTI-38 | Engine-driven notification bodies |
| fti-39-weekly-coach-review-narrative | FTI-39 | Weekly recap + next-week focus |

**Execution order:** FTI-40 → 34 → 33 → 37 → 35 → 36 → 38 → 39 (as planned in sprint-status)

---

## Sprint 2 retro follow-through

| # | Sprint 2 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Close FTI-29–FTI-32 in Linear | ⏳ Unknown | Sprint 3 shipped; Linear sync not verified in repo |
| 2 | Backfill FTI-29 story Dev Agent Record | ❌ Not addressed | Story file still sparse vs merged code |
| 3 | Add Vitest + tests for pure helpers | ✅ **Completed** | FTI-40 established harness; suite grew to 69 tests across coachEngine, autofill, macroPace, nutritionLog, scheduler |
| 4 | Document notification platform limits in project-context | ❌ Not verified | FTI-28 UI copy exists; no central project-context doc found |
| 5 | Run sprint planning for Sprint 3 | ✅ Completed | sprint-status Sprint 3 entries + story files for all 8 stories |
| 6 | Commit `_bmad-output` / planning artifacts | ❌ Not addressed | `_bmad-output` and `_bmad/` still largely untracked |
| 7 | Live smoke with `?previewOnboarding=1` checklist | ⏳ Partial | Adversarial review caught real bugs (FTI-33 historical log, FTI-37 off-plan coach expand) but no formal checklist artifact |
| 8 | Document week-boundary rules (Sun vs Mon) | ❌ Not verified | Streak vs weekly summary boundaries still implicit |

**Continuity insight:** Sprint 2's highest-priority test debt (#3) was resolved decisively — FTI-40 as sprint opener was the right call. Every subsequent story extended the same harness. Untracked BMAD artifacts (#6) and Linear sync (#1) remain recurring process gaps.

---

## What went well

1. **FTI-40 first unlocked the whole epic.** Vitest + fixtures before `coachEngine.ts` meant FTI-34 shipped with 12 snapshot-style tests on day one. Test count grew predictably: 30 → 42 → 57 → 64 → 65 → 69.

2. **Pure `coachEngine` pattern scaled across surfaces.** One module feeds Home plan card, weigh-in reactions, notification bodies, macro pace rationale, and weekly review — UI stories stayed thin wiring layers.

3. **Sprint order was correct.** Engine (34) before Home redesign (33); in-session gap (37) before Home fuel loop (35); notification wiring (38) after all context builders existed; weekly narrative (39) last as retention capstone.

4. **Home IA pivot was coherent.** Water locked to Nutrition tab; MacroRing moved off Home; coach plan + fuel strip + compact streak + collapsed weekly summary reduced scroll competition while keeping daily OS feel.

5. **Adversarial review caught high-impact UX bugs.** FTI-33: historical `[+ Log]` navigated to today (HIGH). FTI-37: coach card expanded on off-plan sessions (CRITICAL/HIGH). Both fixed before merge.

6. **Deterministic coaching shipped without FTI-13.** Rule-based voice across 8 stories proves the product thesis — coached feel without API cost or latency.

7. **Shared helper extraction paid off.** `nutritionLog.ts`, `macroPace.ts`, `workoutAutofill.ts`, `coachTaskActions.ts` each got colocated tests — pattern from Sprint 2 matured into standard practice.

---

## Challenges and growth areas

1. **FTI-33 was the complexity spike.** Home IA touched 7+ components (`TodaysCoachPlanCard`, `HomeFuelStrip`, `coachTaskActions`, streak/summary variants, Nutrition MacroRing hero). Similar surface-area risk to FTI-28 in Sprint 2 — multi-component stories need explicit integration task groups.

2. **`coachEngine.ts` is becoming a god module.** Exports now include plan, recap, weigh-in, notifications, macro pace inputs, weekly review. Circular import with `notificationScheduler.ts` is documented but fragile — extract shared date/training helpers before Sprint 4.

3. **FTI-39 merged ([PR #25](https://github.com/JimmyMc1213/fitnesstracker/pull/25)).** Sprint 3 is fully on `main` — 8/8 PRs merged.

4. **`ScreenWorkout.tsx` monolith persists.** FTI-37 added autofill wiring across 4 code paths inside the workout screen. Sprint 1/2 carryover still unaddressed.

5. **No E2E coverage.** Vitest covers pure logic well; Home navigation flows (coach task → tab, quick-log sheet, weigh-in reaction) remain manual-only. Playwright deferred again.

6. **Display vs save API duplication.** FTI-36 needed `getWeighInReactionForDisplay` separate from `getWeighInReaction` — pattern may repeat as more surfaces show engine copy for already-logged data.

7. **Story file drift on early Sprint 3 stories.** FTI-34 Tasks 8–9 still show unchecked `[ ]` in story file despite completion notes saying done — audit trail inconsistency continues from Sprint 2.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| Test-first sprint opener de-risks domain expansion | FTI-40 → FTI-34 chain; zero regressions reported across 39 new tests |
| Engine-before-UI ordering prevents rework | FTI-33 consumed `getHomeCoachPlan` verbatim; no duplicate coach strings in UI |
| Home coach tasks need routing layer | `coachTaskActions.ts` centralizes kind→tab/sheet mapping; FTI-35 extended without card changes |
| Module cycles are acceptable only at call-time | FTI-38 coachEngine ↔ notificationScheduler — works but needs refactor before more imports |
| Collapsed-by-default cards save scroll budget | Weekly summary + coach copy hidden until expand — retro action from FTI-33 preserved ~80px |
| Review remains the integration test suite | FTI-33 (5 findings), FTI-37 (6 findings); FTI-36/38 shipped clean |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| ~~Merge PR #25 (FTI-39)~~ | — | ✅ Merged 2026-05-23 |
| `coachEngine` / `notificationScheduler` cycle | Medium | Extract `isTrainingDay` + shared date helpers to break cycle |
| `coachEngine.ts` size / cohesion | Medium | Consider submodules: plan, checkIn, notifications, weeklyReview |
| `ScreenWorkout.tsx` decomposition | Medium | Sprint 1–3 carryover; autofill wiring adds pressure |
| No Playwright smoke | Medium | Home coach task navigation highest-value E2E candidate |
| `waterIntake.ts` tests (FTI-40 P2) | Low | Still optional from retro item |
| Untracked BMAD/planning docs | Low | Cross-machine drift risk |
| Week-start inconsistency (Sun vs Mon) | Low | Still undocumented centrally |
| FTI-34 story task checkboxes stale | Low | Backfill for audit trail |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | ~~Merge PR #25 (FTI-39)~~ — done | Jimmymccarthy | ✅ |
| 2 | Close FTI-40–FTI-39 in Linear to match sprint-status | Jimmymccarthy | High |
| 3 | Mark `epic-fti-sprint-3` → `done` in sprint-status after FTI-39 merge | Dev | High |
| 4 | Extract shared training-day / date helpers to break coachEngine ↔ scheduler cycle | Dev | Medium |
| 5 | Run `bmad-sprint-planning` for Sprint 4 (FTI-13 decision, native wrapper, E2E) | Jimmymccarthy | High |
| 6 | Add Playwright smoke: Home coach task → Nutrition tab + fuel quick-log sheet | Dev | Medium |
| 7 | Document `coachEngine` module contract in architecture or project-context | Dev | Medium |
| 8 | Commit `_bmad-output/planning-artifacts` + story files OR add sync doc | Jimmymccarthy | Medium |
| 9 | Backfill FTI-34 story task checkboxes / Dev Agent Record | Dev | Low |
| 10 | Document week-boundary rules (streak Sun vs summary Mon) | Dev | Low |

---

## Next epic preparation

**Sprint 4 is not yet defined in `epics.md`.** PRD backlog highlights:

- **FTI-13** — AI coach notes per exercise (deferred until rule-based voice proven — **now proven**)
- Native App Store wrapper + reliable background notifications
- Playwright E2E smoke paths
- `ScreenWorkout.tsx` refactor
- Optional: persist macro nudges from weigh-in reactions (FTI-36 display-only today)

### Dependencies on Sprint 3 work

| Sprint 3 deliverable | Sprint 4 dependency |
| --- | --- |
| `coachEngine.ts` + 69 Vitest tests | FTI-13 must extend engine, not fork parallel coach logic |
| Home Today's Coach Plan IA | Any new Home cards must respect scroll budget / collapse patterns |
| Notification engine bodies | Native push must preserve `getNotificationBody` contract |
| Weekly coach review narrative | Push notification for Sunday review could reuse `getWeeklyCoachReview` |
| Set autofill from history | AI suggestions must not fight autofill defaults |

### Critical preparation before Sprint 4 kickoff

1. **Sprint 4 planning session** — define scope in Linear + `epics.md` + `sprint-status.yaml`
2. **FTI-13 architecture spike** — extend `coach.ts` / `coachEngine` vs. external LLM API (cost, latency, offline)
3. **E2E framework decision** — Playwright for Home coach flows before adding more navigation-heavy features
4. **coachEngine refactor plan** — break god module before FTI-13 adds more exports

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Strong for pure logic | 69 Vitest tests; build + test gate every story |
| Deployment | ✅ Complete | 8/8 PRs on `main` (#18–#25) |
| Stakeholder acceptance | ⏳ Assumed | No formal sign-off recorded |
| Technical health | ✅ Stable | Persistence unchanged; coach layer is derived view |
| Unresolved blockers | ✅ None | FTI-39 merged via PR #25 |

**Readiness for Sprint 4:** ✅ Sprint 3 fully shipped on `main`. Run sprint planning before `bmad-swarm next`.

---

## Significant discoveries

**Epic update required for Sprint 4:** YES — Sprint 3 validated deterministic coaching; Sprint 4 must decide AI augmentation path.

1. **Rule-based coaching is sufficient for v1 retention hooks** — weekly narrative, macro pace, weigh-in reactions, and notification nudges all ship without LLM. FTI-13 is now an explicit product choice, not a technical blocker.
2. **Home is at scroll capacity** — further Home features need tab reorganization or deeper collapse defaults.
3. **Vitest ROI confirmed** — Sprint 2's deferred action item became Sprint 3's foundation. Never start a domain-expansion epic without test harness again.

---

## Team closing notes

**Alice (Product Owner):** "Sprint 3 is the coaching promise delivered. Home tells you what to do today; workout feels guided; notifications sound human; weekly review closes the loop."

**Charlie (Senior Dev):** "FTI-34 + FTI-40 was the keystone. FTI-33 was the messy integration story — plan more buffer for IA pivots."

**Dana (QA Engineer):** "69 unit tests is real progress. I still want one Playwright path through coach task → fuel quick-log before we add AI."

**Elena (Junior Dev):** "Set autofill from history — users will feel that immediately. Small module, big UX win."

**Amelia (Developer):** "Epic complete — all 8 PRs on `main`. Retro documented. Run sprint-plan for Sprint 4."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-3-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-3-retrospective` → `done`
