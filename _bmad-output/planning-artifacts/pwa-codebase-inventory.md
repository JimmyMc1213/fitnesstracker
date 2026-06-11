---
name: PWA Codebase Inventory
phase: 1
status: complete
stepsCompleted:
  - document-project-deep-scan-apps-pwa
created: 2026-06-08
scope: apps/pwa (RN migration parity baseline)
---

# PWA Codebase Inventory — RN Migration

**Scope:** `apps/pwa/` only  
**Purpose:** Phase 1 gate for PWA → React Native migration planning  
**Parity rule:** PWA behavior is authoritative until RN passes parity gate

---

## 1.1 Technical stack

| Layer | Technology | Key files |
|-------|------------|-----------|
| Framework | React 18.3 | `src/main.tsx`, `src/App.tsx` |
| Build | Vite 5 | `vite.config.ts` |
| Language | TypeScript 5.6 | `tsconfig*.json` |
| Routing | **None (tab state machine)** | `FitnessApp.tsx`, `types.ts` (`TabId`) |
| Shell gate | Auth → onboarding → app | `appShellRouting.ts` |
| State | `useState` + Context | `FitnessSyncContext.tsx` |
| Persistence | `localStorage` key `fitcoach:persist:v1` | `persistFitnessSlice.ts` |
| Cloud sync | Supabase JSONB merge | `fitnessCloudSync.ts`, `syncMeta.ts` |
| Styling | Global CSS ~7.4k lines | `src/index.css` — **0% portable to RN** |
| Animation | Framer Motion | `motion.tsx` |
| UI primitives | `@ark-ui/react`, `@tabler/icons-react` | `components/ui/` |
| Drag-and-drop | `@dnd-kit/*` | workout exercise reorder |
| Barcode | `@zxing/browser` | `BarcodeScanner.tsx` |
| Auth | Supabase GoTrue | `supabaseClient.ts`, `fitnessCloudSync.ts` |
| PWA | Manifest + notification SW only | `site.webmanifest`, `notification-sw.js` |
| Offline | Local-first persist + cloud merge | **Not offline-first precache** |
| Deploy | Vercel | `vercel.json` |
| Tests | Vitest 3 + Playwright 1.60 | `vite.config.ts`, `e2e/` |

### URL / query hooks (only routing-like behavior)

| Param | Purpose | File |
|-------|---------|------|
| `?signIn=1` | Post-OAuth cloud restore | `FitnessApp.tsx` |
| `#access_token=...` | OAuth return | `oauthReturnCapture.ts` |
| `?previewOnboarding=1` | Dev only | `devPreviewOnboarding.ts` |

---

## 1.2 Feature & screen map

### Shell & auth

| ID | Screen/Flow | Route/Path | Key components | API deps | Offline? | PWA-only APIs? | RN notes |
|----|-------------|------------|----------------|----------|----------|----------------|----------|
| S-01 | Boot splash | shell:loading | `AppSplashScreen` | — | — | inline HTML splash | Native splash screen |
| S-02 | Auth welcome | shell:auth | `AuthEntryFlow`, `OnboardingWelcomeScreen` | Supabase Auth | local draft | — | Expo Router auth stack |
| S-03 | Sign in / sign up | shell:auth | `AuthScreen` | email/password, OAuth | — | OAuth hash | `expo-auth-session`; enable Apple |
| S-04 | Onboarding wizard | overlay on app | `OnboardingFlow` | draft persist | localStorage | — | Nested stack 31 steps |
| S-05 | Sunday check-in | global overlay | `SundayWeeklyCheckInFlow` | coach logic | local | — | Modal stack 4 steps |
| S-06 | Workout summary | global sheet | `WorkoutSummarySheet` | — | local | — | Bottom sheet |

### Main tabs

| ID | Screen/Flow | Route/Path | Key components | API deps | Offline? | PWA-only? | RN notes |
|----|-------------|------------|----------------|----------|----------|-----------|----------|
| T-01 | Home | tab:home | `ScreenHome` | sync | local+sync | — | `(tabs)/home` |
| T-02 | Workout | tab:workout | `ScreenWorkout` | — | local | DnD | `(tabs)/workout` |
| T-03 | Nutrition | tab:nutrition | `ScreenNutrition` | food-search | local | camera | `(tabs)/nutrition` |
| T-04 | Progress | tab:progress | `ScreenProgress` | — | local | — | `(tabs)/progress` |
| T-05 | Future You | tab:future_you | `ScreenFutureYou` | 5 edge fns | sync | camera | Floating tab button |
| T-06 | Settings | tab:settings | `ScreenSettings` | sync, delete-user | local+sync | — | `(tabs)/settings` |
| T-07 | Stretch | tab:stretch → home | mobility preview | — | local | — | Deep link to home mobility |

