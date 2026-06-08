# AI Transformation Photo — Risk Register

**Status:** Draft for future review  
**Last updated:** 2026-05-29  
**Feature:** Pro-tier “Future You” — user uploads a photo; AI generates an illustrative image of their goal physique  
**Related:** `gymmy-tier-matrix.md` (Pro feature slot), weigh-in progress photos (`WeightEntry.photoDataUrl`)

**Chosen paywall strategy (2026-05-29):** Cal AI pattern — **show the plan pre-pay**, **hide the transformation until pay** (or trial with payment on file). No one sees the full Future You until they commit. Reveal immediately post-signup in the same onboarding session.

Use this document when scoping v1, writing App Store questionnaire answers, legal copy, paywall design, and go/no-go decisions.

---

## Summary

| Area | Highest-severity risks |
|------|------------------------|
| Legal | Biometric/sensitive data, health claims, minors (COPPA/GDPR) |
| User harm | Body dysmorphia, unrealistic expectations, demographic bias |
| Technical | Photo leakage, vendor retention, NSFW/inappropriate outputs |
| Business | API cost, support load, brand backlash |
| Revenue & conversion | Lower signup if picture gated; plan preview may satisfy without pay; trial cancel after reveal |
| Store rating | AI body transformation may push toward 13+–17+; 18+ not automatic for private photo upload alone |

**Recommended defaults for v1:** explicit opt-in, illustrative-only disclaimer, server-side processing, easy delete, rate limits, no in-app photo feed, optional 18+ gate for transformation only.

---

## Legal & regulatory

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Biometric / sensitive data** | Body photos may qualify as sensitive personal data under GDPR, UK GDPR, CPRA, and similar laws. | Explicit consent; data minimization; retention limits; one-click delete; DPA with vendors. |
| **Health / outcome claims** | “Predicted” body imagery can be read as a medical or guaranteed fitness outcome. | Copy: “illustrative only, not medical advice”; no guarantee language; no before/after marketed as real results. |
| **Minors** | Processing body images with AI for users under 18 (especially under 13) is high legal and ethical risk (COPPA, etc.). | Block transformation for under-18; consider 18+ in-app gate regardless of store rating; age attestation at signup. |
| **Terms & consent gaps** | Users must understand what happens to their photo. | Dedicated consent screen: processing purpose, third-party API, retention, deletion, non-training use (if negotiated). |
| **App Store / Play policy** | Body-modification, weight-loss imagery, and AI-generated likeness may face extra review or rejection. | Review Guideline 1.2 (UGC), health apps guidance; prepare reviewer notes; conservative screenshots. |
| **Deepfake / likeness law** | Some jurisdictions restrict synthetic images of real people. | User owns upload; consent to generate derivative; vendor ToS review; “AI generated” label on all outputs. |

---

## Ethical & user harm

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Body dysmorphia & eating disorders** | Aspirational “future body” images can worsen unhealthy fixation or restriction. | Opt-in only; skip in onboarding; link to NEDA/resources; never nag users who skip; avoid daily prompts. |
| **Unrealistic expectations** | Models idealize symmetry, skin, muscle — not achievable at stated weight alone. | Conservative prompts (“realistic, same person”); show goal weight on card; avoid hyper-lean defaults. |
| **Extrinsic motivation backfire** | “Look like this” novelty may fade; hurts retention vs habit-based coaching. | Position as one-time motivation tool, not core loop; tie to milestones, not daily use. |
| **Demographic bias** | Outputs may skew toward certain body types, skin tones, or presentations. | Test across diverse inputs; fail gracefully; allow regenerate; human review path for reports. |
| **Gender / identity mismatch** | Onboarding sex/gender may not match presentation → distressing outputs. | User-selectable presentation cues; preview before save; easy discard/regenerate. |
| **Disability & medical conditions** | AI may erase or misrepresent prosthetics, scars, mobility aids, medical devices. | Prompt constraints; warn that feature may not represent all bodies; report offensive output. |

---

