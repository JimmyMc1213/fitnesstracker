---
name: RN Migration Test Architecture Design
phase: 6
created: 2026-06-08
framework: Vitest + Maestro
---

# Test Architecture — RN Migration

## 1. Test pyramid

| Layer | Tool | Scope | When |
|-------|------|-------|------|
| Unit | Vitest | `packages/core`, `packages/api-client` | Before UI port of each feature |
| Component | Vitest + RNTL (optional) | Critical RN components | Selective |
| E2E | Maestro | iOS simulator/dev client | Critical paths + per-epic smoke |

## 2. Framework setup (RN-0-03, RN-0-05)

### Vitest
- Extend root `vitest` / turbo `test` to include `packages/*`
- Node env for pure logic (same as PWA)
- Mobile component tests optional in RN-1+

### Maestro
- Location: `apps/mobile/.maestro/`
- CI: EAS Workflow `e2e-test` profile or local on PR (macOS runner)
- testID convention: `{screen}-{element}`

## 3. Critical E2E paths (iOS required)

| Flow | Maestro file | PWA Playwright source | FR |
|------|--------------|----------------------|-----|
| Auth gate | `rn-auth-gate.yaml` | `auth-gate.spec.ts` | FR-M1 |
| Onboarding v2 | `rn-onboarding-v2.yaml` | `onboarding-v2.spec.ts` | FR-M2 |
| Onboarding plan | `rn-onboarding-plan.yaml` | `onboarding-plan-consistency.spec.ts` | FR-M2 |
| Paywall + FY | `rn-onboarding-fy.yaml` | `onboarding-paywall-future-you.spec.ts` | FR-M2, FR-M7 |
| Nutrition log | `rn-nutrition-log.yaml` | `nutrition-log-food.spec.ts` | FR-M5 |
| Workout session | `rn-workout-session.yaml` | `workout-session-smoke.spec.ts` | FR-M4 |
| Coach → nutrition | `rn-coach-nutrition.yaml` | `coach-task-nutrition.spec.ts` | FR-M3, FR-M5 |
| Cloud sync | `rn-sync-signin.yaml` | (new) | FR-M11 |
| Future You upload | `rn-future-you-upload.yaml` | (new) | FR-M7 |

## 4. Unit test port priority

Port these PWA test files to `packages/core` **before** RN UI:

1. `mergePersistedFitnessSlices.test.ts`
2. `onboardingRouting.test.ts`
3. `coachEngine.test.ts`, `dailyPlan.test.ts`
4. `workoutAutofill.test.ts`, `workoutTemplates.test.ts`
5. `nutritionCalculator.test.ts`, `foodSearchMerge.test.ts`
6. `futureYou*Model.test.ts`, `futureYou*Guards.test.ts`

## 5. Definition of Done (per story)

- [ ] Unit tests pass for extracted logic
- [ ] Maestro flow passes (if story touches critical path)
- [ ] Parity checklist item signed against PWA behavior
- [ ] No DOM imports in packages

## 6. CI quality gates

| Gate | Command | Blocking |
|------|---------|----------|
| Typecheck | `turbo typecheck` | yes |
| Unit | `turbo test` | yes |
| Maestro | `maestro test .maestro/` on iOS | PR to main (post RN-0-03) |

## 7. Coverage rules

- 100% of FR-M1–M13 mapped to ≥1 test (see trace matrix)
- Critical paths (auth, onboarding, workout, nutrition, sync, FY) require E2E
- No coverage % target for RN UI initially — focus on FR traceability