### Onboarding steps (31)

| ID | Step | Screen key | Component | API | Offline? | PWA-only? | RN notes |
|----|------|------------|-----------|-----|----------|-----------|----------|
| OB-00 | 0 | welcome | `OnboardingWelcomeScreen` | — | draft | — | |
| OB-01 | 1 | theme | `OnboardingThemePicker` | — | draft | — | |
| OB-02 | 2 | gender | `OnboardingPillStack` | — | draft | — | |
| OB-03 | 3 | dob | `DateOfBirthWheelPicker` | — | draft | — | Native date picker |
| OB-04 | 4 | referral | `ReferralSourcePicker` | — | draft | — | |
| OB-05 | 5 | units | `UnitPreferencePicker` | — | draft | — | |
| OB-06 | 6 | height | `OnboardingHeightInput` | — | draft | — | |
| OB-07 | 7 | weight | `WeightRulerPicker` | — | draft | — | Custom ruler UI |
| OB-08 | 8 | goal | `OnboardingPillStack` | — | draft | — | |
| OB-09 | 9 | goal weight | `WeightRulerPicker` + reinforcement | — | draft | — | Sub-step 9-reinforcement |
| OB-10 | 10 | pace | `OnboardingPillStack` | — | draft | — | Skip if maintain |
| OB-100 | 100 | FY photo | `OnboardingFutureYouPhoto` | future-you-upload | draft | camera, File API | Full MVP |
| OB-101 | 101 | FY motivation | `OnboardingFutureYouMotivation` | future-you-generate | draft | — | |
| OB-11 | 11 | activity | `OnboardingPillStack` | — | draft | — | |
| OB-12 | 12 | experience | `ExperienceLevelPicker` | — | draft | — | |
| OB-13 | 13 | equipment | `EquipmentSetupPicker` | — | draft | — | |
| OB-14 | 14 | session length | `OnboardingPillStack` | — | draft | — | |
| OB-15 | 15 | training days | `WorkoutWeekCalendarPicker` | — | draft | — | |
| OB-16 | 16 | schedule reinforcement | `OnboardingGoalWeightReinforcement` | — | draft | — | |
| OB-17 | 17 | barriers | `OnboardingIconOptionPicker` | — | draft | — | |
| OB-18 | 18 | dietary | `OnboardingIconOptionPicker` | — | draft | — | |
| OB-19 | 19 | training style | `OnboardingIconOptionPicker` | — | draft | — | |
| OB-20 | 20 | plan building | `OnboardingPlanBuilding` | — | draft | framer-motion | Reanimated |
| OB-21 | 21 | fuel targets | `OnboardingDailyFuelPlan` | — | draft | — | Macro edit sheet |
| OB-22 | 22 | protein reinforcement | `OnboardingGoalWeightReinforcement` | — | draft | — | |
| OB-23 | 23 | split reveal | `OnboardingSplitReveal` | — | draft | — | |
| OB-24 | 24 | notification prompt | `OnboardingNotificationPrompt` | — | draft | Notification API | expo-notifications |
| OB-25 | 25 | notification prefs | `NotificationPreferencesPicker` | — | draft | — | |
| OB-26 | 26 | plan ready | `OnboardingPlanReady` | — | draft | — | |
| OB-27 | 27 | paywall | `OnboardingPaywall` | — | draft | — | IAP TBD Phase 2 |
| OB-28 | 28 | FY success | `OnboardingFutureYouSuccess` | future-you-status | draft | — | Pro tier only |

### Home tab overlays

