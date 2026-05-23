# Epic Retrospective: FTI Sprint 5

**Epic key:** `epic-fti-sprint-5`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Close Sprint 3 retro debt (E2E coverage, `coachEngine` cohesion) and ship the Nutrition tab rebuild deferred from Sprint 4, making fuel logging a coached first-class surface aligned with Home quick-log.

| Metric | Value |
| --- | --- |
| Stories completed | 5 / 5 |
| PRs merged | 0 separate story PRs, single epic commit `6a09b6b` on `main` |
| Quality gate | `npm run build` + `npm test` + `npm run test:e2e` |
| Test automation | Vitest **83 tests** (+7 from Sprint 4); Playwright **2 E2E smokes** |
| Epic status | **done**, all stories on `main` |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-47-playwright-e2e-harness-coach-navigation-smoke | FTI-41 | Playwright harness + coach nav + fuel quick-log smoke |
| fti-48-coachengine-refactor-shared-date-training-helpers | FTI-42 | `trainingCalendar.ts`: break coachEngine ↔ scheduler cycle |
| fti-49-nutrition-tab-rebuild-hero-rings-coached-today-log | FTI-43 | `ScreenNutrition.tsx` rebuild, hero rings, today log, water |
| fti-50-home-fuel-strip-alignment-post-nutrition-rebuild | FTI-44 | Home Fuel strip + quick-log sheet alignment |
| fti-51-week-boundary-rules-streak-vs-weekly-summary | FTI-45 | Document Sun vs Mon boundaries + Vitest helpers |

**Execution order:** FTI-47 → 48 → 49 → 50 → 51 (as planned in sprint-status)

---

## Sprint 4 retro follow-through

| # | Sprint 4 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Update design-system docs (monochrome pivot) | ⏳ Partial | Code uses `--primary` white; sprint-status Sprint 6 still references lime green |
| 2 | Close FTI-41–FTI-46 in Linear | ⏳ Unknown | Not verified in repo |
| 3 | Run sprint planning for Sprint 5 | ✅ Completed | sprint-status Sprint 5 + epics.md Epic 5 |
| 4 | Backfill FTI-42-46 story Dev Agent Records | ❌ Not addressed | Story files still `(pending)` |
| 5 | Playwright smoke before Nutrition rebuild | ✅ **Completed** | FTI-47 opener; `e2e/coach-task-nutrition.spec.ts` + `e2e/fuel-quick-log.spec.ts` |
| 6 | Extract `trainingCalendar.ts` (FTI-48) | ✅ **Completed** | 7 Vitest tests; cycle with `notificationScheduler.ts` broken |
| 7 | Nutrition tab rebuild (FTI-49) | ✅ **Completed** | `ScreenNutrition.tsx` major rewrite (~669 lines touched) |
| 8 | Home Fuel alignment (FTI-50) | ✅ **Completed** | `HomeFuelStrip.tsx` + `HomeFuelQuickLogSheet.tsx` updated |
| 9 | Week-boundary docs (FTI-51) | ✅ **Completed** | `_bmad-output/project-context.md` section added |
| 10 | FTI-13 timing decision | ✅ Scoped out | Sprint 5 scope lock; Sprint 6 splits FTI-54 (rule-based) + FTI-55 (optional LLM) |

**Continuity insight:** Sprint 5 closed nearly all structural debt flagged in Sprints 3-4. Story-file hygiene and Linear sync remain the main process gaps. Shipping as one epic commit traded review granularity for speed.

---

## What went well

1. **FTI-47 first was the right call.** Playwright smoke locked coach-task → Nutrition and fuel quick-log paths before `ScreenNutrition.tsx` rewrite, Dana's Sprint 3/4 ask finally answered. Both E2E specs pass in ~5s headless.

2. **FTI-48 unblocked safe expansion.** `trainingCalendar.ts` extracted `startOfWeekSunday`, `startOfWeekMonday`, and week key helpers, 7 new Vitest tests, zero behavior change, coachEngine ↔ notificationScheduler cycle resolved.

3. **Nutrition tab is now a coached surface.** FTI-49 rebuilt hero MacroRings, streamlined today log, water card, and macro-pace rationale, fuel tracking matches the coaching OS thesis, not a settings afterthought.

4. **Home ↔ Nutrition consistency.** FTI-50 aligned preset lists, pace copy, and progress indicators between `HomeFuelStrip` and Nutrition tab without persist schema changes, E2E smoke still passes post-alignment.

