---
name: RN-OFFLINE-03 Debounced push + conflict merge
epic: RN-OFFLINE
story: 03
status: done
swarm_order: 3
swarm_branch: epic-rn-offline/cloud-sync
---

# Story OFFLINE-03: Debounced push + conflict merge retry

Status: ready-for-dev

## Story

**As a** signed-in user editing fitness data  
**I want** changes debounce-uploaded to Supabase with automatic conflict resolution  
**So that** my phone and other devices stay in sync without manual saves

## Acceptance Criteria

1. **Given** signed-in user changes fitness state, **When** ~1100ms elapses without further edits, **Then** `tryPush` uploads current persisted slice to `fitness_user_data`
2. **Given** push returns `conflict`, **When** retry loop runs, **Then** `pullRemoteMergeAlways` merges remote into local, re-persists, and retries push (max 5 attempts, match PWA)
3. **Given** push succeeds, **When** complete, **Then** `syncMeta.lastSeenRemoteUpdatedAtMs` updates and `lastSyncedLabel` reflects recent sync time
4. **Given** payload too large or network error, **When** push fails, **Then** `lastError` on sync context shows user-facing message
5. **Given** `syncNow()` called manually, **When** invoked, **Then** runs pull then push with same conflict retry (PWA `syncNow` parity)
6. **Given** user signs out, **When** session clears, **Then** pending debounced push cancelled; no push without `user.id`
7. **Given** existing Maestro flows, **When** regression runs, **Then** no double-persist or state regression on home/workout/nutrition tabs

## Tasks / Subtasks

- [ ] Add `syncSig` to `FitnessSyncProvider` (AC: 1)
  - [ ] Derive stable fingerprint from `sliceFromAppState(state)` (JSON stringify or hash of sorted keys)
  - [ ] Increment / change `syncSig` whenever `FitnessProvider` state persists
- [ ] Option A: expose `notifyFitnessStateChanged()` from `FitnessProvider` called after `persistState`
  - [ ] Option B: `FitnessSyncProvider` subscribes to state via ref updated by context callback
  - [ ] Avoid duplicate `savePersistedSlice` — single write path: fitness context persists, sync reads ref
- [ ] Debounced push effect `~1100ms` on `syncSig` + `session.user.id` (AC: 1, 2, 6)
  - [ ] Port conflict retry loop from PWA lines 295–335
  - [ ] `setBusy(true/false)` during push
  - [ ] `setLastSyncedAt(Date.now())` + `formatSyncedLabel` on success
- [ ] Implement full `syncNow()` (AC: 5)
  - [ ] `runPullForUser` then push loop (PWA lines 461–499)
- [ ] Guard push with `isFitnessPayloadTooLarge` before network (AC: 4)
- [ ] Run gates + Maestro smoke

## Dev Notes

### Current state

| Item | RN-OFFLINE-02 | This story |
|------|---------------|------------|
| Hydration pull | Done | Unchanged |
| Auto push | None | Debounced |
| `syncNow` | Stub | Full implementation |
| `lastSyncedLabel` | null / stale | Updates on push success |

**Depends on RN-OFFLINE-01** (engine) + **RN-OFFLINE-02** (provider shell).

### PWA parity reference

```295:335:apps/pwa/src/fitness/fitnessCloudSync.ts
// debounced push on syncSig, conflict retry loop
```

```461:499:apps/pwa/src/fitness/fitnessCloudSync.ts
// syncNow: pull + push + conflict retry
```

### Race avoidance

Recommended flow on local edit:
1. `FitnessProvider.setFitnessState` → persist AsyncStorage
2. Notify sync layer (ref update + schedule debounced push)
3. Push reads slice from `stateRef.current` — not re-read from disk mid-flight

On conflict merge:
1. `pullRemoteMergeAlways` → `mergePersistedFitnessSlices`
2. `migratePersistedFitnessSlice` → `replaceFitnessState` → persist
3. Retry `tryPush` with updated meta

### Anti-patterns

- **Do not** push on every keystroke — debounce 1100ms only
- **Do not** push when `!session?.user?.id`
- **Do not** update AccountPanel UI (RN-OFFLINE-04) — only context fields
- **Do not** change merge rules in `mergePersistedFitnessSlices`

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
```

Manual: log food → wait 2s → verify Supabase row `updated_at_ms` advances.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Debounced push + conflict retry | Settings sync UI rows (RN-OFFLINE-04) |
| `syncNow` pull+push | `restoreFromCloud` welcome path (RN-OFFLINE-04) |
| `lastError` / `lastSyncedLabel` on context | Maestro sync flow (RN-OFFLINE-05) |
| Cancel push on sign-out | Offline queue / retry when network down |

### References

- [sprint-rn-offline-sync-plan.md](sprint-rn-offline-sync-plan.md) RN-OFFLINE-03
- [rn-offline-02-fitness-sync-provider-hydration.md](rn-offline-02-fitness-sync-provider-hydration.md)
- PWA: `fitnessCloudSync.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
