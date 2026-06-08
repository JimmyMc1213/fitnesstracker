# Gymmy Full App QA Audit Report

**Method:** Live testing on iPhone 14 viewport (390×844) against `http://127.0.0.1:5173`, plus Playwright automation, existing E2E suite, screenshot tour review, and code inspection. **No code was changed.**

---

## Executive Summary

Gymmy feels like a **real, cohesive fitness product** — not a prototype. The coaching loop (home carousel → workout session with coach notes → nutrition protein priority → progress charts) hangs together well. Visual design is clean, modern, and mobile-first. Onboarding is thorough and Cal AI–inspired.

The biggest gaps are **polish and consistency**, not missing features: overlay/stacking issues on Settings and Log Food, macro ring vs “kcal left” mismatch during/at animation, outdated E2E tests, notification settings mismatch between onboarding and Settings, and dev-only UI leaking into the experience. Workout and nutrition core flows work; onboarding resume and cut/bulk paths work in manual stepping but automated tests need updating for the new 30-step flow.

**Overall:** Strong B+ product — great bones, a handful of bugs worth fixing before wider release, and onboarding could be tightened (30 steps is a lot).

---

## Bugs & Functional Issues

| Severity | Area | Steps to Reproduce | Expected | Actual |
|----------|------|-------------------|----------|--------|
| **Major** | Settings overlay | Home → tap Settings gear | Full-screen opaque Settings; Home hidden | Home content (“Morning weigh-in”, fuel carousel, habits) **visible through/behind** Settings. Confirmed via Playwright `isVisible` after 800ms settle + screenshot `02-home-settings.png` |
| **Major** | Log Food overlay | Nutrition → tap + FAB | Log Food replaces Nutrition view | Nutrition summary (kcal left, macro bars, hydration) **bleeds through** Log Food. Confirmed via Playwright + screenshot `05-nutrition-log-food.png` |
| **Major** | Nutrition macro ring | Seed 860 kcal logged (320+540) → Nutrition tab | Ring center ≈ 860, “kcal left” = 1340 | **“kcal left” = 1340 is correct**, but ring center showed **0** (frozen clock) or **123** (screenshot) — inconsistent with 860 consumed. Ring animates from 0 via `requestAnimationFrame` while “kcal left” updates instantly |
| **Minor** | Nutrition FAB layout | Nutrition tab, hydration card visible | Add button fully clickable | **+ FAB overlaps** hydration “Add” button (screenshot `04-nutrition.png`) |
| **Minor** | Workout session timer | Start workout → mark set Done | Elapsed timer increments | Timer stays **0:00** while sets are logged (screenshot `09-workout-active-session.png`) |
| **Minor** | Progress weight chart | Progress tab with 2 weight entries | Unique x-axis labels | **“May 17” appears twice** on chart x-axis (screenshot `12-progress.png`) |
| **Minor** | E2E: Onboarding | Run `onboarding-v2.spec.ts` | Pass | **Fails** — flow now starts with **theme picker** (step 1), not gender. Tests expect old step order |
| **Minor** | E2E: Coach nav | Run `coach-task-nutrition.spec.ts` | Pass | **Fails** — asserts `"Today's plan"` which **no longer exists** in the codebase |
| **Minor** | E2E: Swipe delete | Run `nutrition-log-food.spec.ts` (first test) | Food removed from list | **Strict mode violation** — delete confirm dialog also contains food name, so `getByText('E2E shake')` matches 2 elements |
| **Polish** | App title / branding | Open app | Consistent “Gymmy” branding | Browser title: **“Jimmy: Personal Fitness OS”** |
| **Polish** | Dev toolbar | Any onboarding screen | No dev UI for normal users | **“Open on reload”** checkbox + **“Leave onboarding”** button visible (DevOnboardingToolbar) |
| **Polish** | Unwired feature | Search codebase | — | **Barcode scanner** (`ScreenScan.tsx`) exists but is **not reachable** |
| **Info** | Notifications in Settings | Complete onboarding (5 toggles) → Settings → Reminders | Same 5 toggles | Settings only has **Workout reminder** + **Nutrition check-in**. No Morning check-in, Weekly review, or Nightly stretch toggles (Playwright: `settingsMorningCheckin: false`, `settingsWeeklyReview: false`) |

### What worked correctly

- **Water tracking:** 40/96 oz with seeded data; +16 oz → 56/96 oz
- **Workout smoke:** Start → log set → finish → summary (E2E passes)
- **Food logging:** Search, My meals, re-log (E2E passes)
- **Maintain path branching:** Skips goal weight / pace screens (verified in step-through)
- **Settings name / units / fuel targets:** Present and editable
- **Stretch flow:** Reachable from Home CTA; block detail sheet opens
- **Streak lost / Sunday preview:** Dev query params work (`?previewStreakLost=1`, `?previewSunday=1`)

---

## Design — What Works Well

1. **Home dashboard carousel** — Fuel + Training slides with dot pagination; protein mini-rings color-coded; “+ Log fuel →” CTA is clear (`01-home.png`).

2. **Protein priority callout** — “107g of protein to go. This is your #1 priority.” with accent color draws focus without being shouty.

3. **Active workout session** — Coach card, rest timer inline, session volume sticky header, “Last session: 135×10” overload tips. Feels like a real coaching product (`09-workout-active-session.png`).

4. **Workout summary** — Confetti + “Workout complete” is satisfying (`10-workout-summary.png`).

5. **Progress tab** — Week 3/12 · Day 18/84 context, weight trend with delta, weekly summary narrative (“Mixed week, 2/5 sessions…”) is excellent coaching copy (`12-progress.png`).

