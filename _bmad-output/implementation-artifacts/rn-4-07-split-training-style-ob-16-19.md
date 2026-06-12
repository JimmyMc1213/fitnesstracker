---
name: RN-4-07 Split training style OB-16-19
epic: RN-4
story: 07
status: done
swarm_order: 7
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.07: Split reveal + training style (OB-16–19)

Status: done

## Story

**As a** user who picked training days  
**I want** to see my split reveal and optional edit branch  
**So that** I confirm the workout plan before fuel setup

## Acceptance Criteria

1. **Given** step 16, **When** split reveal renders, **Then** day labels match `trainingWeekdays` from templates
2. **Given** step 16 Edit, **When** tapped, **Then** navigate to template review (step 17) and return via Continue
3. **Given** steps 18–19, **When** training style / duration screens complete, **Then** advance toward plan building (step 20)
4. **Given** back among steps 12–19, **When** Back tapped, **Then** allowed without crossing into goal-lock zone
5. **Given** each screen, **When** rendered, **Then** phase label **Your training** (steps ≤21)

## Tasks / Subtasks

- [x] Port `OnboardingSplitReveal.tsx` (AC: 1)
- [x] Port `OnboardingTemplateReview.tsx` edit branch (AC: 2)
- [x] Port steps 18–19 screens from `OnboardingFlow.tsx` (~1368–1424)
  - [x] Session length / training style pickers per current PWA (not legacy Gymmy 23-screen names)
- [x] Wire wizard navigation 16 → 17 (optional) → 18 → 19 → 20
- [x] Run typecheck

## Dev Notes

### PWA reference

- `OnboardingSplitReveal.tsx`, `OnboardingTemplateReview.tsx`
- `OnboardingFlow.tsx` steps 16–19

Phase: **Your training** through step 21 (`OnboardingShell.phaseForStep`).

### Previous story intelligence (RN-4-06)

- Templates must exist before split reveal — built on step 15 Continue
- Day labels on templates = user weekdays

### Anti-patterns

- **Do not** rebuild templates on every render — use draft snapshot
- **Do not** skip edit branch if PWA supports Edit on reveal

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: Edit branch round-trip; weekday labels on reveal cards.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- 2026-06-12: Split reveal (16), template review edit branch (17), dietary + training style (18–19) wired with draft template snapshot
- Navigation: back from 18 skips optional edit step 17; Edit ghost action on step 16

### File List

- apps/mobile/components/onboarding/OnboardingSplitReveal.tsx
- apps/mobile/components/onboarding/OnboardingSplitReveal.test.tsx
- apps/mobile/components/onboarding/OnboardingTemplateReview.tsx
- apps/mobile/components/onboarding/OnboardingIconOptionPicker.tsx
- apps/mobile/lib/onboardingMotivationSurvey.ts
- apps/mobile/lib/workout/templateExerciseUtils.ts
- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/context/OnboardingWizardContext.tsx
- apps/mobile/lib/onboardingWizardNavigation.ts
- apps/mobile/lib/onboardingWizardNavigation.test.ts
