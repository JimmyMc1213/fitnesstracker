---
name: RN-4-02 Hook + About you OB-00-05
epic: RN-4
story: 02
status: done
swarm_order: 2
swarm_branch: epic-rn-4/onboarding-v2
baseline_commit: e2aaf9504951b4dfb312ab82c69a9c4bf1bcf412
---

# Story 4.02: Hook + About you (OB-00–05)

Status: done

## Story

**As a** new user starting onboarding  
**I want** welcome, theme, gender, DOB, referral, and units screens matching the PWA  
**So that** my profile baseline is captured before body metrics

## Acceptance Criteria

1. **Given** step 0, **When** I tap Get Started, **Then** I advance to theme (step 1) — no sign-in CTAs (auth-first on RN)
2. **Given** step 1, **When** I pick light/dark theme and Continue, **Then** theme applies via `useAppTheme` and draft saves
3. **Given** steps 2–5, **When** I complete gender, DOB (13+), referral source, and units, **Then** Continue advances sequentially with validation
4. **Given** step 3 invalid DOB, **When** Continue tapped, **Then** button stays disabled with error copy matching PWA
5. **Given** each screen, **When** rendered, **Then** `testID` exists: `onboarding-step-0` … `onboarding-step-5`
6. **Given** back from step 2+, **When** Back tapped, **Then** previous step restores draft fields

## Tasks / Subtasks

- [x] Port `OnboardingWelcomeScreen` → RN (AC: 1)
  - [x] Remove/hide sign-in switch-account (user already authed)
  - [x] Headline/copy from PWA — **NewYou** branding only
- [x] Port `OnboardingThemePicker` (AC: 2)
  - [x] Wire `setTheme` + draft `theme` field
- [x] Port steps 2–5 inline screens from `OnboardingFlow.tsx` (AC: 3–4)
  - [x] Gender pills (`OnboardingSegment` RN port)
  - [x] DOB picker — use RN wheel or date picker matching PWA validation (`ageFromDateOfBirth`)
  - [x] `ReferralSourcePicker` RN port
  - [x] Units picker (`UnitOnboardingScreen` / unit preferences)
- [x] Wire into wizard `renderStep()` switch (AC: 5)
- [x] Save draft on every Continue/Back via wizard provider (AC: 6)
- [x] Run `npm run typecheck --workspace=@newyouai/mobile`

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `npm run typecheck --workspace=@newyouai/mobile` — pass

### Completion Notes List

- Ported welcome (NewYou branding, no auth CTAs), theme picker with `useThemePreference`, gender/DOB/referral/units steps 0–5.
- Extended wizard context with `setProfile`, `setUnitPreferences`, `setDraftTheme` for draft persistence on field change.

### File List

- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/context/OnboardingWizardContext.tsx
- apps/mobile/hooks/useAppTheme.ts
- apps/mobile/hooks/useThemePreference.ts
- apps/mobile/lib/onboardingProfile.ts
- apps/mobile/lib/referralSource.ts
- apps/mobile/lib/themeStorage.ts
- apps/mobile/lib/unitLabels.ts
- apps/mobile/components/onboarding/OnboardingWelcomeScreen.tsx
- apps/mobile/components/onboarding/OnboardingThemePicker.tsx
- apps/mobile/components/onboarding/OnboardingSegment.tsx
- apps/mobile/components/onboarding/DateOfBirthPicker.tsx
- apps/mobile/components/onboarding/ReferralSourcePicker.tsx
- apps/mobile/components/onboarding/UnitPreferencePicker.tsx

## Change Log

- 2026-06-12: RN-4-02 hook + about you steps 0–5 implemented (bmad-swarm epic-rn-4)
