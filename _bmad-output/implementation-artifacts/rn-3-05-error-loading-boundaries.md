---
name: RN-3-05 Error loading boundaries
epic: RN-3
story: 05
status: ready-for-dev
swarm_order: 5
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.05: Error/loading boundaries

Status: ready-for-dev

## Story

**As a** user  
**I want** branded loading and error states when the app shell fails or bootstraps  
**So that** I never see a blank screen or raw React error overlay in production paths

## Acceptance Criteria

1. **Given** session not yet resolved, **When** app loads, **Then** `testID="app-shell-loading"` branded spinner shows
2. **Given** a render error in `(tabs)`, **When** error boundary catches it, **Then** friendly fallback with retry shows `testID="app-shell-error"`
3. **Given** root layout error, **When** Expo `ErrorBoundary` triggers, **Then** themed fallback renders (not white screen)
4. **Given** boot splash completes, **When** shell loading starts, **Then** transition is smooth (no double flash)

## Tasks / Subtasks

- [ ] Extract/refine `AppShellLoading` from `SessionLoadingGate` with `testID="app-shell-loading"` (AC: 1, 4)
  - [ ] Use `isAppShellLoading()` from `@newyouai/core` when RN-3-02 landed
  - [ ] Branded spinner via `useAppTheme` tokens
- [ ] Custom root `ErrorBoundary` fallback (AC: 3)
  - [ ] Replace default Expo export with themed component + retry
  - [ ] Export from `app/_layout.tsx` per Expo Router pattern
- [ ] Route-level error boundary wrapper for `(tabs)` group (AC: 2)
  - [ ] `(tabs)/_layout.tsx` wraps children in `AppShellErrorBoundary`
  - [ ] Retry remounts children or `router.replace("/(tabs)/home")`
- [ ] Coordinate `BootSplash` dismiss timing with shell loading (AC: 4)
  - [ ] BootSplash hides when fonts loaded; shell loading covers session/bootstrap gap
- [ ] Dev-only throw button on a tab stub (`__DEV__` guarded) for manual boundary test (AC: 2)

## Dev Notes

### Current state (must read before editing)

```82:98:apps/mobile/app/_layout.tsx
function SessionLoadingGate({ children }: { children: ReactNode }) {
  const { configured, sessionResolved } = useAuth();
  // ...
  if (configured && !sessionResolved) {
    return (
      <View testID="auth-session-loading">
        <ActivityIndicator />
      </View>
    );
  }
  return children;
}
```

Rename testID to `app-shell-loading` (or alias both during transition). After RN-3-02, gate on full `isAppShellLoading()` input, not just `sessionResolved`.

Root already re-exports Expo `ErrorBoundary` — customize fallback UI.

`BootSplash` overlays root until animation completes — coordinate so user doesn't see flash: white → splash → loading → app.

### PWA reference

- `apps/pwa/src/fitness/AppSplashScreen.tsx`
- `FitnessApp.tsx` — `needsBootSplash`, loading gate before main view

### File structure requirements

**Create:**

- `apps/mobile/components/AppShellLoading.tsx`
- `apps/mobile/components/AppShellErrorBoundary.tsx`
- `apps/mobile/components/AppShellErrorFallback.tsx`

**Update:**

- `apps/mobile/app/_layout.tsx` — custom ErrorBoundary export, AppShellLoading
- `apps/mobile/app/(tabs)/_layout.tsx` — wrap with error boundary
- Optionally one tab stub with `__DEV__` crash button

### Error fallback UX

- Title: "Something went wrong"
- Subtitle: short friendly copy
- Retry button → reset error boundary state
- Themed background/text from `useAppTheme`
- `testID="app-shell-error"`, retry `testID="app-shell-error-retry"`

### Anti-patterns

- **Do not** add Sentry/crash reporting
- **Do not** leave dev throw button in production paths without `__DEV__` guard
- **Do not** break existing `auth-session-loading` Maestro flows without updating YAML if testID changes

### Previous story intelligence

- RN-3-02 introduces broader loading states (hydration stub) — this story unifies branded UI
- RN-0-07 established `BootSplash` — preserve animation timing

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: tap dev throw button → see fallback → retry → screen recovers.

Maestro error-path coverage **not required** for story done.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Branded loading/error UI | Sentry / crash analytics |
| Root + tabs error boundaries | Network error toasts |
| BootSplash coordination | Offline sync error states |

### References

- [sprint-rn-3-app-shell-plan.md](sprint-rn-3-app-shell-plan.md) RN-3-05
- `apps/mobile/components/BootSplash.tsx`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
