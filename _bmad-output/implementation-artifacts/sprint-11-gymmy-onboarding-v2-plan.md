# Sprint 11 — Gymmy Onboarding v2 Final Flow

**Planned:** 2026-05-23  
**Epic:** `epic-fti-sprint-11`  
**Goal:** Ship the 23-screen Gymmy onboarding flow end-to-end (hook → paywall → Home), replacing the v1 11-step wizard.

**Spec:** [`gymmy-onboarding-flow-v2.md`](../planning-artifacts/gymmy-onboarding-flow-v2.md)  
**Tier copy:** [`gymmy-tier-matrix.md`](../planning-artifacts/gymmy-tier-matrix.md)

---

## Sprint goal (one sentence)

New users complete a coached, resumable 23-screen Gymmy onboarding that configures split, macros, reminders, and subscription tier — then land on Home with a working daily plan.

---

## Starting point (already shipped)

| Item | Status | Notes |
|------|--------|-------|
| FTI-69 Phase 0 hotfix | **Done** | dailyPlan + training calendar + hydration gate |
| Tier matrix doc | **Done** | Paywall copy, Free vs Pro |
| Flow v2 spec | **Done** | 23 screens, data model, resume rules |
| FTI-70 Data model | **Done** | `onboardingDraft`, `dateOfBirth`, `goalWeightLbs`, `pace`, `subscriptionTier` |
| FTI-71 Week calendar | **Done** | `WorkoutWeekCalendarPicker` wired in v1 Schedule step |
| v1 wizard | **Live** | 11 steps — replaced by FTI-72 |
| Resume on refresh | **Open bug** | Parked; FTI-75 must fix or accept known gap |

---

## Execute in this order

```
FTI-73 → FTI-72 (3 PR chunks) → FTI-74 → FTI-75 → retro
```

| # | Story | Scope | Target | Status |
|---|-------|-------|--------|--------|
| 0 | *(done)* FTI-69 | Phase 0 foundation | — | done |
| 1 | *(done)* FTI-70 | Data model + draft | — | done |
| 2 | *(done)* FTI-71 | Week calendar picker | — | done |
| 3 | **FTI-73** | `buildWorkoutTemplatesForDays(..., trainingWeekdays)` | 1 PR | ready-for-dev |
| 4 | **FTI-72** | 23-screen flow rewrite | 2–3 PRs | ready-for-dev |
| 5 | **FTI-74** | Paywall UI stub (screen 23) | 1 PR | backlog |
| 6 | **FTI-75** | Playwright happy path + resume + build gate | 1 PR | backlog |
| 7 | Retro | `epic-fti-sprint-11-retrospective` | — | optional |

---

## FTI-73 — Template weekday mapping (do first)

**Why first:** Training screens (15–17) depend on templates getting correct `dayLabel` from user weekdays without a post-hoc align helper.

**Deliverables:**
- Extend `buildWorkoutTemplatesForDays(days, level, equipment, trainingWeekdays?)`
- Assign `dayLabel[i] = trainingWeekdays[i]` when provided
- Unit tests; remove redundant `alignTemplatesToTrainingWeekdays` calls where builder covers it

**Acceptance:** 4-day pick Mon/Tue/Thu/Fri → templates show those labels in split reveal.

---

## FTI-72 — 23-screen rewrite (split into 3 PR chunks)

Replace [`OnboardingFlow.tsx`](../../src/fitness/OnboardingFlow.tsx) v1 step machine with v2. Bump `ONBOARDING_DRAFT_VERSION` to **3** (23-screen order).

### PR 1 — Shell + Hook + About you (screens 1–8)

| Screen | Title / purpose |
|--------|-----------------|
| 1 | Welcome — Gymmy, no back |
| 2 | Why Gymmy coaches — interstitial |
| 3 | First name — required |
| 4 | Gender |
| 5 | Date of birth — derive age |
| 6 | Units |
| 7 | Height |
| 8 | Weight |

**Components:** Extract `OnboardingShell.tsx`, add `OnboardingInterstitial.tsx`  
**Progress:** Phase label "About you", `Step X of 23` from screen 3  
**Draft:** Save on every Continue/Back; sync `gymmy_onboarding_draft`