## Product & trust

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Identity failure** | Output doesn’t look like the user → gimmick or scam perception. | Prioritize identity preservation over polish; set expectations in UI; limited free retries. |
| **Inconsistent results** | Same photo, different runs → user anchors to best fiction. | Cap regenerations; store one “canonical” result per goal snapshot. |
| **Goal mismatch** | Goal weight doesn’t map to visible change (recomposition, height, frame). | Show numeric goal alongside image; explain fat loss vs recomposition in copy. |
| **Stale projections** | User changes goal or weight; old “future you” contradicts plan. | Invalidate or flag stale generations when goal changes materially. |
| **Comparison to real progress** | AI version looks “better” than achievable reality vs actual progress photos. | Side-by-side labels (“AI illustration” vs “Your photo”); don’t auto-compare without context. |
| **Feature regret** | Users feel sold a fantasy if Pro was pitched heavily on this. | Balanced paywall; transformation as one Pro benefit among coaching/analytics. |

---

## Technical & security

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Photo leakage** | Upload path, logs, CDN, or third-party mishandling exposes intimate images. | Server-side only; encrypted storage; no photos in client JSONB sync blob long-term; audit logging without raw image in logs. |
| **Client-side storage** | Current weigh-in pattern stores `photoDataUrl` in persisted slice — doesn’t scale for AI pipeline. | Supabase Storage + signed URLs; separate from weigh-in unless user explicitly reuses photo. |
| **API key / abuse** | Weak auth or rate limits → cost blowout or free public image editor. | Supabase Edge Function; auth required; per-user rate limits (see `food-search` guards pattern). |
| **Vendor data retention** | OpenAI, Google, etc. may retain inputs per default policies. | Enterprise / zero-retention agreements where possible; disclose in privacy policy. |
| **Adversarial / unusual inputs** | Odd images → NSFW or policy-violating outputs. | Input validation; content moderation on output; block and don’t charge user on failure. |
| **NSFW / inappropriate outputs** | Sexualized or bizarre images from innocent selfies. | Output moderation; auto-reject + support ticket; no auto-save of failed generations. |
| **Latency & failure** | 15–60s generation; failed job after upload feels violating for body photos. | Clear progress UX; don’t persist raw upload until user confirms; delete on cancel. |

---

## Revenue & conversion (show plan / hide picture)

Risks from the **chosen paywall model**: full plan visible during onboarding and at paywall; **transformation hidden until pay**. This is a business/revenue tradeoff, not a legal or safety issue.

Reference pattern: Cal AI shows calories/plan pre-pay; gates its core AI hook until subscribe.

### Strategy recap

| Pre-pay | Post-pay |
|---------|----------|
| Split, macros, timeline, coach setup — **visible** | Full app access |
| Future You — **not shown** (blurred teaser or “ready to unlock” only) | **Full reveal** in same onboarding session |

### Risks

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Lower paywall conversion** | Picture-led ads create strong intent to *see* the result; gating it may reduce signups vs showing the full image free. | Strong teaser UX (blurred silhouette, “Your Future You is ready”); CTA names the picture; A/B paywall copy. |
| **Plan preview satisfies without pay** | User sees split + macros during onboarding and feels they already “have the plan” — especially planner types who screenshot and leave. | Plan visible but **execution locked** until pay (no Home, no logging, or read-only preview); paywall CTA = “Start your plan,” not generic “Subscribe.” |
| **Generic paywall feel** | Showing plan like every fitness app weakens differentiation at the moment of decision if the picture teaser is weak. | Lead paywall hero with Future You teaser; plan as supporting proof; timeline (“~12 weeks”) visible pre-pay. |
| **Marketing promise vs paywall gap** | Ads promise “see your future self”; paywall shows blur only — can feel like bait if teaser is too vague. | Copy: “Unlock to view your Future You”; generate during onboarding so “ready” is credible; no fake blur of stock art. |
| **API cost on non-converters** | Image generated during onboarding for users who never pay — cost with no revenue. | Generate only after photo opt-in; consider deferring API call until paywall mount (trade latency); track cost per paid signup. |
| **Photo opt-out dead end** | Marketing is picture-first; skippers hit a plan-only paywall with no emotional hook. | Expect low opt-out if ads pre-select; small “Skip for now” on photo step; fallback paywall copy plan-forward for skippers. |
| **Trial → reveal → cancel** | User starts trial only to see the picture, cancels before renewal. | Payment method required; picture + plan unlock together; retention via Day 1 workout/nutrition task; optional regen cadence (e.g. every 14 days) so value isn’t one-shot. |
| **Post-pay reveal disappointment** | User paid primarily for the image; output doesn’t look like them → refund and bad reviews. | Set expectations on paywall; illustrative disclaimer; identity-quality bar before ship; support path for bad outputs. |
| **Plan shown twice inconsistently** | Step 26 Plan Ready shows full plan, then paywall blurs plan — feels dishonest. | Align screens: Plan Ready = teaser/summary only, **or** skip full reveal until post-pay; same numbers everywhere. |
| **Delayed reveal feels like bait-and-switch** | Picture unlock days after signup (not same session) breaks ad promise. | Reveal full Future You **immediately after pay**, still inside onboarding, before Home. |
| **Higher quality but smaller funnel** | Intentional trade: fewer signups, better retention from users who wanted the plan + picture bundle. | Track paywall → signup **and** D7/D30 retention vs conversion rate; don’t optimize signup alone. |
| **Competitor shows more pre-pay** | Rivals may show body scan results or partial AI output free. | Compete on reveal quality + plan integration, not on free full image; privacy/consent as trust message. |

