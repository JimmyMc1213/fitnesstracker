---
name: RN Migration Traceability Matrix
phase: 6
created: 2026-06-08
coverage_rule: 100% FR-M mapped
---

# Traceability Matrix — PWA → FR → Epic → Test

| FR | PWA inventory IDs | Epic | Unit tests | E2E (Maestro) |
|----|-------------------|------|------------|---------------|
| FR-M1 Auth | S-02, S-03 | RN-2 | oauthReturnCapture.test.ts | rn-auth-gate.yaml |
| FR-M2 Onboarding | OB-00..28 | RN-4 | onboardingRouting.test.ts, onboardingDraft.test.ts | rn-onboarding-v2.yaml, rn-onboarding-fy.yaml |
| FR-M3 Home | T-01, H-* | RN-5 | coachEngine.test.ts, dailyPlan.test.ts | rn-coach-nutrition.yaml |
| FR-M4 Workout | T-02, W-* | RN-6 | workoutAutofill.test.ts, workoutTemplates.test.ts | rn-workout-session.yaml |
| FR-M5 Nutrition | T-03, N-* | RN-7 | foodSearchService.test.ts, nutritionLog.test.ts | rn-nutrition-log.yaml |
| FR-M6 Progress | T-04, P-* | RN-8 | weightProgress.test.ts, personalRecordsBoard.test.ts | (UAT manual) |
| FR-M7 Future You | T-05, FY-* | RN-9 | futureYouPageModel.test.ts, futureYouUploadGuards.test.ts | rn-future-you-upload.yaml |
| FR-M8 Sunday check-in | S-05, SC-* | RN-8 | sundayCheckInHistory.test.ts | (UAT manual) |
| FR-M9 Stretch | T-07, H-02 | RN-5 | mobilityHabit.test.ts | (UAT manual) |
| FR-M10 Settings | T-06, ST-* | RN-10 | goalSettings.test.ts, unitPreferences.test.ts | (UAT manual) |
| FR-M11 Sync | cross-cutting | RN-OFFLINE | mergePersistedFitnessSlices.test.ts | rn-sync-signin.yaml |
| FR-M12 Push | OB-24/25, ST-09 | RN-PUSH | notificationScheduler.test.ts | (UAT manual) |
| FR-M13 App Store | — | RN-STORE | — | TestFlight UAT |

**Coverage:** 13/13 FR-M mapped ✅

## Gap notes

| Gap | Mitigation |
|-----|------------|
| Progress, Settings, Sunday E2E not in PWA Playwright | Add Maestro flows in RN-8, RN-10 or UAT checklist |
| IAP sandbox | RevenueCat sandbox in RN-4 paywall story + RN-STORE |

## Story → test mapping (RN-0 sample)

| Story | Test |
|-------|------|
| RN-0-01 | turbo typecheck |
| RN-0-03 | rn-smoke.yaml |
| RN-2-01 | rn-auth-gate.yaml |
| RN-6-03 | rn-workout-session.yaml |
