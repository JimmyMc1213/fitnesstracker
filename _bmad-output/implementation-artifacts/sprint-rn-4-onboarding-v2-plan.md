# Sprint RN-4 — Onboarding v2

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 12 story files created)  
**Epic:** `epic-rn-4`  
**Swarm branch:** `epic-rn-4/onboarding-v2`  
**Goal:** Replace the `(onboarding)` stub with the PWA-parity Future You onboarding wizard (steps 0–28b), draft resume, paywall + RevenueCat sandbox, and Maestro E2E — so RN-5 Home can assume a configured coach profile.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M3 (onboarding)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(onboarding)/[step]`  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-4  
**UX spec (authoritative):** [`future-you-onboarding-spec.md`](../../future-you-onboarding-spec.md)  
**PWA reference:** `apps/pwa/src/fitness/OnboardingFlow.tsx`, `onboarding-v2.spec.ts`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

A newly signed-in user completes the full Future You onboarding wizard with PWA-parity branching, draft resume on reload, paywall + trial stub, success reveal, and lands on tabs with `onboardingComplete: true`; Maestro `rn-onboarding-v2.yaml` passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-4` |
| Branch | `epic-rn-4/onboarding-v2` |
| Start story | **RN-4-01** (`rn-4-01-onboarding-wizard-shell.md`) |
| Story files | Create under `implementation-artifacts/rn-4-*.md` (none exist yet) |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (epic close) | `rn-onboarding-v2.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` green |

**Kickoff:** `/bmad-swarm epic-rn-4` or `dev this story rn-4-01-onboarding-wizard-shell.md`

**Swarm order (strict):**

