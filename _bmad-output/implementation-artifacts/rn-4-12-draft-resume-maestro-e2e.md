---
name: RN-4-12 Draft resume Maestro E2E
epic: RN-4
story: 12
status: ready-for-dev
swarm_order: 12
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.12: Draft resume + Maestro onboarding E2E

Status: ready-for-dev

## Story

**As a** developer closing RN-4  
**I want** draft resume verified and Maestro onboarding E2E ported  
**So that** onboarding parity is regression-tested like auth and tab-nav

## Acceptance Criteria

1. **Given** user mid-onboarding at step 15, **When** app killed and relaunched, **Then** calendar step restores with same draft data
2. **Given** stale draft pointing at goal-edit step after goal locked, **When** restored, **Then** `resolveOnboardingStepOnRestore` forwards to step 11+
3. **Given** Maestro `rn-onboarding-v2.yaml`, **When** run on simulator, **Then** maintain happy path completes through paywall stub → success → Home visible
4. **Given** Maestro resume test, **When** reload at calendar step, **Then** "Which days can you train?" still visible
5. **Given** Maestro calendar test, **When** deselect to 2 days, **Then** Continue disabled; Pick for me re-enables
6. **Given** epic close, **When** all flows run, **Then** `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` still green
7. **Given** sprint status, **When** story done, **Then** `epic-rn-4` marked `done` in `sprint-status-rn-migration.yaml`

## Tasks / Subtasks

- [ ] Harden draft resume on wizard mount (AC: 1–2)
  - [ ] Call `resolveOnboardingStepOnRestore(step, goal, futureYou)` from core
  - [ ] Fix any hydration race with `useAppShellGate` (wait for draft read before rendering step 0)
- [ ] Create `.maestro/rn-onboarding-v2.yaml` porting PWA cases (AC: 3–5)
  - [ ] Subflows: sign-in test account, force onboarding incomplete, advance helpers
  - [ ] Reference `apps/pwa/e2e/onboarding-v2.spec.ts` + `helpers/onboarding.ts`
- [ ] Add `apps/mobile/scripts/run-onboarding-maestro.mjs` + `npm run test:e2e:onboarding` (AC: 3)
- [ ] Document Maestro env: test credentials, `@newyouai/onboardingComplete=false`, Metro :8082
- [ ] Epic close sweep (AC: 6–7)
  - [ ] `npm run test:e2e:onboarding`
  - [ ] `npm run test:e2e:auth-all`
  - [ ] `npm run test:e2e:tab-nav`
  - [ ] Update sprint status + optional retro doc

## Dev Notes

### PWA E2E reference

```26:56:apps/pwa/e2e/onboarding-v2.spec.ts
test("happy path maintain: onboarding through paywall to Home", ...);
test("resume: reload restores calendar step", ...);
test("week calendar: 3-day minimum validation", ...);
```

Port helper sequence: `advanceHookScreens` → `advanceToCalendarMaintain` → fuel/plan/paywall helpers (may shorten for Maestro with testIDs).

### Maestro harness patterns (RN-2/RN-3)

- Cold start: `launchApp` → `openLink` Metro `:8082` → `dev-client-connect.yaml`
- Auth: reuse `rn-auth-gate-sign-in.yaml` subflow or dedicated onboarding test user
- After onboarding completes, assert `home-title` or `tab-home` visible

### testID contract (accumulated from epic)

| ID | Usage |
|----|-------|
| `onboarding-wizard` | Root wizard |
| `onboarding-step-{n}` | Step screens (0–26, 100, 101, 27, 28) |
| `onboarding-continue` | Shell continue button |
| `tab-home` | Post-onboarding destination |

### Previous story intelligence (RN-4-01–11)

- All step screens must exist before E2E — this story validates integration only
- Paywall may use sandbox stub — Maestro can tap primary CTA without real StoreKit
- Default `onboardingComplete: true` breaks auth tests — onboarding YAML must set false at start; auth-all must reset true or use skip flag documented in RN-4-01

### Anti-patterns

- **Do not** mark epic done without auth + tab regression
- **Do not** rely on Playwright — Maestro only on mobile

### Testing requirements

```bash
npm run test:e2e:onboarding
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run typecheck --workspace=@newyouai/mobile
```

### Epic definition of done

See [sprint-rn-4-onboarding-v2-plan.md](sprint-rn-4-onboarding-v2-plan.md) § Definition of done.

### References

- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) — onboarding trace row
- RN-3 retro: Maestro orchestration scripts pattern (`run-auth-maestro.mjs`, `run-tab-nav-maestro.mjs`)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
