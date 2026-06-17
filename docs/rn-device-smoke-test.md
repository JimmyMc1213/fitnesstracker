# RN device smoke test (launch gate)

Run on **your iPhone** with dev client or TestFlight. Branch: `workoutnewlook` (or main after merge).

Metro (dev client):

```bash
cd apps/mobile
npm run ios
# or from root: npm run dev:mobile:client — port 8082 if needed
```

---

## Pass criteria

One uninterrupted run:

- [ ] Sign in (email or OAuth)
- [ ] Complete onboarding through Future You photo step
- [ ] Paywall shows **blurred** Future You (if photo path)
- [ ] Paywall shows **$14.99/mo** / **$69.99/yr** and yearly **% OFF** — no trial copy
- [ ] Purchase succeeds (RevenueCat + sandbox, or stub in dev without key)
- [ ] Future You **unblurs**; land on Home
- [ ] Log one workout set and finish OR log one food item
- [ ] Sign out and sign back in — data persists

---

## If something fails

Fix **one** blocker per session. Re-run from the failed step only.

Common issues:

| Symptom | Check |
| --- | --- |
| Paywall stub only | Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` + rebuild dev client |
| OAuth fail | Supabase redirect URLs — [`env-matrix.md`](env-matrix.md) |
| Future You stuck generating | Supabase edge functions + OpenAI key |
| Crash on Home | Metro logs; run `npm run typecheck --workspace=@newyouai/mobile` |

---

## Maestro (simulator, optional)

```bash
cd apps/mobile
MAESTRO_TEST_EMAIL=... MAESTRO_TEST_PASSWORD=... npm run test:e2e:auth-all
```

Device smoke test is the launch gate; Maestro is regression backup.
