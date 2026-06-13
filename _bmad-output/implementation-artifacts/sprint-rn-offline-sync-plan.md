# Sprint RN-OFFLINE — Persist & cloud sync adapter

**Planned:** 2026-06-13  
**Last updated:** 2026-06-13 (swarm-ready — all 5 story files created)  
**Epic:** `epic-rn-offline`  
**Swarm branch:** `epic-rn-offline/cloud-sync`  
**Goal:** Wire PWA-parity fitness cloud sync on React Native — extract pull/push/merge logic to shared packages, hydrate fitness state from `fitness_user_data` on sign-in, debounced push with optimistic-lock conflict resolution, live sync status in Settings account panel, post-OAuth restore path, and Maestro `rn-sync-signin.yaml`.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M11 (Cloud sync)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §5 auth → `fitness_user_data` → `packages/core` merge  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-OFFLINE (5 stories)  
**Inventory:** [`pwa-codebase-inventory.md`](../planning-artifacts/pwa-codebase-inventory.md) Cloud sync row, `?signIn=1` restore  
**PWA reference:** `fitnessCloudSync.ts`, `FitnessSyncContext.tsx`, `syncMeta.ts`, `fitnessPayloadGuard.ts`, `persistFitnessSlice.ts`, `migrateTrainingSchedule.ts`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

A signed-in user’s fitness slice loads from Supabase `fitness_user_data` on app open (with merge parity), local edits debounce-push to cloud with conflict retry, Settings account panel shows last-synced status and manual sync, post-OAuth restore merges remote data, and Maestro `rn-sync-signin.yaml` passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-offline` |
| Branch | `epic-rn-offline/cloud-sync` |
| Start story | **RN-OFFLINE-01** (`rn-offline-01-sync-core-extract-pull-push.md`) |
| Story files | Create under `implementation-artifacts/rn-offline-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (api stories) | `npm run test --workspace=@newyouai/api-client` when touching Supabase fitness row helpers |
| Gate (epic close) | `rn-sync-signin.yaml` + full Maestro regression green |

**Kickoff:** `/bmad-create-story RN-OFFLINE-01` then `/bmad-swarm epic-rn-offline` or `dev this story rn-offline-01-sync-core-extract-pull-push.md`

**Swarm order (strict):**

