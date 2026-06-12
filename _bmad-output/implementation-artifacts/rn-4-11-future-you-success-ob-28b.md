---
name: RN-4-11 Future You success OB-28b
epic: RN-4
story: 11
status: ready-for-dev
swarm_order: 11
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.11: Future You success + onboardingComplete (OB-28b)

Status: ready-for-dev

## Story

**As a** user who subscribed  
**I want** a full Future You success reveal then land on Home tabs  
**So that** onboarding completes with emotional payoff matching the PWA

## Acceptance Criteria

1. **Given** step 28 (`ONBOARDING_STEP_FUTURE_YOU_SUCCESS`) with pro tier, **When** screen renders, **Then** unblurred Future You hero shows when generation complete (`canAccessFutureYouSuccessScreen`)
2. **Given** no photo / under-18 / generation failed, **When** success screen renders, **Then** plan-forward success layout still allows Continue
3. **Given** Continue on success, **When** tapped, **Then** `completeOnboardingProfile` runs, draft cleared, `onboardingComplete: true` persisted
4. **Given** onboarding complete, **When** `useAppShellGate` re-evaluates, **Then** user routes to `(tabs)/home` automatically (no manual router.replace from button)
5. **Given** local fitness slice, **When** onboarding completes, **Then** profile/templates/macros/habits written to AsyncStorage fitness key (shape matches PWA persist — cloud sync RN-OFFLINE)
6. **Given** confetti moment, **When** hero visible, **Then** celebration animation fires (Reanimated or lightweight port of PWA confetti)

## Tasks / Subtasks

- [ ] Port `OnboardingFutureYouSuccess.tsx` + hero components (AC: 1–2)
- [ ] Port `completeOnboardingProfile`, habit template build from PWA `onboardingProfile.ts` / flow finish handler (AC: 3, 5)
- [ ] Wire `setOnboardingComplete(true)` + clear draft storage (AC: 3–4)
- [ ] Persist merged fitness slice locally via storage adapter (AC: 5)
- [ ] Optional confetti (`fireFutureYouSuccessConfetti` port) (AC: 6)
- [ ] Run typecheck + auth-all regression (onboarding complete defaults)

## Dev Notes

### PWA reference

- `OnboardingFutureYouSuccess.tsx`, `OnboardingFutureYouSuccessHero.tsx`
- `futureYouSuccessModel.ts`, `canAccessFutureYouSuccessScreen`
- Finish handler in `OnboardingFlow.tsx` (~883–920, 1575+)
- `completeOnboardingProfile`, `habitTemplatesFromOnboarding`, `clearOnboardingDraftStorage`

### Previous story intelligence (RN-4-10)

- `pendingSubscriptionTier` / `subscriptionTier: 'pro'` required for success hero path
- Back from success returns to paywall — preserve if PWA supports

### Shell routing (RN-3 lesson)

- **Do not** `router.replace("/(tabs)/home")` from Continue — update `onboardingComplete` and let `useAppShellGate` redirect

### Anti-patterns

- **Do not** sync to Supabase fitness_user_data yet (RN-OFFLINE)
- **Do not** skip habit/template persistence — Home stub expects data shape in RN-5

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all
```

Manual: full flow completion → tabs; verify AsyncStorage fitness key populated.

### References

- `packages/core/src/sync/mergePersistedFitnessSlices.ts` — merge shape
- PWA key: `FITNESS_LOCAL_STORAGE_KEY` in e2e seed helper

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
