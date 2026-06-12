---
name: RN-4-01 Onboarding wizard shell
epic: RN-4
story: 01
status: done
swarm_order: 1
swarm_branch: epic-rn-4/onboarding-v2
baseline_commit: e2aaf9504951b4dfb312ab82c69a9c4bf1bcf412
---

# Story 4.01: Onboarding wizard shell + step router

Status: review

## Story

**As a** newly signed-in user with incomplete onboarding  
**I want** a wizard host that loads my draft step and routes forward/back with PWA-parity rules  
**So that** screen stories (RN-4-02+) can plug into stable navigation and persistence

## Acceptance Criteria

1. **Given** signed in and `onboardingComplete: false`, **When** `useAppShellGate` resolves, **Then** user stays in `(onboarding)` wizard (not stub copy)
2. **Given** a saved onboarding draft in AsyncStorage, **When** wizard mounts, **Then** step restores via `resolveOnboardingStepOnRestore` from `@newyouai/core`
3. **Given** Continue/Back in wizard, **When** step changes, **Then** draft persists with `ONBOARDING_DRAFT_VERSION` (18) and updated `stepIndex`
4. **Given** wizard chrome, **When** any step renders, **Then** `OnboardingShell` shows progress bar, phase label, back/continue footer (`testID="onboarding-wizard"`)
5. **Given** `@newyouai/core` tests, **When** `npm run test --workspace=@newyouai/core`, **Then** onboarding routing tests pass unchanged
6. **Given** Maestro auth flows with default onboarding complete, **When** `npm run test:e2e:auth-all`, **Then** flows still pass (document `MAESTRO_SKIP_ONBOARDING` / default `true` escape hatch)

## Tasks / Subtasks

- [x] Create `OnboardingWizardProvider` + `useOnboardingWizard` hook (AC: 1–3)
  - [x] State: `stepIndex`, `profile`, `futureYou`, `draftTheme`, templates, notification prefs
  - [x] `goNext` / `goBack` / `goToStep` delegate to `@newyouai/core/onboarding/routing` (maintain, goal-lock, photo revisit)
  - [x] Persist via AsyncStorage adapter wrapping `buildOnboardingDraft` / parse from `packages/core/src/sync/onboardingDraft.ts`
- [x] Replace `(onboarding)/index.tsx` stub with wizard host (AC: 1, 4)
  - [x] `renderStep()` switch — stub placeholder per step until RN-4-02+ fills in
  - [x] Register provider in `(onboarding)/_layout.tsx`
- [x] Port `OnboardingShell` progress helpers (AC: 4)
  - [x] `ONBOARDING_TOTAL_STEPS = 30` and `onboardingProgressStep()` — port from PWA `onboardingSteps.ts` to `apps/mobile/lib/onboardingSteps.ts` or add to `@newyouai/core` if shared
  - [x] `testID="onboarding-continue"` on Continue button; `testID="onboarding-back"` on Back
- [x] Extend `useOnboardingStub` → `useOnboardingState` (AC: 1, 6)
  - [x] Keep `@newyouai/onboardingComplete` key; default `true` for Maestro unless env forces wizard
  - [x] Document override in `docs/env-matrix.md`
- [x] Storage key parity: `GYMMY_ONBOARDING_DRAFT_KEY = "gymmy_onboarding_draft"` (same as PWA `onboardingDraft.ts`)
- [x] Run gates (AC: 5–6)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `(onboarding)/index.tsx` | Static stub `testID="onboarding-stub"` | Wizard host |
| `useOnboardingStub.ts` | Boolean complete flag only | Wizard + draft hydration |
| `useAppShellGate.ts` | Routes to `(onboarding)` when incomplete | Unchanged — wizard replaces stub content |
| `packages/core/onboarding/routing.ts` | Full step logic + tests | **Reuse — do not duplicate** |

Auth-first: PWA welcome step 0 may show sign-in prompt — on RN, user is **already signed in** before wizard. Skip auth CTAs on welcome; start at Get Started → step 1.

