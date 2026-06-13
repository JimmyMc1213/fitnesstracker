---
name: RN-10-03 Appearance + Units panels
epic: RN-10
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-10/settings-account
---

# Story 10.03: Appearance + Units panels

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10-03 -->

## Story

**As a** user  
**I want** to switch app theme and measurement units in Settings  
**So that** appearance and units match PWA panels ST-04 and ST-05

## Acceptance Criteria

1. **Given** Appearance panel, **When** I select Light or Dark, **Then** `useAppTheme().setTheme` updates immediately and `writeStoredTheme` persists choice
2. **Given** app relaunch, **When** Appearance loads, **Then** previously selected theme restores via `readStoredTheme`
3. **Given** Units panel, **When** I change weight/height/volume units, **Then** `unitPreferences` + `unitPreferencesChosen: true` persist through `FitnessProvider`
4. **Given** unit change, **When** I return to Settings hub, **Then** Units row trailing shows `lbs, oz` / `kg, ml` style summary via `weightUnitLabel` + `volumeUnitLabel`
5. **Given** Progress/Workout/Nutrition tabs, **When** units change, **Then** displayed weights/volumes use new units without crash (read same `unitPreferences` slice)

## Tasks / Subtasks

- [ ] Create `components/settings/panels/AppearancePanel.tsx` (AC: 1–2)
  - [ ] Light/Dark segmented control or row toggles (mirror PWA appearance section)
  - [ ] Use `const { theme, setTheme } = useAppTheme()` — already wraps `useThemePreference`
  - [ ] `testID="settings-appearance-light"`, `settings-appearance-dark`
- [ ] Create `components/settings/panels/UnitsPanel.tsx` (AC: 3–5)
  - [ ] Reuse `@/components/onboarding/UnitPreferencePicker` — **do not fork**
  - [ ] On change: `setState(s => ({ ...s, unitPreferences: next, unitPreferencesChosen: true }))`
  - [ ] Import labels from `@/lib/unitConversions` or `@newyouai/core` exports
- [ ] Wire `[panel].tsx` for `appearance` and `units`
- [ ] Hub trailing refresh: use `useFocusEffect` on hub or rely on re-render when popping stack
- [ ] Run typecheck

## Dev Notes

### Current state

| Item | Today | This story |
|------|-------|------------|
| `useAppTheme` | `setTheme` + `writeStoredTheme` works (onboarding OB theme picker uses it) | Expose in Settings Appearance panel |
| `UnitPreferencePicker` | Onboarding only (`app/(onboarding)/index.tsx`) | Reuse in Settings |
| `packages/core/sync/unitPreferences` | `normalizeUnitPreferences`, `DEFAULT_UNIT_PREFERENCES` | Persist through fitness slice |
| Settings panels | Stubs from RN-10-01 | Live panels |

### PWA parity reference

```483:495:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// Hub Preferences: Appearance trailing Dark/Light, Units trailing
```

Port appearance panel renderer from `ScreenSettings.tsx` (search `panel === "appearance"`).

### Implementation guidance

- Theme is **independent** of fitness persist slice — stored in AsyncStorage via `@/lib/themeStorage` (same as onboarding theme step).
- Units are **in** fitness persist — must call fitness context setter so Progress charts, weigh-in, workout weights update.
- `normalizeUnitPreferences` from core should run on save if merging partial patches.

### Anti-patterns

- **Do not** create a second `UnitPreferencePicker` under `components/settings/`
- **Do not** store theme in fitness slice (PWA uses separate `ThemeContext`)
- **Do not** implement fuel/goal panels (RN-10-04)

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
# Manual: toggle dark mode → tab bar + home reflect theme
# Manual: switch kg → Progress weight chart labels update
```

### References

- `apps/mobile/hooks/useAppTheme.ts`, `hooks/useThemePreference.ts`
- `apps/mobile/components/onboarding/UnitPreferencePicker.tsx`
- `packages/core/src/sync/unitPreferences.ts`
- PWA: `ScreenSettings.tsx`, `unitPreferences.test.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