5. **Week boundaries finally documented.** FTI-51 clarified intentional Sun (streak) vs Mon (weekly summary) split in `project-context.md`: closes a Sprint 3 retro carryover that confused every metrics story.

6. **Quality gates expanded correctly.** `project-context.md` now lists `npm run test:e2e` alongside build + Vitest, swarm gate matches reality.

7. **FTI-13 scope discipline held.** LLM coach deferred again with explicit Sprint 6 split (rule-based Must, LLM optional), no premature API integration.

---

## Challenges and growth areas

1. **Single epic commit, no per-story PRs.** Commit `6a09b6b` bundled all 5 stories, unlike Sprint 3's 8 PRs. Harder to review, bisect, or tie adversarial review findings to individual stories.

2. **Story files missing for FTI-48-51.** Only FTI-47 has a story file; FTI-48-51 exist in epics.md and sprint-status only, audit trail gap for a structurally important epic.

3. **FTI-47 story file incomplete.** Tasks still unchecked; Dev Agent Record `(pending)` despite shipped Playwright harness.

4. **`ScreenNutrition.tsx` rewrite risk.** ~669 lines changed in one story, highest regression surface since FTI-33. E2E covers Home paths but not full Nutrition tab flows (Saved tab, water card, manual entry).

5. **E2E coverage still thin.** 2 smoke tests vs 83 unit tests, workout session loop still manual-only (Sprint 6 FTI-52 planned).

6. **Design token doc drift persists.** Sprint 6 scope locks reference lime green (`--pos / #4ade80`); codebase uses monochrome `--primary` white and gray `--pos`. Specs must reconcile before Sprint 6 UI work.

7. **`ScreenWorkout.tsx` monolith untouched.** Sprint 5 scope lock respected, but 1,400+ line file remains the highest-risk module entering session-coaching work.

8. **`waterIntake.ts` tests still optional.** FTI-40 P2 carryover; FTI-56 in Sprint 6 targets this.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| E2E-first opener de-risks tab rebuilds | FTI-47 smoke green before FTI-49 Nutrition rewrite; alignment story (FTI-50) verified against same tests |
| Extract pure modules before UI expansion | FTI-48 `trainingCalendar.ts` enabled FTI-51 boundary tests without touching UI |
| Deferred scope accumulates well when ordered | Nutrition rebuild (Sprint 4 defer) + E2E (Sprint 3 defer) shipped cleanly in one epic when sequenced FTI-47 → 49 |
| Dual week definitions are product-intentional | Sun streak vs Mon summary documented, do not "fix" without explicit product decision |
| Epic commits trade speed for traceability | Sprint 5 velocity high; restore one-story PRs for Sprint 6 session-coaching changes |
| project-context.md is the right home for cross-cutting rules | Week boundaries + quality gates now discoverable for agents and humans |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| E2E: workout session smoke | Medium | Sprint 6 FTI-52: highest next E2E priority |
| E2E: Nutrition tab depth (Saved, water, manual log) | Medium | Only Home quick-log path covered today |
| `ScreenWorkout.tsx` decomposition phase 1 | Medium | Sprint 6 FTI-53 |
| Design token doc vs code (`--primary` vs lime) | Medium | Update Sprint 6 scope locks and epics |
| Story files for FTI-48-51 | Low | Create or backfill before Sprint 6 swarm |
| `coachEngine` submodule split | Low | Cycle broken; file still large, plan/weeklyReview submodules optional |
| `waterIntake.ts` tests | Low | FTI-56 in Sprint 6 backlog |
| Linear sync FTI-47-51 | Low | Recurring process gap |
| CI pipeline for `test:e2e` | Medium | Playwright runs locally; CI gate not yet scaffolded (FTI-56 adjacent) |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Mark `epic-fti-sprint-5-retrospective` → `done` in sprint-status | Dev | High |
| 2 | Close FTI-47–FTI-51 in Linear (Linear IDs FTI-41-45) | Jimmymccarthy | High |
| 3 | Update Sprint 6 scope locks, replace lime-green CTA refs with current `--primary` / coach-accent tokens | Jimmymccarthy | High |
| 4 | Create story files for FTI-48–FTI-51 OR backfill Dev Agent Records in epics | Dev | Medium |
| 5 | Complete FTI-47 story file (tasks + Dev Agent Record) | Dev | Medium |
| 6 | Run `bmad-sprint-planning` for Sprint 6 kickoff | Jimmymccarthy | High |
| 7 | Restore one-story-per-PR flow for Sprint 6 (especially FTI-53-55) | Dev | High |
| 8 | Add Playwright workout session smoke (FTI-52) before session-coaching UI | Dev | High |
| 9 | FTI-54 product review: rule-based notes bar before optional FTI-55 LLM | Jimmymccarthy | High |
| 10 | Scaffold CI `test:e2e` gate when FTI-52 lands | Dev | Medium |
| 11 | Expand E2E to Nutrition Saved tab + water card | Dev | Low |

