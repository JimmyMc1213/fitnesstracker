# Gymmy — Free vs Pro Tier Matrix

**Status:** Approved for onboarding paywall copy and future IAP gating  
**Last updated:** 2026-05-23  
**App name:** Gymmy (placeholder product name)

---

## One-sentence positioning

**Free is enough to follow your plan and track everything. Pro is everything that coaches you, builds for you, and keeps you accountable.**

---

## Pricing (paywall UI — IAP not wired yet)

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | **$9.99/mo** | Primary CTA: "Start 7-day free trial" |
| Annual | **$79.99/yr** | Badge: **Save 33%** vs monthly |
| Free | $0 | Secondary CTA: "Continue with free" |

**v1 behavior:** Both paywall CTAs route to Home. Tier choice is stored (`subscriptionTier: 'free' | 'pro'`) but **features are not gated** until IAP sprint. Copy reflects intended future locks.

---

## Free tier

Enough to execute the plan Gymmy generates at onboarding and honestly track workouts, food, weight, and habits.

### Workouts

| Feature | Detail |
|---------|--------|
| Generated split | Split from onboarding (experience + equipment + schedule) |
| Exercise swap | One-for-one swap (replace exercise A with exercise B) |
| Set editing | Add or remove sets on an exercise |
| Rep ranges | Change rep ranges on exercises |
| Workout logging | Full in-session logging (weight, reps, done) |
| History | **Last 30 sessions** |

### Nutrition

| Feature | Detail |
|---------|--------|
| Food database | Search (USDA + Open Food Facts) + manual add |
| Macro rings | Daily targets + progress rings on Nutrition tab |
| Basic logging | MyFitnessPal-style item logging (search, manual, recently logged) |
| My Foods | Save favorites from search for quick re-log |

**Not in Free (Pro):** My Meals saved templates, barcode, voice log.

### Progress

| Feature | Detail |
|---------|--------|
| Weight logging | Weigh-in flow + weight chart |
| Home dashboard | Daily tasks, fuel strip, greeting |
| Habits | Habit tracking on Home |
| Water + steps | Daily water target/logging; steps target on dashboard |

**Not in Free (Pro):** Progress photos, AI transformation photo.

### Coach

| Feature | Detail |
|---------|--------|
| Rule-based coach notes | **Visible but blurred** with CTA: *"Upgrade to unlock coaching"* |

In-session rule-based notes (FTI-54) and home coach copy remain discoverable so Free users feel what Pro unlocks — they cannot read full coaching text without upgrading.

---

## Pro tier ($9.99/mo · $79.99/yr)

Everything in Free, plus:

### Workouts

| Feature | Detail |
|---------|--------|
| Create from scratch | Build custom workouts outside generated split |
| Extra training days | Add workout days beyond onboarding-generated split |
| Reorder split | Reorder entire split structure |
| Multiple splits | Saved splits (e.g. cut split, bulk split, travel split) |
| Exercise library | Full library with filters |
| History | **Unlimited** workout history |

### Coaching

| Feature | Detail |
|---------|--------|
| AI session coaching | Claude-powered progressive overload guidance per exercise |
| PR board | PR tracking + full analytics |
| Weekly summary | Weekly summary card + progress analytics |
| Advanced split customization | Deep template/split editing beyond Free swap/set/rep edits |
| Coach notes | **Unblurred** — full rule-based + AI coaching readable |

### Nutrition

| Feature | Detail |
|---------|--------|
| Saved meal templates | My Meals — one-tap logging from saved recipes |
| Barcode scanner | When built |
| Voice food logging | When built |

### Progress

| Feature | Detail |
|---------|--------|
| Progress photos | Attach photos to weigh-ins / progress timeline |
| AI transformation photo | When built |

### Lifestyle

| Feature | Detail |
|---------|--------|
| Smart accountability | Context-aware nudges |
| Workout reminders | Scheduled workout notifications |
| Nutrition check-ins | Daily nutrition reminder notifications |

