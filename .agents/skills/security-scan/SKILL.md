---
name: security-scan
description: >-
  Systematically audit this codebase for security risks before launch,
  classify each finding as High/Medium/Low, and write a concrete remediation
  story per finding. Read-only by default (report first, do not auto-fix). Use
  when the user asks for a "security scan", "audit", "pre-launch security
  review", "check for vulnerabilities", or asks "is this safe to launch".
---

# Security Scan

Systematically audit the codebase, classify every finding by risk, and produce a ranked report where **each finding is an actionable remediation story**. This is an audit skill: **read the real files, do not guess**, and **do not change app code** unless the user explicitly asks you to fix after seeing the report.

## Operating rules

- **Read-only by default.** Produce the report first. Do not auto-fix. Only edit code if the user explicitly says to remediate after reviewing findings.
- **Read the real files.** Every finding must cite specific file paths and, where useful, line ranges. No hand-waving.
- **Re-run after fixes.** Remind the user to re-run this skill once remediations land, so the report reflects the current state.
- **Rank consistently.** Apply the rubric below the same way every time.

## How to run

Copy this checklist and track progress:

```
Task Progress:
- [ ] 1. Map trust boundaries (anon-key client / edge function / service-role / admin)
- [ ] 2. Scan each area below by reading the real files
- [ ] 3. Classify each finding High/Medium/Low per the rubric
- [ ] 4. Write a remediation story per finding
- [ ] 5. Produce the ranked report + go/no-go recommendation
```

### Step 1 — Enumerate trust boundaries first

Before scanning, write down who can call what and with which privileges. This frames every later finding.

- **Client (anon key)** — the mobile/PWA app runs with the Supabase anon key and a user JWT. Anything reachable here is attacker-controllable. RLS is the only server-side guard.
- **Edge functions** — `supabase/functions/*`. Determine per function: is `verify_jwt` on? does it call `auth.getUser()`? does it hold the **service-role** key (bypasses RLS)?
- **Service-role** — full DB access, no RLS. Must only live server-side (edge functions, admin server, CI). Flag any path where it is reachable from the client.
- **Admin app** — `apps/admin/` runs a service-role client. Confirm every protected route is actually auth-gated.

State the boundary map explicitly at the top of your report so severity judgments are grounded in it.

### Step 2 — Scan each area (read the real files)

Walk every area below. For each, open the listed files and check the listed concerns.

#### 1. RLS & database policies — `supabase/migrations/*`
- Flag the `community_foods` **UPDATE** policy using `USING (true)` in `003_community_foods_upsert_rls.sql` (any authenticated user can mutate any row).
- Verify tables in `006_future_you_reports.sql` and `007_issue_reports.sql` have **no client-facing policies** (should be service-role only, no anon/authenticated grants).
- Trace the `fitness_user_data` DELETE path in `001_fitness_user_data.sql` — confirm users can only delete their own rows.
- Check storage bucket prefix scoping in `004_future_you_storage.sql` — policies must scope object paths to the owning user (e.g. `auth.uid()` prefix), not allow cross-user reads/writes.
- For every table: is RLS enabled, and does each policy correctly scope to `auth.uid()`?

#### 2. Edge function auth — `supabase/functions/*/index.ts` + `*/guards.ts`
- Confirm `verify_jwt` is set appropriately per function (`supabase/config.toml` + function config).
- Confirm each function calls `auth.getUser()` and authorizes the caller before acting.
- Confirm **service-role isolation** — the service-role key is only used server-side and never returned to or reachable by the client.
- Flag `CORS *` (wildcard `Access-Control-Allow-Origin`) on sensitive/authenticated endpoints.
- Assess rate-limiting **durability** — especially `supabase/functions/food-search/guards.ts`. In-memory counters reset per cold start and are not shared across instances (weak).

#### 3. Entitlement / paywall integrity
- The **preview-vs-result signed URL** issue in `supabase/functions/future-you-status/index.ts` — can a caller obtain the full-resolution/result URL without a valid entitlement (i.e. bypass the paywall via the preview path)?
- `FUTURE_YOU_ENTITLEMENT_STUB` (see `apps/mobile/lib/futureYouDevFlags.ts` and `supabase/functions/future-you-status/index.ts`) — confirm the stub cannot ship enabled to production and is not honored server-side in prod.
- **Client-controlled `subscriptionTier`** in `packages/core/src/future-you/paywallModel.ts` — if the tier is asserted by the client, entitlement checks are bypassable. Entitlement must be verified server-side.
- RevenueCat stub in `apps/mobile/lib/revenueCat.ts` — confirm it is dev-only and that real entitlement is verified server-side, not trusted from the client.