```
RN-4-01 → RN-4-02 → RN-4-03 → RN-4-04 → RN-4-05 → RN-4-06 → RN-4-07
→ RN-4-08 → RN-4-09 → RN-4-10 → RN-4-11 → RN-4-12 → epic-rn-4-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 / RN-1 / RN-2 / RN-3 | **Done** | Foundation, packages, auth, app shell |
| `(onboarding)` route | **Stub** | `index.tsx` — "Onboarding ships in RN-4" |
| `useAppShellGate` | **Live** | Routes signed-in + incomplete → `(onboarding)` |
| `useOnboardingStub` | **Stub** | AsyncStorage `@newyouai/onboardingComplete`; default `true` for Maestro |
| `packages/core/onboarding` | **Partial** | `routing.ts`, `steps.ts`, draft helpers in `sync/` — wizard UI not wired |
| PWA onboarding | **Authoritative** | ~30 internal steps; Future You photo/motivation/paywall/success |
| RevenueCat | **Not wired** | Sandbox configure in RN-4-10; real products in RN-STORE |
| Cloud sync on complete | **Not wired** | Local fitness slice persist; full sync in RN-OFFLINE |

---

## Execute in this order

| # | Story | Story file | Step group | PR target | Status |
|---|-------|------------|------------|-----------|--------|
| 1 | **RN-4-01** | `rn-4-01-onboarding-wizard-shell.md` | Shell | 1 PR | ready-for-dev |
| 2 | **RN-4-02** | `rn-4-02-hook-about-you-ob-00-05.md` | OB-00–05 | 1 PR | ready-for-dev |
| 3 | **RN-4-03** | `rn-4-03-height-weight-goal-ob-06-08.md` | OB-06–08 | 1 PR | ready-for-dev |
| 4 | **RN-4-04** | `rn-4-04-goal-weight-pace-ob-09-10.md` | OB-09–10 | 1 PR | ready-for-dev |
| 5 | **RN-4-05** | `rn-4-05-future-you-photo-motivation-ob-10bc.md` | OB-10b–10c | 1 PR | ready-for-dev |
| 6 | **RN-4-06** | `rn-4-06-training-setup-ob-11-15.md` | OB-11–15 | 1 PR | ready-for-dev |
| 7 | **RN-4-07** | `rn-4-07-split-training-style-ob-16-19.md` | OB-16–19 | 1 PR | ready-for-dev |
| 8 | **RN-4-08** | `rn-4-08-plan-build-fuel-ob-20-22.md` | OB-20–22 | 1 PR | ready-for-dev |
| 9 | **RN-4-09** | `rn-4-09-launch-plan-ready-ob-23-26.md` | OB-23–26 | 1 PR | ready-for-dev |
| 10 | **RN-4-10** | `rn-4-10-paywall-revenuecat-ob-27.md` | OB-27/28 paywall | 1 PR | ready-for-dev |
| 11 | **RN-4-11** | `rn-4-11-future-you-success-ob-28b.md` | OB-28b success | 1 PR | ready-for-dev |
| 12 | **RN-4-12** | `rn-4-12-draft-resume-maestro-e2e.md` | Resume + E2E | 1 PR | ready-for-dev |
| 13 | Retro | `epic-rn-4-retrospective` | — | — | optional |

---

## RN-4-01 — Onboarding wizard shell

**Story file:** `rn-4-01-onboarding-wizard-shell.md`

**Deliverables:**

- Replace `(onboarding)/index.tsx` stub with wizard host + `(onboarding)/[step].tsx` dynamic route
- `OnboardingWizardProvider` — step index, draft state, forward/back using `@newyouai/core/onboarding/routing`
- Wire draft read/write via storage adapter (`packages/core/sync/onboardingDraft.ts` + AsyncStorage)
- Rename/extend `useOnboardingStub` → real `onboardingComplete` from fitness slice (local only until RN-OFFLINE)
- Default `onboardingComplete: false` for **new** installs; document Maestro override env/flag to skip wizard in auth tests
- `testID="onboarding-wizard"` on shell; step screens get `onboarding-step-{n}` pattern

**PWA ref:** `OnboardingShell.tsx`, `OnboardingFlow.tsx` step machine skeleton  
**Core ref:** `packages/core/src/onboarding/routing.ts`, `steps.ts`

**Story gate:** typecheck + core onboarding routing tests green

---

## RN-4-02 — Hook + About you (OB-00–05)

**Story file:** `rn-4-02-hook-about-you-ob-00-05.md`

**Screens:** Welcome (0) · Theme (1) · Gender (2) · DOB (3) · Referral (4) · Units (5)

**Deliverables:**

- RN screen components mirroring PWA copy/layout (NewYou branding — no Gymmy)
- Progress bar phase labels from PWA `onboardingProgressStep`
- Save draft on Continue/Back
- Welcome: no back; theme persists via existing theme hook

**PWA ref:** `OnboardingWelcomeScreen.tsx`, `OnboardingThemePicker.tsx`, pickers in `OnboardingFlow.tsx`

**Story gate:** typecheck; manual walk 0→5

---

## RN-4-03 — Height, weight, primary goal (OB-06–08)

**Story file:** `rn-4-03-height-weight-goal-ob-06-08.md`

**Screens:** Height (6) · Weight (7) · Primary goal (8)

**Deliverables:**

- `OnboardingHeightInput` / `OnboardingWeightInput` RN ports (unit-aware from step 5)
- Primary goal picker (cut / bulk / maintain)
- Branch prep: `nextStepAfterGoal` from core routing

**PWA ref:** `OnboardingHeightInput.tsx`, `OnboardingWeightInput.tsx`, goal picker in flow

**Story gate:** typecheck

---

## RN-4-04 — Goal weight, pace, maintain branch (OB-09–10)

**Story file:** `rn-4-04-goal-weight-pace-ob-09-10.md`

**Screens:** Goal weight (9) · Pace (10) — skipped for maintain

**Deliverables:**

- Maintain path: 8 → 10b (skip 9–10) via `nextStepAfterGoal` / `resolveMaintainOnboardingStep`
- Goal weight reinforcement screen
- Back-lock rules: no back past pace once on activity (wire in shell — full enforcement RN-4-06+)
- Set `futureYou.onboardingGoalLocked` when leaving pace/10c zone

**PWA ref:** `OnboardingGoalWeightReinforcement.tsx`, pace step, `onboardingRouting.ts`

**Story gate:** typecheck + core routing tests

---

## RN-4-05 — Future You photo + motivation (OB-10b–10c)

**Story file:** `rn-4-05-future-you-photo-motivation-ob-10bc.md`

**Screens:** Photo upload (10b) · What's your why? (10c)

**Deliverables:**

- `expo-image-picker` + camera permission flow
- Under-18 blocked UI (no hide — blurred/disabled per spec)
- Skip photo → step 11 without generation job
- Continue from 10c → start Future You generation (port `futureYouGenerateService` / upload via api-client)
- `FutureYouGenerationPill` stub in wizard chrome

**PWA ref:** `OnboardingFutureYouPhoto.tsx`, `OnboardingFutureYouMotivation.tsx`, `futureYouAge.ts`

**Story gate:** typecheck; manual skip + maintain path

---

## RN-4-06 — Training setup part 1 (OB-11–15)

**Story file:** `rn-4-06-training-setup-ob-11-15.md`

**Screens:** Activity (11) · Experience (12) · Equipment (13) · Workout calendar (14–15)

**Deliverables:**

- Activity / experience / equipment pickers (port from PWA pickers)
- `WorkoutWeekCalendarPicker` RN port — 3-day min, Pick for me, 6-day max
- On continue from calendar: `buildWorkoutTemplatesForDays(..., trainingWeekdays)`
- Back locked into goal zone from step 11+

**PWA ref:** `ExperienceLevelPicker.tsx`, `EquipmentSetupPicker.tsx`, calendar in flow

**Story gate:** typecheck + calendar validation manual

---

## RN-4-07 — Split reveal + training style (OB-16–19)

**Story file:** `rn-4-07-split-training-style-ob-16-19.md`

**Screens:** Split reveal (16) · Template review / edit branch (17) · Training style screens (18–19)

**Deliverables:**

- `OnboardingSplitReveal` RN port
- Optional edit branch → template review → return
- Training style selection screens through step 19

**PWA ref:** `OnboardingSplitReveal.tsx`, `OnboardingTemplateReview.tsx`, steps 16–19 in flow

**Story gate:** typecheck

---

## RN-4-08 — Plan build + fuel (OB-20–22)

**Story file:** `rn-4-08-plan-build-fuel-ob-20-22.md`

**Screens:** Plan building animation (20) · Fuel targets / macro edit (21) · Protein reinforcement (22)

**Deliverables:**

- Auto-advance generating animation (~3–4s)
- Macro targets with override + confirm sheet if Future You generating (`onboardingMacroEdit.ts`)
- Protein priority interstitial

**PWA ref:** `OnboardingPlanBuilding.tsx`, `OnboardingDailyFuelPlan.tsx`, `OnboardingReinforcement.tsx`

**Story gate:** typecheck + macro edit confirm manual

---

## RN-4-09 — Launch screens through plan ready (OB-23–26)

**Story file:** `rn-4-09-launch-plan-ready-ob-23-26.md`

**Screens:** Split summary (23) · Notification prompt (24) · Notification picker (25) · Plan ready (26)

**Deliverables:**

- Split summary “Here’s your training plan”
- Notification prompt + preferences picker (UI only — scheduling RN-PUSH)
- `OnboardingPlanReady` — locked Future You teaser; numbers match paywall source of truth
- Generation pill + ready banner when job complete

**PWA ref:** `OnboardingNotificationPrompt.tsx`, `NotificationPreferencesPicker.tsx`, `OnboardingPlanReady.tsx`

**Story gate:** typecheck

---

## RN-4-10 — Paywall + RevenueCat sandbox (OB-27/28)

**Story file:** `rn-4-10-paywall-revenuecat-ob-27.md`

**Screens:** Paywall (step 27 internal / checklist 28)

**Deliverables:**

- `react-native-purchases` configure with sandbox API key (env: `EXPO_PUBLIC_REVENUECAT_*`)
- Paywall UI port — trial CTA, plan summary, blurred Future You hero when applicable
- Stub purchase → `subscriptionTier` local persist (no App Store products yet)
- Plan numbers identical to step 26 (`onboardingPlanSnapshot` / PWA parity)

**PWA ref:** `OnboardingPaywall.tsx`, `onboardingPaywallReveal.ts`, `gymmy-tier-matrix.md` (pricing copy)

**Out of scope:** Real IAP, feature gating, App Store Connect products (RN-STORE)

**Story gate:** typecheck; sandbox purchase logs in dev

---

## RN-4-11 — Future You success + complete onboarding (OB-28b)

**Story file:** `rn-4-11-future-you-success-ob-28b.md`

**Screens:** Future You success reveal (28b)

**Deliverables:**

- Full unblurred Future You hero + confetti
- Continue → set `onboardingComplete: true`, clear onboarding draft, persist local fitness slice
- `useAppShellGate` routes to `(tabs)/home`
- Opt-out path (no photo / under-18): paywall → success without hero or plan-only success

**PWA ref:** `OnboardingFutureYouSuccess.tsx`, `completeOnboardingProfile`, `canAccessFutureYouSuccessScreen`

**Story gate:** typecheck + manual complete → tabs

---

## RN-4-12 — Draft resume + Maestro E2E

**Story file:** `rn-4-12-draft-resume-maestro-e2e.md`

**Deliverables:**

- Draft resume: quit on calendar step → relaunch → same step (port PWA `onboarding-v2.spec.ts` resume case)
- `resolveOnboardingStepOnRestore` wired on wizard mount
- Maestro: `.maestro/rn-onboarding-v2.yaml` — happy path maintain + calendar validation
- npm script `test:e2e:onboarding` in `apps/mobile`
- Maestro env: force onboarding incomplete + optional test account bypass

**PWA ref:** `apps/pwa/e2e/onboarding-v2.spec.ts`, `e2e/helpers/onboarding.ts`

**Story gate:** Maestro green + auth-all + tab-nav regression green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Future You onboarding v2 (PWA parity) | Home/coach UI after landing (RN-5) |
| `(onboarding)/[step]` wizard + draft resume | Fitness cloud sync / hydration (RN-OFFLINE) |
| Local fitness slice persist on complete | Full offline merge / conflict resolution |
| RevenueCat **sandbox** configure + stub purchase | App Store products + real IAP (RN-STORE) |
| Future You photo upload + generation kickoff | Barcode, workout editor, nutrition log (RN-6/7) |
| Notification **preference UI** in onboarding | Push scheduling + APNs token registry (RN-PUSH) |
| Maestro `rn-onboarding-v2.yaml` | Playwright on native |
| NewYou / New You AI copy only | Gymmy / Fitcoach branding |
| Maestro auth/tab regression stays green | Universal links (RN-STORE) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, `apps/mobile/.env` with Supabase + RevenueCat sandbox vars

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — regression + epic gate
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding    # add in RN-4-12
```

