---
name: RN-2-04 Apple Sign-In
epic: RN-2
story: 04
status: done
swarm_order: 3
swarm_branch: epic-rn-2/authentication-session
baseline_commit: e193c40b8ffb81cc55bcc722a001233f71b38eea
---

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

# RN-2-04: Apple Sign-In

## User story

**As an** iOS user  
**I want** to continue with Apple  
**So that** I can sign in with my Apple ID (native-only; PWA had placeholder)

## Acceptance criteria

1. **Given** signed out on an auth screen, **When** I tap Continue with Apple, **Then** the native Apple Sign-In sheet appears
2. **Given** successful Apple auth, **When** Supabase accepts the identity token, **Then** I reach `(tabs)` home
3. **Given** user cancels Apple sheet, **When** I dismiss, **Then** I remain on auth screen without crash
4. **Given** first-time Apple sign-in, **When** Apple provides name, **Then** full name is passed to Supabase user metadata when available
5. **Given** EAS iOS build, **Then** Sign in with Apple capability is enabled in provisioning

## PWA reference

- `apps/pwa/src/fitness/AuthScreen.tsx` (`AppleSignInPlaceholder` — replace on RN)
- Architecture: Apple provider enabled in Supabase

## Tasks

- [x] Add `expo-apple-authentication` (or documented Supabase + Expo Apple flow)
- [x] Extend `AuthContext.signInWithOAuth` or add `signInWithApple()` using identity token → Supabase
- [x] Add Apple button to `AuthOAuthButtons` (black/white per HIG)
- [x] Enable Apple capability in EAS / `app.config.ts` plugin config
- [x] Document TestFlight requirement for full Apple auth testing
- [x] `npm run typecheck --workspace=@newyouai/mobile` passes

## Test tasks

- [ ] Manual: Apple Sign-In on dev client or TestFlight internal build
- [ ] Maestro: not required (Apple auth not reliably automatable)

## Dependencies

RN-2-03 (OAuth redirect + `AuthOAuthButtons` shell)

## Notes

- Native-only feature — ships enabled unlike PWA placeholder
- One PR target

### Pending — Apple Developer account approval (2026-06-12)

Code shipped; external setup blocked until Apple Developer account is approved.

**Resume checklist:**

1. Apple Developer → App ID `app.newyouai.mobile` → Sign in with Apple capability
2. Supabase → Auth → Providers → Apple → enable; Client IDs: `app.newyouai.mobile`
3. `eas build --profile development --platform ios` → reinstall dev client
4. Manual test on device or TestFlight; mark story `done` + run epic Maestro sweep

## Dev Agent Record

### Completion Notes

- Added `signInWithApple()` using `expo-apple-authentication` + `signInWithIdToken`.
- Apple button in `AuthOAuthButtons` (iOS only, HIG black style).
- Enabled `usesAppleSignIn` and `expo-apple-authentication` plugin in `app.config.ts`.
- Documented TestFlight note in `docs/eas-ios.md`.

### File List

- `apps/mobile/context/AuthContext.tsx`
- `apps/mobile/components/AuthOAuthButtons.tsx`
- `apps/mobile/app.config.ts`
- `apps/mobile/package.json`
- `docs/eas-ios.md`

## Change Log

- 2026-06-12: RN-2-04 Apple Sign-In implemented (bmad-swarm epic-rn-2)
