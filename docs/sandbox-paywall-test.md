# Sandbox paywall test (iOS)

Quick path to hit the real StoreKit sheet and verify webhook → unblur.

## Why you might not see sandbox / paywall

| Symptom | Cause |
|--------|--------|
| Never see onboarding paywall | `EXPO_PUBLIC_LEGACY_USER_EMAILS` includes your sign-in email |
| Paywall taps succeed with no Apple sheet | Missing RC key, old dev client, or stub env |
| Future You unblurs without paying | `EXPO_PUBLIC_FUTURE_YOU_ENTITLEMENT_STUB=true` or server `FUTURE_YOU_ENTITLEMENT_STUB` |

For a real sandbox run, disable those stubs and use a **non-legacy** Supabase account.

## 1. Create a Sandbox tester (App Store Connect)

1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Sandbox** → **Testers**
2. **+** → new tester (any email format Apple accepts, e.g. `newyou-sandbox-test@privaterelay.appleid.com`)
3. Password: meets Apple rules (8+ chars, upper, lower, number)
4. **Country:** same as your App Store products (usually United States)

This is **not** your personal Apple ID. It only works for test purchases.

## 2. Sign in on the simulator

1. Open **Settings** on the iOS Simulator
2. Scroll to **App Store** (or **Apps → App Store** on newer iOS)
3. At the bottom: **Sandbox Account** → sign in with the sandbox tester from step 1

If you don’t see **Sandbox Account**, trigger a purchase in the app first — iOS often prompts then.

## 3. App env (already adjusted for sandbox mode)

In `apps/mobile/.env`:

- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` — set
- `EXPO_PUBLIC_FUTURE_YOU_ENTITLEMENT_STUB` — **off**
- `EXPO_PUBLIC_LEGACY_USER_EMAILS` — **commented out**

Restart Metro after any `.env` change.

## 4. Reset onboarding and run

```bash
# from repo root — clears onboarding flag + starts Metro
npm run dev:onboarding:clear
```

Or full rebuild if needed:

```bash
npm run dev:onboarding:rebuild
```

## 5. Test flow

1. Sign in with a **new** email (not in legacy list) — create account in the app if needed
2. Complete onboarding through **Future You photo** → **paywall**
3. Tap **Unlock NewYou** → Apple sandbox purchase sheet should appear
4. Confirm purchase (sandbox — no real charge)
5. Future You should **unblur** after RevenueCat webhook updates `subscriptions` (usually seconds)

## 6. RevenueCat offering (required)

Product catalog → Offerings → **default** → Edit:

- **$rc_monthly** → New You AI (App Store) → `newyouai_pro_monthly`
- **$rc_annual** → New You AI (App Store) → `newyouai_pro_yearly`

Without App Store products on the offering, you get *“No subscription packages available”*.

## 7. Simulator: must launch from Xcode (not `expo run:ios`)

Apple only applies the **StoreKit Configuration** when you run the app **from Xcode** (▶ Run).
`expo run:ios` / `npm run dev:onboarding:rebuild` build and launch via `simctl`, which **skips**
the scheme’s StoreKit file — RevenueCat then logs *“Error fetching offerings”* on sign-in.

### Recommended command

```bash
npm run dev:onboarding:xcode
```

This configures StoreKit, starts Metro on 8082, and opens `NewYouAI.xcworkspace`. In Xcode:

1. Select an **iPhone simulator** (top bar)
2. Press **▶ Run** (do not open the app from the sim home screen first)
3. Sign in → onboarding → paywall

### One-time: upload StoreKit certificate to RevenueCat

RevenueCat validates simulator receipts against a cert exported from the `.storekit` file:

1. In Xcode, open `apps/mobile/ios/NewYouAI.storekit`
2. **Editor → Save Public Certificate**
3. RevenueCat → **Project → Apps → New You AI (iOS)** → expand **StoreKit testing framework** → upload the certificate

You still need the **default** offering mapped to App Store products (step 6).

### Alternative: physical iPhone

Real device sandbox does not need the StoreKit file. Use a sandbox tester and:

```bash
cd apps/mobile && npx expo run:ios --device
```

On iOS 18+: **Settings → Developer → Sandbox Apple Account**.

## 8. Troubleshooting

| Error | Fix |
|-------|-----|
| **Error fetching offerings** (RevenueCat error 1) | Launch with **`npm run dev:onboarding:xcode`** + ▶ Run in Xcode; upload StoreKit cert to RC; fix offering (step 6) |
| No subscription packages available | Fix RevenueCat offering (step 6) |
| No **App Store** section in Simulator Settings | Normal on many iOS versions — sandbox sign-in appears at purchase time |
| Purchase did not grant pro entitlement | Entitlement id must be **New You AI Pro** in RC + code |
| Paywall succeeds, no Apple sheet | Rebuild dev client; confirm RC key in `.env` |
| Paid but still blurred | Check webhook in RevenueCat → Integrations → Webhooks (test event 200) |
| **Requiring unknown module** (e.g. `8680`) | Stale Metro cache — restart Metro with `--clear` (the `:xcode` script now does this automatically) |

Restore dev stubs when done:

```bash
# apps/mobile/.env — uncomment legacy emails + entitlement stub if you want
# supabase secrets set FUTURE_YOU_ENTITLEMENT_STUB=true --project-ref ztedlrvvkcjxoomwavyd
```
