# Future You — Onboarding UX Spec

**Status:** Draft — product flow locked (2026-05-29)  
**Related:** `ai-transformation-photo-risks.md`, `OnboardingFlow.tsx`, `gymmy-tier-matrix.md`

---

## Monetization (locked)

- **Paid only** — no free tier, no “Continue with free”
- **Free trial:** **14 days** (placeholder until IAP sprint confirms)
- **Paywall (step 28 today → step 27 after 27 removed):** Show plan · hide full Future You until trial/payment starts
- **Post-pay:** Big success screen with **unblurred** Future You → Continue → Home

---

## Full step map (code today: 0–28)

| Step | Phase | Screen | Notes |
|------|--------|--------|-------|
| **0** | Hook | Welcome | → Auth required before onboarding (new) |
| **1** | Hook | Theme | |
| **2–7** | About you | Gender · DOB · referral · units · height · weight | |
| **8** | Your goal | Primary goal | Cut / bulk / maintain |
| **9** | Your goal | Goal weight + reinforcement | Skip if maintain |
| **10** | Your goal | Pace | Skip if maintain · **no back past here once on step 11+** |
| **10b** | Your goal | Future You photo | Optional skip · 18+ active · 13–17 see blocked state |
| **10c** | Your goal | What’s your why? | Required after photo · starts AI job on Continue |
| **11** | Your goal | Activity level | **Back locked to ≤10c** from here on |
| **12–19** | Training | Experience → training style | Back works among these steps |
| **20** | Training | Plan building animation | |
| **21** | Fuel | Fuel targets (editable macros) | Macro edit → confirm if Future You generating |
| **22** | Fuel | Protein reinforcement | |
| **23** | Fuel | Split reveal | “Here’s your training plan” |
| **24** | Launch | Notification prompt | |
| **25** | Launch | Notification picker | |
| **26** | Launch | Plan ready | Plan + locked Future You teaser · **same numbers as paywall** |
| ~~**27**~~ | ~~Launch~~ | ~~Save progress~~ | **REMOVE** — auth is first |
| **28** | Launch | Paywall | Trial/subscribe · blurred teaser if photo |
| **28b** | Launch | **Future You success** | Full unblurred reveal · Continue → Home |

**After implementation:** remove 27 · insert 10b/10c · add 28b · auth gate before step 0/1.

---

## Product decisions (locked)

### Step 27 — remove

Save progress is pointless with auth-first. Delete step 27; paywall moves up one index after renumber.

### Maintain gets Future You

Maintain users hit **10b → 10c** (skip 9–10 goal weight/pace). AI output is **subtle**: slightly leaner, a little more muscle, healthier overall — **not** a drastic transform.

### Back navigation after step 10

- From **step 11 onward:** **no back** to steps **8, 9, 10, 10b, 10c** (anything that feeds the AI job).
- **Allowed:** back among later steps (e.g. 15 → 14 → 13) as long as they don’t cross into the locked zone.
- Rule: **once you’re past step 10, you’re past step 10.**

### No goal changes during onboarding

After step 10, goal / goal weight / pace are **locked** in the wizard. Changes only in **Settings** after onboarding.

### Under 18 (13–17)

- App still allows 13+ onboarding.
- Future You **blocked** for under-18.
- **Do not hide** 10b — show **blurred/disabled** UI + copy: e.g. *“Future You is available when you turn 18.”*
- Treated like **opt-out** for paywall (plan-only hook, no generation).

### Plan consistency (steps 26 & 28)

- **Same macro numbers, split summary, and timeline** on Plan ready (26) and paywall (28).
- Single source of truth from onboarding state — no drift between screens.

### Macro edits (step 21)

Step 21 already allows macro edits. If user edits while Future You is generating or queued:

- Show confirm: *“Changing your targets may affect how accurate your Future You looks. Continue?”*
- Numbers on 26/28 still match whatever they confirmed.

### Generation reminders (steps 11–28)

