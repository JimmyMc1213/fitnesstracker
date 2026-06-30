# RevenueCat + App Store subscriptions

Wire real payments before public launch. Pricing: **$14.99/mo** · **$69.99/yr** · **no trial**.

---

## 1. App Store Connect products

In [App Store Connect](https://appstoreconnect.apple.com) → your app → **Subscriptions**:

| Field | Monthly | Yearly |
| --- | --- | --- |
| **Reference name** | New You Pro Monthly | New You Pro Yearly |
| **Product ID** | `newyouai_pro_monthly` | `newyouai_pro_yearly` |
| **Price** | $14.99 | $69.99 |
| **Subscription group** | New You Pro (one group) | same |
| **Free trial** | None | None |

Submit products for review with the app binary.

---

## 2. RevenueCat project

1. [RevenueCat dashboard](https://app.revenuecat.com) → New project → add **iOS** app  
   Bundle ID: `app.newyouai.mobile`

2. **Entitlements:** create `pro` (matches `customerInfo.entitlements.active.pro` in [`apps/mobile/lib/revenueCat.ts`](../apps/mobile/lib/revenueCat.ts))

3. **Products:** import App Store product IDs above

4. **Offerings:** default offering with:
   - `$rc_monthly` → `newyouai_pro_monthly`
   - `$rc_annual` → `newyouai_pro_yearly`

5. Copy **iOS public API key** → `EXPO_PUBLIC_REVENUECAT_IOS_KEY`

---

## 3. Environment

Local (`apps/mobile/.env`):

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
```

EAS (preview + production):

```bash
cd apps/mobile
eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "appl_…" --scope project
```

Server (Supabase edge function secret, for the webhook in section 6):

```bash
supabase secrets set REVENUECAT_WEBHOOK_AUTH="<random-strong-string>" --project-ref ztedlrvvkcjxoomwavyd
```

Also set Supabase vars per [`env-matrix.md`](env-matrix.md).

**Rebuild dev client** after adding `react-native-purchases` or changing native config.

---

## 4. Sandbox test

1. App Store Connect → Users and Access → **Sandbox** tester account
2. iPhone Settings → App Store → Sandbox Account → sign in
3. Complete onboarding → Future You photo → paywall → purchase
4. Confirm: charge succeeds (sandbox), Future You **unblurs**, `subscriptionTier` is pro

Without `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, paywall uses **stub purchase** (dev/Maestro only — not for launch).

---

## 5. Production test (TestFlight)

Same flow on TestFlight build with production StoreKit. Use a real Apple ID; cancel subscription after verifying unblur.

---

## 6. Server-authoritative entitlement (webhook)

Client `subscriptionTier` is no longer trusted by the server. Future You unblur is gated on a `subscriptions` table that RevenueCat writes to via webhook.

### How it fits together

1. On sign-in, the app calls `Purchases.logIn(session.user.id)` ([`apps/mobile/context/AuthContext.tsx`](../apps/mobile/context/AuthContext.tsx)) so the RevenueCat `app_user_id` equals the Supabase `auth.users.id`.
2. RevenueCat sends subscription events to the [`revenuecat-webhook`](../supabase/functions/revenuecat-webhook/index.ts) edge function.
3. The function verifies a shared secret, maps the event ([`revenueCatEvent.ts`](../supabase/functions/_shared/subscriptions/revenueCatEvent.ts)), and upserts a row into `public.subscriptions` ([`010_subscriptions.sql`](../supabase/migrations/010_subscriptions.sql)) with the service role.
4. [`future-you-status`](../supabase/functions/future-you-status/index.ts) reads that row and only returns the unblurred `resultSignedUrl` when the subscription is active and unexpired.

### Deploy

```bash
# 1. Pick a strong random string for the webhook shared secret
supabase secrets set REVENUECAT_WEBHOOK_AUTH="<random-strong-string>" --project-ref ztedlrvvkcjxoomwavyd

# 2. Apply the migration and deploy the functions
supabase db push --project-ref ztedlrvvkcjxoomwavyd
supabase functions deploy revenuecat-webhook --project-ref ztedlrvvkcjxoomwavyd
supabase functions deploy future-you-status --project-ref ztedlrvvkcjxoomwavyd
```

### Wire the webhook in RevenueCat

RevenueCat dashboard → **Integrations → Webhooks**:

- **URL:** `https://ztedlrvvkcjxoomwavyd.supabase.co/functions/v1/revenuecat-webhook`
- **Authorization header:** the exact `REVENUECAT_WEBHOOK_AUTH` value set above

Send a test event from the dashboard; it should return `200`. Then confirm a sandbox purchase creates a row in `public.subscriptions` with `is_active = true`, and that Future You unblurs.

> Local dev without a real purchase: set `FUTURE_YOU_ENTITLEMENT_STUB=true` (see [`env-matrix.md`](env-matrix.md)) to force entitled responses.

---

## Paywall display (already in repo)

- Prices: [`apps/mobile/lib/paywallPlans.ts`](../apps/mobile/lib/paywallPlans.ts) — $14.99 / $69.99, yearly `% OFF` badge, no trial copy
- CTA: "Unlock Future You" (monthly path)
