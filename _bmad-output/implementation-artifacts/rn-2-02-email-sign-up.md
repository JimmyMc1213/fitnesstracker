---
name: RN-2-02 Email sign-up flow
epic: RN-2
story: 02
status: done
swarm_order: 1
swarm_branch: epic-rn-2/authentication-session
baseline_commit: e193c40b8ffb81cc55bcc722a001233f71b38eea
---

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

# RN-2-02: Email sign-up flow

## User story

**As a** new user on the auth welcome screen  
**I want** to create an account with name, email, and password  
**So that** I can start onboarding with the same Supabase account as PWA users

## Acceptance criteria

1. **Given** signed out on welcome, **When** I tap Get Started and submit valid name/email/password, **Then** I reach `(tabs)` home with `home-title` visible
2. **Given** invalid input (empty fields or password &lt; 6 chars), **When** I tap Create Account, **Then** an inline error is shown and submit does not call Supabase
3. **Given** email already registered with wrong password, **When** I sign up, **Then** I see PWA-parity copy directing me to sign in instead
4. **Given** Supabase email confirmation is enabled, **When** sign-up succeeds without session, **Then** I see "Check your inbox…" info message (not a hard error)
5. **Given** sign-up succeeds, **When** session is established, **Then** `useAuthGate` redirects to tabs without manual `router.replace` from the form

## PWA reference

- `apps/pwa/src/fitness/AuthScreen.tsx` (signup view)
- `apps/pwa/src/fitness/fitnessCloudSync.ts` (`signUpWithEmail`)
- `apps/pwa/e2e/auth-gate.spec.ts` (extend for sign-up path)

## Tasks

- [x] Add `signUpWithEmail(email, password, name)` to `AuthContext` (port PWA duplicate-email + `needsConfirmation` logic)
- [x] Wire `sign-up.tsx`: controlled inputs, validation, loading, error/info states
- [x] Enable submit button; remove placeholder copy
- [x] Add toggle link to sign-in screen
- [x] Add Maestro `rn-auth-sign-up.yaml`
- [x] `npm run typecheck --workspace=@newyouai/mobile` passes

## Test tasks

- [x] Maestro `rn-auth-sign-up.yaml` (requires Supabase + disposable test email or env seed)
- [ ] Manual: duplicate email path, needsConfirmation path

## Dependencies

RN-2-01 (auth gate + sign-in pattern)

## Notes

- Do not seed full fitness persist slice here — RN-OFFLINE / RN-4 own post-auth state
- User-facing copy: **NewYou** / **New You AI** only
- One PR target

## Dev Agent Record

### Completion Notes

- Ported PWA `signUpWithEmail` duplicate-email and `needsConfirmation` handling into `AuthContext`.
- Wired full sign-up form with validation, loading, error/info states, and sign-in toggle.
- Added `rn-auth-sign-up.yaml` Maestro flow with `MAESTRO_TEST_SIGNUP_*` env vars.
- Typecheck passes.

### File List

- `apps/mobile/context/AuthContext.tsx`
- `apps/mobile/app/(auth)/sign-up.tsx`
- `apps/mobile/.maestro/rn-auth-sign-up.yaml`

## Change Log

- 2026-06-12: RN-2-02 email sign-up implemented (bmad-swarm epic-rn-2)
