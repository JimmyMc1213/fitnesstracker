---
name: RN-OFFLINE-01 Sync core extract + pull/push
epic: RN-OFFLINE
story: 01
status: done
swarm_order: 1
swarm_branch: epic-rn-offline/cloud-sync
---

# Story OFFLINE-01: Sync core extract + pull/push

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-OFFLINE kickoff -->

## Story

**As a** developer  
**I want** PWA fitness cloud sync pull/push logic extracted to `packages/core` with Vitest coverage  
**So that** RN-OFFLINE-02..05 can wire a testable sync engine without duplicating Supabase row semantics

## Acceptance Criteria

1. **Given** PWA `fitnessCloudSync.ts` pull/push helpers, **When** extracted to `packages/core/src/sync/`, **Then** PWA file re-exports or thin-wraps core and existing PWA sync tests still pass
2. **Given** remote row `updated_at_ms` > `lastSeenRemoteUpdatedAtMs`, **When** `pullRemoteIntoLocal` runs, **Then** returns `{ applied: true, mergedSlice, meta }` using `mergePersistedFitnessSlices`
3. **Given** remote row stale or missing, **When** `pullRemoteIntoLocal` runs, **Then** returns `{ applied: false }` without mutating local slice
4. **Given** no cloud row for user, **When** `tryPush` runs, **Then** inserts payload with new `updated_at_ms`
5. **Given** cloud row exists and `updated_at_ms` matches meta baseline, **When** `tryPush` runs, **Then** updates row with optimistic lock; on mismatch returns `{ conflict: true }`
6. **Given** payload exceeds `MAX_FITNESS_PAYLOAD_BYTES` (~2 MB), **When** `tryPush` runs, **Then** returns `{ error: string }` before network call
7. **Given** AsyncStorage adapter, **When** `loadSyncMeta` / `saveSyncMeta` round-trip, **Then** `lastSeenRemoteUpdatedAtMs` persists under key `fitcoach:syncMeta:v1`

## Tasks / Subtasks

- [ ] Create `packages/core/src/sync/fitnessCloudSyncEngine.ts` (AC: 2–5)
  - [ ] `FitnessUserRow` type: `{ user_id, payload, updated_at_ms }`
  - [ ] `FitnessSyncClient` interface: `fetchRow(userId)`, `insertRow`, `updateRow` (injectable for Vitest mocks)
  - [ ] `payloadToPersistedSlice(payload)` — normalize remote JSON to `PersistedFitnessSlice`
  - [ ] `pullRemoteIntoLocal(uid, localSlice, meta)`
  - [ ] `pullRemoteMergeAlways(uid, localSlice)`
  - [ ] `tryPush(uid, slice, meta)` — insert / optimistic-lock update / conflict / error
- [ ] Create `packages/core/src/sync/syncMeta.ts` (AC: 7)
  - [ ] `FITNESS_SYNC_META_KEY = "fitcoach:syncMeta:v1"`
  - [ ] `loadSyncMeta(adapter)`, `saveSyncMeta(adapter, meta)` async using `PersistStorageAdapter`
  - [ ] Sync meta Vitest with `createMemoryStorageAdapter`
- [ ] Create `packages/core/src/sync/fitnessPayloadGuard.ts` (AC: 6)
  - [ ] Port `MAX_FITNESS_PAYLOAD_BYTES`, `fitnessPayloadByteLength`, `isFitnessPayloadTooLarge` from PWA
  - [ ] Colocated Vitest
- [ ] Create `packages/core/src/sync/syncErrors.ts` (AC: 6)
  - [ ] `userFacingSyncError(e, fallback)` — match PWA SyntaxError / JSON parse friendly copy
  - [ ] `formatSyncedLabel(ts)` — locale short date + time
- [ ] Export all from `packages/core/src/index.ts`
- [ ] PWA thin re-exports (AC: 1)
  - [ ] `apps/pwa/src/fitness/fitnessCloudSync.ts` — import engine functions from core where pure
  - [ ] `apps/pwa/src/fitness/syncMeta.ts` — re-export or wrap with `createLocalStorageAdapter`
  - [ ] `apps/pwa/src/fitness/fitnessPayloadGuard.ts` — re-export from core