### PR 2 — Goal + Training (screens 9–17)

| Screen | Title / purpose |
|--------|-----------------|
| 9 | Primary goal |
| 10 | Goal weight — skip if maintain |
| 11 | Pace — skip if maintain |
| 12 | Activity level |
| 13 | Experience |
| 14 | Equipment |
| 15 | **WorkoutWeekCalendarPicker** (reuse FTI-71) |
| 16 | Split reveal — **new** `OnboardingSplitReveal.tsx` |
| 17 | Edit split — optional branch → `OnboardingTemplateReview` |

**Branching:** maintain skips 10–11; Edit on 16 → 17 → 18  
**On Continue from 15:** `buildWorkoutTemplatesForDays(..., trainingWeekdays)`

### PR 3 — Nutrition + Launch through Plan ready (screens 18–22)

| Screen | Title / purpose |
|--------|-----------------|
| 18 | Macro targets + override |
| 19 | Protein priority — interstitial |
| 20 | Notifications |
| 21 | Generating plan — auto-advance 3–4s |
| 22 | Plan ready — **new** `OnboardingPlanReady.tsx` |

**Finish screen 22:** Navigate to screen 23 (FTI-74), not Home yet  
**Branding:** "Gymmy" in all copy

---

## FTI-74 — Paywall stub (screen 23)

**UI:** Full designed paywall per tier matrix  
- **$9.99/mo** · **$79.99/yr (33% off)**  
- Both CTAs → Home (no real IAP)  
- Store `subscriptionTier: 'free' | 'pro'` on CTA tap  

**On finish:** `onboardingComplete: true`, clear `gymmy_onboarding_draft`, persist full fitness slice.

**Out of scope:** StoreKit, Stripe, feature gating.

---

## FTI-75 — E2E + quality gate

**Playwright:**
- Happy path: new user → paywall → Home (maintain + cut paths)
- Resume: quit on screen 15 → reload → same screen *(fix refresh bug if still broken)*
- Week calendar: 3-day min, Pick for me, 6-day max

**Build gate:** `npm test` + `npm run build` + `npm run test:e2e`

---

## Sprint 11 scope locks

### IN SCOPE
- 23-screen flow per spec
- Gymmy name in onboarding + paywall only
- Week calendar (FTI-71) in screen 15
- Paywall UI stub; tier stored, no gating
- Draft resume (best effort; FTI-75 fixes refresh)
- Legacy skip via `onboardingSkip.ts` unchanged
- Dev preview toolbar + `?previewOnboarding=1`

### OUT OF SCOPE
- Real IAP / App Store billing
- Pro feature gating (My Meals, etc.)
- Global app rename Fitcoach → Gymmy
- AI transformation screens (cut from v2)
- Referral / rate-app / Apple Health prompts

---

## Definition of done (epic)

1. New user completes 23 screens and lands on Home with split, macros, tasks, tier stored.
2. Maintain skips goal weight + pace.
3. Week calendar enforces 3–6 days; Pick for me works.
4. Paywall shows tier matrix copy; both CTAs reach Home.
5. Legacy users skip wizard; FTI-69 daily plan still correct.
6. `npm test` + `npm run build` + E2E pass.

---

## Dev workflow (per story)

1. `create story and dev FTI-XX`
2. One focused PR per story (FTI-72 may be 3 PRs)
3. `npm test` + `npm run build` before merge
4. Update `sprint-status.yaml` story → `done`
5. Next story in order

---

## Risk register

| Risk | Mitigation |
|------|------------|
| FTI-72 too large for one session | 3 PR chunks above |
| Resume bug blocks epic AC | FTI-75 dedicated; dedicated `gymmy_onboarding_draft` key already in place |
| Cloud sync wipes draft | Merge rules in FTI-70; retest in FTI-75 |
| Screen count UX fatigue | Interstitials break up data entry; hook sells value first |

---

## Next action

Say: **`create story and dev FTI-73`**

Then proceed FTI-72 PR1 → PR2 → PR3 → FTI-74 → FTI-75.