6. **Onboarding tone** — Copy like “Honest answer. We'll set the plan in the real world.” and reinforcement interstitials sell the coach well.

7. **Dark theme onboarding** — Theme picker with live preview is a nice touch.

8. **Settings organization** — Logical sections: Appearance, Account, Units, Rest timer, Reminders, Hydration, Equipment, Fuel targets, Habits, Program.

9. **Stretch routine** — Block list + detail bottom sheet with cues is calm and usable (`14-stretch.png`, `15-stretch-block-detail.png`).

10. **Bottom tab bar** — Simple 4-tab nav; hides appropriately during overlays.

---

## Design — What Feels Off

1. **Onboarding length (30 steps)** — “Step 8 of 30” on height screen feels long. Consider merging units+height, or collapsing survey steps.

2. **Dark mode onboarding contrast** — Headings like “How tall are you?” are dark gray on black; hard to read (browser screenshot during audit).

3. **Workout idle tab contrast** — “TRAINING”, “Restore default 5-day program” very faint on light gradient (`06-workout-idle.png`).

4. **Settings / Log Food ghosting** — Overlapping layers make the app feel broken, not just “in transition.”

5. **Dev toolbar in onboarding** — “Leave onboarding” above Continue is alarming for a real user; “Open on reload” looks like debug cruft.

6. **Notification settings inconsistency** — User configures 5 reminders in onboarding, then only finds 2 in Settings. Trust-breaking.

7. **Log Food information density** — When working correctly, All + Recently logged + Manual Add is good; when layers bleed, it’s unusable.

8. **FAB vs hydration Add** — Two competing primary actions in the same corner.

9. **Macro ring animation vs static text** — Ring counts up from 0; “kcal left” is static → temporary mismatch feels like a bug.

10. **Paywall / Save progress / OAuth** — UI-only stubs are fine for now, but “Sign in with Apple/Google” with no real flow may frustrate if tapped.

---

## Polish & Copy Notes

- Referral step **requires selection** before Continue enables — good validation, but no hint when disabled.
- Pace labels are full strings: **“Balanced (~1 lb/wk)”** not just “Balanced”.
- Dietary step title: **“Any foods you avoid?”** with options like **“No restrictions. I eat everything”** (not “Classic”).
- Step 19 is **training style** (“Tell me exactly what to do”), not accomplishments — E2E copy is stale.
- Calendar step requires **≥3 days** or **“Pick for me”** — Continue stays disabled otherwise (good, but easy to miss).
- Settings first-name field has **no `aria-label`** — only visible text “First name (home greeting)”.
- Settings copy still says **“Fitcoach”** in notification hint (“Background notifications coming soon”).
- Home no longer shows **“Today’s plan”** heading — coach tasks live inside carousel slides.
- `?previewStreakLost=1` and `?previewSunday=1` are dev-only; fine for testing.

---

## Coverage Checklist

| Flow | Status |
|------|--------|
| Welcome / Get Started | Tested |
| Full cut onboarding → paywall | Step-through ~95%; blocked at notification Allow in automation (timing); manual path validated through fuel targets + split |
| Maintain spot-check | Validated — skips goal weight/pace |
| Resume mid-flow (calendar) | Not fully verified in this run (automation timeout); E2E test exists but **fails** (outdated) |
| Home (carousel, weigh-in, habits, stretch CTA) | Tested via screenshots + partial live |
| Nutrition (rings, water, log food) | Tested — water OK; ring/overlay issues noted |
| Log Food (All, My foods, My meals, Favorites) | Tabs exist; depth limited by overlay timing |
| Workout idle / history / preview / editor | Screenshots + E2E smoke |
| Active session (sets, rest timer, coach, finish) | Tested — timer at 0:00 noted |
| Workout summary | Screenshot + E2E |
| Weekly routine builder (generate + manual) | Not manually tested this session |
| Progress (weight, weekly summary, PRs, calendars) | Screenshot review |
| Stretch (8 blocks + detail) | Screenshot + partial live |
| Settings (all sections) | Screenshot + partial live |
| Streak lost modal | Dev preview param |
| Sunday weekly check-in | Dev preview param |
| Auth / cloud sync | UI only — not configured in dev |
| Barcode scan | Unwired |

---

## E2E Test Suite Results (against dev server)

**4 passed / 5 failed** (iPhone 14 config, port 5173)

| Pass | Fail |
|------|------|
| Food search → log | Onboarding maintain (outdated steps) |
| My meals one-tap log | Onboarding resume (outdated) |
| Recently logged re-log | Calendar validation (outdated) |
| Workout session smoke | Coach “Log fuel” (missing “Today’s plan”) |
| | Nutrition swipe-delete (strict mode) |

---

## General Opinion

**Gymmy is impressively complete for a solo/small-team fitness app.** The coaching voice is consistent, the workout logger is better than most MVPs, and nutrition logging covers the paths people actually use (search, manual, meals, recents). The home screen answers “what should I do today?” without feeling cluttered.

The main things holding it back from feeling **production-polished**:

1. **Overlay rendering** on Settings and Log Food — this is the #1 fix; it makes the app look broken.
2. **Test suite drift** from onboarding v2 changes — CI may be red or giving false confidence.
3. **Onboarding length + dev chrome** — trim steps and hide dev toolbar outside dev builds.
4. **Settings/onboarding parity** for notifications.

None of these require rethinking the product — they’re fixable polish. The core loop (onboard → home → log food / workout → see progress) is solid and worth shipping after those fixes.

---

**No code was modified.** When you’re ready to tackle fixes, I’d prioritize: overlay opacity/z-index → macro ring sync → update E2E for new onboarding → Settings notification parity → FAB/hydration layout.
