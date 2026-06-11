---
name: RN Migration PRD
phase: 4
status: complete
created: 2026-06-08
supersedes_pwa_prd: false
note: Dedicated RN migration PRD. Fitcoach prd.md remains for PWA maintenance only.
---

# Product Requirements — React Native Migration (New You AI)

**Project:** fitnesstracker  
**Product:** New You AI iOS native app  
**Baseline:** `apps/pwa` (100% in-scope feature parity)  
**Last updated:** 2026-06-08

---

## 1. Overview

Migrate the production PWA to a native iOS app using Expo + React Native while preserving all shipped product functionality. This PRD **supersedes Fitcoach `prd.md` non-goals** for native App Store scope only — PWA PRD remains authoritative for web.

---

## 2. Functional requirements

### FR-M1: Authentication

User can authenticate on iOS with the **same Supabase account** as PWA.

- Email/password sign-up and sign-in
- Google OAuth
- **Apple Sign-In** (enabled on native; disabled in PWA UI today)
- Password change, email update, sign out
- Account deletion via `delete-user` Edge Function
- Session persists across app restarts (SecureStore)

**PWA ref:** `AuthEntryFlow.tsx`, `AuthScreen.tsx`, `fitnessCloudSync.ts`

---

### FR-M2: Onboarding v2

New user completes the **31-step onboarding wizard** with draft resume parity.

- All steps OB-00 through OB-28 including Future You photo (100) and motivation (101)
- Pace/goal weight skips for maintain goal match PWA routing
- Plan building, macro edit, split reveal, notification prefs
- Paywall step (OB-27) with StoreKit/RevenueCat (see FR-M7, NFR-IAP)
- Future You success reveal (OB-28) for pro tier
- Draft persists locally and resumes after app kill

**PWA ref:** `OnboardingFlow.tsx`, `onboardingSteps.ts`, `onboardingRouting.ts`

---

### FR-M3: Home dashboard

User sees personalized home with coach plan, habits, and daily tracking.

- Greeting, coach cards, daily plan, week focus
- Macro rings animation (Reanimated parity)
- Weigh-in sheet
- Sunday check-in entry card (Sundays)
- Mobility/stretch entry from home
- Future You header entry modes per `homeFutureYouModel`

**PWA ref:** `ScreenHome.tsx`, `dailyPlan.ts`, `coachEngine.ts`

---

### FR-M4: Workout

User can log workouts with full session, history, and routine management.

- Idle dashboard: routines, templates, starters
- Active lifting session: sets/reps/weight, rest timer, coach card
- Exercise reorder (drag), swap, notes, set kind picker
- Numeric keypad, autofill from previous sets
- History view, session preview, save as template
- Routine editor, weekly builder
- All confirm sheets (cancel, delete, empty finish, etc.)

**PWA ref:** `ScreenWorkout.tsx`, `workout/*`

---

### FR-M5: Nutrition

User can log food, track macros and water.

- Nutrition dashboard with macro summary
- Log Food modal: tabs All, My Foods, My Meals, Favorites
- USDA/OFF search via `food-search` Edge Function
- Barcode scan
- Manual entry, serving picker, meal editor with ingredients
- Water intake tracking
- Edit/delete logged items with undo toast

**PWA ref:** `ScreenNutrition.tsx`, `LogFoodScreen.tsx`, `foodSearchService.ts`

---

### FR-M6: Progress

User can track body weight, PRs, calendar, and progress photos.

- Weight chart and goal progress
- Workout calendar, PR board, avg calories
- Progress pics gallery
- Sunday check-in history overlay
- Weigh-in sheet

**PWA ref:** `ScreenProgress.tsx`, `weightProgress.ts`, `personalRecordsBoard.ts`

---

### FR-M7: Future You (full MVP)

User can upload photo, generate AI transformation, view gallery, report, delete.

- Gallery, detail, upload views
- Photo capture/pick, consent, upload to `future-you-upload`
- Generation via `future-you-generate`, poll `future-you-status`
- Paywall gating for pro tier
- Report offensive content, delete transformation
- App Store AI disclosure per `ai-transformation-photo-risks.md`

