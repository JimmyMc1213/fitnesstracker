---
name: RN Migration Epics & Stories
phase: 5
status: complete
created: 2026-06-08
story_granularity: 1-3 dev days solo + AI
---

# Epics & Stories — PWA → React Native Migration

**Inputs:** `prd-rn-migration.md`, `architecture-rn-migration.md`, `pwa-codebase-inventory.md`  
**Naming:** Stories as `RN-{epic}-{nn}` → files `rn-{epic}-{nn}.md`

---

## Epic overview

| Epic | Title | Stories | Size |
|------|-------|---------|------|
| RN-0 | Migration foundation & dev environment | 7 | M |
| RN-1 | Shared platform layer | 9 | L |
| RN-2 | Authentication & session | 5 | M |
| RN-3 | Core navigation & app shell | 6 | M |
| RN-4 | Onboarding v2 | 12 | L |
| RN-5 | Home & coach | 7 | M |
| RN-6 | Workout domain | 11 | L |
| RN-7 | Nutrition OS | 9 | L |
| RN-8 | Progress & check-ins | 7 | M |
| RN-9 | Future You | 9 | L |
| RN-10 | Settings & account | 6 | M |
| RN-PUSH | Push notifications | 4 | S |
| RN-OFFLINE | Persist & cloud sync adapter | 5 | M |
| RN-STORE | App Store ship | 5 | M |
| RN-PARITY | Parity verification & cutover | 5 | M |

**Total stories:** ~107

---

## RN-0: Migration foundation & dev environment

**Purpose:** Expo scaffold, monorepo wiring, CI, dev client, EAS, Maestro init.

### RN-0-01: Init Expo app in monorepo

**As a** developer **I want** `apps/mobile` scaffolded in Turborepo **so that** native work has a home.

**Acceptance criteria:**
- Given the monorepo root, when I run `npm run dev --workspace=@newyouai/mobile`, then Expo dev client starts
- Given `turbo.json`, when CI runs `build`, then mobile typecheck is included

**PWA ref:** N/A (greenfield)  
**Tasks:** [ ] `npx create-expo-app` in apps/mobile [ ] Wire package.json `@newyouai/mobile` [ ] Add turbo tasks [ ] `.gitignore` native dirs  
**Tests:** typecheck passes  
**Deps:** none

---

### RN-0-02: EAS profiles and dev client

**As a** developer **I want** EAS Build profiles **so that** I can run on simulator and TestFlight.

**Acceptance criteria:**
- Given `eas.json`, when I run `eas build --profile development --platform ios`, then dev client builds
- Profiles: development, preview, production per `docs/eas-ios.md`

**Tasks:** [ ] eas.json [ ] app.config.ts bundle ID [ ] Apple team linked  
**Tests:** build succeeds on EAS  
**Deps:** RN-0-01

---

### RN-0-03: Maestro harness init

**As a** developer **I want** Maestro configured **so that** E2E tests can run on iOS simulator.

**Acceptance criteria:**
- Given dev client on simulator, when I run `maestro test .maestro/smoke.yaml`, then app launches

**Tasks:** [ ] Install Maestro CLI docs in README [ ] `.maestro/smoke.yaml` [ ] e2e-test EAS profile  
**Tests:** smoke flow passes  
**Deps:** RN-0-02

---

### RN-0-04 through RN-0-07 (summary)

| ID | Title |
|----|-------|
| RN-0-04 | Env matrix: `EXPO_PUBLIC_SUPABASE_*` in docs/env-matrix.md |
| RN-0-05 | CI: add mobile typecheck to GitHub Actions |
| RN-0-06 | NativeWind + tokens scaffold from theme.ts |
| RN-0-07 | Expo Router root layout + splash screen |

---

## RN-1: Shared platform layer

**Purpose:** Extract `packages/types`, `api-client`, `core` from PWA.

### RN-1-01: Extract types package

**PWA ref:** `apps/pwa/src/fitness/types.ts`  
**Tests:** existing type-consuming tests compile  
**Deps:** RN-0-01

### RN-1-02: Storage adapter interface + AsyncStorage impl

**PWA ref:** `persistFitnessSlice.ts`  
**Tests:** adapter unit tests  
**Deps:** RN-1-01

### RN-1-03 through RN-1-09 (summary)

