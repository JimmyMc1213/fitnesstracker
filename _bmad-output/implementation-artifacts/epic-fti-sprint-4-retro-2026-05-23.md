# Epic Retrospective: FTI Sprint 4

**Epic key:** `epic-fti-sprint-4`  
**Project:** fitnesstracker (Fitcoach)  
**Date:** 2026-05-23  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Close the gap between "coaching engine shipped" and "app feels finished", screenshot-audit bug fixes, unified primary CTAs, lighter Home IA, habits folded into Home, Progress polish, Settings regroup. Nutrition tab rebuild explicitly deferred to Sprint 5.

| Metric | Value |
| --- | --- |
| Stories completed | 6 / 6 |
| PRs merged | 2, [#26](https://github.com/JimmyMc1213/fitnesstracker/pull/26) (FTI-41), [#27](https://github.com/JimmyMc1213/fitnesstracker/pull/27) (FTI-42-46) + follow-up fix `514f2b5` |
| Quality gate | `npm run build` + `npm test` on every story |
| Test automation | Vitest, **76 tests** at epic close (from 69 at Sprint 3 end) |
| Epic status | **done**, all stories on `main` |

### Stories delivered

| Story | Linear | Theme |
| --- | --- | --- |
| fti-41-ui-bug-sweep-dev-copy-token-fix | FTI-41 | Dev copy scrub, `--lime` token, persist safety |
| fti-42-design-system-primary-secondary-buttons | FTI-42 | `PrimaryButton` / `SecondaryButton` shared components |
| fti-43-home-density-greeting-weigh-in-legend | FTI-43 | Onboarding name, inline weigh-in, streak legend |
| fti-44-daily-habits-on-home-remove-habits-tab | FTI-44 | `HomeDailyHabitsCard`, 4-tab nav, delete `ScreenHabits` |
| fti-45-progress-goal-aware-delta-empty-states | FTI-45 | Goal-aware delta + empty-state polish |
| fti-46-settings-section-ia-notification-copy | FTI-46 | Settings section reorder + notification copy dedupe |

**Execution order:** FTI-41 → 42 → 43 → 44 → 45 → 46 (as planned in sprint-status)

---

## Sprint 3 retro follow-through

| # | Sprint 3 action | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Close FTI-40–FTI-39 in Linear | ⏳ Unknown | sprint-status shows done; Linear sync not verified in repo |
| 2 | Mark `epic-fti-sprint-3` → `done` | ✅ Completed | sprint-status + commit `6baa350` |
| 3 | Extract shared training-day / date helpers | ⏳ Deferred | Planned Sprint 5 FTI-48: shipped there |
| 4 | Run sprint planning for Sprint 4 | ✅ Completed | `epics.md` Epic 4 + sprint-status Sprint 4 entries |
| 5 | Add Playwright smoke (Home coach → Nutrition) | ⏳ Deferred | Planned Sprint 5 FTI-47: shipped there |
| 6 | Document `coachEngine` module contract | ❌ Not addressed | No architecture doc beyond inline comments |
| 7 | Commit `_bmad-output` / planning artifacts | ⏳ Partial | Sprint 4 story files + epics committed in PR #27; `_bmad/custom/` still untracked |
| 8 | Backfill FTI-34 story task checkboxes | ❌ Not addressed | Story file still sparse vs merged code |
| 9 | Document week-boundary rules (Sun vs Mon) | ⏳ Deferred | Planned Sprint 5 FTI-51: shipped there |
| 10 | FTI-13 AI coach decision | ✅ Scoped out | Sprint 4 scope lock: FTI-13 deferred; rule-based voice sufficient |

**Continuity insight:** Sprint 4 correctly absorbed UI/IA polish while deferring structural debt (E2E, coachEngine refactor, Nutrition rebuild) to Sprint 5. Linear sync and story-file audit trail remain recurring gaps.

---

## What went well

1. **FTI-41 as opener was correct.** Dev copy, broken `--lime` token, and persist parse crashes were user-visible blockers. Fixing them first unblocked the entire design-system sweep.

2. **Shared button components reduced drift.** `PrimaryButton` / `SecondaryButton` in `shared.tsx` replaced ad-hoc inline fills across Workout, Home, Settings, and sheet flows, one place to evolve CTA styling.

3. **Home IA simplification landed cleanly.** Removing the dead Habits tab (FTI-44) and folding habits into `HomeDailyHabitsCard` with a progress bar reads finished, not abandoned. 4-tab nav evenly spaced after fix `514f2b5`.

4. **Onboarding name step closed FTI-29 gap.** FTI-43 added first-name capture after Units, Home greeting finally has a primary input path, not Settings-only.

5. **Progress tab feels intentional.** Goal-aware delta sentiment (`weightProgress.ts` + 4 Vitest cases) fixes the bulk-user green/red inversion bug. Empty Fuel updates and workout calendar overlay remove placeholder noise.

6. **Settings IA matches mental model.** Account → You → Units → Training → Nutrition → Reminders → Habits → Program order plus deduped notification copy reduces scroll confusion.

7. **Scope discipline held.** Nutrition tab rebuild, FTI-13 LLM, native wrapper, and ScreenWorkout decomposition all stayed out, party-mode scope locks respected.

---

## Challenges and growth areas

1. **Mid-sprint design pivot: lime → monochrome.** FTI-42 shipped lime-green primary CTAs per spec; post-review fix `514f2b5` replaced global primaries with white (`--primary: #ffffff`) while keeping Today's Plan card green accent. Story files and sprint scope locks still reference lime, documentation drift.

2. **Story file audit trail remains weak.** FTI-42-46 story files show `(pending)` Dev Agent Records and unchecked task boxes despite merged code. Only FTI-41 has a complete record.

3. **FTI-43 + FTI-44 were a coupled integration spike.** Home stack order, habits card slot, tab removal, and Settings copy references touched 10+ files, similar surface-area risk to FTI-33 in Sprint 3.

4. **`--pos` token semantics shifted.** After monochrome pivot, `--pos` became `#d4d4d4` (neutral gray) rather than green, goal-aware Progress deltas and coach accent colors need a naming audit so "positive" doesn't read as "gray."

5. **Nutrition tab left intentionally unfinished.** Deferred scope was correct, but Home Fuel strip and Nutrition tab visual mismatch persisted until Sprint 5, users saw two different fuel UIs for one sprint cycle.

6. **No E2E coverage yet.** Sprint 4 added navigation changes (4-tab nav, habits on Home) without automated regression tests, carried risk into Sprint 5.

7. **Single epic PR for FTI-42-46.** PR #27 bundled 5 stories, harder to bisect regressions than Sprint 3's one-story-per-PR pattern.

---

## Key insights

| Insight | Evidence |
| --- | --- |
| Bug sweep before design sweep | FTI-41 token + copy fixes prevented FTI-42 from building on broken `--lime: #ffffff` |
| IA pivots need integration buffer | FTI-43 + FTI-44 + tab removal = multi-surface story; plan explicit integration task groups |
| Product review can override spec mid-epic | Monochrome CTA pivot improved visual cohesion; specs must update same day |
| Defer heavy tab rebuilds when IA is in flux | Nutrition rebuild waited until Home/Fuel patterns stabilized, correct call |
| Pure helpers + Vitest still scale on polish epics | `weightProgress.ts`, `userText.ts` added tests without slowing UI stories |
| 4-tab nav is the new baseline | Habits tab removal is permanent until a compelling standalone surface exists |

---

## Technical debt & follow-ups

| Item | Severity | Notes |
| --- | --- | --- |
| Design token doc drift (lime vs monochrome) | Medium | Update epics, scope locks, Sprint 6 planning to match `--primary` white + coach-card green accent |
| Story file backfill FTI-42-46 | Low | Dev Agent Records empty; task checkboxes stale |
| Nutrition tab rebuild | Medium | ✅ Deferred to Sprint 5 FTI-49 |
| Playwright E2E | Medium | ✅ Deferred to Sprint 5 FTI-47 |
| `coachEngine` refactor | Medium | ✅ Deferred to Sprint 5 FTI-48 |
| Week-boundary documentation | Low | ✅ Deferred to Sprint 5 FTI-51 |
| `ScreenWorkout.tsx` monolith | Medium | Sprint 1-4 carryover; FTI-42 swept buttons only |
| Linear sync | Low | Recurring, close FTI-41-46 in Linear |

---

## Action items

| # | Action | Owner | Priority |
| --- | --- | --- | --- |
| 1 | Update design-system docs to reflect monochrome primary + coach green accent | Jimmymccarthy | High |
| 2 | Close FTI-41–FTI-46 in Linear to match sprint-status | Jimmymccarthy | High |
| 3 | Mark `epic-fti-sprint-4-retrospective` → `done` in sprint-status | Dev | High |
| 4 | Run `bmad-sprint-planning` for Sprint 5 (E2E, Nutrition rebuild, coachEngine refactor) | Jimmymccarthy | High |
| 5 | Backfill FTI-42-46 story Dev Agent Records | Dev | Medium |
| 6 | Add Playwright smoke before Nutrition tab rebuild (FTI-47 first) | Dev | High |
| 7 | Extract `trainingCalendar.ts` before Nutrition/coach expansion (FTI-48) | Dev | Medium |
| 8 | Align Home Fuel strip with Nutrition rebuild (FTI-50) | Dev | Medium |
| 9 | Document week boundaries in project-context (FTI-51) | Dev | Low |
| 10 | Decide FTI-13 timing, still out of Sprint 5 per scope lock | Jimmymccarthy | Medium |

---

## Next epic preparation

**Sprint 5 scope (planned):** Quality foundation & nutrition OS, Playwright E2E, `coachEngine` refactor, Nutrition tab rebuild, Home Fuel alignment, week-boundary rules.

### Dependencies on Sprint 4 work

| Sprint 4 deliverable | Sprint 5 dependency |
| --- | --- |
| `PrimaryButton` / `SecondaryButton` | Nutrition rebuild uses shared buttons, monochrome styling carries forward |
| 4-tab nav + habits on Home | E2E smoke paths assume Home → Nutrition navigation |
| Home Fuel strip (unchanged UX) | FTI-50 alignment depends on FTI-49 Nutrition patterns |
| Settings nutrition targets | Nutrition tab reads same persist keys, no schema change needed |
| `--lime` / `--primary` tokens | Token naming must be stable before Nutrition hero rings |

### Critical preparation before Sprint 5 kickoff

1. **Sprint 5 planning session**, confirm FTI-47 → 48 → 49 → 50 → 51 order in Linear + sprint-status
2. **E2E-first opener**, mirror FTI-40 pattern; do not rebuild Nutrition without smoke tests
3. **Resolve design token naming**, document `--primary` vs `--pos` vs coach green before FTI-49
4. **Nutrition tab scope lock**, hero rings + today log + water; no new Home cards

### Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Testing & quality | ✅ Stable | 76 Vitest tests; build gate every story |
| Deployment | ✅ Complete | PRs #26–#27 on `main` |
| Stakeholder acceptance | ⏳ Assumed | Monochrome CTA pivot implies product review occurred |
| Technical health | ✅ Stable | No persist schema changes; UI-only epic |
| Unresolved blockers | ✅ None | Nutrition rebuild is planned work, not a blocker |

**Readiness for Sprint 5:** ✅ Sprint 4 fully shipped on `main`. Run Sprint 5 with E2E opener.

---

## Significant discoveries

**Epic update required for Sprint 5:** YES, Nutrition tab rebuild and E2E coverage are now the highest-value next investments.

1. **Monochrome primary CTAs are the new design direction**, lime-green global primaries were tried and reverted except coach-card accents. Sprint 5+ specs must not assume `#4ade80` primary buttons.
2. **Home is at capacity again**, habits card added scroll weight; Sprint 5 explicitly locks "no new Home cards beyond Fuel strip alignment."
3. **4-tab nav is stable**, do not re-add Habits tab without a standalone feature justification.
4. **Screenshot-audit epics benefit from FTI-41-style openers**, dev copy and token bugs are cheap to fix and high user impact.

---

## Team closing notes

**Alice (Product Owner):** "Sprint 4 is the 'feels finished' sprint. Habits on Home, personal greeting, Progress that respects your goal, users notice this immediately."

**Charlie (Senior Dev):** "The monochrome pivot mid-PR #27 was the right product call, but we need to update specs the same day. Stale lime references will confuse Sprint 5."

**Dana (QA Engineer):** "76 unit tests help, but we changed nav structure without E2E. Sprint 5 must open with Playwright."

**Elena (Junior Dev):** "Deleting ScreenHabits and folding into HomeDailyHabitsCard was cleaner than maintaining a dead tab."

**Amelia (Developer):** "Epic complete, PRs #26–#27 on `main`. Retro documented. Sprint 5 is E2E + Nutrition."

---

## Sign-off

- **Retrospective status:** done  
- **Document:** `_bmad-output/implementation-artifacts/epic-fti-sprint-4-retro-2026-05-23.md`  
- **Sprint status key updated:** `epic-fti-sprint-4-retrospective` → `done`
