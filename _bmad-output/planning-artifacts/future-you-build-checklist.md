# Future You — Build checklist (in order)

**Use this file only** — no Linear needed. Check boxes as you go.  
**Spec reference:** `future-you-onboarding-spec.md` · `ai-transformation-photo-risks.md`

**Dev tip:** Phases 1–7 = working product with fake subscription. Phase 8 = real money.

---

## Phase 1 — Foundation

### Step 1 — Require sign-in before onboarding

**Build:** Auth gate in `FitnessApp` / welcome flow — no account → sign up / sign in screen only.

**Test / should be there:**
- [x] Fresh install → cannot reach theme picker or step 1 without signing in
- [x] After sign-in → onboarding starts (or resumes draft)
- [x] Sign out mid-onboarding → kicked to auth, draft preserved for same account

---

### Step 2 — `futureYouMotivations.ts`

**Build:** Curated list: id, label, promptFragment, loadingPhrase, isGeneric, goals[], genders[].

**Test / should be there:**
- [x] Every 10c chip you show in UI has a matching id in this file
- [x] Generics exist for cut, bulk, maintain
- [x] Specifics exist for cut (m/f), bulk, maintain
- [x] No duplicate ids

---

### Step 3 — `buildFutureYouPrompt.ts`

**Build:** Function: profile + motivationId + timeline → full OpenAI instruction string.

**Test / should be there:**
- [x] Output always includes “same person” / identity language
- [x] Maintain goal → output includes “subtle” / no dramatic change
- [x] Wedding dress / veins motivations → different fragments in output
- [x] Timeline string (e.g. “3 months”) appears in prompt when provided

---

### Step 4 — Prompt unit tests

**Build:** Vitest tests for `buildFutureYouPrompt`.

**Test / should be there:**
- [x] `npm test` passes for prompt builder
- [x] Tests fail if someone removes maintain guardrail or identity line

---

## Phase 2 — Backend

### Step 5 — Supabase Storage bucket

**Build:** Private bucket for Future You (e.g. `future-you`). RLS: user can only read/write own paths.

**Test / should be there:**
- [ ] Authenticated user can upload to `users/{userId}/...`
- [ ] Another user’s path returns forbidden
- [ ] No public URLs without signed token

---

### Step 6 — `future_you_jobs` table

**Build:** Postgres table: user_id, status, motivation_id, source_path, result_path, error, timestamps.

**Test / should be there:**
- [ ] Row created when generation starts
- [ ] status transitions: queued → generating → ready (or failed)
- [ ] One active job per user during onboarding (or defined rule documented)

---

### Step 7 — Edge function: upload photo

**Build:** Auth JWT required · accepts image · saves to Storage · returns path.

**Test / should be there:**
- [ ] No auth → 401
- [ ] Valid upload → file in Storage under correct user folder
- [ ] Response includes path/id client needs for generate step
- [ ] Oversized / invalid file → clear error

---

### Step 8 — Edge function: generate

**Build:** Load photo + `buildFutureYouPrompt` · call OpenAI · save result to Storage · set job `ready`. Auto-retry on failure.

**Test / should be there:**
- [x] Manual/curl test with real selfie → result image in Storage
- [x] Job row ends as `ready` with result_path
- [ ] Simulated OpenAI fail → retries, then `failed` if exhausted
- [x] API key never exposed to client

---

### Step 9 — Edge function: poll status

**Build:** Returns job status + (optional) blurred teaser metadata, not full result URL pre-pay.

**Test / should be there:**
- [ ] Poll returns `generating` while in flight
- [ ] Poll returns `ready` when done
- [ ] Pre-pay poll does **not** return full unblurred result URL to client (or client ignores until entitled)

---

### Step 10 — Prompt quality spike

**Build:** Run 5–10 real selfies through cut/bulk/maintain + 2–3 motivations each. Tune fragments.

**Test / should be there:**
- [ ] Still looks like the person (identity) — re-run spike with real selfie (`scripts/futureYouPromptSpike.mjs`)
- [x] Maintain = subtle, not drastic — guardrail + fragments tuned after spike
- [x] Cut + “veins” / “wedding dress” visibly different emphasis vs generic
- [x] You’re happy enough to ship v1 (knowing report button exists) — conditional on one real-selfie identity pass

**Artifacts:** `_bmad-output/prompt-spike/` · `scripts/futureYouPromptSpike.mjs`

---

## Phase 3 — Onboarding screens (Future You)

### Step 11 — Step 10b: photo upload

**Build:** Camera/gallery · consent copy · Continue → 10c · Skip → 11 · under-18 blocked UI.

**Test / should be there:**
- [x] Cut/bulk: after step 10 → 10b appears
- [x] Maintain: after step 8 → 10b (skips 9–10)
- [x] Continue with photo → goes to 10c
- [x] Skip → goes to 11, no job started
- [x] Age 13–17: blurred/blocked + “available at 18” message, no upload
- [x] Age 18+: normal upload works

---

### Step 12 — Step 10c: motivation picker

