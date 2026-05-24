# FTI-74 — Onboarding paywall UI stub

**Status:** done  
**Sprint:** 11  
**Branch:** `epic-fti-sprint-11/gymmy-onboarding-v2`

## Summary

Screen 23 (index 22): paywall stub per [gymmy-tier-matrix.md](../planning-artifacts/gymmy-tier-matrix.md). No real IAP — both CTAs finish onboarding and land on Home.

## Deliverables

- `OnboardingPaywall.tsx` — headline, $9.99/mo / $79.99/yr pricing, trial + free CTAs
- Wired as final step after Plan Ready
- `finish()` stores `subscriptionTier: 'free' | 'pro'`, sets `onboardingComplete`, clears draft

## Acceptance

- [x] Primary CTA → `pro`, secondary → `free`
- [x] Both reach Home with full fitness slice persisted
- [x] No StoreKit / Stripe
