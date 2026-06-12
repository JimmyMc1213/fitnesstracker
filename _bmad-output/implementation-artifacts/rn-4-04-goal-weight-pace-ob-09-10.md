---
name: RN-4-04 Goal weight pace OB-09-10
epic: RN-4
story: 04
status: ready-for-dev
swarm_order: 4
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.04: Goal weight, pace, maintain branch (OB-09–10)

Status: done

## Story

**As a** user with a cut or bulk goal  
**I want** to set goal weight and pace with reinforcement  
**So that** my plan reflects realistic targets before Future You

## Acceptance Criteria

1. **Given** cut/bulk goal, **When** on step 9, **Then** goal weight input + optional reinforcement sub-step (`9-reinforcement`) works like PWA
2. **Given** maintain goal, **When** wizard restores or navigates, **Then** steps 9–10 never show (`resolveMaintainOnboardingStep`)
3. **Given** step 10 pace, **When** I Continue, **Then** advance to Future You photo (step 100) and set `onboardingGoalLocked` on futureYou draft when leaving zone
4. **Given** step 11+, **When** Back pressed, **Then** cannot navigate back into steps 8–10c (`isOnboardingBackIntoGoalLockBlocked`)
5. **Given** core tests, **When** Vitest runs, **Then** maintain + goal-lock routing tests pass

## Tasks / Subtasks

- [x] Port step 9 goal weight + `OnboardingGoalWeightReinforcement` (AC: 1)
- [x] Port step 10 pace picker (AC: 3)
- [x] Wire maintain skip in wizard mount + `goNext` from step 8 (AC: 2)
- [x] Implement back-lock using core helpers in wizard `goBack` (AC: 4)
- [x] Set `futureYou.onboardingGoalLocked = true` when advancing past pace/10c zone (AC: 3)
- [x] Run core + mobile gates (AC: 5)

## Dev Notes

### PWA reference

- `OnboardingGoalWeightReinforcement.tsx`
- `OnboardingFlow.tsx` steps 9, `ONBOARDING_STEP_PACE` (~1085–1150)
- Reinforcement flag: `goalWeightReinforcement` local state in flow

### Core routing (must use)

```typescript
// packages/core/src/onboarding/routing.ts
resolveMaintainOnboardingStep(step, goal)
resolveGoalLockedOnboardingStep(step, futureYou)
isOnboardingBackIntoGoalLockBlocked(from, to, futureYou)
```

### Previous story intelligence (RN-4-03)

- Step 8 sets `profile.goal` — maintain users never see 9–10
- Internal step constants: `ONBOARDING_STEP_PACE = 10`, photo = 100

### Anti-patterns

- **Do not** allow editing goal weight after step 11 (spec: locked in wizard)
- **Do not** duplicate maintain logic inline — call core functions

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: cut path 8→9→10→photo; maintain 8→photo; back blocked from step 11 to step 8.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Steps 9–10 + reinforcement | Future You photo (RN-4-05) |
| Goal-lock back navigation | AI generation (RN-4-05) |

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Step 9 goal weight + reinforcement sub-step with accent delta headline
- Step 10 pace picker via `PacePicker` + `GOAL_PACE_OPTIONS`
- Maintain skip + goal-lock via existing `resolveWizardNextStep` / core `resolveOnboardingStepOnRestore`
- Back-lock from step 11+ via `isOnboardingBackIntoGoalLockBlocked` in `resolveWizardBackStep`
- `onboardingGoalLocked` set on maintain step-8 exit and pace step-10 exit
- Added `goalWeight.test.ts`, `onboardingWizardNavigation.test.ts`, `vitest.config.ts` for `@/` alias

### File List

- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/components/onboarding/OnboardingGoalWeightReinforcement.tsx
- apps/mobile/components/onboarding/OnboardingShell.tsx
- apps/mobile/components/onboarding/PacePicker.tsx
- apps/mobile/lib/goalWeight.ts
- apps/mobile/lib/goalWeight.test.ts
- apps/mobile/lib/onboardingReinforcementCopy.ts
- apps/mobile/lib/onboardingWizardNavigation.ts
- apps/mobile/lib/onboardingWizardNavigation.test.ts
- apps/mobile/vitest.config.ts
