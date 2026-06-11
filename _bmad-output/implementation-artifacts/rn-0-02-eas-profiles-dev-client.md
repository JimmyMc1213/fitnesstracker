---
name: RN-0-02 EAS profiles and dev client
epic: RN-0
story: 02
status: done
---

# RN-0-02: EAS profiles and dev client

## User story

**As a** developer  
**I want** EAS Build profiles and a custom dev client  
**So that** I can run on the iOS simulator and TestFlight with native modules (Maestro, camera, IAP later)

## Acceptance criteria

1. **Given** `eas.json`, **When** I run `eas build --profile development --platform ios`, **Then** a simulator dev client build succeeds
2. **Given** the dev client installed on simulator, **When** I run `npm run dev:mobile`, **Then** the app loads the RN-0-01 placeholder screen
3. **Given** `eas.json`, **Then** profiles `development`, `preview`, and `production` exist per `docs/eas-ios.md`

## Tasks

- [x] Add `expo-dev-client` dependency
- [x] Add `expo-dev-client` plugin to `app.config.ts`
- [x] Create `eas.json` with development / preview / production profiles
- [x] Update `docs/eas-ios.md` with dev-client workflow
- [x] Add `dev:client` script for post-build local dev
- [ ] Run `eas init` to link Expo project (requires interactive login)
- [ ] Run `eas build --profile development --platform ios` (requires Apple Developer account)
- [ ] Verify dev client on simulator

## Manual steps (developer)

```bash
cd apps/mobile
npm run eas login          # once (use eas-cli, NOT npx eas)
npm run eas init
npm run eas build -- --profile development --platform ios
# After build completes, install on simulator from EAS dashboard or CLI
npm run dev:mobile:client  # from repo root
```

## Dependencies

RN-0-01

## Notes

- Expo Go works for RN-0-01 scaffold only; dev client required from RN-0-03 (Maestro) onward
- `development` profile targets iOS simulator (`ios.simulator: true`)
- Apple team linking happens during first EAS iOS build
