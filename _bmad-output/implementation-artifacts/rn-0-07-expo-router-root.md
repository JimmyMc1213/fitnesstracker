---
name: RN-0-07 Expo Router root layout + splash
epic: RN-0
story: 07
status: done
baseline_commit: 9e2eea78309a792f80e5482946d5b233cdb8501d
completed: 2026-06-10
---

# RN-0-07: Expo Router root layout + splash screen

## User story

**As a** developer  
**I want** a production-ready Expo Router root layout with branded boot splash and system-aware theming  
**So that** RN screens inherit correct tokens in light/dark mode before feature ports begin

## Acceptance criteria

1. **Given** `apps/mobile/app/_layout.tsx`, **When** the app boots, **Then** native splash hides after fonts load and an in-app NewYou boot splash fades out (≥1.4s visible)
2. **Given** system appearance changes, **When** home renders, **Then** NativeWind semantic classes (`bg-background`, `text-foreground`) reflect light/dark tokens from `packages/config/tokens.ts`
3. **Given** root layout, **When** inspected, **Then** `SafeAreaProvider`, `StatusBar`, and token-driven React Navigation theme are wired
4. **Given** Maestro smoke, **When** run against dev client, **Then** home title and RN-0-07 placeholder copy are visible

## Tasks

- [x] Add `packages/config/theme-vars.ts` with `themeCssVars()` for NativeWind `vars()`
- [x] Add `ThemeShell` (SafeAreaProvider + StatusBar + CSS variable context)
- [x] Add `BootSplash` + `NewYouSplashMark` aligned with PWA splash timing
- [x] Refactor root `_layout.tsx` — navigation theme from tokens, boot splash overlay
- [x] Override mobile Tailwind semantic colors to use CSS variables
- [x] Bridge `useColorScheme` to NativeWind system appearance API
- [x] Unit tests for `theme-vars`
- [x] Update Maestro smoke copy and home placeholder
- [x] Document RN-0-07 in `docs/eas-ios.md`

## Dependencies

RN-0-06

## Dev Agent Record

### Implementation Plan

- Runtime theme switching via NativeWind `vars(themeCssVars(scheme))` on root `View` (reliable on iOS vs `@media` in CSS)
- Native `expo-splash-screen` covers font load; `BootSplash` provides NewYou-branded mark handoff
- React Navigation theme colors sourced from shared tokens

### Completion Notes

- RN-0 epic foundation complete — next story is RN-1-01 (extract types package)
- Epic RN-0 complete; sprint tracker marks story `review`

## File List

- `packages/config/theme-vars.ts`
- `packages/config/theme-vars.test.ts`
- `packages/config/package.json`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/tailwind.config.ts`
- `apps/mobile/components/ThemeShell.tsx`
- `apps/mobile/components/BootSplash.tsx`
- `apps/mobile/components/NewYouSplashMark.tsx`
- `apps/mobile/components/useColorScheme.ts`
- `apps/mobile/lib/splashTiming.ts`
- `apps/mobile/.maestro/smoke.yaml`
- `docs/eas-ios.md`

## Change Log

- 2026-06-10: RN-0-07 root layout, boot splash, and system-aware NativeWind theme vars
- 2026-06-11: Rebrand boot splash to NewYou (remove Gymmy from RN mobile)