- Persistent pill: **“Creating your Future You…”** (rotating goal/gender/10c phrases).
- When `ready`, on **one** launch-phase screen (e.g. 22, 23, or 26): banner — *“Your Future You is ready — keep going to unlock it.”*
- Pill updates: *“Your Future You is ready — unlock at the end.”*

### Paywall opt-in vs opt-out

| Path | Step 28 |
|------|---------|
| Photo + generation | Plan visible · blurred pic · **“You in [blurred timeline]”** · CTA when `ready` |
| Skipped photo / under-18 | Same layout · no Future You hero · plan-forward CTA |

### Post-pay success (28b)

- **Big success screen** — same layout weight as paywall but **full unblurred** Future You.
- Optional callback from 10c motivation.
- **Continue** → Home (not a small modal).

### Home — stay motivated

- **Future You** entry on Home (card, tile, or strip) — reopen saved image + goal timeline.
- Keeps transformation visible after onboarding.

### Auth-first

Sign up / sign in **before** any onboarding step. No account → no wizard.

---

## Step 10b — Photo upload

- Camera / gallery · consent (illustrative AI, not medical advice)
- **Continue** → 10c
- **Skip for now** → 11 (no job)
- **Maintain:** `8 → 10b → 10c → 11` (skip 9–10)
- **13–17:** blocked/blurred state, no upload, copy explains 18+

---

## Step 10c — Personalization

- **Required** after photo (not skippable)
- Pick **one** motivation — generics always available (see prior list in doc history)
- **Continue** → start generation → step 11
- **Back disabled** from 11+ back to 10c

---

## Generation in progress

See loading phrases section. States: `queued` · `generating` · `ready` · `failed` (internal only).

**Paywall rule:** User on photo path must reach step 28 with status **`ready`**. CTA stays disabled until then. Pill + launch banners keep them informed while they finish steps 11–26.

---

## Paywall (step 28)

Paid only · **14-day trial** CTA · no free path.

### Future You hook (photo path)

Hero layout when generation is **`ready`**:

- **Blurred** Future You image (thumbnail / silhouette — no full reveal)
- Headline pattern: **“You in ___”** where the timeline is **blurred** but visibly present  
  - Example: `You in `[blur overlay on `3 months`]  
  - Timeline computed from goal weight + pace + current weight (e.g. ~12 weeks → “3 months”)
- Plan summary below (visible, not blurred — same numbers as step 26)
- CTA disabled until generation **`ready`** (see AI backend rules)

**28b reveal:** Unblurs **both** the image **and** the timeline text together — e.g. *“You in 3 months”* + full Future You.

| | Photo path (ready) | Photo path (still generating) | Skip / under-18 |
|--|-------------------|------------------------------|-----------------|
| Plan | Visible | Visible | Visible |
| Image | Blurred | Blurred placeholder or spinner | Omitted |
| Timeline copy | “You in [blurred 3 months]” | “You in [blurred …]” + pill “Still creating…” | Omitted |
| CTA | Enabled · “Start 14-day trial” | **Disabled** or “Preparing your Future You…” | “Start 14-day trial” |

---

## Post-pay success (step 28b)

Same layout as paywall hero — **unblurred** image + **unblurred** timeline (*“You in 3 months”*) · “AI generated” label · **Continue** → Home.

Only shown when generation is **`ready`** (guaranteed by paywall gate).

---

## Home — Future You

Persistent entry to view saved transformation + motivation / goal context. Defer regen cadence to fast follow.

---

## Data model (draft)

```ts
type FutureYouDraft = {
  photoUploaded?: boolean;
  photoStoragePath?: string;
  motivationId?: string;
  motivationIsGeneric?: boolean;
  generationStatus?: "idle" | "queued" | "generating" | "ready" | "failed";
  generationJobId?: string;
  resultStoragePath?: string;
  onboardingGoalLocked?: boolean; // true after step 10 continue
  remindersMuted?: boolean;
};
```

---

## AI backend (locked)

