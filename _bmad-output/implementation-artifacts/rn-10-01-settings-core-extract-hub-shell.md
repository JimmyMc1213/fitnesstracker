---
name: RN-10-01 Settings core extract + hub shell
epic: RN-10
story: 01
status: ready-for-dev
swarm_order: 1
swarm_branch: epic-rn-10/settings-account
---

# Story 10.01: Settings core extract + hub shell

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10 kickoff -->

## Story

**As a** developer  
**I want** settings pure logic in `packages/core` and a full settings hub replacing the 2-panel stub  
**So that** RN-10-02..06 share tested goal helpers and users see the complete PWA settings navigation tree (ST-00)

## Acceptance Criteria

1. **Given** PWA `goalSettings.ts` (+ `macroLimits.ts` if fuel panel depends on it), **When** extracted to `packages/core/src/settings/`, **Then** PWA files become thin re-exports and `goalSettings.test.ts` passes unchanged
2. **Given** onboarded user, **When** I open Settings tab, **Then** hub shows profile card + all PWA sections: Account, Preferences, Goals & tracking, Training, Habits, Legal, Socials, Account actions — not the 2-row stub in `settings/index.tsx`
3. **Given** hub row tap, **When** panel id is one of 13 PWA panels, **Then** `(tabs)/settings/[panel]` pushes with title from `PANEL_TITLES` and `testID="settings-panel-{id}"`
4. **Given** hub, **When** fitness state has targets/units/habits, **Then** trailing labels match PWA (`fuel-targets` cal, hydration volume, goal range, habits count, rest timer, equipment)
5. **Given** deep link `newyouai://settings/account`, **When** app opens signed in, **Then** account panel shell renders (body placeholder until RN-10-02)
6. **Given** Maestro tab-nav, **When** `npm run test:e2e:tab-nav` runs, **Then** `testID="settings-hub"` present; no regression on other tabs

## Tasks / Subtasks

- [ ] Extract `packages/core/src/settings/goalSettings.ts` + test from PWA (AC: 1)
  - [ ] Include: `nutritionGoalSettingsLabel`, `latestWeightLbs`, `isGoalWeightValid`, `normalizeGoalProfilePatch`, `applyGoalSettingsDraft`, `isGoalSettingsDirty`, `GOAL_PACE_OPTIONS`, `NUTRITION_GOALS`
  - [ ] Extract `macroLimits.ts` to `packages/core/src/settings/` if not already shared (clamp helpers for RN-10-04)
  - [ ] Export from `packages/core/src/index.ts`
  - [ ] PWA `goalSettings.ts` / `macroLimits.ts` → one-line re-exports
- [ ] Port layout primitives → `apps/mobile/components/settings/` (AC: 2)
  - [ ] `SettingsHubSection.tsx`, `SettingsRow.tsx`, `SettingsProfileCard.tsx`, `SettingsComingSoonRow.tsx`
  - [ ] Match PWA structure from `SettingsLayout.tsx`; use `useAppTheme().colors` + NativeWind card borders
- [ ] Rewrite `apps/mobile/app/(tabs)/settings/index.tsx` (AC: 2, 4)
  - [ ] Port `renderHub()` section order from `ScreenSettings.tsx` (lines 463–607)
  - [ ] `SettingsProfileCard` → `router.push("/(tabs)/settings/you")`
  - [ ] Sign-out row + Delete Account button visible when `sessionEmail` (handlers no-op or disabled until RN-10-06)
  - [ ] Legal/Socials rows: use `SettingsComingSoonRow` until RN-10-06 wires URLs
- [ ] Refactor `apps/mobile/app/(tabs)/settings/[panel].tsx` (AC: 3, 5)
  - [ ] Panel registry mapping id → title (mirror `PANEL_TITLES` in PWA lines 121–134)
  - [ ] Render panel-specific component stub from `components/settings/panels/` or inline placeholder per panel
  - [ ] Shared back header: `testID="settings-panel-back"`
  - [ ] Invalid panel id → safe fallback + back