```
RN-OFFLINE-01 → RN-OFFLINE-02 → RN-OFFLINE-03 → RN-OFFLINE-04 → RN-OFFLINE-05 → epic-rn-offline-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-10 | **Done** | All feature tabs + settings shipped |
| `mergePersistedFitnessSlices` | **Done (RN-1)** | `packages/core/src/sync/mergePersistedFitnessSlices.ts` + Vitest |
| AsyncStorage persist | **Done** | `FITNESS_LOCAL_STORAGE_KEY` = `fitcoach:persist:v1`; `FitnessProvider` local-only |
| `useAppShellGate` | **Partial** | `fitnessHydrated: true` hardcoded — must wire to sync provider |
| `AuthContext` | **Done (RN-2)** | Session + sign-in/out; **do not** duplicate auth in sync layer |
| Settings account panel | **Stub (RN-10)** | Sync row shows `"Signed in"` — no `lastSyncedLabel` / `syncNow` |
| PWA `fitnessCloudSync.ts` | **PWA-only** | Full pull/push/hydration; port logic, not the React hook wholesale |
| `syncMeta.ts` | **PWA-only** | `lastSeenRemoteUpdatedAtMs` in localStorage — port to AsyncStorage |
| `fitnessPayloadGuard.ts` | **PWA-only** | Size cap before push — extract with tests |
| `migratePersistedFitnessSlice` | **PWA-only** | Run after merge before save — port or call from core |
| Maestro sync | **Missing** | `rn-sync-signin.yaml` listed in master plan; not created |
| Delete account | **Done (RN-10)** | `delete-user` edge fn; local reset — verify still works after sync wires |

---

## Execute in this order

| # | Story | Story file | Scope | PR target | Status |
|---|-------|------------|-------|-----------|--------|
| 1 | **RN-OFFLINE-01** | `rn-offline-01-sync-core-extract-pull-push.md` | Core pull/push + sync meta + payload guard | 1 PR | ready-for-dev |
| 2 | **RN-OFFLINE-02** | `rn-offline-02-fitness-sync-provider-hydration.md` | Provider + hydration pull on auth | 1 PR | ready-for-dev |
| 3 | **RN-OFFLINE-03** | `rn-offline-03-debounced-push-conflict-merge.md` | Debounced push + conflict retry | 1 PR | ready-for-dev |
| 4 | **RN-OFFLINE-04** | `rn-offline-04-account-sync-ui-restore.md` | Settings UI + restoreFromCloud | 1 PR | ready-for-dev |
| 5 | **RN-OFFLINE-05** | `rn-offline-05-maestro-sync-signin-e2e.md` | Maestro + epic polish | 1 PR | ready-for-dev |
| 6 | Retro | `epic-rn-offline-retrospective` | — | — | optional |

---

## RN-OFFLINE-01 — Sync core extract + pull/push

**Story file:** `rn-offline-01-sync-core-extract-pull-push.md`

**Deliverables:**

- Extract pure sync engine to `packages/core/src/sync/` (PWA re-exports unchanged):
  - `fitnessCloudSyncEngine.ts` — `fetchFitnessRemoteRow`, `payloadToPersistedSlice`, `pullRemoteIntoLocal`, `pullRemoteMergeAlways`, `tryPush`
  - `syncMeta.ts` — `loadSyncMeta` / `saveSyncMeta` using `PersistStorageAdapter` (not `localStorage`)
  - `fitnessPayloadGuard.ts` — `isFitnessPayloadTooLarge` + cap constants
  - `syncErrors.ts` — `userFacingSyncError`, `formatSyncedLabel`
- Supabase row access via injectable client factory (reuse `@newyouai/api-client` or mobile `getSupabase()` wrapper in adapter layer — keep engine testable)
- Colocated Vitest:
  - Pull when remote newer vs skip when stale
  - Insert vs update push paths
  - Optimistic-lock conflict detection
  - Payload too large error
  - Sync meta read/write round-trip (memory adapter)
- Port / extend existing `mergePersistedFitnessSlices.test.ts` patterns for integration-style pull merge cases

**PWA ref:** `fitnessCloudSync.ts` (lines 57–143), `syncMeta.ts`, `fitnessPayloadGuard.ts`  
**Do not:** React provider, `useAppShellGate` wiring, Settings UI (RN-OFFLINE-02..04)

---

## RN-OFFLINE-02 — FitnessSyncProvider + hydration pull

**Story file:** `rn-offline-02-fitness-sync-provider-hydration.md`

**Deliverables:**

- `apps/mobile/context/FitnessSyncContext.tsx` — **sync-only** context (no duplicate auth methods; consume `AuthContext` session):
  - `configured`, `busy`, `lastError`, `lastSyncedLabel`, `fitnessHydrated`
  - `syncNow`, `restoreFromCloud` (stubs until RN-OFFLINE-03/04 flesh out push)
- `FitnessSyncProvider` wraps app inside `AuthProvider` + around/beside `FitnessProvider`
- On `session.user.id` + `sessionResolved`:
  - Run hydration pull (`HYDRATION_PULL_TIMEOUT_MS` = 5000, match PWA)
  - Full restore when `onboardingComplete !== true` && no normalized onboarding draft
  - Otherwise conditional pull via `pullRemoteIntoLocal` + `lastSeenRemoteUpdatedAtMs`
- After merge: `migratePersistedFitnessSlice` + `replaceFitnessState` + `savePersistedSlice`
- On auth metadata: seed `displayName` from `user_metadata.full_name` when local empty (PWA parity)
- Wire `useAppShellGate` → `fitnessHydrated` from `FitnessSyncContext` (remove hardcoded `true`)
- Loading gate: app shell waits for sync hydration when configured + signed in

**PWA ref:** `useFitnessCloudSync` pull/hydration effects (lines 220–293)  
**Do not:** Debounced auto-push (RN-OFFLINE-03); account panel labels (RN-OFFLINE-04)

---

## RN-OFFLINE-03 — Debounced push + conflict merge retry

**Story file:** `rn-offline-03-debounced-push-conflict-merge.md`

**Deliverables:**

- `syncSig` derived from persisted slice fingerprint (or stable JSON hash of `sliceFromAppState(state)`)
- Debounced push `~1100ms` after fitness state changes (match PWA)
- Push loop: `tryPush` → on `conflict` → `pullRemoteMergeAlways` → merge → retry (max 5)
- On success: update `syncMeta`, set `lastSyncedAt` / `lastSyncedLabel`
- On error: surface `lastError` on sync context (payload too large, network, etc.)
- Integrate with `FitnessProvider` `setFitnessState` / `replaceFitnessState` without double-persist races
- `syncNow()` fully implements manual push+pull (PWA `syncNow` parity)

**PWA ref:** `fitnessCloudSync.ts` debounced push effect (lines 295–335), conflict retry in `syncNow`  
**Do not:** Settings row UI (RN-OFFLINE-04); Maestro (RN-OFFLINE-05)

---

## RN-OFFLINE-04 — Account sync UI + post-OAuth restore

**Story file:** `rn-offline-04-account-sync-ui-restore.md`

**Deliverables:**

- **Settings account panel (ST-03):** replace `"Signed in"` stub with:
  - `lastSyncedLabel` when available ("Jun 13, 3:42 PM" format)
  - `busy` spinner/disabled state during sync
  - `lastError` inline message (user-facing copy from `userFacingSyncError`)
  - **Sync now** row / button → `syncNow()`; `testID="settings-sync-now"`
- **Hub account trailing label:** show last synced summary when on account section
- **Post-OAuth restore:** deep link / query `signIn=1` parity:
  - After OAuth completes, optional `restoreFromCloud()` when local slice empty or welcome-restore path
  - Document env flag if needed for Maestro (`EXPO_PUBLIC_E2E_SYNC_RESTORE=true`)
- Verify delete account (RN-10) still clears local slice + cloud row via `delete-user`
- Verify sign-out does not corrupt local persist (local-first retained)

**PWA ref:** `ScreenSettings.tsx` account sync row, `FitnessApp.tsx` `?signIn=1`  
**Do not:** Push notifications (RN-PUSH); RevenueCat restore (RN-STORE)

---

## RN-OFFLINE-05 — Maestro sync sign-in + epic polish

**Story file:** `rn-offline-05-maestro-sync-signin-e2e.md`

**Deliverables:**

- `.maestro/rn-sync-signin.yaml` — sign in → wait for hydration → assert home visible → open Settings account → assert sync status row not stub-only
- `npm run test:e2e:sync` script in `apps/mobile/package.json`
- E2E seed strategy: mock Supabase row via `EXPO_PUBLIC_E2E_MOCK_FITNESS_SYNC=true` or dedicated test user + pre-seeded `fitness_user_data` (document in runbook)
- Remove any remaining "sync ships in RN-OFFLINE" placeholder copy
- Epic regression sweep: auth-all, tab-nav, onboarding, coach-nutrition, workout-session, nutrition-log, progress, sunday-check-in, future-you, settings
- Update `testarch-trace-rn-migration.md` FR-M11 row evidence

**PWA ref:** Playwright sync smoke equivalent (inventory `?signIn=1`)  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M11 → `rn-sync-signin.yaml`

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| `fitness_user_data` pull on sign-in / app open | Push notification scheduling (RN-PUSH) |
| Debounced push + optimistic-lock conflict merge | Server-side push token registry (post-MVP) |
| `syncMeta` (`lastSeenRemoteUpdatedAtMs`) on AsyncStorage | Real IAP / RevenueCat production (RN-STORE) |
| `fitnessHydrated` app shell gate | Universal links (RN-STORE) |
| Settings account sync status + sync now | Parity matrix sign-off (RN-PARITY) |
| `restoreFromCloud` / post-OAuth restore | Re-implementing auth flows (RN-2 owns AuthContext) |
| Payload size guard before push | Admin / multi-user tooling |
| Maestro `rn-sync-signin.yaml` | Offline queue when network unavailable (best-effort error surface only) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, Supabase configured, test user credentials

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — optional mock if story adds flag
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FITNESS_SYNC=true npx expo start --dev-client --port 8082

# Terminal 2 — epic gate (RN-OFFLINE-05)
npm run test:e2e:sync
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress
npm run test:e2e:sunday-check-in
npm run test:e2e:future-you
npm run test:e2e:settings
```