| # | Decision |
|---|----------|
| **1. Vendor** | **OpenAI / ChatGPT** (image API — e.g. GPT-4o image generation/edit). Edge function holds API key. |
| **2. Not ready at paywall** | **Picture must be done before pay.** Disable trial/pay CTA on step 28 until `generationStatus === ready`. User can still view plan on 26/28; they cannot start trial until image exists. |
| **3. Failed at paywall** | **Cannot happen** (product requirement). Backend **auto-retries** silently (exponential backoff, cap attempts). Never enable CTA while failed. If exhausted: fall back to skip-photo paywall (no Future You hook) + support path — user should not pay expecting an image that doesn’t exist. |
| **4. Bad output** | **User report** in v1. “Something wrong?” → report on 28b + Home Future You view. No auto-moderation block required for launch. |
| **5. Prompts** | **Approved architecture** below — two-layer code prompts; iterate in repo, change if not working. |

### Prompt architecture (approved — v1)

**Approach:** Curated motivations in code + single assembler. No CMS, no user free-text, no second LLM to rewrite prompts. Revisit if quality isn’t good enough.

**Layer 1 — `futureYouMotivations.ts`**

Each motivation id:

| Field | Purpose |
|-------|---------|
| `label` | 10c UI text |
| `promptFragment` | 1–2 sentences sent to OpenAI |
| `loadingPhrase` | Optional pill text |
| `isGeneric` | Softer fragment for generic picks |
| `goals` / `genders` | Filter which chips show |

Ship ~3 generics + ~4–6 specifics per goal/gender combo for v1.

**Layer 2 — `buildFutureYouPrompt.ts`**

Assembles full instruction from: goal, gender, current/goal weight, timeline string, `promptFragment`, and **global non‑negotiables** (every request):

- Same person, same pose and lighting  
- Illustrative only, not medical  
- Realistic, not hyper-idealized  
- **Maintain:** assembler injects “subtle only — slightly leaner, bit more tone, same weight class, no dramatic change” regardless of chip  

**Edge function:** `buildFutureYouPrompt(input)` → OpenAI image API → Storage → job `ready`.

**Tuning loop:** Test selfies × motivations → edit fragments / global block → unit tests on prompt strings (e.g. maintain contains “subtle”, all contain “same person”) → ship.

**Deferred:** emphasis row on 10c, A/B prompts, DB-stored prompts.

### OpenAI integration notes

- Call from **Supabase Edge Function** only (never client)
- Input: stored photo URL + assembled prompt
- Output: save to Supabase Storage → set job `ready`
- Rate limit per user · log failures for retry logic
- Disclose OpenAI processing in privacy policy + 10b consent

---

## Storage & data (locked)

| # | Decision |
|---|----------|
| **6. Job state** | **`future_you_jobs` Postgres table** (user_id, status, motivation_id, storage paths, error, timestamps). Client **polls** authenticated edge function every 3–5s during onboarding. No Realtime required v1. |
| **7. Photo retention** | **Keep source selfie + generated image** until **account delete** or user taps **Delete Future You** in app. Legal is fine with: 10b consent, privacy policy disclosure, encryption at rest, one-click delete, no training use. Do **not** keep photos in JSONB sync blob. *(Revisit purge-after-N-days only if legal asks for minimization.)* |
| **8. Account delete** | **Wipe all** Future You storage paths in `delete-user` edge function (extend existing fn). |

### `future_you_jobs` (sketch)

```sql
-- status: queued | generating | ready | failed
-- paths: source_photo_path, result_photo_path
```

---

## IAP & entitlement (locked)

| # | Decision |
|---|----------|
| **9. Trial start** | **Payment upfront** when IAP ships — **Apple Pay** / App Store billing (14-day trial placeholder in copy). |
| **10. Entitlement model** | **`none` \| `trial` \| `active` \| `expired`** stored on user/subscription record. App checks this (or StoreKit truth) before any feature access. |
| **11. After trial** | **Full app lock** — no workouts, food, Home until subscribed. Not partial lock. |

