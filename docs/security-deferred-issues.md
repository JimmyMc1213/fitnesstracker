# Security issues — deferred (not yet fixed)

This document tracks security findings from the pre-launch audit (Jul 2026) that were **intentionally left open** because fixing them requires more design work, a feature build, or carries breakage risk. Use this list when asking in a new chat: *"What security issues weren't touched?"* or *"What's left from the security scan?"*

**Status of the audit:** The three **High** findings and several **Medium** items were fixed in the same pass as this doc. See git history around the commit that adds migrations `011`–`013` and the admin auth gate.

**Re-run the audit:** Use the `.agents/skills/security-scan` skill after any of these are addressed.

---

## Medium — requires feature / integration work

### M-1 — No real server-side subscription entitlement

- **Severity:** Medium (was High-adjacent before paywall URL fix)
- **Affected:** `supabase/functions/future-you-status/index.ts` (`isFutureYouEntitled`), `FUTURE_YOU_ENTITLEMENT_STUB` in `docs/env-matrix.md`, `apps/mobile/lib/futureYouDevFlags.ts`
- **Risk:** Entitlement is still a stub (`FUTURE_YOU_ENTITLEMENT_STUB` env flag). If set in production, everyone is entitled. There is no durable server source of truth (RevenueCat webhook → DB, or RevenueCat REST lookup).
- **Why deferred:** Needs RevenueCat → server integration; not a one-line fix.
- **Fix steps:**
  - [ ] Persist subscription state server-side (webhook handler or periodic RevenueCat API check by app user id).
  - [ ] Replace `isFutureYouEntitled()` to read that source; fail closed.
  - [ ] Assert `FUTURE_YOU_ENTITLEMENT_STUB` cannot be enabled in production deploy env.

### M-2 — Client-controlled `subscriptionTier` gates reveal client-side

- **Severity:** Medium
- **Affected:** `packages/core/src/future-you/successModel.ts`, `packages/core/src/future-you/homeEntryModel.ts`, `packages/core/src/sync/onboardingDraft.ts`
- **Risk:** `subscriptionTier` is part of client-synced state; `isFutureYouPostPayEntitled()` and related helpers trust `subscriptionTier === "pro"`. A modified client can claim pro locally.
- **Why deferred:** UI/routing depends on tier today; server entitlement (M-1) must land first. **Note:** H-1 fix means the full image URL is no longer leaked via status even if tier is spoofed.
- **Fix steps:**
  - [ ] Treat `subscriptionTier` as display-only; never authorize asset access from it.
  - [ ] Gate reveal routes on server poll returning `resultSignedUrl` only when entitled.

### M-6 — Auth deep links accept tokens without origin binding

- **Severity:** Medium
- **Affected:** `apps/mobile/lib/authOAuth.ts`, `apps/mobile/lib/deepLinkRouter.ts`, OAuth session handlers
- **Risk:** `parseOAuthRedirectUrl` accepts `access_token` / `refresh_token` from any deep link containing those params. Crafted links could fixate session (phishing / wrong-account login).
- **Why deferred:** Requires PKCE `code` flow and/or `state` nonce validation across the live OAuth path; easy to break sign-in if rushed.
- **Fix steps:**
  - [ ] Prefer authorization-code exchange over raw tokens in inbound URLs.
  - [ ] Validate `state` / nonce generated for the in-flight auth request before `setSession`.
  - [ ] Reject unsolicited token-bearing deep links.

---

## Low — hardening / defense-in-depth

### L-1 — CORS `*` on authenticated edge functions

- **Severity:** Low
- **Affected:** `supabase/functions/*/index.ts` (e.g. `future-you-status`, `food-search`, `future-you-report`)
- **Risk:** Wildcard `Access-Control-Allow-Origin` on JWT-protected endpoints. Lower impact (bearer tokens, not cookies) but broadens browser-callable surface.
- **Why deferred:** Tightening origins must match all deployed app URLs (PWA, admin, mobile web); misconfiguration breaks clients.
- **Fix steps:**
  - [ ] Replace `*` with an allow-list env var (production app origins only).