**Onboarding testing:** Set `@newyouai/onboardingComplete` to `false` (or Maestro env) so signed-in users enter wizard instead of tabs. Auth flows may need a `MAESTRO_SKIP_ONBOARDING=true` escape hatch documented in `docs/env-matrix.md`.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

### Epic close (RN-4-12)

- [ ] `rn-onboarding-v2.yaml` green (maintain happy path + resume + calendar min-days)
- [ ] `npm run test:e2e:auth-all` green (no auth regression)
- [ ] `npm run test:e2e:tab-nav` green (no shell regression)
- [ ] Manual: new user completes onboarding → tabs with coach profile stub data
- [ ] Manual: maintain path skips goal weight/pace; cut/bulk paths hit Future You zone
- [ ] Manual: under-18 sees blocked Future You UI (not hidden)
- [ ] `epic-rn-4` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-4/onboarding-v2`
2. Run `/bmad-create-story` for RN-4-01 if story file missing, then swarm or `dev this story rn-4-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-4-12: run onboarding + auth-all + tab-nav Maestro sweep + mark epic `done`

---

## Definition of done (epic)

1. Signed-in user with `onboardingComplete: false` enters full wizard (not stub).
2. User completes paywall → success → tabs with `onboardingComplete: true`.
3. Draft resume restores step after app kill/relaunch.
4. PWA-parity branching: maintain skips goal weight/pace; goal-lock prevents back into AI zone.
5. Future You photo optional; under-18 blocked state shown; generation pill during wizard.
6. Plan ready and paywall show identical macro/split numbers.
7. RevenueCat sandbox configured; stub tier stored locally.
8. Maestro onboarding + auth-all + tab-nav green.

---

## Unblocks

| Downstream | Needs from RN-4 |
|------------|-----------------|
| RN-5 Home & coach | Onboarded profile, macros, split, habits templates |
| RN-PUSH | Notification preferences from OB-24/25 |
| RN-OFFLINE | `onboardingComplete` + fitness slice shape to sync |
| RN-STORE | RevenueCat offerings wired to real products |
| RN-PARITY | Onboarding trace row in test matrix |
| PWA feature freeze | Recommend after RN-4 Maestro green (per migration plan) |
