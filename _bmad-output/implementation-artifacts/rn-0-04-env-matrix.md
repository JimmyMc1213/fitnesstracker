---
name: RN-0-04 Env matrix mobile vars
epic: RN-0
story: 04
status: done
---

# RN-0-04: Env matrix — mobile Supabase vars

## User story

**As a** developer  
**I want** `EXPO_PUBLIC_SUPABASE_*` documented in the env matrix  
**So that** mobile builds use the same Supabase project as the PWA without guessing naming

## Acceptance criteria

1. **Given** `docs/env-matrix.md`, **Then** a Mobile column lists `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. **Given** the matrix, **Then** PWA `VITE_*` ↔ mobile `EXPO_PUBLIC_*` mapping is documented
3. **Given** `apps/mobile/.env.example`, **Then** developers have a copy-paste template for local dev
4. **Given** EAS docs in the matrix, **Then** preview/production secret setup is described

## Tasks

- [x] Add Mobile column to `docs/env-matrix.md`
- [x] Document local `.env`, EAS secrets, and PWA mapping
- [x] Add `apps/mobile/.env.example`
- [x] Cross-link from `docs/eas-ios.md` and root `.env.example`
- [x] Note future vars (`EXPO_PUBLIC_RN_FEATURE_*`, privacy/terms for RN-10)

## Dependencies

RN-0-03

## Notes

- No runtime Supabase client in mobile until RN-2
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` documented as optional legacy fallback (mirrors PWA)
