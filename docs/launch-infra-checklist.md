# Launch infra checklist

One-time setup before public launch. Batch in a single ~2-hour session.

**Jimmy walkthrough:** [`launch-phase-1-jimmy.md`](launch-phase-1-jimmy.md)  
**Status probe:** `node scripts/check-launch-infra.mjs`  
**IAP wiring:** [`revenuecat-app-store-setup.md`](revenuecat-app-store-setup.md)

**Launch model:** RN app · pay-to-unblur Future You · $14.99/mo or $69.99/yr · no trial · strangers via social (not F&F).

---

## 1. Support email — support@newyouai.app

- [ ] Choose provider: Google Workspace, Zoho Mail, or Cloudflare Email Routing → personal inbox
- [ ] Add DNS records for newyouai.app domain
- [ ] Send a test email; confirm receipt
- [ ] Add address in App Store Connect → App Information → Support URL / contact

**Used in:** App Store review, privacy/terms pages, in-app Settings.

---

## 2. Social handles — @newyouai

Claim before someone else does. URLs already wired in the app.

- [ ] Instagram: https://www.instagram.com/newyouai
- [ ] TikTok: https://www.tiktok.com/@newyouai
- [ ] X: https://x.com/newyouai

Suggested bio: *Upload a photo. See your future self. AI fitness coach.*

No posts required yet — secure names + bio + link placeholder.

---

## 3. Apple App Store Connect

Apple Developer account: **active**.

- [ ] Create app record: New You AI · bundle `app.newyouai.mobile`
- [ ] Subscription group with two products:
  - Monthly: **$14.99** (no introductory offer / no trial)
  - Yearly: **$69.99**
- [ ] Privacy Policy URL: https://newyouai.app/privacy
- [ ] Terms URL (optional in ASC): https://newyouai.app/terms
- [ ] Age rating questionnaire — disclose AI body imagery, user-generated photos
- [ ] App Review notes: Future You is illustrative AI; 18+ gate; consent screen; deletion in-app

---

## 4. RevenueCat (connects App Store ↔ app paywall)

- [ ] Create RevenueCat project for New You AI
- [ ] Add iOS App Store app · link shared secret / App Store Connect API
- [ ] Map offerings to monthly + yearly product IDs
- [ ] Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in mobile env (see `docs/env-matrix.md`)
- [ ] Sandbox test: complete onboarding → pay → Future You unblurs
- [ ] Production test: real purchase on your phone via TestFlight

---

## 5. TestFlight → public launch

- [ ] Build: `cd apps/mobile && npm run eas build -- --profile preview --platform ios`
- [ ] Install on your iPhone; run full onboarding + payment yourself
- [ ] Decide: public TestFlight link vs straight to App Store (after 2 weeks stranger feedback)
- [ ] Update newyouai.app homepage CTA when download link is live

---

## 6. Dad — admin dashboard (parallel, not blocking)

- [ ] Admin at admin.newyouai.app ready for support/ops by launch
- [ ] Not required for strangers to install or pay

---

## Done gate

A **stranger** (not friends/family) can:

1. Find you on social/outreach
2. Install native app
3. Complete onboarding + upload photo
4. See blurred Future You on paywall
5. Pay and see unblurred result + use full app
6. Email support@newyouai.app if something breaks
