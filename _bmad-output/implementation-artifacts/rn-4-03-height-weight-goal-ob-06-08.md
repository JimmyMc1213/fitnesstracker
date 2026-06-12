---
name: RN-4-03 Height weight goal OB-06-08
epic: RN-4
story: 03
status: done
swarm_order: 3
swarm_branch: epic-rn-4/onboarding-v2
baseline_commit: e2aaf9504951b4dfb312ab82c69a9c4bf1bcf412
---

# Story 4.03: Height, weight, primary goal (OB-06–08)

Status: done

## Story

**As a** user in the About you / Your goal phase  
**I want** to enter height, weight, and primary goal with unit-aware inputs  
**So that** nutrition and training calculations have baseline body metrics

## Acceptance Criteria

1. **Given** step 6, **When** I enter valid height (ft/in or cm per units), **Then** Continue enables
2. **Given** step 7, **When** I enter valid weight (lbs or kg), **Then** Continue enables and value stored in profile
3. **Given** step 8, **When** I select cut/bulk/maintain, **Then** selection persists and `nextStepAfterGoal` determines step 9 vs 10b path on Continue
4. **Given** unit preferences from step 5, **When** height/weight screens render, **Then** labels and inputs match selected units
5. **Given** each screen, **When** rendered, **Then** `testID="onboarding-step-6|7|8"`

## Tasks / Subtasks

- [x] Port `OnboardingHeightInput` (AC: 1, 4)
- [x] Port `OnboardingWeightInput` (AC: 2, 4)
- [x] Port primary goal picker — cut / bulk / maintain (AC: 3)
  - [x] On Continue from 8: use `nextStepAfterGoal(profile.goal)` from core
- [x] Wire steps 6–8 in wizard `renderStep()` (AC: 5)
- [x] Draft saves heightIn/weightLbs (normalized internal units like PWA)
- [x] Run typecheck

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `npm run typecheck --workspace=@newyouai/mobile` — pass

### Completion Notes List

- Height/weight inputs store canonical inches/lbs; goal step uses existing `resolveWizardNextStep` for maintain → photo branching.

### File List

- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/lib/unitConversions.ts
- apps/mobile/components/onboarding/OnboardingHeightInput.tsx
- apps/mobile/components/onboarding/OnboardingWeightInput.tsx
- apps/mobile/components/onboarding/PrimaryGoalPicker.tsx

## Change Log

- 2026-06-12: RN-4-03 height/weight/goal steps 6–8 implemented (bmad-swarm epic-rn-4)
