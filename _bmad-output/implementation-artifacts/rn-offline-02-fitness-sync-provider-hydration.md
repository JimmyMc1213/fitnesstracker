---
name: RN-OFFLINE-02 FitnessSyncProvider + hydration pull
epic: RN-OFFLINE
story: 02
status: done
swarm_order: 2
swarm_branch: epic-rn-offline/cloud-sync
---

# Story OFFLINE-02: FitnessSyncProvider + hydration pull

Status: ready-for-dev

## Story

**As a** signed-in user opening the app  
**I want** my fitness data pulled from Supabase and merged into local state before the main shell renders  
**So that** I see my cloud-backed profile on this device with PWA-parity hydration behavior

## Acceptance Criteria

1. **Given** Supabase configured + valid session, **When** app loads, **Then** `FitnessSyncProvider` runs hydration pull before `fitnessHydrated` becomes true (max 5s timeout, then proceed with local slice)
2. **Given** local slice has `onboardingComplete !== true` and no normalized onboarding draft, **When** hydration runs, **Then** `pullRemoteMergeAlways` restores full cloud snapshot (welcome / fresh-install path)
3. **Given** onboarded local slice + remote newer than `lastSeenRemoteUpdatedAtMs`, **When** hydration runs, **Then** `pullRemoteIntoLocal` merges and `replaceFitnessState` updates UI + AsyncStorage
4. **Given** `useAppShellGate`, **When** signed in and sync pending, **Then** `fitnessHydrated` from sync context gates shell (remove hardcoded `true` in `useAppShellGate.ts`)
5. **Given** OAuth user metadata `full_name` and empty local `displayName`, **When** session established, **Then** display name seeds into fitness state (PWA parity)
6. **Given** no Supabase config or signed out, **When** app loads, **Then** `fitnessHydrated` true immediately; no pull attempted
7. **Given** RN-OFFLINE-01 engine, **When** typecheck runs, **Then** mobile builds with `FitnessSyncProvider` in root layout

## Tasks / Subtasks

- [ ] Create `apps/mobile/lib/fitness/createSupabaseSyncClient.ts` (AC: 1–3)
  - [ ] Implement `FitnessSyncClient` from core using `getSupabase().from("fitness_user_data")`
- [ ] Create `apps/mobile/context/FitnessSyncContext.tsx` (AC: 1, 4, 6)
  - [ ] **Sync-only** context value: `configured`, `busy`, `lastError`, `lastSyncedLabel`, `fitnessHydrated`, `syncNow`, `restoreFromCloud`
  - [ ] **Do not** expose `signInWithPassword` / OAuth — use `useAuth()` for session
  - [ ] `useFitnessSync()` hook + disabled stub when provider missing
- [ ] Implement hydration pull effect (AC: 1–3, 5)
  - [ ] `HYDRATION_PULL_TIMEOUT_MS = 5000` (match PWA)
  - [ ] On `session.user.id` + `sessionResolved`: run pull, then set `fitnessHydrated`
  - [ ] After merge: call `migratePersistedFitnessSlice` (port from PWA or extract to core if missing)
  - [ ] `replaceFitnessState(buildFitnessAppState(merged))` via `useFitnessState()`
  - [ ] `saveSyncMeta` + `savePersistedSlice` after successful pull
  - [ ] `displayNameFromUser` seed on auth metadata change
- [ ] Wire providers in `apps/mobile/app/_layout.tsx` (AC: 7)
  - [ ] Order: `AuthProvider` → `FitnessProvider` → `FitnessSyncProvider` → nav
  - [ ] `FitnessSyncProvider` must read/write fitness state from inner `FitnessProvider`
- [ ] Update `apps/mobile/hooks/useAppShellGate.ts` (AC: 4)
  - [ ] `buildShellRoutingInput` reads `fitnessHydrated` from `useFitnessSync()`
  - [ ] `AppShellLoadingGate` waits on `!fitnessHydrated` when configured + signed in
- [ ] Stub `syncNow` / `restoreFromCloud` (no-op or pull-only) until RN-OFFLINE-03/04
- [ ] Run gates

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `useAppShellGate.ts` | `fitnessHydrated: true` hardcoded | Wire to sync context |
| `FitnessContext.tsx` | Local AsyncStorage only | Consumed by sync for merge writes |
| `AuthContext.tsx` | Session resolved | Sync reads `session.user.id` |
| `_layout.tsx` | Auth → Fitness | Add FitnessSync between them |
| `AccountPanel.tsx` | "Signed in" stub | RN-OFFLINE-04 |

**Depends on RN-OFFLINE-01** — core engine + syncMeta must exist.

### Provider nesting (required)

```
AuthProvider
  FitnessProvider          # local hydrate on mount
    FitnessSyncProvider    # cloud pull after session; writes via replaceFitnessState
      RootLayoutNav
```

`FitnessSyncProvider` cannot wrap `FitnessProvider` outside — it needs `useFitnessState()`.

### PWA parity reference

```220:293:apps/pwa/src/fitness/fitnessCloudSync.ts
// runPullForUser, hydration timeout, needsFullRestore branch
```

```30:40:apps/pwa/src/fitness/fitnessCloudSync.ts
// persistSliceWithMigration after merge
```

### migratePersistedFitnessSlice

PWA `migrateTrainingSchedule.ts` runs after cloud merge. If not in core yet, either:
- Extract to `packages/core/src/sync/migratePersistedFitnessSlice.ts` in this story, or
- Port minimal wrapper in `apps/mobile/lib/fitness/migratePersistedFitnessSlice.ts`

Must run before `savePersistedSlice` after every pull merge.

### Anti-patterns

- **Do not** duplicate auth APIs on sync context (RN-2 owns auth)
- **Do not** implement debounced push (RN-OFFLINE-03)
- **Do not** update AccountPanel UI (RN-OFFLINE-04)
- **Do not** block unsigned users on `fitnessHydrated` — only signed-in + configured

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
```

Manual: sign in with seeded `fitness_user_data` row → home shows remote displayName / workout data.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Hydration pull + fitnessHydrated gate | Debounced auto-push (RN-OFFLINE-03) |
| FitnessSyncProvider (sync-only API) | Account panel sync UI (RN-OFFLINE-04) |
| Supabase client adapter | Maestro sync flow (RN-OFFLINE-05) |
| displayName seed from metadata | Post-OAuth `signIn=1` restore (RN-OFFLINE-04) |

### References

- [sprint-rn-offline-sync-plan.md](sprint-rn-offline-sync-plan.md) RN-OFFLINE-02
- [rn-offline-01-sync-core-extract-pull-push.md](rn-offline-01-sync-core-extract-pull-push.md)
- PWA: `fitnessCloudSync.ts`, `FitnessSyncContext.tsx`
- Mobile: `app/_layout.tsx`, `hooks/useAppShellGate.ts`, `context/FitnessContext.tsx`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