**Build:** Single-select chips · generics + specifics · Continue disabled until one picked · starts generation.

**Test / should be there:**
- [ ] Cannot Continue without a selection
- [ ] Options match goal + gender
- [ ] Continue → job queued/generating → step 11
- [ ] Selected motivationId saved to draft/job

---

### Step 13 — Generation pill

**Build:** Persistent UI on `OnboardingShell` from step 11 through paywall when job active.

**Test / should be there:**
- [ ] After 10c: pill shows “Creating your Future You…”
- [ ] Phrases rotate every few seconds
- [ ] When ready: “Your Future You is ready — unlock at the end”
- [ ] Skip photo path: **no pill**
- [ ] Tap pill (optional): sheet explains unlock at paywall

---

### Step 14 — “Ready — keep going” banner

**Build:** One banner on step 26 (Plan ready) when status = ready.

**Test / should be there:**
- [ ] Banner appears when job ready before user reaches paywall
- [ ] Does not show if skipped photo or under-18
- [ ] Disappears or updates appropriately if not ready yet

---

### Step 15 — Lock back navigation

**Build:** From step 11+, back cannot go to 8–10c. Back among 12–19 etc. still works.

**Test / should be there:**
- [ ] On step 15, back → 14 works
- [ ] On step 11, back does **not** return to 10c/10b/10
- [ ] After generation started, changing photo/motivation via back is impossible

---

## Phase 4 — Onboarding flow wiring

### Step 16 — Maintain routing

**Build:** `step 8 maintain` → 10b → 10c → 11 (not 8 → 11).

**Test / should be there:**
- [x] Maintain user sees Future You photo step
- [x] Never forced through goal weight / pace screens

---

### Step 17 — Lock goal after step 10

**Build:** No UI to change goal/pace/goal weight in onboarding after step 10.

**Test / should be there:**
- [ ] Cannot navigate back to change goal after step 11
- [ ] Settings goal edit still works post-onboarding (separate)

---

### Step 18 — Macro edit warning (step 21)

**Build:** If user edits macros on step 21 while job generating/queued → confirm dialog.

**Test / should be there:**
- [ ] Edit macros + active job → warning about picture accuracy
- [ ] Cancel keeps old macros
- [ ] Confirm saves new macros; plan numbers on 26/28 match edited values

---

### Step 19 — Remove step 27 · renumber · migrate

**Build:** Delete Save progress screen · bump `ONBOARDING_DRAFT_VERSION` · fix step indices.

**Test / should be there:**
- [x] Flow goes 26 → 27 (paywall) with no save-progress screen
- [x] Progress bar total steps correct
- [x] Old in-progress drafts migrate without crash

---

### Step 20 — Plan consistency (steps 26 & 28)

**Build:** Single `planSnapshot` object used by Plan ready + paywall.

**Test / should be there:**
- [ ] Same calories, protein, split days, timeline on 26 and 28
- [ ] Edit macros on 21 → both screens show same updated numbers

---

## Phase 5 — Paywall + reveal

### Step 21 — Paywall (step 28): blurred hook

**Build:** Plan visible · blurred image · **“You in [blurred X months]”** · trial CTA disabled until `ready`.

**Test / should be there:**
- [ ] Photo path + still generating → CTA disabled or “Preparing…”
- [ ] Photo path + ready → CTA enabled
- [ ] Timeline text visible but blurred (e.g. “3 months” under blur)
- [ ] Full image **not** visible pre-pay
- [ ] Skip/under-18 → no Future You hero, plan-only CTA

---

### Step 22 — Paid only · no free tier

**Build:** Remove “Continue with free” · single trial/subscribe path.

**Test / should be there:**
- [ ] No free escape hatch on paywall
- [ ] Copy mentions 14-day trial (placeholder ok until IAP)

---

### Step 23 — Step 28b: success screen

**Build:** Post-pay big screen · unblurred photo + unblurred “You in 3 months” · AI label · Continue → Home.

**Test / should be there:**
- [ ] Only reachable after trial/subscribe (use dev stub: fake entitlement)
- [ ] Image and timeline both unblurred together
- [ ] “AI generated” / illustrative disclaimer visible
- [ ] Continue lands on Home with plan active

---

### Step 24 — Skip / under-18 paywall path

**Build:** Same paywall shell without Future You block.

**Test / should be there:**
- [ ] Skipped photo → completes onboarding without broken empty teaser
- [ ] Under-18 → same, no generation, plan-forward CTA works

---

## Phase 6 — Home + after onboarding

### Step 25 — Home: Future You entry

**Build:** Card/tile on Home to reopen saved transformation + timeline.

**Test / should be there:**
- [ ] After 28b, Home shows Future You entry
- [ ] Tap opens full image + timeline + motivation if set
- [ ] Skip photo users: entry prompts upload (or hidden until they upload later)

---

### Step 26 — Report button

**Build:** “Something wrong?” on 28b + Home Future You view · sends report (email/form/flag — your choice v1).

