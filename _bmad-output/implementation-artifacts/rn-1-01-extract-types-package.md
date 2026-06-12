---
name: RN-1-01 Extract types package
epic: RN-1
story: 01
status: done
baseline_commit: 9e2eea78309a792f80e5482946d5b233cdb8501d
completed: 2026-06-10
---

# RN-1-01: Extract types package

## User story

**As a** developer  
**I want** shared domain types in `@newyouai/types`  
**So that** PWA and mobile can share `AppState`, workout, nutrition, and onboarding contracts without duplication

## Acceptance criteria

1. **Given** `packages/types`, **When** inspected, **Then** domain types from `apps/pwa/src/fitness/types.ts` live in platform-agnostic modules (no React/DOM)
2. **Given** `apps/pwa`, **When** I run `npm run typecheck`, **Then** PWA re-exports from `@newyouai/types` and only PWA UI types (`ScreenProps`, `IconProps`) remain local
3. **Given** `foodSearchTypes.ts` and `futureYouDraft.ts`, **When** type-only exports are needed, **Then** they re-export from `@newyouai/types`
4. **Given** root `npm run test --workspace=@newyouai/pwa`, **When** run, **Then** existing Vitest suite passes (type-consuming tests compile)

## PWA reference

- `apps/pwa/src/fitness/types.ts` (~600 lines)
- `apps/pwa/src/fitness/foodSearchTypes.ts`
- `FutureYouDraft` / `FutureYouJobStatus` / `AppTheme` type definitions

## Tasks

- [x] Split domain types into `packages/types/src/*` modules
- [x] Barrel export from `packages/types/src/index.ts`
- [x] Add `@newyouai/types` workspace dependency to `@newyouai/pwa`
- [x] Thin PWA `types.ts` to re-exports + `ScreenProps` / `IconProps`
- [x] Re-export food search and Future You types from package in PWA shims
- [x] Verify `turbo typecheck` and PWA Vitest pass

## Test tasks

- [x] `npm run typecheck` from root passes
- [x] `npm run test --workspace=@newyouai/pwa` passes

## Dependencies

RN-0-07 (Expo Router root layout)

## Notes

- RN-1-08 will migrate remaining PWA logic imports; this story is types-only extraction
- `packages/*` must not import React — `ScreenProps` stays in PWA

## Dev Agent Record

### Implementation Plan

- Domain types split by area: workout, nutrition, onboarding, progress, future-you, food-search
- PWA keeps React-coupled screen props locally; all persisted/synced state types shared

### Completion Notes

- Extracted ~550 lines of domain types into 12 modules under `packages/types/src/`
- PWA `types.ts` now re-exports from `@newyouai/types` + keeps `ScreenProps` / `IconProps`
- All 624 Vitest tests pass; turbo typecheck green across 9 packages
- Next story: RN-1-02 (storage adapter interface + AsyncStorage impl)

## File List

- `packages/types/src/*.ts`
- `packages/types/package.json`
- `apps/pwa/src/fitness/types.ts`
- `apps/pwa/src/fitness/foodSearchTypes.ts`
- `apps/pwa/src/fitness/futureYouDraft.ts`
- `apps/pwa/src/fitness/futureYouJobs.ts`
- `apps/pwa/src/fitness/theme.ts`
- `apps/pwa/package.json`

## Change Log

- 2026-06-10: Extract shared domain types to `@newyouai/types`
