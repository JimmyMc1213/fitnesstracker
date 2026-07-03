# Email sender avatar (BIMI) — New You AI

Shows the New You logo next to `noreply@mail.newyouai.app` in Gmail, Apple Mail, Yahoo, etc.

Logo file (hosted on marketing site):

```
https://newyouai.app/bimi/newyou-logo.svg
```

Source asset: `apps/web/public/bimi/newyou-logo.svg`

---

## 1. Deploy the logo

Deploy **`newyouai-web`** (`apps/web`) to Vercel so the SVG is live:

```bash
curl -I https://newyouai.app/bimi/newyou-logo.svg
# expect HTTP 200
```

---

## 2. Cloudflare DNS (sending domain `mail.newyouai.app`)

Add these in **Cloudflare → newyouai.app → DNS** (DNS only / grey cloud for TXT).

### DMARC (required before BIMI)

| Type | Name | Content |
|------|------|---------|
| TXT | `_dmarc.mail` | `v=DMARC1; p=quarantine; pct=100; rua=mailto:support@newyouai.app` |

After a few weeks of clean delivery, tighten to `p=reject`.

### BIMI (logo in inbox)

| Type | Name | Content |
|------|------|---------|
| TXT | `default._bimi.mail` | `v=BIMI1; l=https://newyouai.app/bimi/newyou-logo.svg;` |

Resend SPF/DKIM on `mail.newyouai.app` should already be set from domain verification.

---

## 3. Gmail blue checkmark (optional, later)

Gmail usually **requires a mark certificate** before showing the logo:

- **VMC** — trademark on the logo (~$1k+/yr, DigiCert / Entrust)
- **CMC** — logo in use 1+ year (Gmail + Yahoo)

With a cert, append to the BIMI record:

```
v=BIMI1; l=https://newyouai.app/bimi/newyou-logo.svg; a=https://newyouai.app/bimi/newyou-cert.pem;
```

Host the PEM at `apps/web/public/bimi/newyou-cert.pem` after purchase.

**Yahoo** may show the logo without a cert. **Outlook** does not support BIMI.

---

## 4. Timeline

- DNS propagation: minutes to hours
- Logo appearing in inboxes: up to **48 hours**
- Gmail also weighs domain reputation and send volume

---

## 5. Quick interim hack (optional)

Register `noreply@mail.newyouai.app` at [gravatar.com](https://gravatar.com) with the same logo. Some clients pick it up; Gmail mostly ignores Gravatar for bulk senders.

---

## References

- [Resend — Implementing BIMI](https://resend.com/docs/dashboard/domains/bimi)
- [Google — Set up BIMI](https://support.google.com/a/answer/10911320)