---

## Future Pro features (slots in automatically when built)

These are **Pro-only by default** — no tier doc change needed when they ship:

- Barcode scanner
- Voice food logging
- AI transformation photo
- Apple Watch companion

---

## Implementation status (codebase today)

Use this when writing paywall bullets and planning gating work.

| Feature | Built? | Current access | Target tier |
|---------|--------|----------------|-------------|
| Onboarding split + templates | Yes | All | Free |
| Exercise swap (mid-workout + onboarding review) | Yes | All | Free |
| Set add/remove, rep edits | Yes | All | Free |
| Workout logging + history | Yes | All (unlimited today) | Free: 30 cap when gated |
| USDA/OFF food search | Yes | All | Free |
| Macro rings + manual log | Yes | All | Free |
| My Foods favorites | Yes | All | Free |
| **My Meals templates** | Yes | **All (ungated)** | **Pro — gate at IAP** |
| Weight log + progress chart | Yes | All | Free |
| Home + daily tasks | Yes | All | Free |
| Habits | Yes | All | Free |
| Water intake | Yes | All | Free |
| Steps target | Yes | All | Free |
| Rule-based coach notes | Yes | All (unblurred) | Free: blur + CTA |
| Notifications (workout + nutrition) | Yes | All | Pro |
| Weekly summary card | Yes | All | Pro |
| PR board | Yes | All | Pro |
| Create workout from scratch | No | — | Pro |
| Multiple saved splits | No | — | Pro |
| Full exercise library filters | Partial | All | Pro |
| AI session coaching (Claude) | No | — | Pro |
| Barcode / voice / transformation | No | — | Pro (future) |
| Progress photos | Partial (weigh-in photo field exists) | All | Pro |
| IAP / subscription enforcement | No | — | Post onboarding v2 |

---

## Paywall screen copy (derived from matrix)

### Headline
**Unlock your full coaching experience**

### Free column — "Continue with free"
- Your generated training split
- Log workouts + 30-day history
- Food search + macro tracking
- Weight log + habits + daily dashboard
- Coach previews (upgrade to read full notes)

### Pro column — "Start 7-day free trial"
- Everything in Free
- AI coaching + unblurred session notes
- PR board + weekly analytics
- Saved meals — one-tap logging
- Unlimited history + custom splits
- Workout & nutrition reminders

### Honest subline (small print)
*Pro features like barcode scan and voice logging arrive automatically when they ship.*

---

## Gating policy

### Phase 1 — Onboarding paywall stub (current sprint track)
- Store `subscriptionTier` on finish
- **No feature enforcement**
- Paywall copy reflects matrix above

### Phase 2 — IAP sprint
- Enforce limits: 30-session history (Free), My Meals (Pro), blurred coach (Free)
- Notifications require Pro
- Grandfather rule TBD: existing users who used My Meals before gate — recommend 30-day grace or auto-Pro trial

### Phase 3 — AI + future Pro slots
- Barcode, voice, transformation, Watch ship as Pro without doc change

---

## Open decisions (none blocking paywall UI)

| Topic | Decision |
|-------|----------|
| My Meals | Pro only; gate when IAP ships (user confirmed 2026-05-23) |
| Water + steps | Free (user confirmed 2026-05-23) |
| Free trial | 7-day trial on Pro CTA (marketing; not enforced until IAP) |
| Coach blur UX | Design during onboarding paywall story — blur in-session + home coach cards |

---

## Related docs

- [Gymmy onboarding v2 plan](/Users/jimmymccarthy/.cursor/plans/gymmy_onboarding_v2_5ef9338f.plan.md) — screen 23 paywall consumes this matrix
- [FTI-69 dailyPlan hotfix](../implementation-artifacts/fti-69-dailyplan-hydration-hotfix.md) — Phase 0 complete
