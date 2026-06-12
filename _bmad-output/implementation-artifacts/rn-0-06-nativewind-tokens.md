---
name: RN-0-06 NativeWind + tokens scaffold
epic: RN-0
story: 06
status: done
completed: 2026-06-10
---

# RN-0-06: NativeWind + tokens scaffold

## User story

**As a** developer  
**I want** NativeWind configured in `@newyouai/mobile` with brand tokens from `theme.ts`  
**So that** RN screens can use Tailwind utilities aligned with the PWA design system

## Acceptance criteria

1. **Given** `apps/mobile`, **When** I run `npm run typecheck`, **Then** NativeWind types and token imports compile
2. **Given** `packages/config/tokens.ts`, **When** compared to `apps/pwa/src/fitness/theme.ts`, **Then** dark/light color palettes match
3. **Given** the home screen, **When** rendered, **Then** layout uses `className` with token utilities (`bg-background`, `text-foreground`, etc.)
4. **Given** `tailwind.preset.ts`, **When** web/admin/mobile consume it, **Then** shared semantic color tokens are available

## Tasks

- [x] Add `packages/config/tokens.ts` derived from PWA `theme.ts`
- [x] Extend `packages/config/tailwind.preset.ts` with tokens (colors, spacing, radii)
- [x] Install NativeWind v4 + Tailwind in `apps/mobile`
- [x] Add `global.css`, `babel.config.js`, `metro.config.js`, `tailwind.config.ts`
- [x] Import `global.css` in root `_layout.tsx`
- [x] Convert home screen from StyleSheet to NativeWind `className`
- [x] Align `constants/Colors.ts` with shared tokens
- [x] Add token parity unit tests in `@newyouai/config`
- [x] Update Maestro smoke copy for RN-0-06

## Dependencies

RN-0-05

## Notes

- Light/dark theme switching via `dark:` utilities is deferred to RN-0-07 (root layout + splash)
- Web/admin presets now include expanded token map; existing classes remain valid