#### 4. Auth flows
- OAuth / deep-link parsing — `apps/mobile/lib/authOAuth.ts`, `apps/mobile/lib/deepLinkRouter.ts`. Check for open-redirect and token/parameter injection via crafted deep links.
- Redirect allow-list — `apps/mobile/lib/authRedirect.ts` and `additional_redirect_urls` in `supabase/config.toml`. Confirm redirects are constrained to an allow-list, no wildcards that enable token exfiltration.
- Password reset / change flows — verify they require a valid session/token and cannot be triggered for arbitrary accounts.
- Session storage — `apps/mobile/lib/supabaseSecureStore.ts`. Confirm tokens use `SecureStore`, not `AsyncStorage` (plaintext). Flag any `AsyncStorage` fallback holding secrets.
- Minimum password length / strength in `supabase/config.toml` (`minimum_password_length`, symbol requirements).

#### 5. Admin app — `apps/admin/`
- Confirm every route under `apps/admin/app/(protected)/` is actually behind auth — check `apps/admin/app/(protected)/layout.tsx` enforces a session/role gate (not just folder naming).
- `apps/admin/lib/supabase-admin.ts` uses the service-role client — confirm it is server-only (never bundled to the browser) and that pages don't leak service-role access to unauthenticated visitors.

#### 6. Secrets & env — `docs/env-matrix.md`
- Cross-check client-exposed vs server-only variables against `docs/env-matrix.md`. Anything server-only must never be referenced in client bundles.
- Scan for hardcoded keys/tokens/secrets across the repo (API keys, service-role keys, private tokens).
- Verify `.gitignore` covers `.env*` and any secret material; confirm no secrets are committed in config.
- Check dev scripts / tooling that use the service role — confirm they are not shipped or reachable in production.

#### 7. Input validation & payload limits — `packages/core/src/*/*Guards.ts`
- Review shared guards: `packages/core/src/future-you/{generateGuards,reportGuards,uploadGuards}.ts`, `packages/core/src/issue-report/reportGuards.ts`. Confirm inputs are validated server-side, not only client-side.
- Verify the **2MB sync cap** is enforced server-side (not just in the client).
- Upload MIME/size checks — confirm `future-you-upload` validates content type and size before accepting/storing.

#### 8. Third-party client calls
- Open Food Facts barcode lookup — check abuse/rate-limit exposure (unauthenticated proxying, no throttle, potential for the app's key/IP to be abused).

#### 9. Dependency & config hygiene
- Note running `npm audit` (report high/critical advisories; do not auto-upgrade).
- Verify no secrets or credentials are committed in any config file.

### Step 3 — Classify each finding (rubric)

Apply consistently:

- **High** — exploitable now; leads to data exposure/loss, auth bypass, financial/paywall bypass, or service-role/DB compromise. Examples: paywall / signed-URL bypass, admin routes without auth, broad RLS `USING (true)`, service-role reachable from client.
- **Medium** — requires specific conditions or weakens security posture. Examples: weak password policy, non-durable (in-memory) rate limits, dev-only storage risks, missing server-side validation that is currently masked by the client.
- **Low** — informational / hardening / defense-in-depth. Examples: project-ref exposure, CORS configuration review, third-party abuse surface.

### Step 4 & 5 — Produce the report

Use the output format below. Group by severity, lead with a summary count and a go/no-go call.

## Output format

Produce a single report in this structure:

```markdown
# Security Scan Report — <date>

## Summary
**X High · Y Medium · Z Low**

**Launch recommendation: GO / NO-GO** — <one-line justification>

### Trust boundary map
- Client (anon key + user JWT): <what it can reach>
- Edge functions: <verify_jwt / auth.getUser / service-role usage per fn>
- Service-role: <where it lives, confirmed server-only?>
- Admin app: <auth gate confirmed?>

---

## High
### [H-1] <short title>
- **Severity:** High
- **Affected files:** `path/to/file.ts:LINES`, ...
- **Risk:** <what is wrong and what it exposes>
- **Exploit scenario:** <concrete step-by-step of how an attacker abuses it>
- **Acceptance criteria / fix steps:**
  - [ ] <specific, verifiable step written as a ticket>
  - [ ] <...>

### [H-2] ...

## Medium
### [M-1] ...
(same fields)

## Low
### [L-1] ...
(same fields)
```

Rules for the report:
- Every finding is a **remediation story** with all fields: ID, title, severity, affected files/paths, risk description, exploit scenario, and actionable acceptance criteria / fix steps.
- IDs are `H-n`, `M-n`, `L-n`.
- The summary count and **go/no-go** are mandatory. NO-GO if any High is unresolved.
- If an area was checked and is clean, note it briefly (a short "Checked and clean" list) so the user knows it wasn't skipped.

## Notes
- **Read-only by default** — report first, do not auto-fix. Offer to remediate specific findings only after the user reviews the report.
- **Re-run after fixes** to confirm remediations and catch regressions before launch.
- **Deferred / open items** from past audits are tracked in [docs/security-deferred-issues.md](../../../docs/security-deferred-issues.md). When the user asks what wasn't fixed yet, read that file first.
