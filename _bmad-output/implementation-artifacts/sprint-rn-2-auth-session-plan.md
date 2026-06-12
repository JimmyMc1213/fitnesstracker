# Sprint RN-2 — Authentication & Session

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready)  
**Epic:** `epic-rn-2`  
**Swarm branch:** `epic-rn-2/authentication-session`  
**Goal:** Complete native auth entry + session lifecycle (email, Google, Apple, sign-out) so RN-3 app shell can assume a signed-in user.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M1 (partial — account mgmt in RN-10)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §5 Auth  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-2  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

A user can create an account or sign in with email, Google, or Apple on iOS; the session persists in SecureStore; sign-out returns to the auth welcome screen; auth Maestro flows pass on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-2` |
| Branch | `epic-rn-2/authentication-session` |
| Start story | **RN-2-02** (`rn-2-02-email-sign-up.md`) |
| Story files | All 5 exist under `implementation-artifacts/rn-2-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (epic close) | Auth Maestro flows green (see below) |

**Kickoff:** `/bmad-swarm epic-rn-2` or `dev this story rn-2-02-email-sign-up.md`

**Swarm order (strict):**

```
RN-2-02 → RN-2-03 → RN-2-04 → RN-2-05 → epic-rn-2-retrospective
```

RN-2-01 is **done** — do not re-implement; only extend `AuthContext` / auth screens in 02–05.

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 / RN-1 | **Done** | Foundation + shared packages |
| RN-2-01 | **Done** | SecureStore, sign-in, auth gate (2026-06-12) |
| Sign-up shell | **Live** | `sign-up.tsx` — submit disabled until RN-2-02 |
| OAuth | **Not wired** | RN-2-03 / RN-2-04 |
| Sign-out UI | **Not wired** | `AuthContext.signOut` exists; RN-2-05 adds affordance |
| Post-auth routing | **Stub** | Lands on `(tabs)` placeholder — `appShellRouting` is RN-3-02 |

---

## Execute in this order

| # | Story | Story file | PR target | Status |
|---|-------|------------|-----------|--------|
| — | RN-2-01 | `rn-2-01-supabase-securestore.md` | 1 PR | **done** |
| 1 | **RN-2-02** | `rn-2-02-email-sign-up.md` | 1 PR | ready-for-dev |
| 2 | **RN-2-03** | `rn-2-03-google-oauth.md` | 1 PR | ready-for-dev |
| 3 | **RN-2-04** | `rn-2-04-apple-sign-in.md` | 1 PR | ready-for-dev |
| 4 | **RN-2-05** | `rn-2-05-sign-out-session-oauth.md` | 1 PR | ready-for-dev |
| 5 | Retro | `epic-rn-2-retrospective` | — | optional |

---

## RN-2-01 — Shipped (baseline for swarm)

**Do not redo.** Swarm builds on:

- `AuthContext` + `useAuthGate` + `(auth)` / `(tabs)` groups
- Maestro: `rn-auth-gate.yaml`, `rn-auth-gate-sign-in.yaml` (YAML includes `clearState`, `clearKeychain`, Metro `openLink` → `:8082`)

Re-run auth Maestro at **epic close** (RN-2-05), not per story unless a story touches auth gate.

---

## RN-2-02 — Email sign-up flow

**Story file:** `rn-2-02-email-sign-up.md`

**Deliverables:**

- `AuthContext.signUpWithEmail` — port PWA `fitnessCloudSync.signUpWithEmail` (duplicate email, `needsConfirmation`)
- Wire `sign-up.tsx`: validation, loading, errors; enable submit
- Success → `useAuthGate` → `(tabs)` (stub home; onboarding routing is RN-3)

**Maestro (add):** `rn-auth-sign-up.yaml`

**PWA ref:** `AuthScreen.tsx`, `fitnessCloudSync.ts`, extend `e2e/auth-gate.spec.ts` pattern

**Story gate:** typecheck + `npm run test:e2e:auth` still passes

---

## RN-2-03 — Google OAuth

**Story file:** `rn-2-03-google-oauth.md`

**Deliverables:**

- `expo-auth-session`, `expo-web-browser`
- `signInWithOAuth('google')` — `makeRedirectUri` + `WebBrowser.openAuthSessionAsync`
- Shared `AuthOAuthButtons` on welcome / sign-in / sign-up
- Document redirect URIs in `docs/env-matrix.md`

