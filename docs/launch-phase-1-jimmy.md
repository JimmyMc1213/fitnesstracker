# Phase 1 — Jimmy action sheet (~2 hours)

Do these in one sitting. No code required.

Check status first:

```bash
node scripts/check-launch-infra.mjs
```

---

## 1. jimmymccarthy1213@outlook.com (30 min)

Support contact is the personal Outlook inbox. Google Workspace for `newyouai.app` is cancelled, so do not create a Workspace mailbox.

1. Send a test email to `jimmymccarthy1213@outlook.com` from another account and confirm it arrives
2. App Store Connect → app → App Information → set the support email to `jimmymccarthy1213@outlook.com`

---

## 2. Social handles (45 min)

Claim and set bio: *Upload a photo. See your future self. AI fitness coach.*

| Platform | URL | Notes |
| --- | --- | --- |
| Instagram | https://www.instagram.com/newyouai | Probe may return 200 even if taken — try sign-up |
| TikTok | https://www.tiktok.com/@newyouai | Same |
| X | https://x.com/newyouai | Often available if 404 on profile |

No posts yet. Pin download link when TestFlight is ready.

---

## 3. App Store Connect skim (30 min)

Apple Developer: **active**.

1. Open [App Store Connect](https://appstoreconnect.apple.com)
2. Confirm app **New You AI** · bundle `app.newyouai.mobile`
3. Read subscription setup — full steps: [`revenuecat-app-store-setup.md`](revenuecat-app-store-setup.md)
4. Product IDs to create later: `newyouai_pro_monthly` ($14.99), `newyouai_pro_yearly` ($69.99), no trial

---

## 4. Pin pricing

| Plan | Price | Trial |
| --- | --- | --- |
| Monthly | $14.99/mo | None |
| Yearly | $69.99/yr | None (show % savings on paywall) |

---

When done, run `node scripts/check-launch-infra.mjs` again (MX records should appear after email routing).
