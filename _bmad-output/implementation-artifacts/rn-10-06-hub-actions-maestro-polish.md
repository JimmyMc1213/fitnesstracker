---
name: RN-10-06 Hub actions + Maestro + epic polish
epic: RN-10
story: 06
status: ready-for-dev
swarm_order: 6
swarm_branch: epic-rn-10/settings-account
---

# Story 10.06: Hub actions + Maestro + epic polish

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10-06 -->

## Story

**As a** user and QA engineer  
**I want** sign-out, delete account, legal links, and automated settings E2E  
**So that** account lifecycle and FR-M10 trace evidence are complete

## Acceptance Criteria

1. **Given** Settings hub + signed in, **When** I tap Sign out and confirm, **Then** `AuthContext.signOut` clears session and auth gate shows
2. **Given** Settings hub, **When** I complete delete flow (warn → final confirm), **Then** `delete-user` Edge Function invokes, local fitness persist clears, user signed out
3. **Given** delete succeeds with Future You data present, **Then** FY storage paths wiped per edge fn (verify no orphaned tiles after re-login)
4. **Given** Legal rows, **When** I tap Terms or Privacy, **Then** `Linking.openURL` opens `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_POLICY_URL`
5. **Given** Social rows, **When** tapped, **Then** Instagram/TikTok/X URLs open (port PWA social URLs or constants)
6. **Given** Maestro `rn-settings.yaml`, **When** run on simulator, **Then** settings tab → hub → fuel-targets panel → back passes
7. **Given** Maestro `rn-auth-sign-out.yaml`, **When** run, **Then** flow uses `settings-sign-out` (fixes broken `home-sign-out` reference)
8. **Given** epic close, **When** full regression runs, **Then** all existing Maestro flows green; no "ships in RN-10" copy remains

## Tasks / Subtasks

- [ ] Hub sign-out (AC: 1)
  - [ ] Confirm sheet before sign-out (port PWA `showSignOutConfirm`)
  - [ ] `testID="settings-sign-out"` on hub row
  - [ ] Wire `useAuth().signOut`
- [ ] Delete account flow (AC: 2–3)
  - [ ] Port two-step warn/final sheets from PWA (lines 1500–1530 area)
  - [ ] Implement `deleteUserAccount` mobile helper — port from PWA `deleteUserAccount.ts` + `fitnessCloudSync.deleteAccount`
  - [ ] Invoke `sb.functions.invoke("delete-user", { method: "POST", body })` (consider `packages/api-client` invoke wrapper)
  - [ ] On success: clear AsyncStorage fitness slice, call `signOut`, show notice
  - [ ] `testID="settings-delete-account"`
  - [ ] Support dry-run env if PWA has `isDeleteAccountDryRunEnabled`
- [ ] Legal + Social links (AC: 4–5)
  - [ ] Replace `SettingsComingSoonRow` on Legal/Socials with live `SettingsRow` + `Linking.openURL`
  - [ ] Env vars per [docs/env-matrix.md](../../docs/env-matrix.md): `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`
- [ ] Maestro (AC: 6–8)
  - [ ] Create `apps/mobile/.maestro/rn-settings.yaml`
  - [ ] Update `apps/mobile/.maestro/rn-auth-sign-out.yaml` — navigate to settings tab, tap `settings-sign-out`
  - [ ] Add `"test:e2e:settings": "maestro test .maestro/rn-settings.yaml"` to `apps/mobile/package.json`
  - [ ] Include in `run-auth-maestro.mjs` or epic close script if applicable
- [ ] Remove placeholder copy across settings routes/components
- [ ] Update `sprint-status-rn-migration.yaml`: `epic-rn-10` → `done`
- [ ] Epic regression sweep

## Dev Notes

### Current state

| Item | Today | This story |
|------|-------|------------|
| `home-sign-out` testID | **Missing** from codebase | Maestro broken — fix in this story |
| `rn-auth-sign-out.yaml` | Taps `home-sign-out` | Update to settings path |
| `delete-user` EF | Shipped in Supabase | Wire from mobile |
| `api-client` | No delete-user invoke yet | Add invoke helper OR use `getSupabase()` directly (match PWA) |
| Legal hub rows | Coming soon (RN-10-01) | Live links |

### PWA parity reference

```573:607:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// Account actions: sign out, delete account
```

```432:444:apps/pwa/src/fitness/fitnessCloudSync.ts
// deleteAccount → deleteUserAccount helper
```

```1:91:supabase/functions/delete-user/index.ts
// Edge function — wipes fitness_user_data + auth user + storage paths
```

### Implementation guidance

- **Delete flow:** Port `apps/pwa/src/fitness/deleteUserAccount.ts` logic. Sequence: invoke edge fn → sign out → reset local state to empty slice defaults.
- **Sign-out confirm:** Only show Account actions section when `sessionEmail` (PWA pattern line 573).
- **Maestro settings flow:** Minimal smoke — open settings tab (`tab-settings`), assert `settings-hub`, tap fuel-targets row, assert `settings-panel-fuel-targets`, back.
- **Maestro sign-out:** After sign-in subflow, `tapOn: tab-settings` → scroll if needed → `tapOn: settings-sign-out` → confirm → assert auth screen.

### Epic close gate

```bash
npm run test:e2e:settings
npm run test:e2e:auth-sign-out
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress
npm run test:e2e:sunday-check-in
npm run test:e2e:future-you
```

### Anti-patterns

- **Do not** leave `home-sign-out` in Maestro without a matching testID
- **Do not** skip local persist wipe after delete — user must see fresh install state
- **Do not** block epic on RN-OFFLINE sync

### References

- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M10
- [sprint-rn-10-settings-plan.md](sprint-rn-10-settings-plan.md) RN-10-06
- [rn-3-04-settings-stack-navigation.md](rn-3-04-settings-stack-navigation.md)
- `apps/pwa/src/fitness/deleteUserAccount.test.ts`
- `apps/mobile/.maestro/rn-auth-sign-out.yaml`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
