---
name: RN-3-04 Settings stack navigation
epic: RN-3
story: 04
status: ready-for-dev
swarm_order: 4
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.04: Settings stack navigation

Status: ready-for-dev

## Story

**As a** signed-in user  
**I want** to open Settings and drill into panel routes  
**So that** account and preference screens can be added in RN-10 without navigation rework

## Acceptance Criteria

1. **Given** signed in on home tab, **When** I tap settings entry (gear), **Then** settings hub opens (not a bottom tab)
2. **Given** settings hub, **When** I tap a panel row (e.g. Account), **Then** `(tabs)/settings/[panel]` pushes on stack
3. **Given** a panel screen, **When** I tap back, **Then** I return to settings hub
4. **Given** settings hub, **When** rendered, **Then** `testID="settings-hub"` is present

## Tasks / Subtasks

- [ ] Add `(tabs)/settings/_layout.tsx` Stack navigator (AC: 2–3)
- [ ] Add `(tabs)/settings/index.tsx` hub shell listing sample panels (AC: 1, 4)
  - [ ] Rows: Account (`account`), Notifications (`notifications`) with `testID`s
- [ ] Add `(tabs)/settings/[panel].tsx` dynamic shell — title from route param (AC: 2–3)
- [ ] Settings entry from home tab stub — gear icon/button `testID="open-settings"` (AC: 1)
  - [ ] Hide settings from tab bar: `Tabs.Screen name="settings" options={{ href: null }}`
- [ ] Preserve `home-sign-out` on home stub OR document move to settings account stub (coordinate RN-10; keep on home for Maestro until RN-10)
- [ ] Manual stack push/pop verification (AC: 3)

## Dev Notes

### PWA behavior vs RN approach

PWA treats `settings` as a `TabId` and hides the tab bar when `tab === "settings"`. RN uses **stack push from home** instead — settings is not a bottom tab.

```381:389:apps/pwa/src/fitness/FitnessApp.tsx
  const hideTabBar =
    tab === "settings" ||
    tabBarEnterDelayed ||
    // ...
```

RN: gear on home → `router.push("/(tabs)/settings")` — tab bar remains visible on hub (acceptable shell stub).

### Architecture compliance

- Architecture lists `(tabs)/settings` + panel stack push
- Deep link `newyouai://settings/account` handled in RN-3-06 — panel route param must match `[panel]` dynamic segment

### File structure requirements

**Create:**

- `apps/mobile/app/(tabs)/settings/_layout.tsx`
- `apps/mobile/app/(tabs)/settings/index.tsx`
- `apps/mobile/app/(tabs)/settings/[panel].tsx`

**Update:**

- `apps/mobile/app/(tabs)/_layout.tsx` — register hidden `settings` screen
- `apps/mobile/app/(tabs)/home.tsx` — gear entry button

### Hub shell content (minimal)

- Header "Settings"
- Two tappable rows linking to `/(tabs)/settings/account` and `/(tabs)/settings/notifications`
- `testID="settings-hub"`, `testID="settings-panel-account"`, etc.

Panel shell: display panel name from `useLocalSearchParams().panel`, back header, `testID="settings-panel-{panel}"`.

Do **not** port 13 settings panels from `ScreenSettings.tsx` — content is RN-10.

### PWA reference (structure only)

- `apps/pwa/src/fitness/screens/ScreenSettings.tsx` — panel list patterns

### Previous story intelligence

- RN-3-01: home tab stub exists with sign-out — add gear without breaking layout
- RN-3-02: settings only reachable when shell routes to `(tabs)`

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: home → settings hub → account panel → back → hub.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Settings stack scaffold | 13 panel implementations (RN-10) |
| Sample panel shells | Sign-out relocation (keep `home-sign-out`) |
| Hidden from tab bar | Theme picker, goal settings, delete account |

### References

- [architecture-rn-migration.md §3](../planning-artifacts/architecture-rn-migration.md)
- [sprint-rn-3-app-shell-plan.md](sprint-rn-3-app-shell-plan.md) RN-3-04

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