- [ ] Add hub `testID`s: `settings-hub`, `settings-profile-card`, `settings-row-{panelId}` (AC: 2, 6)
- [ ] Run gates (AC: 1, 6)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/settings/index.tsx` | 2 panels (`account`, `notifications`) | Full PWA hub |
| `apps/mobile/app/(tabs)/settings/[panel].tsx` | Generic stub + "ships in RN-10" | Panel router + titled shells |
| `packages/core/src/settings/` | Does not exist | `goalSettings` (+ `macroLimits`) |
| `apps/pwa/src/fitness/goalSettings.ts` | Source of truth | Re-export from core |
| `packages/core/sync/unitPreferences` | Normalizer exists | Reuse — do not duplicate |
| `deepLinkRouter.ts` | Routes `settings/account` | Must still work after hub expand |

**Blocks RN-10-02..06** — panel bodies stay placeholder until owned by later stories.

### Previous epic intelligence (RN-9 close)

- Core extract pattern: move pure TS to `packages/core/src/<domain>/`, PWA file becomes `export { ... } from "@newyouai/core"`, port Vitest colocated (see `packages/core/src/future-you/`, `packages/core/src/progress/weightProgress.ts`).
- Tab/screen shell pattern: `ScreenHeader` optional on stack child; settings uses stack push from hub (RN-3-04).
- Epic close Maestro seeds via `EXPO_PUBLIC_E2E_FITNESS_SEED` — RN-10-06 adds settings flow; not this story.
- Do not break `npm run test:e2e:future-you`, `test:e2e:progress`, or other regression flows.

### PWA parity reference — hub structure

```463:558:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// renderHub(): profile card, Account, Preferences, Goals & tracking, Training, Habits
```

```121:134:apps/pwa/src/fitness/screens/ScreenSettings.tsx
const PANEL_TITLES: Record<...> = { you, account, appearance, units, fuel-targets, ... }
```

```1:76:apps/pwa/src/fitness/SettingsLayout.tsx
// SettingsHubSection, SettingsRow, SettingsProfileCard, SettingsComingSoonRow
```

### Architecture compliance

- Route: `(tabs)/settings` + `[panel]` stack per [architecture-rn-migration.md](../planning-artifacts/architecture-rn-migration.md) §3
- `_layout.tsx` Stack `headerShown: false` — panels own back nav (RN-3-04)
- Deep link: `apps/mobile/lib/deepLinkRouter.ts` already maps `settings/:panel` — panel param names must match hub ids exactly (`fuel-targets` not `fuel_targets`)
- Fitness state: read via `useFitnessState()` from `@/context/FitnessContext` for trailing labels

### File structure requirements

```
packages/core/src/settings/
  goalSettings.ts + goalSettings.test.ts
  macroLimits.ts + macroLimits.test.ts   # if extracted

apps/mobile/components/settings/
  SettingsHubSection.tsx
  SettingsRow.tsx
  SettingsProfileCard.tsx
  SettingsComingSoonRow.tsx
  panels/
    SettingsPanelPlaceholder.tsx   # optional shared stub

apps/mobile/app/(tabs)/settings/
  index.tsx          # UPDATE — full hub
  [panel].tsx        # UPDATE — panel registry + router
  _layout.tsx        # unchanged
```

PWA re-export example:

```typescript
export {
  applyGoalSettingsDraft,
  isGoalSettingsDirty,
  ...
} from "@newyouai/core";
```

### Anti-patterns

- **Do not** port panel form content (RN-10-02..05)
- **Do not** wire sign-out/delete handlers (RN-10-06) — rows OK disabled
- **Do not** implement `FitnessSyncContext` / cloud sync (RN-OFFLINE)
- **Do not** rename panel route ids — breaks deep links and Maestro
- **Do not** add `notifications` as panel id — PWA uses `reminders` (Tracking reminders)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa    # goalSettings tests via re-export
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Core extract goalSettings (+ macroLimits) | Panel forms (RN-10-02..05) |
| Full hub + 13 panel route shells | Sign-out/delete/legal links (RN-10-06) |
| Hub trailing labels from fitness state | Cloud sync adapter (RN-OFFLINE) |
| Deep link compatibility | Maestro settings flow (RN-10-06) |

### References

- [sprint-rn-10-settings-plan.md](sprint-rn-10-settings-plan.md) RN-10-01
- [prd-rn-migration.md](../planning-artifacts/prd-rn-migration.md) FR-M10
- [pwa-codebase-inventory.md](../planning-artifacts/pwa-codebase-inventory.md) ST-00..ST-13
- PWA: `ScreenSettings.tsx`, `SettingsLayout.tsx`, `goalSettings.ts`
- Mobile: `app/(tabs)/settings/*`, `lib/deepLinkRouter.ts`, `rn-3-04-settings-stack-navigation.md`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
