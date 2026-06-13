---
name: RN-10-02 You + Account panels
epic: RN-10
story: 02
status: ready-for-dev
swarm_order: 2
swarm_branch: epic-rn-10/settings-account
---

# Story 10.02: You + Account panels

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-10-02 -->

## Story

**As a** signed-in user  
**I want** to view and edit my profile, change my password, and manage my account email  
**So that** account settings match PWA panels ST-01, ST-02 (change-password sub-layer), and ST-03

## Acceptance Criteria

1. **Given** You panel (`settings/you`), **When** I edit first name, **Then** `displayName` persists via `FitnessProvider` and home greeting updates
2. **Given** You panel signed in, **When** I view Personal info, **Then** email row shows `AuthContext.sessionEmail` with edit affordance
3. **Given** You panel, **When** I tap Change password, **Then** sub-layer ST-02 shows current/new/confirm fields
4. **Given** valid password change, **When** I submit, **Then** Supabase `updateUser({ password })` succeeds and success message shows
5. **Given** wrong current password, **When** I submit, **Then** inline error displays (re-auth flow per Supabase — mirror PWA)
6. **Given** Account panel (`settings/account`), **When** sync not configured, **Then** trailing shows "Not configured" (PWA parity)
7. **Given** Account panel with configured Supabase, **When** opened, **Then** sync status row shows session email + last-synced label stub ("Signed in" until RN-OFFLINE)
8. **Given** Connected accounts section, **When** user has Google/Apple identity, **Then** provider badges display (read-only)

## Tasks / Subtasks

- [ ] Create `components/settings/panels/YouPanel.tsx` (AC: 1–5)
  - [ ] Display name `TextInput` with `sanitizeUserText` from core or `@/lib/userText`
  - [ ] Personal info: email row with inline edit mode (port PWA lines 746–835)
  - [ ] Change password navigation: push `/(tabs)/settings/you/change-password` OR in-panel layer state (`youSubPanel` pattern)
- [ ] Create change-password screen/layer (AC: 3–5)
  - [ ] Port `renderChangePasswordPanel()` (PWA lines 612–718)
  - [ ] Implement `updatePassword` via `getSupabase().auth.updateUser({ password })` after re-auth with current password if required
  - [ ] `testID`s: `settings-change-password-current`, `settings-change-password-submit`
- [ ] Create `components/settings/panels/AccountPanel.tsx` (AC: 6–8)
  - [ ] Sync & backup row with trailing from auth/sync state
  - [ ] Connected accounts badges (Apple SVG icon pattern from PWA `AppleSignInIcon`)
  - [ ] Do **not** duplicate email edit if kept on You panel — match PWA: email edit on You, Account focuses sync
- [ ] Wire `[panel].tsx` to render `YouPanel` / `AccountPanel` for `you` and `account` ids
- [ ] Add `useAuth()` for `sessionEmail`, `configured`
- [ ] Run typecheck

## Dev Notes

### Current state

| Item | Today | This story |
|------|-------|------------|
| RN-2 auth | `AuthContext` sign-in/out/OAuth | Add password + email update helpers |
| `FitnessSyncContext` | PWA only | **No mobile sync context** — use `AuthContext` + read-only status rows |
| You/Account panels | Placeholder in `[panel].tsx` | Full panel UI |
| RN-2 scope deferral | Password/email/delete → RN-10 | This story delivers password + email |

### PWA parity reference

```721:835:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// renderYouPanel: displayName, email edit, change password entry
```

```612:718:apps/pwa/src/fitness/screens/ScreenSettings.tsx
// renderChangePasswordPanel
```

```419:421:apps/pwa/src/fitness/fitnessCloudSync.ts
// updateEmail via updateUserEmail helper
```

### Implementation guidance

- **Email update:** Port `updateUserEmail` logic from PWA (`apps/pwa/src/fitness/` — search `updateUserEmail`). Use `sb.auth.updateUser({ email })`; show confirmation message (email won't change until user confirms link).
- **Password update:** Supabase may require recent sign-in. PWA re-authenticates with current password first — mirror that sequence; surface `changePasswordError` string.
- **No FitnessSyncContext on mobile:** Account panel sync row shows:
  - `!configured` → "Not configured"
  - `sessionEmail` → "Signed in" (full sync labels land RN-OFFLINE)
- **Display name:** `setFitnessState` or equivalent from `FitnessContext` — same key as onboarding `displayName`.

### Architecture compliance

- Panel routes: `(tabs)/settings/you`, `(tabs)/settings/account`
- Optional nested route: `(tabs)/settings/you/change-password.tsx` if using file-based sub-layer instead of in-component state
- Preserve `testID="settings-panel-you"` / `settings-panel-account` from RN-10-01

### Anti-patterns

- **Do not** implement delete account (RN-10-06)
- **Do not** implement cloud sync sign-in/pull/push (RN-OFFLINE)
- **Do not** add RevenueCat restore (RN-STORE)
- **Do not** move email edit only to Account if PWA keeps it on You panel

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
# Manual: change display name → home greeting updates
# Manual: change password with test account
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| You + change-password + Account panels | Delete account (RN-10-06) |
| Email + password Supabase updates | Full sync adapter (RN-OFFLINE) |
| Connected accounts display | Restore purchases (RN-STORE) |

### References

- [sprint-rn-10-settings-plan.md](sprint-rn-10-settings-plan.md) RN-10-02
- [rn-2-05-sign-out-session-oauth.md](rn-2-05-sign-out-session-oauth.md) — auth deferrals
- PWA: `ScreenSettings.tsx`, `fitnessCloudSync.ts`
- Mobile: `context/AuthContext.tsx`, `context/FitnessContext.tsx`

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
