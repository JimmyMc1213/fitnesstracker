# FTI-72 — Onboarding flow v2 (23 screens)

**Status:** done  
**Sprint:** 11  
**Branch:** `epic-fti-sprint-11/gymmy-onboarding-v2`

## Summary

Replaced the v1 11-step wizard with the Gymmy 23-screen onboarding flow per [gymmy-onboarding-flow-v2.md](../planning-artifacts/gymmy-onboarding-flow-v2.md).

## Deliverables

- `ONBOARDING_DRAFT_VERSION` bumped to **3** with v2→v3 step migration
- Extracted: `OnboardingShell`, `OnboardingInterstitial`, `OnboardingSplitReveal`, `OnboardingPlanReady`
- Rewrote `OnboardingFlow.tsx` with branching (maintain skips goal weight/pace; Edit split branch)
- Calendar continue builds templates with `trainingWeekdays`
- `dateOfBirth` on profile; age derived on finish
- Plan ready → paywall (not Home)

## Acceptance

- [x] 23 screens (0–22) with Gymmy branding
- [x] Draft persist on Continue/Back
- [x] v2 draft migration via step mapping
- [x] Maintain skips screens 9–10
