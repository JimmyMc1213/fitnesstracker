---
name: RN-0-05 CI mobile typecheck
epic: RN-0
story: 05
status: done
---

# RN-0-05: CI mobile typecheck

## User story

**As a** developer  
**I want** `@newyouai/mobile` typecheck in GitHub Actions  
**So that** RN regressions are caught on every PR to `main`

## Acceptance criteria

1. **Given** a PR to `main`, **When** CI runs, **Then** `@newyouai/mobile` `tsc --noEmit` executes
2. **Given** `turbo.json`, **When** mobile env vars change, **Then** `EXPO_PUBLIC_SUPABASE_*` are tracked for build cache
3. **Given** CI env, **When** Supabase is not configured, **Then** typecheck still passes (placeholder app, RN-0-01)

## Tasks

- [x] Split CI typecheck and build steps in `.github/workflows/ci.yml`
- [x] Add explicit `Mobile typecheck` step (`--filter=@newyouai/mobile`)
- [x] Add `EXPO_PUBLIC_SUPABASE_*` to CI step env and `turbo.json` build env
- [x] Document CI gate in `docs/setup.md`

## Dependencies

RN-0-04

## Notes

- Maestro E2E in CI is a separate future job (EAS Workflow); RN-0-03 smoke is local/dev for now
- Monorepo `turbo run typecheck` already included mobile; explicit step makes the gate visible in Actions UI