### Architecture compliance

- Dynamic step registry per [architecture-rn-migration.md §3](../planning-artifacts/architecture-rn-migration.md): `(onboarding)/index` hosts wizard; optional `[step].tsx` later if needed
- `packages/*` has no DOM — all UI in `apps/mobile/components/onboarding/*`
- Shell gate owns routing — **no** `router.replace` from wizard Continue handlers

### File structure requirements

**Create:**

- `apps/mobile/context/OnboardingWizardContext.tsx`
- `apps/mobile/hooks/useOnboardingWizard.ts`
- `apps/mobile/lib/onboardingStorage.ts` — AsyncStorage read/write for draft + complete flag
- `apps/mobile/components/onboarding/OnboardingShell.tsx`
- `apps/mobile/components/onboarding/OnboardingStepPlaceholder.tsx` (temporary until RN-4-02)

**Update:**

- `apps/mobile/app/(onboarding)/index.tsx`
- `apps/mobile/app/(onboarding)/_layout.tsx` — wrap provider
- `apps/mobile/hooks/useOnboardingStub.ts` — fold into `useOnboardingState` or re-export
- `docs/env-matrix.md` — Maestro onboarding overrides

### Anti-patterns

- **Do not** reimplement maintain/goal-lock routing — import from `@newyouai/core`
- **Do not** break auth Maestro — keep default `onboardingComplete: true`
- **Do not** wire cloud sync / `fitnessHydrated` restore (RN-OFFLINE)
- **Do not** implement screen content beyond placeholders (RN-4-02+)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all
```

Manual: set `@newyouai/onboardingComplete` = `false` → signed-in user sees wizard shell with step 0 placeholder.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Wizard provider + shell chrome | Individual step UI (RN-4-02+) |
| Draft persist/load | Cloud merge (RN-OFFLINE) |
| Step routing via core | Paywall / RevenueCat (RN-4-10) |
| Placeholder step render | Maestro onboarding flow (RN-4-12) |

### References

- [sprint-rn-4-onboarding-v2-plan.md](sprint-rn-4-onboarding-v2-plan.md)
- [future-you-onboarding-spec.md](../../future-you-onboarding-spec.md) — step map
- PWA: `OnboardingFlow.tsx` (state machine), `OnboardingShell.tsx`
- Core: `packages/core/src/sync/onboardingDraft.ts`, `onboarding/routing.ts`

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `npm run typecheck --workspace=@newyouai/mobile` — pass
- `npm run test --workspace=@newyouai/core -- --run onboarding` — 11/11 pass
- `npm run test:e2e:auth-all` — blocked (Java runtime not installed for Maestro on this machine)

### Completion Notes List

- Replaced onboarding stub with `OnboardingWizardProvider`, draft hydration via `gymmy_onboarding_draft`, and PWA-parity routing guards from `@newyouai/core`.
- Added RN `OnboardingShell` with progress bar, phase labels, and Maestro testIDs.
- Extended `useOnboardingState` (re-exports `useOnboardingStub`); documented `EXPO_PUBLIC_MAESTRO_SKIP_ONBOARDING` in env matrix.

### File List

- apps/mobile/context/OnboardingWizardContext.tsx
- apps/mobile/hooks/useOnboardingWizard.ts
- apps/mobile/hooks/useOnboardingState.ts
- apps/mobile/hooks/useOnboardingStub.ts
- apps/mobile/hooks/useAppShellGate.ts
- apps/mobile/lib/onboardingStorage.ts
- apps/mobile/lib/onboardingSteps.ts
- apps/mobile/lib/onboardingDefaults.ts
- apps/mobile/lib/onboardingWizardNavigation.ts
- apps/mobile/components/onboarding/OnboardingShell.tsx
- apps/mobile/components/onboarding/OnboardingStepPlaceholder.tsx
- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/app/(onboarding)/_layout.tsx
- docs/env-matrix.md

## Change Log

- 2026-06-12: RN-4-01 onboarding wizard shell implemented (bmad-swarm epic-rn-4)
