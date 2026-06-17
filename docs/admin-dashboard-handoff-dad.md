# Admin dashboard — handoff for Dad

**Target:** Ready by New You public launch · **Not blocking** Jimmy on RN or TestFlight.

---

## What it is

Staff dashboard at **admin.newyouai.app** (`apps/admin/`). For you and Jimmy — not shown to app users.

---

## Current state

Next.js app with routes:

- `/` — dashboard home
- `/users` — user list
- `/future-you` — Future You moderation/support
- `/community-foods` — community food DB
- `/settings` — staff settings
- `/login` — staff auth (Supabase, `ADMIN_ALLOWED_EMAILS`)

Deployed separately on Vercel (see [`vercel.md`](vercel.md)).

---

## Launch-ready checklist

- [ ] Staff can log in with allowed emails
- [ ] View/search users who need support
- [ ] Future You: view reported/offensive flags if backend exposes them
- [ ] Basic ops: no crashes on empty data

---

## Out of scope for launch v1

- Full CRM, billing admin (RevenueCat dashboard covers subscriptions)
- Public-facing features

---

## Jimmy's dependencies

None for TestFlight. Jimmy will route support email to `support@newyouai.app` until admin is enough for ops.

Questions: Jimmy · Repo: `fitnesstracker/apps/admin/`
