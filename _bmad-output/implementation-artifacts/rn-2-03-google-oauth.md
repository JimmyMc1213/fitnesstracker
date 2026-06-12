---
name: RN-2-03 Google OAuth
epic: RN-2
story: 03
status: done
swarm_order: 2
swarm_branch: epic-rn-2/authentication-session
baseline_commit: e193c40b8ffb81cc55bcc722a001233f71b38eea
---

<!-- Validation: optional validate-create-story before dev-story / bmad-swarm next -->

# RN-2-03: Google OAuth via expo-auth-session

## User story

**As a** user on an auth screen  
**I want** to continue with Google  
**So that** I can sign in without creating a separate password

## Acceptance criteria

1. **Given** signed out, **When** I tap Continue with Google, **Then** the system browser / auth session opens and returns to the app on success
2. **Given** OAuth succeeds, **When** Supabase establishes a session, **Then** I reach `(tabs)` home (same gate as email sign-in)
3. **Given** user cancels the OAuth sheet, **When** I return to the app, **Then** I remain on the auth screen with no error crash
4. **Given** misconfigured redirect URI, **When** OAuth fails, **Then** inline error explains the failure
5. **Given** Google button on welcome, sign-in, and sign-up, **Then** styling matches design tokens (divider + secondary OAuth button pattern from PWA)

## PWA reference

- `apps/pwa/src/fitness/fitnessCloudSync.ts` (`signInWithOAuth` provider `google`)
- `apps/pwa/src/index.css` (`.onboarding-oauth-btn--google`)

## Tasks

- [x] Add `expo-auth-session`, `expo-web-browser` dependencies
- [x] Implement `signInWithOAuth(provider: 'google')` in `AuthContext` with `makeRedirectUri` + `WebBrowser.openAuthSessionAsync`
- [x] Document redirect URIs in `docs/env-matrix.md` and Supabase dashboard checklist
- [x] Add shared `AuthOAuthButtons` component (Google only in this story)
- [x] Wire OAuth buttons on `(auth)/index`, `sign-in`, `sign-up`
- [x] `npm run typecheck --workspace=@newyouai/mobile` passes

## Test tasks

- [ ] Manual: Google sign-in on iOS simulator/dev client with test Google account
- [ ] Optional Maestro `rn-auth-google.yaml` (document skip if provider blocks automation)

## Dependencies

RN-2-02 (email path stable; auth screens finalized)

## Notes

- Redirect scheme: `newyouai` (already in `app.config.ts`)
- First OAuth story owns redirect plumbing reused by RN-2-04 Apple
- One PR target

## Dev Agent Record

### Completion Notes

- Added `expo-auth-session`; `expo-web-browser` was already present.
- Implemented Google OAuth via `signInWithOAuth` with redirect parsing in `lib/authOAuth.ts`.
- Created `AuthOAuthButtons` and wired on welcome, sign-in, sign-up screens.
- Documented redirect URIs in `docs/env-matrix.md`.

### File List

- `apps/mobile/context/AuthContext.tsx`
- `apps/mobile/lib/authOAuth.ts`
- `apps/mobile/components/AuthOAuthButtons.tsx`
- `apps/mobile/app/(auth)/index.tsx`
- `apps/mobile/app/(auth)/sign-in.tsx`
- `apps/mobile/app/(auth)/sign-up.tsx`
- `apps/mobile/package.json`
- `docs/env-matrix.md`

## Change Log

- 2026-06-12: RN-2-03 Google OAuth implemented (bmad-swarm epic-rn-2)
