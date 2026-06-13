---
name: RN-OFFLINE-04 Account sync UI + post-OAuth restore
epic: RN-OFFLINE
story: 04
status: done
swarm_order: 4
swarm_branch: epic-rn-offline/cloud-sync
---

# Story OFFLINE-04: Account sync UI + post-OAuth restore

Status: ready-for-dev

## Story

**As a** signed-in user in Settings  
**I want** to see real cloud sync status and trigger a manual sync  
**So that** I know my data is backed up and can recover after signing in on a new device

## Acceptance Criteria

1. **Given** signed-in user opens Account panel, **When** last sync succeeded, **Then** shows "Last uploaded · {lastSyncedLabel}" (PWA copy) instead of duplicate "Signed in" stub
2. **Given** sync in progress, **When** account panel open, **Then** sync now control disabled / busy indicator; `testID="settings-sync-busy"` optional
3. **Given** sync error, **When** account panel open, **Then** inline error message from `lastError` (red secondary text, PWA parity)
4. **Given** signed-in user taps **Sync now**, **When** tapped, **Then** calls `syncNow()`; `testID="settings-sync-now"`
5. **Given** settings hub, **When** account section visible, **Then** trailing label shows `lastSyncedLabel ?? "Signed in"` (PWA `accountTrailing` parity)
6. **Given** post-OAuth sign-in with empty local onboarding state, **When** `restoreFromCloud()` applicable, **Then** remote snapshot merges into local fitness state (PWA `?signIn=1` / welcome restore path)
7. **Given** user deletes account (RN-10), **When** confirmed, **Then** cloud row removed + local slice cleared — still works with sync wired
8. **Given** user signs out, **When** complete, **Then** local persist retained; account panel shows sign-in prompt

## Tasks / Subtasks

- [ ] Update `apps/mobile/components/settings/panels/AccountPanel.tsx` (AC: 1–4)
  - [ ] `useFitnessSync()` for `busy`, `lastError`, `lastSyncedLabel`, `syncNow`
  - [ ] Remove "Cloud sync details land in a later release" helper copy
  - [ ] Signed-in card: email + last uploaded line
  - [ ] Sync & backup section: Status row with live trailing; Sync now `SettingsRow` pressable
  - [ ] `testID="settings-sync-now"`, `settings-account-sync-status`
- [ ] Update `apps/mobile/app/(tabs)/settings/index.tsx` hub trailing (AC: 5)
  - [ ] Account row trailing: `lastSyncedLabel ?? "Signed in"` when session present
- [ ] Implement `restoreFromCloud()` fully in `FitnessSyncProvider` (AC: 6)
  - [ ] Unconditional `pullRemoteMergeAlways` + merge + `replaceFitnessState`
  - [ ] Return `boolean` success for callers
- [ ] Post-OAuth restore trigger (AC: 6)
  - [ ] After `completeOAuthFromUrl` success in auth flow OR deep link `signIn=1` param — call `restoreFromCloud()` when local needs full restore
  - [ ] Check `useDeepLinkHandler` / auth callback for hook point
  - [ ] Optional: `EXPO_PUBLIC_E2E_SYNC_RESTORE=true` for Maestro (RN-OFFLINE-05)
- [ ] Fix `lib/deepLinkRouter.ts` settings route typing if blocking typecheck (AC: 8)
- [ ] Verify delete account + sign-out paths unchanged (AC: 7, 8)
- [ ] Run gates

## Dev Notes

### Current state — AccountPanel stub

```45:65:apps/mobile/components/settings/panels/AccountPanel.tsx
// "Signed in" x2, disabled Status row trailing "Signed in"
```

### PWA parity reference

```940:957:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// lastSyncedLabel, sync.busy, sync.lastError, sync.syncNow()
```

```464:467:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// accountTrailing: lastSyncedLabel ?? "Signed in"
```

```444:462:apps/pwa/src/fitness/FitnessApp.tsx
// restoreFromCloud after sign-in
```

### Auth vs sync boundary

- Account panel uses **both** `useAuth()` (email, providers) and `useFitnessSync()` (sync status)
- Sign-in UI stays on auth screen — account panel does **not** add email/password sign-in form (PWA has inline sign-in when logged out; RN uses `(auth)` group — match RN-2 pattern: show "Sign in from auth screen" when logged out)

### Anti-patterns

- **Do not** add push notification UI (RN-PUSH)
- **Do not** add RevenueCat restore (RN-STORE)
- **Do not** re-implement OAuth in settings panel

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:settings
npm run test:e2e:auth-sign-out
```

Manual: sync now → last uploaded timestamp updates; sign out → local data still on device.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Account panel + hub sync labels | Maestro sync flow (RN-OFFLINE-05) |
| `restoreFromCloud` + post-OAuth hook | Push notifications (RN-PUSH) |
| Delete/sign-out regression verify | Parity sign-off (RN-PARITY) |

### References

- [sprint-rn-offline-sync-plan.md](sprint-rn-offline-sync-plan.md) RN-OFFLINE-04
- [rn-offline-03-debounced-push-conflict-merge.md](rn-offline-03-debounced-push-conflict-merge.md)
- PWA: `ScreenSettings.tsx` account panel, `FitnessApp.tsx`
- Mobile: `AccountPanel.tsx`, `settings/index.tsx`, `hooks/useDeepLinkHandler.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
