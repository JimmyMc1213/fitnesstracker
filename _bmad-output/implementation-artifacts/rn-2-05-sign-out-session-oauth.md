---
name: RN-2-05 Sign out session refresh OAuth deep link
epic: RN-2
story: 05
status: done
swarm_order: 4
swarm_branch: epic-rn-2/authentication-session
baseline_commit: e193c40b8ffb81cc55bcc722a001233f71b38eea
---

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

# RN-2-05: Sign out, session refresh, OAuth deep link

## User story

**As a** signed-in user  
**I want** reliable session refresh and a clear sign-out path  
**So that** my auth state stays correct across app restarts and I can switch accounts safely

## Acceptance criteria

1. **Given** signed in, **When** I tap Sign out, **Then** session clears from SecureStore and I land on `auth-welcome-screen`
2. **Given** valid session, **When** app returns to foreground, **Then** `getSession` / token refresh runs without hanging the auth gate
3. **Given** OAuth return with invalid/expired state, **When** deep link resolves, **Then** user sees friendly error and stays on auth (no blank screen)
4. **Given** `signOut` fails (network), **When** error occurs, **Then** local session still clears and user reaches welcome (best-effort)
5. **Given** all RN-2 stories shipped, **When** Maestro `rn-auth-sign-out.yaml` runs, **Then** sign-in → sign-out → welcome passes

## PWA reference

- `apps/pwa/src/fitness/fitnessCloudSync.ts` (`signOut`, `welcomeResetNonce`)
- `apps/pwa/src/fitness/oauthReturnCapture.ts` (Save Progress OAuth — defer full parity to RN-4)

## Tasks

- [x] Add minimal sign-out affordance (tabs header dev button or account stub — full Settings in RN-10)
- [x] Harden `signOut` with try/catch; ensure `useAuthGate` redirects to `(auth)`
- [x] Add `AppState` foreground listener → `refreshSession` in `AuthContext`
- [x] OAuth deep link edge cases: parse errors, cancelled flow, stale `WebBrowser` session
- [x] Extract pure helpers + Vitest if non-trivial (redirect URL builder, error mapping)
- [x] Add Maestro `rn-auth-sign-out.yaml`
- [x] Mark `epic-rn-2` done in sprint status after all gates pass

## Test tasks

- [x] Maestro `rn-auth-sign-out.yaml`
- [ ] Manual: kill app → relaunch → still signed in; sign out → relaunch → welcome
- [ ] Manual: OAuth cancel paths for Google + Apple

## Dependencies

RN-2-03, RN-2-04 (all auth entry points exist)

## Notes

- Password change, email update, account deletion → RN-10 Settings & account
- RevenueCat `Purchases.logIn(userId)` → RN-4 paywall step
- Epic closer — one PR target

## Dev Agent Record

### Completion Notes

- Added `home-sign-out` affordance on tabs home stub.
- Hardened `signOut` with try/catch; local session always clears.
- Added `AppState` foreground → `refreshSession`.
- OAuth redirect parsing and error mapping in `lib/authOAuth.ts`.
- Added `rn-auth-sign-out.yaml` Maestro flow.

### File List

- `apps/mobile/context/AuthContext.tsx`
- `apps/mobile/lib/authOAuth.ts`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/.maestro/rn-auth-sign-out.yaml`

## Change Log

- 2026-06-12: RN-2-05 sign-out + session refresh implemented (bmad-swarm epic-rn-2)
