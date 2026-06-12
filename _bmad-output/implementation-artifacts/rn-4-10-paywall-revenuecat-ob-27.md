---
name: RN-4-10 Paywall RevenueCat OB-27
epic: RN-4
story: 10
status: ready-for-dev
swarm_order: 10
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.10: Paywall + RevenueCat sandbox (OB-27/28)

Status: ready-for-dev

## Story

**As a** user at the end of onboarding  
**I want** a paywall with trial/subscribe CTAs and sandbox billing  
**So that** subscription tier is captured before I enter the app

## Acceptance Criteria

1. **Given** step 27 (`ONBOARDING_STEP_PAYWALL`), **When** paywall renders, **Then** plan summary matches step 26 numbers
2. **Given** photo path + generation ready, **When** paywall shows, **Then** blurred Future You hero displays; opt-out path shows plan-forward layout
3. **Given** RevenueCat sandbox configured, **When** app launches onboarding, **Then** `Purchases.configure` runs with `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
4. **Given** trial/subscribe CTA tap, **When** sandbox purchase succeeds (or stub succeeds in dev), **Then** `subscriptionTier: 'pro'` stored and advance to success step (RN-4-11)
5. **Given** dev without RevenueCat key, **When** CTA tapped, **Then** stub tier assignment still allows flow completion (document in env-matrix)
6. **Given** paid-only product rule, **When** paywall shown, **Then** no "Continue with free" CTA (per future-you-onboarding-spec)

## Tasks / Subtasks

- [ ] Add `react-native-purchases` dependency + Expo config plugin if required (AC: 3)
- [ ] Create `apps/mobile/lib/revenueCat.ts` — configure, logIn with Supabase user id optional
- [ ] Port `OnboardingPaywall.tsx` + related hero components (AC: 1–2, 6)
  - [ ] `OnboardingPaywallFutureYouHero`, blurred teaser model from `onboardingPaywallReveal.ts`
- [ ] Wire paywall Continue/purchase → set tier + `goToStep(ONBOARDING_STEP_FUTURE_YOU_SUCCESS)` (AC: 4)
- [ ] Document env vars in `docs/env-matrix.md` (AC: 3, 5)
- [ ] Run typecheck

## Dev Notes

### PWA reference

- `OnboardingPaywall.tsx`, `OnboardingPaywallFullBleed.tsx`, hero variants
- `onboardingPaywallReveal.ts`, `futureYouPaywallModel.ts`
- Step `ONBOARDING_STEP_PAYWALL` in flow (~1560+)

### Monetization spec

- Paid only, 14-day trial placeholder copy
- Pricing reference: `gymmy-tier-matrix.md` ($9.99/mo · $79.99/yr) — use **NewYou** branding in UI

### Previous story intelligence (RN-4-09)

- Plan snapshot from steps 21/26 must feed paywall — import shared helper
- RN-2 explicitly deferred RevenueCat logIn until this story

### Anti-patterns

- **Do not** wire App Store Connect products (RN-STORE)
- **Do not** feature-gate tabs yet — store tier only
- **Do not** set `onboardingComplete: true` here — RN-4-11 success screen owns completion

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: sandbox purchase in dev client; stub path without API key.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Paywall UI + RC sandbox | Production IAP |
| Tier stored locally on draft | Cloud subscription sync |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
