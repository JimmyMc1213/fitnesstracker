---
name: newyou-finish
description: >-
  Finish and ship the New You AI iOS app to the App Store. Executes Linear
  launch epic FTI-70 in strict order (FTI-71–FTI-88): merge entitlement code,
  Supabase deploy, RevenueCat/ASC/EAS wiring, TestFlight, smoke test, Apple
  compliance, submit. Uses cursor-ide-browser on open console tabs and Linear
  MCP for status. Use when the user says "NewYou Finish", "finish launch",
  "ship to App Store", "run FTI-71", or wants the pay-to-unblur launch completed.
---

# NewYou Finish — App Store launch executor

Ship **New You AI** (`app.newyouai.mobile`) so a stranger can install, pay $14.99/mo or $69.99/yr (no trial), and see Future You unblur.

**Linear epic:** [FTI-70](https://linear.app/ftiness-tracker/issue/FTI-70)  
**Repo:** `JimmyMc1213/fitnesstracker` · mobile app `apps/mobile`

## Before starting

1. Read this skill fully.
2. **Linear MCP:** List FTI-70 sub-issues; note what's Done vs open. Do not redo completed work.
3. **Ask user once** if anything is already done that Linear doesn't reflect (especially FTI-76–80 if they passed smoke test).
4. **Browser:** Use `cursor-ide-browser` on launch console tabs. If login/MFA/passkey wall → stop, ask user to sign in, then resume.
5. **Git:** Do not commit unless user asks. Do not force push. Do not deploy prod without confirming.

## Done gate

One uninterrupted stranger path: install → sign in → onboarding → blurred Future You → real purchase → unblur → use app → email support@newyouai.app.

---

## Execution order (strict — FTI ID = step number)

Work **FTI-71 → FTI-88** in order. Mark each Done in Linear before starting the next. Fix **one blocker** per session if something fails.

| ID | Task | Owner | Browser? |
|----|------|-------|------------|
| **FTI-71** | Merge pro entitlement client + server code to `main` | Agent (code/PR) | GitHub optional |
| **FTI-72** | Fail closed on missing RevenueCat in release builds | Agent (code) | No |
| **FTI-73** | Deploy `future_you_entitlements` migration to prod Supabase | Agent + user approve | Supabase |
| **FTI-74** | Deploy `sync-pro-entitlement` + `revenuecat-webhook` edge functions | Agent + user approve | Supabase |
| **FTI-75** | Configure RevenueCat webhook + Supabase `REVENUECAT_*` secrets | Agent + user approve | Supabase + RevenueCat |
| **FTI-76** | Create ASC subscription products (monthly/yearly, no trial) | User or agent via browser | App Store Connect |
| **FTI-77** | Configure RevenueCat project, `pro` entitlement, offerings | Agent via browser | RevenueCat |
| **FTI-78** | Set EAS secrets (`EXPO_PUBLIC_SUPABASE_*`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`) | Agent via browser or CLI | Expo |
| **FTI-79** | TestFlight preview build + install on physical iPhone | Agent triggers build; user installs | Expo + ASC |
| **FTI-80** | Device smoke test — full pay-to-unblur launch gate | **User on iPhone** | No |
| **FTI-81** | Add iOS Privacy Manifest (`PrivacyInfo.xcprivacy`) | Agent (code) | No |
| **FTI-82** | Tighten ATS — remove `NSAllowsArbitraryLoads` | Agent (code) | No |
| **FTI-83** | Complete ASC metadata + review notes | User or agent via browser | App Store Connect |
| **FTI-84** | Verify support@newyouai.app delivery + ASC contact | User or agent | Resend / email |
| **FTI-85** | Fix overlay bleed bugs (FTI-60, FTI-61) | Agent (code) | No — optional pre-submit |
| **FTI-86** | Add Manage subscription link in Settings | Agent (code) | No — optional |
| **FTI-87** | Submit iOS app to App Store review | User or agent via browser | App Store Connect |
| **FTI-88** | Claim @newyouai social handles | User | Social — post-launch OK |

### Minimal path (if user already passed FTI-80 smoke test)

Skip re-wiring that's verified working. Focus: **FTI-71 → FTI-81/82 (safe) → FTI-83 → FTI-87**.

Still confirm FTI-73–78 are live — don't assume from smoke test alone.

---

## Reference IDs (do not guess)

| Key | Value |
|-----|-------|
| Bundle ID | `app.newyouai.mobile` |
| ASC app ID | `6786066197` |
| EAS project ID | `2fe54137-703a-4c3f-bd01-5ceabee0268d` |
| RevenueCat project | `814de77b` |
| Supabase prod project | `ztedlrvvkcjxoomwavyd` |
| Product IDs | `newyouai_pro_monthly` ($14.99/mo), `newyouai_pro_yearly` ($69.99/yr) |
| Entitlement | `pro` |
| Apple team | `YJ77689737` |

---

## Browser consoles (cursor-ide-browser)

Open or reuse these tabs. Epic FTI-70 description has the auth status table.

| Service | URL |
|---------|-----|
| RevenueCat | `https://app.revenuecat.com/projects/814de77b/overview` |
| App Store Connect | `https://appstoreconnect.apple.com/apps/6786066197` |
| Supabase prod | `https://supabase.com/dashboard/project/ztedlrvvkcjxoomwavyd` |
| Expo EAS env | `https://expo.dev/accounts/jimmymccarthy/projects/newyouai-mobile/environment-variables` |
| GitHub | `https://github.com/JimmyMc1213/fitnesstracker` |
| Resend (email) | Resend dashboard · newyouai.app domain |
| Linear | `https://linear.app/ftiness-tracker/issue/FTI-70` |

**Linear MCP:** `save_issue` to update status; `save_comment` to log what was done.

---

## Per-issue quick guide

### FTI-71 — Merge entitlement code

Files on branch (may already be committed):
- `apps/mobile/lib/syncProEntitlement.ts`
- `apps/mobile/lib/revenueCat.ts`, `context/AuthContext.tsx`
- `supabase/functions/sync-pro-entitlement/`, `revenuecat-webhook/`
- `supabase/migrations/011_future_you_entitlements.sql`
- `supabase/functions/future-you-status/index.ts`

Verify: `npm run typecheck --workspace=@newyouai/mobile` · merge PR to `main`.

### FTI-72 — Fail closed stub

In release (`!__DEV__`), missing `EXPO_PUBLIC_REVENUECAT_IOS_KEY` must **not** return `{ ok: true, stub: true }`. Update `revenueCat.ts` + `OnboardingPaywall.tsx` + tests.

### FTI-73–75 — Supabase prod

- **73:** Apply migration `011_future_you_entitlements.sql`
- **74:** `supabase functions deploy sync-pro-entitlement revenuecat-webhook`
- **75:** Secrets `REVENUECAT_SECRET_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`; point RevenueCat webhook at prod function

Confirm `FUTURE_YOU_ENTITLEMENT_STUB` is **not** set in prod.

### FTI-76–77 — IAP wiring

- ASC: subscription group, two products, **no trial**
- RevenueCat: link ASC, map products to `pro` offering

Docs: `docs/revenuecat-app-store-setup.md`

### FTI-78 — EAS secrets

Required on EAS project (preview + production):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`

CLI: `cd apps/mobile && eas env:list` / `eas secret:create`

### FTI-79 — TestFlight build

```bash
cd apps/mobile
npm run eas build -- --profile preview --platform ios
eas submit --profile preview --platform ios
```

User installs on physical iPhone — not dev client + Metro.

### FTI-80 — Smoke test (user)

Pass criteria (`docs/rn-device-smoke-test.md`):
- Sign in → onboarding → blurred Future You → $14.99/$69.99 paywall (no trial)
- **Real sandbox purchase** (not stub) → unblur → Home
- Log workout or food → sign out/in persists

Agent cannot complete this — user runs on device.

### FTI-81–82 — Apple compliance (code)

- **81:** Add `PrivacyInfo.xcprivacy` via Expo config plugin
- **82:** Remove `NSAllowsArbitraryLoads: true` from `apps/mobile/app.config.ts`

### FTI-83 — ASC metadata

Screenshots, description, age rating (AI body imagery, 18+ gate), review notes (illustrative AI, consent, delete/report flows). Privacy URL: `https://newyouai.app/privacy`

### FTI-87 — Submit

Production build + submit after FTI-80 + FTI-83 (+ FTI-81/82 in build). Update newyouai.app CTA when live.

---

## Session workflow

Copy and update each turn:

```
NewYou Finish progress:
- [ ] FTI-71 … FTI-88 (mark done as you go)
Current: FTI-XX
Blocker: (none | describe)
User action needed: (none | sign in to X | run smoke test on iPhone)
```

**Each issue:**
1. Read Linear issue + acceptance criteria
2. Do the work (code, browser, or CLI)
3. Verify acceptance criteria
4. Mark Done in Linear + short comment
5. Report to user; start next only if unblocked

---

## Docs in repo

- `docs/launch-infra-checklist.md`
- `docs/revenuecat-app-store-setup.md`
- `docs/rn-device-smoke-test.md`
- `docs/env-matrix.md`

Probe: `node scripts/check-launch-infra.mjs`

---

## Not launch-blocking (defer if user wants speed)

FTI-84, FTI-85, FTI-86, FTI-88 · admin dashboard · social handles · overlay polish

---

## Start command

When user invokes this skill, respond with:

1. Current Linear status of FTI-71–88
2. First incomplete issue in order
3. What you will do autonomously vs what needs user action right now
4. Begin FTI-XX immediately unless blocked on auth