### L-2 — Localhost / Expo redirect URLs in production auth config

- **Severity:** Low
- **Affected:** `supabase/config.toml` → `[auth].additional_redirect_urls`
- **Risk:** Dev entries (`http://localhost:…`, `exp://127.0.0.1:…`) in the linked production project widen redirect surface.
- **Why deferred:** Removing them can break local dev unless split per environment.
- **Fix steps:**
  - [ ] Use separate Supabase projects or environment-specific config for prod vs dev redirects.
  - [ ] Remove localhost/exp entries from production `config push`.

### L-3 — Open Food Facts proxy abuse

- **Severity:** Low
- **Affected:** `supabase/functions/food-search/index.ts` (`searchOff`)
- **Risk:** Authenticated users can drive upstream OFF traffic; shared IP/UA could be throttled. Mitigated partially by durable rate limit (migration `013`).
- **Why deferred:** Caching and upstream quotas are product/ops tuning, not a quick security patch.
- **Fix steps:**
  - [ ] Add response caching for repeated queries.
  - [ ] Monitor OFF rate limits; consider per-IP caps at CDN/WAF.

### L-4 — SecureStore falls back to AsyncStorage

- **Severity:** Low (dev); review for production builds
- **Affected:** `apps/mobile/lib/supabaseSecureStore.ts`
- **Risk:** In `__DEV__`, web, or on keychain failure, session tokens use AsyncStorage (plaintext).
- **Why deferred:** Intentional for local dev/simulator; changing prod behavior needs device testing.
- **Fix steps:**
  - [ ] Confirm production signed builds never set `EXPO_PUBLIC_SUPABASE_USE_ASYNC_STORAGE`.
  - [ ] Log/alert if SecureStore fallback triggers in non-dev builds.

### L-5 — Project ref / infra identifiers in committed docs

- **Severity:** Low (informational)
- **Affected:** `docs/env-matrix.md`, `supabase/config.toml`
- **Risk:** Project ref is not a secret but aids reconnaissance.
- **Fix steps:** Optional doc scrub or env-specific doc generation.

### L-6 — `secure_password_change = false`

- **Severity:** Low
- **Affected:** `supabase/config.toml`
- **Risk:** Documented as required for `resetPasswordForEmail` recovery flow without nonce.
- **Why deferred:** Changing breaks password-reset UX unless flow is redesigned.
- **Fix steps:**
  - [ ] Document threat model; ensure in-app password change requires valid session.
  - [ ] Revisit if Supabase auth flow allows `secure_password_change` with recovery links.

---

## Already fixed (for context)

| ID | Title | Fix summary |
|----|--------|-------------|
| H-1 | Paywall signed-URL bypass | Low-res preview object + status never signs full result for non-entitled users |
| H-2 | Admin unauthenticated | Supabase SSR auth + `ADMIN_ALLOWED_EMAILS` gate on `(protected)` routes |
| H-3 | `community_foods` UPDATE `USING (true)` | Migration `011`: owner-only UPDATE |
| M-3 | In-memory food-search rate limit | Migration `013` + RPC; fail-open to in-memory |
| M-4 | Weak password length (6) | `minimum_password_length = 8` + client validators |
| M-5 | Client-only 2MB sync cap | Migration `012`: DB trigger on `fitness_user_data.payload` |

---

## Launch checklist (remaining)

Before calling security "done" for launch:

1. Apply migrations `011`–`013` to the linked Supabase project.
2. Deploy updated edge functions (`future-you-generate`, `future-you-status`, `food-search`, `future-you-delete`).
3. `supabase config push` for password length change.
4. Deploy admin app with `ADMIN_ALLOWED_EMAILS` and staff accounts configured.
5. Address M-1 (real entitlement) before relying on paywall for revenue.
6. Re-run `.agents/skills/security-scan` and confirm deferred items are acceptable or closed.
