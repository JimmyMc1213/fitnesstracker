# Epic Retrospective: FTI Sprint 6

**Epic key:** `epic-fti-sprint-6`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Reduce `ScreenWorkout.tsx` monolith risk, expand E2E into the workout loop, and deliver FTI-13 session coaching via rule-based per-exercise notes (LLM optional).

| Metric | Value |
| --- | --- |
| Stories completed | 4 / 5 shipped, 1 scope-cancelled (FTI-55) |
| PR | [#28](https://github.com/JimmyMc1213/fitnesstracker/pull/28) `epic-6/fti-sprint-6-workout-architecture` |
| Quality gate | `npm run build` + `npm test` + `npm run test:e2e` |
| Test automation | Vitest **100 tests** (+17 from Sprint 5); Playwright **3 E2E smokes** |
| Epic status | **done**, pending merge to `main` |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-52-playwright-e2e-workout-session-smoke | FTI-46 | Workout tab: start → log set → finish → summary |
| fti-53-screenworkout-decomposition-phase-1 | FTI-47 | Extract session header, exercise card, finish confirm sheet |
| fti-54-rule-based-per-exercise-session-coach-notes | FTI-49 | History-driven coach notes on exercise cards |
| fti-55-llm-coach-notes-per-exercise-fti-13 | FTI-50 | **Cancelled**, FTI-54 satisfies product bar |
| fti-56-waterintake-tests-weigh-in-macro-nudge-persist | FTI-48 | `waterIntake.ts` Vitest + persist weigh-in macro nudge |

**Execution order:** FTI-52 → 53 → 54 → 55 (skip) → 56 (as planned)

---

## Sprint 5 retro follow-through

| # | Sprint 5 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Mark epic-fti-sprint-5-retrospective → done | ✅ Done | sprint-status |
| 2 | Close FTI-47–51 in Linear | ⏳ Unknown | Not verified in repo |
| 3 | Update Sprint 6 scope locks (design tokens) | ⏳ Partial | Lime-green refs remain in older comments |
| 4 | Story files for FTI-48–51 | ❌ Not addressed | Still epics.md only |
| 5 | Complete FTI-47 story file | ❌ Not addressed | Tasks still unchecked |
| 6 | Sprint 6 planning | ✅ Done | epics.md Epic 6 + sprint-status |
| 7 | One-story-per-PR for Sprint 6 | ❌ Not done | Single epic PR #28 again |
| 8 | FTI-52 workout E2E before coaching UI | ✅ **Done** | `e2e/workout-session-smoke.spec.ts` |
| 9 | FTI-54 product gate before FTI-55 LLM | ✅ **Done** | FTI-55 cancelled at review |
| 10 | CI `test:e2e` gate | ❌ Not done | Local gate only |
| 11 | Expand Nutrition E2E depth | ❌ Not done | Still Home-path smokes |

**Continuity insight:** Sprint 6 hit every technical Must from Sprint 5 prep (E2E-first, decomposition, rule-based notes). Process gaps (Linear sync, story-file hygiene, per-story PRs) repeated.

---

## What went well

1. **FTI-52 E2E-first paid off.** Workout session smoke landed before FTI-53 touched `ScreenWorkout.tsx`. All 3 Playwright specs stay green through decomposition and coach notes.

2. **Phase-1 decomposition without behavior change.** `ScreenWorkout.tsx` dropped ~395 lines (−28%) into `src/fitness/workout/`. Session header, exercise card, and finish confirm are isolated for FTI-54 wiring.

3. **Rule-based coach notes shipped (FTI-13 phase 1).** `exerciseSessionNotes.ts` reuses autofill history; notes generate once per session and render on exercise cards with coach styling.

4. **FTI-55 scope discipline.** LLM notes cancelled after FTI-54 review. No API keys, no offline failure modes, no duplicate coach logic.

5. **Retro debt closed (FTI-56).** 10 `waterIntake.ts` unit tests; weigh-in macro nudges persist on save so Home copy survives refresh.

6. **Story files exist for all Sprint 6 stories.** Better audit trail than Sprint 5 (FTI-48–51 gap).

7. **Test count grew meaningfully.** 83 → 100 Vitest; E2E 2 → 3 smokes.

---

## Challenges and growth areas

1. **Single epic PR again.** PR #28 bundles all Sprint 6 work. Sprint 5 retro called for one-story PRs for session-coaching changes; pattern not restored.

2. **Coach copy tone pass needed post-ship.** Em-dash and `×` multiplication signs in user-facing coach text read AI-generated. Follow-up sanitization added (`sanitizeCoachCopy`, plain `135x8` notation).

3. **Persisted session notes cache legacy copy.** Active workouts could show old coach strings until session restart; load-time sanitization added in `buildAppState`.

4. **E2E depth still thin vs unit tests.** 3 smokes vs 100 unit tests. Nutrition Saved tab, water card, and coach-note assertions not in Playwright yet.

5. **CI pipeline for E2E not scaffolded.** Quality gate documented locally; no GitHub Actions `test:e2e` yet.

6. **`ScreenWorkout.tsx` still large (~1,033 lines).** Phase 1 only; exercise search, idle dashboard, and swap flows remain in monolith.

7. **Design token doc drift persists.** Scope lock comments still mention lime green; code uses monochrome `--primary`.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| E2E-before-monolith-edit is the safe pattern | FTI-52 green before FTI-53 extraction; smoke still passes |
| Deterministic coach notes ship value without LLM | FTI-54 history-driven copy; FTI-55 skipped without blocker |
| Extract UI blocks before adding features to monolith | Coach notes wired via `WorkoutExerciseCard` prop, not inline in 1,400-line file |
| Sanitize persisted coach copy on load | Session notes frozen at start; copy fixes need migration path |
| Epic PRs trade review granularity for swarm speed | Same trade as Sprint 5; bisect harder for workout regressions |
| Plain-language coach copy matters for trust | User feedback on em dashes; prefer commas and `135x8` over `×` |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| E2E: assert per-exercise coach note visible | Medium | FTI-54 behavior not yet in Playwright |
| E2E: Nutrition Saved tab + water card | Medium | Sprint 5 carryover |
| `ScreenWorkout.tsx` phase 2 decomposition | Medium | Idle dashboard, exercise search, swap sheets |
| CI `test:e2e` in GitHub Actions | Medium | Local gate only |
| Story files / Dev Agent Records for FTI-48–51 | Low | Sprint 5 backlog |
| Design token docs vs code | Low | Reconcile lime-green scope lock comments |
| FTI-55 LLM (optional) | Low | Revisit if rule-based notes need richer copy |
| Linear sync FTI-52–56 | Low | Recurring process gap |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Mark `epic-fti-sprint-6-retrospective` → `done` in sprint-status | Dev | High |
| 2 | Merge PR #28 to `main` | Jimmymccarthy | High |
| 3 | Close FTI-46–50 / FTI-48 in Linear (Sprint 6 mapping) | Jimmymccarthy | High |
| 4 | Run `bmad-sprint-planning` for Sprint 7 kickoff | Jimmymccarthy | High |
| 5 | Restore one-story-per-PR for Sprint 7 | Dev | High |
| 6 | Add Playwright assertion for exercise coach note (FTI-54) | Dev | Medium |
| 7 | Scaffold CI `test:e2e` gate | Dev | Medium |
| 8 | ScreenWorkout phase 2 scope in Sprint 7 planning | Jimmymccarthy | Medium |
| 9 | Backfill FTI-48–51 story files OR Dev Agent Records | Dev | Low |
| 10 | Reconcile design-token scope locks in epics/sprint-status | Jimmymccarthy | Low |

---

## Next epic preparation

**Sprint 7:** Not yet planned in epics.md. Candidates from debt above:

- ScreenWorkout phase 2 (idle + search + swap extraction)
- E2E depth (coach notes, Nutrition Saved, water)
- CI quality pipeline
- Optional FTI-55 LLM if product reopens FTI-13

### Dependencies on Sprint 6 work

| Sprint 6 deliverable | Sprint 7 dependency |
| --- | --- |
| Workout session E2E smoke | Baseline for any workout UI change |
| `src/fitness/workout/*` modules | Further decomposition extends same folder |
| `exerciseSessionNotes.ts` + coachEngine export | LLM layer would extend same contract |
| 100 Vitest + 3 E2E | CI gate should pin these counts |
| `sanitizeCoachCopy` | Any new coach surfaces should use plain copy conventions |

### Critical preparation before Sprint 7 kickoff

1. **Merge Sprint 6 to `main`** and tag epic complete
2. **Sprint planning** with explicit scope locks (no epic-bundle PR if review matters)
3. **E2E expansion** before next workout feature
4. **Reconcile design tokens** in planning docs

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Strong | 100 Vitest + 3 E2E; triple gate local |
| Deployment | ⏳ Pending | PR #28 open, mergeable |
| Stakeholder acceptance | ⏳ Assumed | Per-exercise coach notes are user-visible |
| Technical health | ✅ Improved | Monolith reduced; session coaching live |
| Unresolved blockers | ✅ None | FTI-55 intentionally deferred |

**Readiness for Sprint 7:** ✅ Sprint 6 complete on epic branch. Merge, then plan next epic with process fixes (PR granularity, CI).

---

## Significant discoveries

**Epic update required for Sprint 7:** YES, focus on E2E/CI maturity and ScreenWorkout phase 2 before adding more in-session features.

1. **Workout loop is now test-automated end-to-end.** Highest-risk user flow (start → log → finish) has Playwright coverage; extend before phase 2 edits.
2. **Rule-based coaching is enough for v1.** FTI-13 LLM can wait; history-driven notes feel personal without API cost.
3. **Coach copy is product surface, not implementation detail.** Typography choices (em dashes, `×`) affect perceived quality; establish plain-copy conventions in project-context.
4. **Epic swarm velocity is high but review cost is real.** Two consecutive single-PR epics; Sprint 7 should split if bisect/review matter.

---

## Team closing notes

**Alice (Product Owner):** "Per-exercise coach notes are the FTI-13 win we wanted. Skipping LLM was the right call."

**Charlie (Senior Dev):** "1,033 lines is still a lot, but phase 1 unblocked coach wiring. Phase 2 before we add rest-timer UX changes."

**Dana (QA Engineer):** "Three E2E tests cover the big paths. I want a coach-note assertion in Playwright next."

**Elena (Junior Dev):** "Extracting `WorkoutExerciseCard` made the coach note prop obvious. Monolith would have been painful."

**Amelia (Developer):** "Epic complete on branch. Merge PR #28, mark retro done, plan Sprint 7 with smaller PRs."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-6-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-6-retrospective` → `done`
