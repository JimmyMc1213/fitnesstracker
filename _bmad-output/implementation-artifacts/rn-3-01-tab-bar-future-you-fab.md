---
name: RN-3-01 Tab bar with Future You FAB
epic: RN-3
story: 01
status: ready-for-dev
swarm_order: 1
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.01: Tab bar with Future You FAB

Status: ready-for-dev

## Story

**As a** signed-in user  
**I want** the main tab bar with a Future You FAB matching the PWA layout  
**So that** I can navigate between core app areas while native feature screens are built in later epics

## Acceptance Criteria

1. **Given** signed in with onboarding complete (stub until RN-3-02), **When** I reach `(tabs)`, **Then** I see tabs: Home, Nutrition, Workout, Progress
2. **Given** the tab bar, **When** I look at the dock, **Then** a Future You FAB labeled **NewYou** is visible and tappable (`testID="tab-fab-future-you"`)
3. **Given** any main tab, **When** I tap it, **Then** the corresponding placeholder screen renders with a unique `testID`
4. **Given** the Future You FAB, **When** I tap it, **Then** `future-you` placeholder screen renders with `testID="tab-future-you"`
5. **Given** RN-2 auth flows, **When** Maestro `npm run test:e2e:auth-all` runs, **Then** all auth YAML flows still pass

## Tasks / Subtasks

- [ ] Replace `(tabs)/_layout.tsx` with PWA-parity custom tab bar (4 tabs + elevated FY FAB) (AC: 1–4)
  - [ ] Use Expo Router `Tabs` with `tabBar` prop → custom `TabBarDock` component
  - [ ] Wire NativeWind + `useAppTheme` tokens for active/inactive states
- [ ] Add tab routes and remove Expo template files (AC: 3–4)
  - [ ] `home.tsx` — migrate content from current `index.tsx` (preserve `home-title`, `home-sign-out`)
  - [ ] `nutrition.tsx`, `workout.tsx`, `progress.tsx`, `future-you.tsx` — placeholder stubs
  - [ ] Delete `two.tsx`; remove `index.tsx` after `home.tsx` exists; set `initialRouteName: "home"`
  - [ ] Hide `future-you` from default tab bar slots (`href: null` on `Tabs.Screen`) — FAB navigates instead
- [ ] Icons aligned with PWA tab set (AC: 1–2)
  - [ ] Home, kitchen/nutrition, barbell/workout, trending/progress, future-you avatar
  - [ ] Prefer `expo-symbols` SF Symbols on iOS; match PWA labels exactly
- [ ] Add Maestro `rn-tab-navigation.yaml` + `npm run test:e2e:tab-nav` script (AC: 3–5)
- [ ] Run `npm run typecheck --workspace=@newyouai/mobile` (AC: 5)

## Dev Notes

### Current state (must read before editing)

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/_layout.tsx` | Expo template: `index` + `two`, generic symbols | Custom tab bar + 5 routes |
| `apps/mobile/app/(tabs)/index.tsx` | Home stub with sign-out (`home-title`, `home-sign-out`) | Move to `home.tsx` |
| `apps/mobile/app/(tabs)/two.tsx` | Template tab | **Delete** |
| `apps/mobile/app/modal.tsx` | Expo template linked from tab header | Remove header link; modal shells are RN-3-03 |

`useAuthGate` still routes signed-in users to `/(tabs)` with no onboarding branch — acceptable for RN-3-01; RN-3-02 adds `(onboarding)`.

### PWA parity reference

```324:335:apps/pwa/src/fitness/FitnessApp.tsx
  const MAIN_TABS: { id: TabId; label: string; Icon: typeof IconHome }[] = [
    { id: "home", label: "Home", Icon: IconHome },
    { id: "nutrition", label: "Nutrition", Icon: IconToolsKitchen2 as typeof IconHome },
    { id: "workout", label: "Workout", Icon: IconBarbell as typeof IconHome },
    { id: "progress", label: "Progress", Icon: IconTrendingUp as typeof IconHome },
  ];

  const FUTURE_YOU_TAB = {
    id: "future_you" as const,
    label: "NewYou",
    Icon: IconFutureYou as typeof IconHome,
  };
```

PWA CSS class `tabbar-dock` — replicate layout: 4 equal tabs + centered elevated FAB overlapping dock. Tab bar **hide on overlays** (log food, workout editor, etc.) is **out of scope** until RN-6+.

### Architecture compliance

- Route map per [architecture-rn-migration.md §3](../planning-artifacts/architecture-rn-migration.md): `(tabs)/home`, `nutrition`, `workout`, `progress`, `future-you`
- Settings is **not** a bottom tab — gear entry from home stub ships in RN-3-04
- User-facing copy: **NewYou** / **New You AI** only (no Gymmy)

### File structure requirements

**Create:**

- `apps/mobile/components/TabBarDock.tsx` — custom tab bar + FAB
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/app/(tabs)/nutrition.tsx`
- `apps/mobile/app/(tabs)/workout.tsx`
- `apps/mobile/app/(tabs)/progress.tsx`
- `apps/mobile/app/(tabs)/future-you.tsx`
- `apps/mobile/.maestro/rn-tab-navigation.yaml`

**Update:**

- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/package.json` — add `"test:e2e:tab-nav"` script

**Delete:**

- `apps/mobile/app/(tabs)/two.tsx`
- `apps/mobile/app/(tabs)/index.tsx` (after `home.tsx` migration)

### testID contract (Maestro)

| Screen | testID |
|--------|--------|
| Home | `tab-home` (root View; keep `home-title`, `home-sign-out`) |
| Nutrition | `tab-nutrition` |
| Workout | `tab-workout` |
| Progress | `tab-progress` |
| Future You screen | `tab-future-you` |
| Future You FAB (dock) | `tab-fab-future-you` |

### Maestro harness

Mirror auth YAML cold-start pattern: `launchApp` → `openLink` (Metro `:8082`) → `subflows/dev-client-connect.yaml` → sign-in subflow or reuse session → tap tabs by testID.

### Anti-patterns (RN-2 lessons)

- **Do not** add `router.replace("/(tabs)/…")` from tab taps — Expo Router handles tab navigation
- **Do not** remove or relocate `home-sign-out` without updating Maestro auth flows
- **Do not** implement tab screen content beyond placeholder title + subtitle

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all          # regression gate
npm run test:e2e:tab-nav           # new — after Maestro YAML added
```

Maestro prerequisites: JDK 17, dev client on simulator, Metro on **port 8082** if 8081 is occupied (`npx expo start --dev-client --port 8082`).

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Tab bar chrome + placeholder screens | Home/coach UI (RN-5) |
| FY FAB navigation to stub | Future You feature content (RN-9) |
| Maestro tab smoke | Onboarding routing (RN-3-02) |
| Preserve auth Maestro testIDs | Tab bar hide on modals/editors (RN-6+) |

### References

- [sprint-rn-3-app-shell-plan.md](sprint-rn-3-app-shell-plan.md) — RN-3-01 deliverables
- [architecture-rn-migration.md §3 Tab mapping](../planning-artifacts/architecture-rn-migration.md)
- [epics-rn-migration.md RN-3](../planning-artifacts/epics-rn-migration.md)
- PWA icons: `apps/pwa/src/fitness/icons.tsx`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