**Sync testing:** Use `MAESTRO_TEST_EMAIL` / `MAESTRO_TEST_PASSWORD` from existing auth flows. Seed remote row with `onboardingComplete: true` + minimal workout/nutrition slice for merge assertion.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

### Epic close (RN-OFFLINE-05)

- [ ] `rn-sync-signin.yaml` green
- [ ] Full Maestro regression suite green
- [ ] Manual: edit workout on device A → sign in on fresh install B → data merges
- [ ] Manual: concurrent edit conflict resolves without data loss (last-write-wins via merge)
- [ ] Manual: payload-too-large surfaces friendly error in account panel
- [ ] `epic-rn-offline` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-offline/cloud-sync`
2. Run `/bmad-create-story` for RN-OFFLINE-01, then swarm or `dev this story rn-offline-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. `npm run test --workspace=@newyouai/core` when sync engine touched
6. Update `sprint-status-rn-migration.yaml` story → `done`
7. RN-OFFLINE-05: run sync Maestro + full regression + mark epic `done`

---

## Definition of done (epic)

1. Signed-in user hydrates fitness state from cloud on app open (with 5s timeout fallback).
2. Local fitness edits debounce-push to `fitness_user_data` with PWA-parity merge on conflict.
3. Settings account panel shows real last-synced time, errors, and manual sync now.
4. Post-OAuth / welcome restore can merge remote snapshot into local state.
5. `useAppShellGate` respects `fitnessHydrated` — no flash of wrong shell while pull pending.
6. Maestro `rn-sync-signin.yaml` + full regression suite green.

---

## Unblocks

| Downstream | Needs from RN-OFFLINE |
|------------|----------------------|
| RN-PUSH | Stable persist keys; sync not required but same user session |
| RN-STORE | Multi-device subscription tier consistency via synced persist slice |
| RN-PARITY | FR-M11 trace row + sync UAT evidence |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Auth vs sync context duplication | Sync provider reads `AuthContext` only; no second sign-in API |
| `FitnessProvider` + sync double-write races | Single write path: merge → `replaceFitnessState` → persist → schedule push |
| Large progress pics / FY photos exceed JSONB cap | `isFitnessPayloadTooLarge` before push; surface error in account panel |
| Maestro needs live Supabase | `EXPO_PUBLIC_E2E_MOCK_FITNESS_SYNC` flag or dedicated CI test user |
| `fitnessHydrated` blocks shell too long | 5s timeout matches PWA; proceed with local slice on timeout |
| Pre-existing `deepLinkRouter.ts` typecheck error | Fix if it blocks epic gates; unrelated but may surface in RN-OFFLINE-04 settings deep links |