| ID | Screen/Flow | Parent | Key components | API | Offline? | PWA-only? | RN notes |
|----|-------------|--------|----------------|-----|----------|-----------|----------|
| H-01 | Weigh-in sheet | home | `WeighInSheet` | — | local | — | |
| H-02 | Mobility preview | home | `MobilityRoutineFlow` | — | local | — | |
| H-03 | Active stretch session | home | `stretch/*` | — | local | — | |
| H-04 | Sunday entry card | home | `HomeSundayCheckInCard` | — | local | — | |
| H-05 | Coach plan cards | home | `ScreenHome` sections | coach engine | local | — | |
| H-06 | Daily habits | home | habit templates | — | local | — | |
| H-07 | Macro rings | home | `useAnimatedMacroProgress` | — | local | CSS animation | Reanimated |

### Nutrition tab + Log Food

| ID | Screen/Flow | Parent | Key components | API | Offline? | PWA-only? | RN notes |
|----|-------------|--------|----------------|-----|----------|-----------|----------|
| N-01 | Nutrition dashboard | nutrition | `ScreenNutrition` | — | local | — | |
| N-02 | Log Food overlay | nutrition | `LogFoodScreen` | food-search | local | — | Modal |
| N-03 | Tab: All | log-food | search + recent | food-search | — | — | |
| N-04 | Tab: My foods | log-food | saved foods | — | local | — | |
| N-05 | Tab: My meals | log-food | meal templates | — | local | — | |
| N-06 | Tab: Favorites | log-food | starred presets | — | local | — | |
| N-07 | Serving picker | log-food | serving picker | — | local | — | |
| N-08 | Manual entry | log-food | manual macros | — | local | — | |
| N-09 | Meal editor | log-food | meal draft | — | local | — | |
| N-10 | Barcode scanner | log-food | `BarcodeScanner` | food-search | — | getUserMedia, zxing | expo-camera |
| N-11 | Water tracker | nutrition | `waterIntake.ts` UI | — | local | — | |

### Workout tab overlays (selected — 25+ total)

| ID | Screen/Flow | Phase | Key components | API | Offline? | PWA-only? | RN notes |
|----|-------------|-------|----------------|-----|----------|-----------|----------|
| W-01 | Idle dashboard | idle | `WorkoutIdleDashboard` | — | local | — | |
| W-02 | Active session | lifting | exercise cards, keypad | — | local | DnD | draggable-flatlist |
| W-03 | Routine editor | idle | `WorkoutRoutineEditor` | — | local | DnD | Full screen |
| W-04 | Weekly builder | idle | `WeeklyRoutineBuilderFlow` | — | local | — | |
| W-05 | History | idle | `ScreenWorkoutHistory` | — | local | — | Overlay |
| W-06 | Rest timer | lifting | `RestTimerSheet` | — | local | — | Background timer |
| W-07 | Exercise swap | lifting | `ExerciseSwapSheet` | — | local | — | |
| W-08 | Numeric keypad | lifting | `WorkoutNumericKeypad` | — | local | — | |
| W-09 | Confirm sheets | both | 10+ confirm sheets | — | local | bottom sheets | RN ActionSheet/Sheet |

### Progress tab overlays

| ID | Screen/Flow | Parent | Key components | API | Offline? | PWA-only? | RN notes |
|----|-------------|--------|----------------|-----|----------|-----------|----------|
| P-01 | Weight chart | progress | `ScreenProgress` | — | local | — | |
| P-02 | PR board | progress | `personalRecordsBoard` | — | local | — | |
| P-03 | Workout calendar | progress | `trainingCalendar` | — | local | — | |
| P-04 | Progress pics gallery | progress | `ScreenProgressPicsGallery` | — | local | photo picker | |
| P-05 | Sunday history | progress | `ScreenSundayCheckInHistory` | — | local | — | |
| P-06 | Weigh-in sheet | progress | `WeighInSheet` | — | local | — | |

### Future You tab

| ID | Screen/Flow | View | Key components | API | Offline? | PWA-only? | RN notes |
|----|-------------|------|----------------|-----|----------|-----------|----------|
| FY-01 | Gallery | gallery | `FutureYouGalleryView` | — | sync | — | |
| FY-02 | Detail | detail | `FutureYouDetailView` | future-you-status | sync | — | |
| FY-03 | Upload flow | upload | `FutureYouNewPicView` | upload+generate | — | camera, File API | App Store risk |
| FY-04 | Fullscreen viewer | overlay | `FutureYouFullscreenViewer` | — | — | — | |
| FY-05 | Replace dialog | overlay | `FutureYouReplaceDialog` | future-you-delete | — | — | |
| FY-06 | Report offensive | detail | report flow | future-you-report | — | — | |