### No second free trial

Two layers:

1. **App Store / Play** — platform enforces one intro trial per Apple ID / Google account per subscription group (primary enforcement when IAP wired).
2. **Backend** — `trial_consumed` table keyed by **store original transaction id** or **auth provider stable id** (survives account delete/re-signup with same Apple ID). New gym account cannot start trial if that store identity already consumed one.

Do **not** rely on email alone — users can reuse Apple Sign In.

### App lock behavior

- `expired` or `none` after onboarding complete → **subscription gate screen** on launch (same paywall pattern, no free tier).
- During onboarding, user completes flow once; lock applies on subsequent launches if never converted after trial.

---

## Legal (deferred — handle before ship)

User decision: handle later. Before release, must cover: body photos, OpenAI processing, retention/deletion, illustrative disclaimer, 18+ Future You, App Store questionnaire. See `ai-transformation-photo-risks.md`.

| # | Topic | Status |
|---|--------|--------|
| 12 | Privacy policy update | **Deferred** |
| 13 | EU launch | **Deferred** |
| 14 | OpenAI DPA / retention | **Deferred** |

---

## Remaining issues

### Locked ✓

Product/flow · AI backend (#1–5) · Storage (#6–8) · IAP (#9–11)

### Engineering defaults (no answer needed)

| # | Default |
|---|---------|
| 15 | “Ready — keep going” banner on step **26** |
| 16 | 10c emphasis row deferred |
| 17 | Skippers upload via Home Future You card |
| 18 | Regen cadence deferred |
| 19 | Share export deferred |
| 20 | Rewrite `gymmy-tier-matrix.md` when IAP ships |

---

## 10c motivation lists (reference)

**Generics (always):** Cut — look my best / lean & defined / confident · Bulk — strong & filled out / athletic physique / powerful · Maintain — healthier overall / more energy / subtle glow

**Specific examples:** wedding dress, abs, veins, jawline, kids/energy, toned arms, beach-ready, subtle tone-up, etc. Implement in `futureYouMotivations.ts`.

**Maintain prompt tone:** Slightly leaner, bit more muscle definition, healthier look — **minor** change only.

---

## Loading phrases (reference)

Rotate on generation pill · goal + gender + 10c id. Examples: “Sharpening jawline…”, “Toning core…”, “Brightening your look…”, “Enhancing arm definition…” (veins).

---

## Engineering checklist

- [ ] Auth before step 1
- [ ] Remove step 27 · renumber · migrate draft version
- [ ] Insert 10b · 10c · 28b
- [ ] Maintain: 8 → 10b → 10c → 11
- [ ] Lock back navigation to ≤10c from step 11+
- [ ] Lock goal fields after step 10 in onboarding
- [ ] Under-18 blocked UI on 10b (not hidden)
- [ ] Macro edit confirm on step 21 when job active
- [ ] Single plan snapshot for steps 26 & 28
- [ ] Paywall “You in [blurred timeline]” + disable CTA until `ready`
- [ ] Generation pill + ready banner
- [ ] Paywall paid-only · 14-day trial · no free CTA
- [ ] 28b unblur image + timeline · Home Future You entry
- [ ] OpenAI edge function + storage + auth JWT + auto-retry
- [ ] Report button on 28b + Home Future You view
- [ ] `future_you_jobs` table + poll from client
- [ ] `delete-user` wipes Storage paths for Future You
- [ ] Entitlement: `none` | `trial` | `active` | `expired` + app lock gate
- [ ] `trial_consumed` anti-abuse (store id + backend)
- [ ] `futureYouMotivations.ts` + `buildFutureYouPrompt.ts` + prompt unit tests

---

## References

- `src/fitness/OnboardingFlow.tsx`
- `src/fitness/OnboardingShell.tsx`
- `src/fitness/OnboardingDailyFuelPlan.tsx` — macro edit step 21
- `src/fitness/WeighInSheet.tsx`
- `src/fitness/curatedFoods.ts` — pattern for curated id → label maps
