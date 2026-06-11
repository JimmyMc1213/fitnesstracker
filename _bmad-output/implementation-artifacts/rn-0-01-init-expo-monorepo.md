---
name: RN-0-01 Init Expo app in monorepo
epic: RN-0
story: 01
status: done
completed: 2026-06-08
---

# RN-0-01: Init Expo app in monorepo

## User story

**As a** developer  
**I want** `apps/mobile` scaffolded in the Turborepo monorepo  
**So that** native iOS development has a dedicated workspace with CI integration

## Acceptance criteria

1. **Given** the repo root, **When** I run `npm install`, **Then** `@newyouai/mobile` is linked as a workspace package
2. **Given** `apps/mobile`, **When** I run `npx expo start --dev-client`, **Then** Metro bundler starts without errors
3. **Given** `turbo.json`, **When** I run `npm run typecheck`, **Then** mobile package is included
4. **Given** the app, **When** opened on iOS simulator, **Then** a placeholder home screen renders

## PWA reference

N/A — greenfield scaffold. Architecture: `architecture-rn-migration.md` §1

## Tasks

- [x] Create `apps/mobile` with Expo SDK 56 + Expo Router (tabs template)
- [x] Set `name: "@newyouai/mobile"` in package.json
- [x] Add to root `package.json` workspaces (if not already globbed)
- [x] Wire `turbo.json` tasks: `dev`, `typecheck` for mobile
- [x] Add `apps/mobile/tsconfig.json` extending monorepo base
- [x] Configure `app.config.ts` with scheme `newyouai`, bundle ID placeholder
- [x] Add README section in `docs/eas-ios.md` pointing to RN-0-02 for EAS
- [x] Verify `npm run typecheck` from root passes

## Test tasks

- [x] `turbo typecheck --filter=@newyouai/mobile` passes
- [x] Manual: Expo launches on iOS simulator (Expo Go, RN-0-01)

## Dependencies

None (first implementation story)

## Notes

- Do **not** extract shared packages yet (RN-1)
- Do **not** port PWA screens — placeholder only
- Exclude dev toolbar patterns from commits per repo rules