---

## Next epic preparation

**Sprint 6 scope (planned):** Workout architecture & session coaching, workout E2E smoke, `ScreenWorkout` phase-1 decomposition, rule-based per-exercise coach notes (FTI-54), optional LLM notes (FTI-55), waterIntake tests + weigh-in macro nudge persist (FTI-56).

**Sprint execution order:** FTI-52 → 53 → 54 → 55 → 56

### Dependencies on Sprint 5 work

| Sprint 5 deliverable | Sprint 6 dependency |
| --- | --- |
| Playwright harness + `e2e/helpers/seed.ts` | FTI-52 extends same fixture pattern for workout loop |
| `trainingCalendar.ts` + boundary docs | Session coaching + weekly metrics must not reintroduce Sun/Mon confusion |
| Rebuilt `ScreenNutrition.tsx` | Macro nudge persist (FTI-56) touches nutrition state, schema stable |
| Home Fuel alignment | No new Home cards in Sprint 6, alignment is baseline |
| E2E coach + fuel smoke | Must stay green through FTI-53 workout decomposition |

### Critical preparation before Sprint 6 kickoff

1. **FTI-52 E2E-first**, mirror FTI-47 pattern before touching `ScreenWorkout.tsx`
2. **FTI-54 product gate**, rule-based per-exercise notes Must; FTI-55 LLM optional at review
3. **Phase-1 decomposition scope lock**, no full ScreenWorkout rewrite; extract hooks/components only
4. **Reconcile design tokens**, update scope locks before any new coach UI surfaces
5. **One-story PRs**, session coaching changes need isolated review

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Strong | 83 Vitest + 2 E2E; triple gate documented |
| Deployment | ✅ Complete | Epic commit `6a09b6b` on `main` |
| Stakeholder acceptance | ⏳ Assumed | Nutrition rebuild is major UX change, no formal sign-off recorded |
| Technical health | ✅ Improved | coachEngine cycle broken; Nutrition tab modernized |
| Unresolved blockers | ✅ None | FTI-55 LLM is optional product decision, not a blocker |

**Readiness for Sprint 6:** ✅ Sprint 5 fully shipped on `main`. Open with FTI-52 workout E2E before session-coaching code.

---

## Significant discoveries

**Epic update required for Sprint 6:** YES, workout architecture and session coaching are the next complexity spike; E2E and decomposition must land before coach notes.

1. **Nutrition OS is now first-class**, deferred from Sprint 4, delivered in Sprint 5. Home quick-log and Nutrition tab share patterns; further fuel features should extend both surfaces together.
2. **Playwright ROI confirmed**, 2 smokes caught navigation regressions worth more than 10 unit tests for tab/sheet flows. Expand into workout loop next.
3. **Dual week boundaries are stable**, document in onboarding copy if users ask why streak and summary differ on Sundays.
4. **FTI-13 path is clear**, rule-based per-exercise notes (FTI-54) before optional LLM (FTI-55). Sprint 3 thesis holds: deterministic coaching ships retention; AI is augmentation.
5. **Epic-commit pattern should not repeat for coaching work**, FTI-53-55 touch the highest-risk file; require per-story PRs and adversarial review.

---

## Team closing notes

**Alice (Product Owner):** "Nutrition finally feels coached, not bolted on. Hero rings + today log is the fuel OS we wanted since Sprint 2."

**Charlie (Senior Dev):** "FTI-48 should have happened in Sprint 4, glad it's done. FTI-53 is the real ScreenWorkout payoff; don't skip FTI-52."

**Dana (QA Engineer):** "Two E2E tests is a start. I want workout start → log set → finish before we add coach notes per exercise."

**Elena (Junior Dev):** "Week boundary docs in project-context.md, I finally understand why Sunday looks weird on Home."

**Amelia (Developer):** "Epic complete on `main`. Sprint 6 opens with workout E2E, then decomposition, then coach notes. FTI-55 stays optional."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-5-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-5-retrospective` → `done`
