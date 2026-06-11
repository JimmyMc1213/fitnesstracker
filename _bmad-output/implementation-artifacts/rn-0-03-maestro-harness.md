---
name: RN-0-03 Maestro harness init
epic: RN-0
story: 03
status: done
---

# RN-0-03: Maestro harness init

## User story

**As a** developer  
**I want** Maestro configured  
**So that** E2E tests can run on the iOS simulator

## Acceptance criteria

1. **Given** dev client on simulator, **When** I run `maestro test .maestro/smoke.yaml` from `apps/mobile`, **Then** the app launches and the home title is visible
2. **Given** `eas.json`, **Then** an `e2e-test` build profile exists for simulator CI builds
3. **Given** `docs/eas-ios.md`, **Then** Maestro CLI install and local run steps are documented

## Tasks

- [x] Add `apps/mobile/.maestro/smoke.yaml`
- [x] Add `testID` on home screen (`home-screen`, `home-title`)
- [x] Add `e2e-test` profile to `eas.json`
- [x] Add `test:e2e` script to `apps/mobile/package.json`
- [x] Document Maestro in `docs/eas-ios.md`
- [x] Manual: install Maestro CLI (`curl -Ls "https://get.maestro.mobile.dev" | bash`)
- [x] Manual: run smoke with dev client + Metro on simulator (2026-06-10, iPhone 17 sim)

## Manual verification

```bash
# Install Maestro (once)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Terminal 1
npm run dev:mobile:client

# Terminal 2
cd apps/mobile && npm run test:e2e
```

## Dependencies

RN-0-02

## Notes

- Maestro has no npm package in the app; CLI only
- Dev client smoke needs Metro running; `e2e-test` CI builds bundle JS (RN-0-05)
- Future flows: `rn-auth-gate.yaml`, `rn-onboarding-v2.yaml`, etc. per test design
