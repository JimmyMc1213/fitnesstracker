---
name: RN-4-08 Plan build fuel OB-20-22
epic: RN-4
story: 08
status: done
swarm_order: 8
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.08: Plan build + fuel (OB-20–22)

Status: done

## Story

**As a** user finishing training setup  
**I want** plan generation animation and editable fuel targets  
**So that** my macros reflect my goals before launch screens

## Acceptance Criteria

1. **Given** step 20, **When** screen mounts, **Then** auto-advance to step 21 after ~3–4s (like PWA `OnboardingPlanBuilding`)
2. **Given** step 21, **When** fuel targets shown, **Then** values from `calculateNutritionTargets` match PWA inputs from profile
3. **Given** step 21 macro edit while Future You generating, **When** Continue, **Then** confirm sheet appears (`shouldConfirmMacroEditOnContinue`)
4. **Given** step 22, **When** protein reinforcement shown, **Then** Continue advances to step 23
5. **Given** edited macros confirmed, **When** reaching plan ready/paywall later, **Then** same numbers used (single draft source)

## Tasks / Subtasks

- [x] Port `OnboardingPlanBuilding.tsx` with timed auto-advance (AC: 1)
- [x] Port `OnboardingDailyFuelPlan.tsx` + macro override UI (AC: 2)
- [x] Port `OnboardingMacroEditConfirmSheet.tsx` + `onboardingMacroEdit.ts` logic (AC: 3)
- [x] Port protein reinforcement step 22 (AC: 4)
- [x] Store `macroTargets` on draft/profile — source of truth for steps 26/28
- [x] Run typecheck + core nutrition tests if available

## Dev Notes

### PWA reference

- `OnboardingPlanBuilding.tsx`, `OnboardingDailyFuelPlan.tsx`
- `OnboardingMacroEditConfirmSheet.tsx`, `onboardingMacroEdit.ts`
- `nutritionCalculator.ts` — targets calculation
- Steps 20–22 in `OnboardingFlow.tsx`

Phase transitions: **Your training** (20–21) → **Your fuel** (22–23).

### Previous story intelligence (RN-4-07)

- Profile + templates complete before step 20
- Generation pill may still show if Future You job running

### Anti-patterns

- **Do not** hardcode macro numbers — compute from profile
- **Do not** skip confirm sheet when generation in flight

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: edit macros during simulated generating state → confirm dialog.

### References

- [future-you-onboarding-spec.md](../../future-you-onboarding-spec.md) — macro edit section

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- 2026-06-12: Plan building (3.5s auto-advance), fuel targets with macro edit + Future You confirm sheet, protein reinforcement step 22
- Macros stored on draft via `setMacros` / `goToStep` overrides

### File List

- apps/mobile/components/onboarding/OnboardingPlanBuilding.tsx
- apps/mobile/components/onboarding/OnboardingDailyFuelPlan.tsx
- apps/mobile/components/onboarding/OnboardingMacroEditConfirmSheet.tsx
- apps/mobile/lib/nutritionCalculator.ts
- apps/mobile/lib/macroLimits.ts
- apps/mobile/lib/onboardingMacroEdit.ts
- apps/mobile/lib/onboardingMacroEdit.test.ts
- apps/mobile/lib/futureYouJobs.ts
- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/context/OnboardingWizardContext.tsx