**PWA ref:** `ScreenFutureYou.tsx`, `FutureYouPageContent.tsx`, Future You services

---

### FR-M8: Sunday weekly check-in

User completes 4-step Sunday check-in flow.

- Overview, body weight, coach read, commitments
- History on Progress tab

**PWA ref:** `SundayWeeklyCheckInFlow.tsx`, `sundayCheckIn.ts`

---

### FR-M9: Stretch / mobility

User can start mobility routine from home.

- Mobility preview and active stretch session
- Session sticky header, completion flow

**PWA ref:** `MobilityRoutineFlow`, `stretch/*`

---

### FR-M10: Settings

User can manage all settings panels (13 + sub-layers).

- Hub: Account, Preferences, Goals, Training, Habits, Legal, Sign out, Delete account
- Panels: you, change-password, account, appearance, units, fuel-targets, hydration, goal, reminders, rest-timer, equipment, habits, program
- Goal save/discard confirms, habit delete confirms

**PWA ref:** `ScreenSettings.tsx`

---

### FR-M11: Cloud sync

User data syncs across devices via Supabase `fitness_user_data`.

- Local persist slice + debounced push
- Pull on sign-in, merge conflict resolution matches PWA
- Same JSON schema (`fitcoach:persist:v1` equivalent key on native)

**PWA ref:** `fitnessCloudSync.ts`, `mergePersistedFitnessSlices.ts`

---

### FR-M12: Push notifications

User receives context-aware reminders matching PWA copy.

- Permission prompt during onboarding (OB-24/25)
- Scheduled local notifications per `notificationScheduler.ts` logic
- Settings reminders panel controls

**PWA ref:** `notificationScheduler.ts`, `notificationPermission.ts`

---

### FR-M13: App Store ship

App is ready for TestFlight and App Store submission.

- Privacy manifest (`PrivacyInfo.xcprivacy`)
- Future You AI disclosures
- TestFlight internal → external → production
- App Store metadata, screenshots
- IAP products configured and sandbox-tested

---

## 3. Non-functional requirements

### NFR-1: Performance
- Cold start < 3s on iPhone 12+
- List scroll 60fps on workout history and food log

### NFR-2: Accessibility
- VoiceOver labels on all interactive elements
- Dynamic Type support on body text
- Touch targets ≥ 44pt

### NFR-3: Security
- No secrets in repo; env vars only
- Auth tokens in SecureStore
- Certificate pinning not required MVP

### NFR-4: Testing
- 100% FR-M* mapped in trace matrix
- Shared logic unit-tested in `packages/*` before UI port
- Maestro E2E on auth, onboarding, workout, nutrition, sync, Future You upload

### NFR-5: App Store compliance
- Guideline 3.1.1 IAP for digital subscriptions
- Privacy nutrition labels
- AI-generated imagery disclosures

### NFR-IAP
- RevenueCat entitlement `pro` maps to `subscriptionTier: "pro"`
- Restore purchases in Account settings
- Sandbox testing before production

---

## 4. Explicit deferrals

| Item | Rationale | PO sign-off |
|------|-----------|-------------|
| Android / Google Play | Out of MVP scope | ✅ Confirmed |
| PWA sunsetting | Stay live until parity gate | ✅ Default |
| Backend schema redesign | Adapter-only changes | ✅ Confirmed |
| Marketing/admin changes | Out of scope | ✅ Confirmed |
| Pixel-perfect animation parity | Reanimated approximates framer-motion | Accepted NFR |
| Server-side push (APNs token registry) | Optional post-MVP; local notifications first | Deferred to RN-PUSH |

---

## 5. Supersession note

Fitcoach [`prd.md`](prd.md) lists "Native App Store wrapper" and "IAP" as **non-goals**. This document **explicitly supersedes those non-goals for the RN migration track only.** PWA development continues under Fitcoach PRD until feature freeze.
