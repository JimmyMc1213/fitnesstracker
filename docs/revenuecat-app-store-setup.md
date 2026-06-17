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

## Paywall display (already in repo)

- Prices: [`apps/mobile/lib/paywallPlans.ts`](../apps/mobile/lib/paywallPlans.ts) — $14.99 / $69.99, yearly `% OFF` badge, no trial copy
- CTA: "Unlock Future You" (monthly path)