- [ ] Vitest suite `fitnessCloudSyncEngine.test.ts` (AC: 2–6)
  - [ ] Mock client: no row → insert path
  - [ ] Mock client: stale meta → skip pull
  - [ ] Mock client: newer remote → merge applied
  - [ ] Mock client: update conflict when `updated_at_ms` drifted
  - [ ] Payload too large short-circuit
- [ ] Run gates

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `packages/core/src/sync/mergePersistedFitnessSlices.ts` | Done (RN-1) | Used by pull merge — do not fork |
| `apps/pwa/src/fitness/fitnessCloudSync.ts` | 542-line hook + pure helpers mixed | Extract pure helpers to core |
| `apps/pwa/src/fitness/syncMeta.ts` | `localStorage` sync | Core async adapter + PWA wrapper |
| `apps/mobile` | No sync engine | Consumes core in RN-OFFLINE-02 |

**Blocks RN-OFFLINE-02..05** — no React providers or UI in this story.

### PWA parity reference

```57:143:apps/pwa/src/fitness/fitnessCloudSync.ts
// fetchFitnessRemoteRow, pullRemoteIntoLocal, pullRemoteMergeAlways, tryPush
```

```1:30:apps/pwa/src/fitness/syncMeta.ts
const KEY = "fitcoach:syncMeta:v1";
```

```1:10:apps/pwa/src/fitness/fitnessPayloadGuard.ts
export const MAX_FITNESS_PAYLOAD_BYTES = 2 * 1024 * 1024;
```

### Architecture compliance

- Table: `fitness_user_data` — `user_id`, `payload` (JSONB), `updated_at_ms` per [architecture-rn-migration.md](../planning-artifacts/architecture-rn-migration.md) §5
- Storage key unchanged: `fitcoach:persist:v1` for slice; `fitcoach:syncMeta:v1` for meta
- Keep engine **framework-agnostic** — no React, no `window`, no `localStorage` in core

### File structure requirements

```
packages/core/src/sync/
  fitnessCloudSyncEngine.ts
  fitnessCloudSyncEngine.test.ts
  syncMeta.ts
  syncMeta.test.ts
  fitnessPayloadGuard.ts
  fitnessPayloadGuard.test.ts
  syncErrors.ts
  syncErrors.test.ts
```

### Injectable client pattern (recommended)

```typescript
export type FitnessSyncClient = {
  fetchRow: (userId: string) => Promise<FitnessUserRow | null>;
  insertRow: (userId: string, payload: unknown, updatedAtMs: number) => Promise<{ error?: string }>;
  updateRow: (
    userId: string,
    payload: unknown,
    updatedAtMs: number,
    expectedRemoteUpdatedAtMs: number,
  ) => Promise<{ updatedAtMs: number } | { conflict: true } | { error: string }>;
};
```

Mobile adapter in RN-OFFLINE-02 wraps `getSupabase().from("fitness_user_data")`.

### Anti-patterns

- **Do not** add `FitnessSyncProvider` or touch `useAppShellGate` (RN-OFFLINE-02)
- **Do not** duplicate auth sign-in methods — RN-2 `AuthContext` owns session
- **Do not** change `mergePersistedFitnessSlices` merge rules — only call it
- **Do not** use `localStorage` in core — use `PersistStorageAdapter` only

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # if PWA re-export tests exist
npm run typecheck --workspace=@newyouai/mobile
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Pure pull/push engine + meta + payload guard | React provider (RN-OFFLINE-02) |
| Vitest with mock Supabase client | Debounced push (RN-OFFLINE-03) |
| PWA re-exports | Settings UI (RN-OFFLINE-04) |
| `userFacingSyncError` / `formatSyncedLabel` | Maestro (RN-OFFLINE-05) |

### References

- [sprint-rn-offline-sync-plan.md](sprint-rn-offline-sync-plan.md) RN-OFFLINE-01
- [prd-rn-migration.md](../planning-artifacts/prd-rn-migration.md) FR-M11
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M11 → `mergePersistedFitnessSlices.test.ts`
- PWA: `fitnessCloudSync.ts`, `syncMeta.ts`, `fitnessPayloadGuard.ts`
- Core: `mergePersistedFitnessSlices.ts`, `storage/persist.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
