---
name: RN-3-02 appShellRouting parity
epic: RN-3
story: 02
status: ready-for-dev
swarm_order: 2
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.02: appShellRouting parity (loading/auth/app)

Status: ready-for-dev

## Story

**As a** returning user  
**I want** the app shell to route me through loading, auth, or app states like the PWA  
**So that** onboarding and main tabs appear only when appropriate

## Acceptance Criteria

1. **Given** Supabase configured and session resolving, **When** app launches, **Then** loading gate shows until `sessionResolved` (`testID="app-shell-loading"`)
2. **Given** signed out, **When** shell resolves, **Then** user is in `(auth)` only
3. **Given** signed in and `onboardingComplete: false`, **When** shell resolves, **Then** user lands on `(onboarding)` stub (not tabs)
4. **Given** signed in and `onboardingComplete: true`, **When** shell resolves, **Then** user lands on `(tabs)`
5. **Given** PWA Vitest suite, **When** `appShellRouting` tests run in `packages/core`, **Then** all cases pass (ported from PWA unchanged)
6. **Given** Supabase is not configured, **When** the app launches, **Then** auth/onboarding gates are bypassed and user can reach `(tabs)` (RN-2-01 AC6 / smoke.yaml parity)

## Tasks / Subtasks

- [ ] Extract `appShellRouting` to `packages/core` (AC: 5)
  - [ ] `packages/core/src/shell/appShellRouting.ts` — copy from PWA verbatim
  - [ ] `packages/core/src/shell/appShellRouting.test.ts` — port tests
  - [ ] Export from `packages/core/src/index.ts`
  - [ ] PWA `apps/pwa/src/fitness/appShellRouting.ts` → re-export from `@newyouai/core` (no behavior change)
- [ ] Add `useAppShellGate` hook replacing auth-only `useAuthGate` (AC: 2–4)
  - [ ] Compute `AppShellRoutingInput` from `AuthContext` + local onboarding stub state
  - [ ] Shell router owns all post-session redirects — **no** `router.replace` from auth forms (RN-2 lesson)
  - [ ] Route to `(auth)` | `(onboarding)` | `(tabs)` based on `resolveAppShellMainView` + `canReachOnboardingWizard`
- [ ] Create `(onboarding)` stub route group (AC: 3)
  - [ ] `(onboarding)/_layout.tsx` + `index.tsx` with `testID="onboarding-stub"`
  - [ ] Copy: "Onboarding ships in RN-4"
- [ ] Local `onboardingComplete` stub until RN-4/RN-OFFLINE (AC: 3–4)
  - [ ] AsyncStorage key e.g. `@newyouai/onboardingComplete` default `true` for dev/Maestro
  - [ ] Document dev override in story notes + `docs/env-matrix.md`
- [ ] Signed-in hydration loading placeholder (AC: 1)
  - [ ] Stub `fitnessHydrated: true` OR short timed gate — no cloud sync yet
  - [ ] Stub `signInRestorePending: false` until RN-OFFLINE
- [ ] Update root `_layout.tsx` Stack: `(auth)`, `(onboarding)`, `(tabs)` (AC: 2–4)
- [ ] Preserve unconfigured Supabase bypass in `useAppShellGate` (AC: 6)
  - [ ] When `!configured`: skip auth/onboarding redirects; allow `(tabs)` (matches current `useAuthGate`)
- [ ] Introduce `testID="app-shell-loading"` on loading gate (AC: 1); RN-3-05 extracts branded `AppShellLoading` component

## Dev Notes

### Current state (must read before editing)

```7:31:apps/mobile/hooks/useAuthGate.ts
/** Redirects between `(auth)` and `(tabs)` based on Supabase session. */
export function useAuthGate() {
  // ...
  if (session && inAuthGroup) {
    router.replace("/(tabs)");
  }
}
```

This **always** sends signed-in users to tabs — must become onboarding-aware.