**Maestro:** `rn-auth-google.yaml` optional; manual sign-in OK for story done

**Story gate:** typecheck + `npm run test:e2e:auth`

---

## RN-2-04 — Apple Sign-In

**Story file:** `rn-2-04-apple-sign-in.md`

**Deliverables:**

- `expo-apple-authentication` (or documented Supabase native flow)
- Apple button on `AuthOAuthButtons`
- Sign in with Apple capability in EAS / `app.config.ts`

**Maestro:** manual / TestFlight — not blocking per story

**Story gate:** typecheck + `npm run test:e2e:auth`

---

## RN-2-05 — Sign out, session refresh, OAuth edge cases

**Story file:** `rn-2-05-sign-out-session-oauth.md`

**Deliverables:**

- Minimal sign-out affordance (tabs stub or header — full Settings is RN-10)
- `signOut` hardening + `AppState` → `refreshSession`
- OAuth deep-link edge cases (cancel, stale session, token refresh failure)
- Vitest for extracted pure helpers if any

**Maestro (add):** `rn-auth-sign-out.yaml`  
**Epic Maestro sweep:** all auth flows below

**Story gate:** typecheck + full auth Maestro sweep green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Email sign-up + sign-in | Password change, email update (RN-10) |
| Google + Apple OAuth | Account deletion Edge Function (RN-10) |
| SecureStore session persist | Fitness cloud sync on auth (RN-OFFLINE) |
| Sign-out + session refresh | RevenueCat `Purchases.logIn` (RN-4) |
| Maestro auth E2E | `appShellRouting` / onboarding after auth (RN-3, RN-4) |
| NewYou branding only | Gymmy / Fitcoach copy |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, `apps/mobile/.env` with `EXPO_PUBLIC_SUPABASE_*`

```bash
# Java (Maestro)
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — use 8082 if 8081 is taken
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — from apps/mobile
npm run test:e2e:auth              # signed-out gate (RN-2-01)
MAESTRO_TEST_EMAIL=... MAESTRO_TEST_PASSWORD=... npm run test:e2e:auth-sign-in
npm run test:e2e:auth-sign-up      # after RN-2-02
npm run test:e2e:auth-sign-out     # after RN-2-05
```

Auth YAML flows use `openLink` → `http://127.0.0.1:8082` — Metro **must** be on port 8082 when 8081 is occupied.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

### Epic close (RN-2-05)

- [ ] `rn-auth-gate.yaml` green
- [ ] `rn-auth-gate-sign-in.yaml` green (with `MAESTRO_TEST_*`)
- [ ] `rn-auth-sign-up.yaml` green
- [ ] `rn-auth-sign-out.yaml` green
- [ ] RN-2-03 Google — manual on dev client (or optional Maestro)
- [ ] RN-2-04 Apple — manual on dev client / TestFlight
- [ ] `epic-rn-2` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-2/authentication-session`
2. Run swarm or `dev this story <rn-2-XX>.md` in order 02 → 05
3. One focused PR per story (target; epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-2-05: run full auth Maestro sweep + mark epic `done`

---

## Definition of done (epic)

1. Signed-out user sees auth welcome; cannot reach tabs without session.
2. Email sign-up and sign-in reach `(tabs)` stub home.
3. Google and Apple sign-in work on dev client (manual gate documented).
4. Sign-out clears session and returns to welcome.
5. Session survives app restart (manual: kill → relaunch).
6. Auth Maestro flows green per epic close checklist.

---

## Unblocks

| Downstream | Needs from RN-2 |
|------------|-----------------|
| RN-3 App shell | Stable auth gate + session |
| RN-4 Onboarding | Signed-in user id (routing still RN-3) |
| RN-OFFLINE | `session.user.id` for sync |
| M2 timeline | Auth E2E green |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Metro port 8081 conflict | Always `--port 8082` + Maestro `openLink` already set |
| Maestro needs Java | `JAVA_HOME` for openjdk@17 in runbook |
| OAuth redirect mismatch | env-matrix + Supabase dashboard checklist in RN-2-03 |
| Apple auth on simulator | TestFlight for RN-2-04 acceptance |
| Epic bundle PR | Prefer one PR per story if review/bisect matters |

---

## Next action

**`/bmad-swarm epic-rn-2`** — starts at **RN-2-02**.

Or: `dev this story rn-2-02-email-sign-up.md`