| ID | Title | PWA ref |
|----|-------|---------|
| RN-1-03 | Extract mergePersistedFitnessSlices + tests | `mergePersistedFitnessSlices.ts` |
| RN-1-04 | Extract onboarding routing + tests | `onboardingRouting.ts` |
| RN-1-05 | Extract coach engine + tests | `coachEngine.ts`, `dailyPlan.ts` |
| RN-1-06 | Extract api-client: Supabase factory | `supabaseClient.ts` |
| RN-1-07 | Extract api-client: Edge Function invoke | `foodSearchService.ts`, `futureYou*Service.ts` |
| RN-1-08 | PWA imports from packages (no behavior change) | apps/pwa |
| RN-1-09 | Vitest workspace config for packages/* | turbo test |

---

## RN-2: Authentication & session

### RN-2-01: Supabase client with SecureStore

**PWA ref:** `supabaseClient.ts`, `fitnessCloudSync.ts`  
**Maestro:** `rn-auth-gate.yaml`  
**Given** signed out, **When** I sign in with email/password, **Then** I reach app shell (matches PWA `auth-gate.spec.ts`)

### RN-2-02 through RN-2-05 (summary)

| ID | Title |
|----|-------|
| RN-2-02 | Email sign-up flow |
| RN-2-03 | Google OAuth via expo-auth-session |
| RN-2-04 | Apple Sign-In |
| RN-2-05 | Sign out, session refresh, OAuth deep link |

---

## RN-3: Core navigation & app shell

### RN-3-01: Tab bar with Future You FAB

**PWA ref:** `FitnessApp.tsx` tab bar  
**Maestro:** tab navigation smoke

### RN-3-02 through RN-3-06 (summary)

| ID | Title |
|----|-------|
| RN-3-02 | appShellRouting parity (loading/auth/app) |
| RN-3-03 | Modal routes: log-food, sunday-check-in shells |
| RN-3-04 | Settings stack navigation |
| RN-3-05 | Error/loading boundaries |
| RN-3-06 | Deep link handler stub |

---

## RN-4: Onboarding v2 (12 stories)

Stories RN-4-01..12 cover step groups:
- OB-00–05 (welcome → units)
- OB-06–10 (height → pace + FY photo/motivation)
- OB-11–19 (activity → training style)
- OB-20–26 (plan build → plan ready)
- OB-27 paywall + RevenueCat sandbox
- OB-28 success reveal
- Draft resume E2E

**Maestro:** `rn-onboarding-v2.yaml` (port from `onboarding-v2.spec.ts`)  
**Deps:** RN-2, RN-3, RN-1-04

---

## RN-5: Home & coach (7 stories)

**PWA ref:** `ScreenHome.tsx`, coach cards, macro rings, weigh-in, Sunday card  
**Maestro:** `rn-coach-nutrition.yaml` partial

---

## RN-6: Workout domain (11 stories)

**PWA ref:** `ScreenWorkout.tsx`, all workout/* sheets  
**Maestro:** `rn-workout-session.yaml` (port `workout-session-smoke.spec.ts`)  
**Key:** RN-6-04 draggable exercise reorder

---

## RN-7: Nutrition OS (9 stories)

**PWA ref:** `LogFoodScreen.tsx`, `foodSearchService.ts`, `BarcodeScanner.tsx`  
**Maestro:** `rn-nutrition-log.yaml`

---

## RN-8: Progress & check-ins (7 stories)

**PWA ref:** `ScreenProgress.tsx`, `SundayWeeklyCheckInFlow.tsx`

---

## RN-9: Future You (9 stories)

**PWA ref:** `FutureYouPageContent.tsx`, all future-you services  
**Maestro:** Future You upload flow  
**Risk:** App Store AI disclosure UI

---

## RN-10: Settings & account (6 stories)

**PWA ref:** `ScreenSettings.tsx` all 13 panels

---

## RN-PUSH: Push notifications (4 stories)

**PWA ref:** `notificationScheduler.ts`, OB-24/25

---

## RN-OFFLINE: Persist & sync (5 stories)

**PWA ref:** `fitnessCloudSync.ts`, `persistFitnessSlice.ts`  
**Maestro:** sync smoke after sign-in

---

## RN-STORE: App Store ship (5 stories)

- Privacy manifest
- App Store Connect products (IAP)
- TestFlight internal/external
- Screenshots + metadata
- Review checklist + Future You disclosures

---

## RN-PARITY: Parity verification (5 stories)

- Trace matrix 100% verification
- UAT checklist execution
- Performance/a11y audit
- Go/no-go report
- PWA freeze announcement doc

---

## Story template (all stories follow)

```
- User story (As a / I want / So that)
- Acceptance criteria (Given/When/Then) referencing PWA
- PWA reference: route, component paths
- Tasks/subtasks checkboxes
- Test tasks: Vitest files; Maestro flow name; testIDs
- Dependencies
```

**Next:** Run `/bmad-create-story` for **RN-0-01** to validate template, then `/bmad-dev-story` to implement.