```1:43:apps/pwa/src/fitness/appShellRouting.ts
export function resolveAppShellMainView(input: AppShellRoutingInput): AppShellMainView {
  if (isAppShellLoading(input)) return "loading";
  if (needsAuthForApp(input)) return "auth";
  return "app";
}

export function canReachOnboardingWizard(input: AppShellRoutingInput): boolean {
  return resolveAppShellMainView(input) === "app" && !input.skipOnboarding && !input.onboardingComplete;
}
```

`appShellRouting` is **not yet** in `packages/core` — extract follows RN-1 pattern (`mergePersistedFitnessSlices` re-export).

### Shell routing decision tree

```
sessionResolved?  NO  → loading
needsAuthForApp?  YES → (auth)
canReachOnboardingWizard? YES → (onboarding)
else → (tabs)
```

When `!configured`, skip the tree above — gate must not redirect to `(auth)` or `(onboarding)`.

PWA input wiring reference: `FitnessApp.tsx` `shellRoutingInput` (lines ~397–405).

### Architecture compliance

| PWA state | RN route group |
|-----------|----------------|
| `loading` | Root loading gate (BootSplash + `app-shell-loading`) |
| `auth` | `(auth)/*` |
| onboarding incomplete | `(onboarding)/index` stub |
| `app` | `(tabs)/*` |

Coordinate with RN-1-04 `onboarding/routing.ts` in core — wizard step logic stays there; this story only routes **to** onboarding group.

### File structure requirements

**Create:**

- `packages/core/src/shell/appShellRouting.ts`
- `packages/core/src/shell/appShellRouting.test.ts`
- `apps/mobile/hooks/useAppShellGate.ts`
- `apps/mobile/hooks/useOnboardingStub.ts` (or `lib/onboardingStub.ts`)
- `apps/mobile/app/(onboarding)/_layout.tsx`
- `apps/mobile/app/(onboarding)/index.tsx`

**Update:**

- `packages/core/src/index.ts`
- `apps/pwa/src/fitness/appShellRouting.ts` — re-export
- `apps/pwa/src/fitness/appShellRouting.test.ts` — import from core or delete duplicate
- `apps/mobile/app/_layout.tsx` — Stack screens + swap `useAuthGate` → `useAppShellGate`
- `apps/mobile/hooks/useAuthGate.ts` — deprecate/remove or fold into `useAppShellGate`

### Onboarding stub for Maestro / dev

Default `onboardingComplete: true` so existing auth Maestro flows still land on tabs.

To test onboarding path manually:

```javascript
// AsyncStorage or dev menu
await AsyncStorage.setItem('@newyouai/onboardingComplete', 'false');
```

Re-run app signed-in → expect `onboarding-stub`, not tabs.

### Anti-patterns

- **Do not** implement onboarding wizard steps (RN-4)
- **Do not** wire fitness cloud sync / `signInRestorePending` restore (RN-OFFLINE)
- **Do not** break PWA — run `npm run test --workspace=@newyouai/core` before and after extract

### Testing requirements

```bash
npm run test --workspace=@newyouai/core     # appShellRouting Vitest
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all                   # must stay green
```

Manual: toggle onboarding stub → verify `(onboarding)` vs `(tabs)`.

### Previous story intelligence (RN-3-01)

- Tab routes must exist before shell can route to `(tabs)/home`
- Preserve `home-sign-out` and auth Maestro testIDs
- Custom tab bar from RN-3-01 — shell gate should use `router.replace("/(tabs)/home")` not bare `/(tabs)` if needed for deep links later

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| `appShellRouting` extract + tests | Onboarding wizard UI (RN-4) |
| `(onboarding)` stub route | Cloud hydration (RN-OFFLINE) |
| `useAppShellGate` | RevenueCat logIn (RN-4 paywall) |
| Local onboardingComplete stub | `skipOnboarding` fitness-data logic (stub `false`) |

### References

- [architecture-rn-migration.md §3 Shell routing](../planning-artifacts/architecture-rn-migration.md)
- [RN-2-01 completion notes](rn-2-01-supabase-securestore.md) — auth-first cold start, no form-level replace
- PWA tests: `apps/pwa/src/fitness/appShellRouting.test.ts`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