### Metrics to watch

| Metric | What it tells you |
|--------|-------------------|
| Paywall view → trial/signup rate | Is hiding the picture costing too much top-of-funnel? |
| Photo step opt-in rate | Is marketing + onboarding aligning (expect high if ads are picture-led)? |
| Reveal → cancel within 48h | Picture-chaser / disappointed output problem |
| Workouts or meals logged in week 1 | Plan-as-product retention signal |
| Cost per paying signup (API) | Onboarding generation waste on non-converters |

### Alternatives considered (not chosen)

| Model | Revenue upside | Revenue downside |
|-------|----------------|------------------|
| Show full picture free, hide plan | Strong emotional hook pre-pay | User got ad promise for free; lower intent to pay |
| Show full picture free, show plan | Maximum trust | Weakest paywall; highest one-and-done churn risk |
| Hide picture until pay, show plan | **Chosen** — protects hook; Cal AI pattern | Lower conversion than free picture; plan may feel “enough” |

---

## Business & operations

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Unit economics** | Image generation is expensive at scale. | No full preview without pay; hard caps on regens (e.g. 1 per 14 days); track cost per paid signup; lower resolution only for paywall teaser if needed. |
| **Support load** | “Doesn’t look like me,” “offensive,” “delete everything.” | In-app report; documented delete flow; FAQ; template responses. |
| **Chargebacks / refunds** | Subscribe for transformation, bad output, dispute. | Clear illustrative disclaimer before first generation; no refund promise on subjective output. |
| **Brand risk** | Press: “Fitness app uses AI to body-shame users.” | Tone-deaf copy audit; diverse marketing examples; opt-in positioning. |
| **Competitive copying** | Idea is easy to copy; moat is trust and execution. | Focus on identity quality, privacy, and integration with existing goal/coaching data. |

---

## Content & moderation

| Risk | Why it matters | Mitigation ideas |
|------|----------------|------------------|
| **Non-selfie uploads** | Celebrity, other people, children → legal and ToS violations. | Face count / liveness heuristics where feasible; ToS prohibition; block on detect. |
| **Nudity / partial nudity** | Progress photos often borderline; stores and models have strict rules. | Require minimum clothing in guidelines; reject uploads that fail moderation. |
| **Sharing abuse** | Share cards used to mock others or fake transformation marketing. | Watermark + “AI generated”; no impersonation; ToS on misleading shares. |
| **Undisclosed AI shares** | Users post AI image as real progress. | Mandatory label on export assets; optional visible watermark on share card. |

---

## App Store age rating & distribution

Photo upload alone does **not** automatically require **18+**. Rating depends on questionnaire answers and feature set.

### What typically affects rating

| Factor | Fitcoach context | Typical impact |
|--------|------------------|----------------|
| Private progress photos (no in-app feed) | Weigh-in `photoDataUrl`; personal only | Low — not Apple’s “broad UGC distribution” |
| Calorie / diet / weight tracking | Core app | Health/wellness descriptor (often 4+–13+) |
| AI body transformation | Planned Pro feature | **Higher** — comps often 13+–17+ |
| In-app social feed of body photos | Not planned | Would significantly raise rating + moderation |
| Export share to Instagram, etc. | External share only | Usually not equivalent to in-app UGC |