### Settings panels

| ID | Panel ID | Title | Renderer | API | Offline? | RN notes |
|----|----------|-------|----------|-----|----------|----------|
| ST-00 | null | Settings hub | `renderHub()` | — | local | Stack root |
| ST-01 | you | You | profile | sync | local | |
| ST-02 | you:change-password | Change password | password form | Supabase Auth | — | |
| ST-03 | account | Account | email, sync, delete | delete-user | sync | |
| ST-04 | appearance | Appearance | theme | — | local | |
| ST-05 | units | Units | unit prefs | — | local | |
| ST-06 | fuel-targets | Fuel targets | macros | — | local | |
| ST-07 | hydration | Hydration | water target | — | local | |
| ST-08 | goal | Goal | goal settings | — | local | |
| ST-09 | reminders | Reminders | notification prefs | — | local | expo-notifications |
| ST-10 | rest-timer | Rest timer | duration | — | local | |
| ST-11 | equipment | Equipment | equipment setup | — | local | |
| ST-12 | habits | Habits | habit templates | — | local | |
| ST-13 | program | Program | training program | — | local | |

### Sunday check-in steps

| ID | Step | Component | RN notes |
|----|------|-----------|----------|
| SC-01 | 0 | `StepOverview` | Week summary |
| SC-02 | 1 | `StepBodyWeight` | Weight trend |
| SC-03 | 2 | `StepCoachRead` | Coach narrative |
| SC-04 | 3 | `StepCommitments` | Week focus lock-in |

**Screen map total:** 90+ discrete flows (gate: ✅ complete)

---

## 1.3 Component & module taxonomy

### Shareable to `packages/*` (pure TS, no DOM)

| Domain | Example files | Test files | Est. shareability |
|--------|---------------|------------|-------------------|
| Coach engine | `coach.ts`, `coachEngine.ts`, `dailyPlan.ts` | 5+ | High |
| Workout logic | `workoutAutofill.ts`, `workoutTemplates.ts`, `workoutSplitByDays.ts` | 15+ | High |
| Nutrition math | `nutritionCalculator.ts`, `nutritionLog.ts`, `foodMeasurements.ts` | 8+ | High |
| Onboarding routing | `onboardingRouting.ts`, `onboardingDraft.ts`, `onboardingProfile.ts` | 10+ | High |
| Sync merge | `mergePersistedFitnessSlices.ts`, `fitnessPayloadGuard.ts` | 3+ | High (adapter for storage) |
| Future You models | `futureYou*Model.ts`, `futureYou*Guards.ts`, `futureYou*Service.ts` | 25+ | High (services need fetch adapter) |
| Units / goals | `unitPreferences.ts`, `goalSettings.ts`, `macroLimits.ts` | 5+ | High |

**Rule:** No `window`, `document`, `localStorage`, or React imports in shared packages.

### Platform-specific (RN rebuild required)

| Category | Count | Notes |
|----------|-------|-------|
| Screen components | 7 tabs + onboarding | All `screens/*.tsx` |
| Sheet/overlay components | 40+ | Bottom sheets, full-screen overlays |
| Workout UI | 20+ | `workout/*.tsx` |
| Stretch UI | 5+ | `stretch/*.tsx` |
| Global CSS | 1 file ~7.4k lines | Rebuild with NativeWind or StyleSheet |

### Web-only APIs to replace

| API | PWA usage | RN replacement |
|-----|-----------|----------------|
| `localStorage` | persist slice, onboarding draft | AsyncStorage + SecureStore |
| `getUserMedia` | barcode, Future You photo | expo-camera / image-picker |
| `Notification` | reminders | expo-notifications + APNs |
| `serviceWorker` | notification-sw.js | Remove; native push |
| CSS variables / classes | entire UI | NativeWind or StyleSheet |
| `@dnd-kit` | exercise reorder | draggable-flatlist |
| `framer-motion` | transitions | Reanimated |
| File API / data URLs | photo upload | expo-file-system |

---

## 1.4 Test inventory

### Vitest — 97 files

Location: `apps/pwa/src/fitness/**/*.test.ts`  
Environment: node (inline in `vite.config.ts`)