**Test / should be there:**
- [ ] Button visible on reveal and Home view
- [ ] Submitting report does not crash; you receive or log it

---

### Step 27 — Delete Future You

**Build:** User can delete their Future You (source + result) from app.

**Test / should be there:**
- [x] Delete removes Storage files + job row (`future-you-delete` edge fn + client service)
- [x] Home entry updates (gone or upload prompt) (`futureYouDraftAfterUserDelete` + `homeFutureYouModel` tests)
- [x] Account still works; plan unaffected (draft-only clear; `subscriptionTier` / profile unchanged)

---

### Step 28 — Skipper reminders (optional v1)

**Build:** Banner/card nudging upload · X dismiss · Settings mute.

**Test / should be there:**
- [ ] Skipped photo at 10b → sees reminder on Home/Progress
- [ ] X dismisses that instance
- [ ] Mute stops future nudges

*(OK to defer step 28 until after core ship.)*

---

## Phase 7 — Account lifecycle

### Step 29 — Extend `delete-user`

**Build:** On account delete, wipe all `users/{userId}/future-you/**` + job rows.

**Test / should be there:**
- [ ] Delete account → Storage paths gone (list bucket or try fetch → 404)
- [ ] `future_you_jobs` rows for user gone
- [ ] Dry run mode still works if you use it

---

### Step 30 — Entitlement states (stub ok)

**Build:** `none | trial | active | expired` on user/subscription slice · `canUseApp()` helper.

**Test / should be there:**
- [ ] Dev toggle: trial → can complete onboarding + see 28b
- [ ] Dev toggle: expired → app shows lock screen on launch (after onboarding done)
- [ ] Stub documents where real IAP will plug in

---

## Phase 8 — Payments (IAP sprint)

### Step 31 — App Store + Apple Pay

**Build:** StoreKit / RevenueCat · payment upfront · 14-day trial product.

**Test / should be there:**
- [ ] Sandbox: start trial → entitlement `trial`
- [ ] Apple Pay / subscribe button works on paywall
- [ ] Restore purchases works

---

### Step 32 — App lock after trial

**Build:** `expired` → full-screen subscribe gate on launch · no Home/workouts/food.

**Test / should be there:**
- [ ] Sandbox: expire trial → next launch blocked
- [ ] Subscribe → immediate access restored
- [ ] No free tier back door

---

### Step 33 — No second trial

**Build:** `trial_consumed` keyed to store original transaction / Apple subscriber id.

**Test / should be there:**
- [ ] Same Apple ID: second account cannot start new trial
- [ ] Delete account + recreate: still no second trial (store + backend)
- [ ] New Apple ID: trial allowed (expected)

---

### Step 34 — Gate features on real entitlement

**Build:** Replace dev stub · 28b + Home Future You require trial/active.

**Test / should be there:**
- [ ] Cannot reach 28b without valid entitlement
- [ ] Expired users cannot view Future You until resubscribe

---

## Phase 9 — Polish + ship

### Step 35 — E2E tests

**Build:** Playwright (or manual script) for critical paths.

**Test / should be there:**
- [ ] Photo path: 10b → 10c → … → paywall waits → stub pay → 28b → Home
- [ ] Skip photo path
- [ ] Maintain path
- [ ] Under-18 blocked at 10b
- [ ] CTA disabled until ready

---

### Step 36 — Legal

**Build:** Privacy policy · 10b consent · App Store questionnaire · “AI generated” labels.

**Test / should be there:**
- [ ] Policy mentions body photos + OpenAI
- [ ] Consent shown before upload
- [ ] App Store submission answers prepared

---

### Step 37 — Update tier matrix doc

**Build:** `gymmy-tier-matrix.md` → paid-only, no free tier.

**Test / should be there:**
- [ ] Doc matches paywall behavior in app

---

### Step 38 — Beta

**Build:** 5–10 real users, collect bad outputs + confusion.

**Test / should be there:**
- [ ] Paywall conversion understandable
- [ ] Identity quality acceptable
- [ ] No show-stopper crashes

---

### Step 39 — Ship

**Test / should be there:**
- [ ] Production OpenAI key in edge secrets
- [ ] Storage RLS verified prod
- [ ] IAP products live
- [ ] Legal pages linked in app

---

## Quick “am I done?” milestones

| Milestone | Steps | You can demo… |
|-----------|-------|----------------|
| **Backend works** | 1–10 | Upload selfie → get AI image in Storage |
| **Onboarding UX** | 11–20 | Full wizard with pill, locks, plan |
| **Money path (fake)** | 21–24 | Paywall blur → stub pay → success screen |
| **Living product** | 25–30 | Home card, delete, account wipe |
| **Real money** | 31–34 | Trial, lock, no double trial |
| **Shipped** | 35–39 | Tests, legal, beta, prod |

---

## Dev stub until Phase 8

```ts
// Example: localStorage or env flag for development
const DEV_ENTITLED = import.meta.env.DEV && true;
// Replace with StoreKit / subscriptionStatus when Phase 8 lands
```

Use stub to test 28b and Home without App Store connected.