### Comparable apps (indicative, not legal advice)

| App | Photo / AI feature | Age rating |
|-----|-------------------|------------|
| Lose It! | Progress photos, food photo log | 4+ |
| MyFitnessPal | Progress photos, AI coach, community | 16+ |
| Your Body AI | Meal photo analysis | 13+ |
| Gym AI | Body photo scan + analysis | 17+ |
| AI Weight Loss Coach | AI weight coaching | 17+ |

### Store-rating risks specific to this feature

| Risk | Notes |
|------|-------|
| **Questionnaire mis-answer** | Claiming “no UGC” while operating a public photo feed would be problematic. Private personal photos are different. |
| **AI assistant questions (2025+)** | Apple asks how AI affects sensitive content frequency; answer honestly for transformation. |
| **Regional variance** | e.g. France may show 18+ for apps with 17+ global rating on newer OS versions. |
| **Voluntary override** | Can set higher minimum age in App Store Connect if product policy requires 18+ for transformation. |

### Store rating vs in-app age gate

- **Store rating:** what Apple displays (e.g. 13+, 16+, 17+).
- **In-app gate:** you can require 18+ to use transformation even if the app is rated lower.
- **Recommendation:** plan for **17+** as plausible store outcome for full feature set; use **18+ gate for transformation only** for liability and ED concerns.

---

## Severity matrix (prioritization)

| Severity | Risks |
|----------|-------|
| **Critical** | Photo leakage; minors using transformation; ED harm; processing non-consensual/third-party photos |
| **High** | Unrealistic expectations; identity failure; App Store rejection; runaway API cost; vendor retention without DPA; paywall conversion too low with picture gated |
| **Medium** | Stale projections; demographic bias; support volume; stale paywall promises; trial cancel after reveal; plan preview satisfies without pay |
| **Lower** | Viral sharing backlash; competitor parity; regional rating quirks |

---

## v1 mitigation checklist (go/no-go)

Before shipping, confirm:

- [ ] Dedicated opt-in consent screen with illustrative-only / not medical advice copy
- [ ] Transformation blocked for users under 18 (or 18+ attestation)
- [ ] Server-side processing only; no long-lived raw photos in client sync payload
- [ ] Supabase Edge Function with auth + rate limits
- [ ] One-click delete: source photo + all generated variants
- [ ] “AI generated” label on result and share exports
- [ ] No in-app public feed of user body photos
- [ ] Output moderation + report offensive output path
- [ ] Vendor DPA / retention terms documented in privacy policy
- [ ] App Store Connect questionnaire drafted with accurate UGC / health / AI answers
- [ ] Conservative prompts (realistic, same person, no hyper-idealization)
- [ ] Paywall: plan visible, Future You gated until pay; teaser only pre-pay
- [ ] Post-pay reveal in same onboarding session (not delayed to Progress tab)
- [ ] Step 26 Plan Ready aligned with paywall (no full plan then fake blur)
- [ ] Pro/subscriber caps on regenerations (cadence TBD, e.g. every 14 days)

---

## Open questions (for next review)

1. Minimum age: 16+, 18+, or match store rating only?
2. Reuse weigh-in photo vs dedicated “Future You” camera flow?
3. Which model/vendor first (identity preservation vs cost)?
4. Store generated images in Supabase Storage vs ephemeral only?
5. Share card in v1 or defer to reduce moderation/abuse surface?
6. Block feature entirely in EU until legal review, or ship with enhanced consent?
7. Regen cadence after first reveal (weekly vs every 14 days)?
8. Paywall teaser: blurred silhouette vs “ready” card with no image pixels?
9. Photo opt-out fallback paywall copy and layout?

---

## References in repo

- `future-you-onboarding-spec.md` — full onboarding flow, skip/reminder UX, personalization page, loading phrases
- `gymmy-tier-matrix.md` — Pro tier lists “AI transformation photo”
- `src/fitness/WeighInSheet.tsx` — existing progress photo upload (`photoDataUrl`)
- `supabase/functions/food-search/` — edge function auth + rate-limit pattern to mirror