| Category | Count | RN action |
|----------|-------|-----------|
| Coach / daily plan | 5 | Port to `packages/core` |
| Workout logic | 15 | Port to `packages/core` |
| Nutrition | 8 | Port to `packages/core` |
| Onboarding | 10 | Port to `packages/core` |
| Future You | 25 | Port to `packages/core` + `api-client` |
| Sync / auth guards | 5 | Port with storage adapter |
| Misc (units, habits, etc.) | 29 | Port selectively |

### Playwright E2E — 7 specs

| Spec | Critical path | RN Maestro equivalent |
|------|---------------|----------------------|
| `auth-gate.spec.ts` | Auth shell | `rn-auth-gate.yaml` |
| `onboarding-v2.spec.ts` | Full onboarding | `rn-onboarding-v2.yaml` |
| `onboarding-plan-consistency.spec.ts` | Plan data | unit + partial E2E |
| `onboarding-paywall-future-you.spec.ts` | Paywall + FY | `rn-onboarding-fy.yaml` |
| `nutrition-log-food.spec.ts` | Log food | `rn-nutrition-log.yaml` |
| `workout-session-smoke.spec.ts` | Workout session | `rn-workout-session.yaml` |
| `coach-task-nutrition.spec.ts` | Coach → nutrition | `rn-coach-nutrition.yaml` |

### Manual QA

- `_bmad-output/qa-audit-full-app-report.md` — source for parity checklist items

### Test gaps for RN

| Gap | Priority |
|-----|----------|
| No E2E for Sunday check-in | Medium |
| No E2E for settings/account delete | High |
| No E2E for Future You gallery (post-onboarding) | High |
| No Maestro harness yet | Blocking RN-0 |
| No coverage % configured | Low |

---

## 1.5 Risk register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R-01 | No URL routing — deep links | High | Universal links encode tab/panel/step in Phase 3 architecture |
| R-02 | Future You AI App Store rejection | High | `ai-transformation-photo-risks.md`; privacy manifest; user consent |
| R-03 | `@zxing/browser` barcode | Medium | expo-camera + native barcode |
| R-04 | `@dnd-kit` exercise reorder | Medium | react-native-draggable-flatlist |
| R-05 | 7.4k CSS rebuild effort | High | NativeWind tokens from `theme.ts`; vertical slices |
| R-06 | Web push → APNs | Medium | expo-notifications; may need push token Edge Function |
| R-07 | IAP / StoreKit undecided | Medium | Phase 2 research; default match PWA stub |
| R-08 | Apple OAuth disabled in PWA | Medium | Enable on native; Supabase already wired |
| R-09 | localStorage → secure storage | Medium | Storage adapter in RN-1; migrate persist key |
| R-10 | 31-step onboarding complexity | High | Epic RN-4 largest; resume draft parity critical |
| R-11 | Parallel FTI Sprint 11 | Low | Separate RN backlog from PWA sprint |
| R-12 | Fitcoach PRD conflicts with RN scope | Medium | Separate `prd-rn-migration.md` |

---

## API layer summary

### Supabase Edge Functions (reusable as-is)

| Function | Service file | Purpose |
|----------|--------------|---------|
| `food-search` | `foodSearchService.ts` | USDA + OFF merge |
| `future-you-upload` | `futureYouUploadService.ts` | Photo upload |
| `future-you-generate` | `futureYouGenerateService.ts` | Queue AI job |
| `future-you-status` | `futureYouPollService.ts` | Poll job (REST GET) |
| `future-you-report` | `futureYouReportService.ts` | Report content |
| `future-you-delete` | `futureYouDeleteService.ts` | Delete transformation |
| `delete-user` | `fitnessCloudSync.ts` | Account deletion |

### Direct Supabase

| Table | Usage |
|-------|-------|
| `fitness_user_data` | JSONB cloud sync blob |
| `community_foods` | Barcode contributions |
| `future_you_jobs` | AI generation jobs |
| Storage buckets | Future You photos |

---

## Phase 1 gate

| Criterion | Status |
|-----------|--------|
| Feature map covers all PWA routes/flows | ✅ 90+ flows documented |
| Risk register complete | ✅ 12 risks |
| Test inventory complete | ✅ 97 Vitest + 7 Playwright |
| Component taxonomy complete | ✅ |
| Technical stack validated | ✅ |

**Gate passed.** Proceed to Phase 2: `/bmad-technical-research`
