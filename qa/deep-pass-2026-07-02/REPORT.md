# Deep QA Pass — 2026-07-02 (real account)

**Branch:** `rn-migration` @ `6e5ffbf`  
**Device:** iPhone 17 Pro simulator (iOS 26.5)  
**Metro:** `127.0.0.1:8082` with `EXPO_PUBLIC_ONBOARDING_DEV_TOOLS=1`, `REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1`  
**Launch:** Deep link only (`exp+newyouai-mobile://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8082`) — never sim home screen  
**Auth for in-app pass:** `EXPO_PUBLIC_DEV_AUTO_SIGN_IN_EMAIL` / `PASSWORD` set to real account (same credentials; bypasses Maestro secure-field limitation — see #2)

## Test account

| Field | Value |
|-------|-------|
| Email | `jimmyjam1213@outlook.com` |
| Password | `newyou2026` |

Supabase password grant verified OK via API (`access_token` returned). Display name on Home: **Jimmy**.

---

## What was tested this time (signed-in app)

| Area | Light | Dark | Result | Screenshot |
|------|-------|------|--------|------------|
| Metro deep link + live bundle | — | — | **PASS** | `04-main-thread-busy.png` (auth welcome, prior run) |
| Auth welcome + logo (live bundle) | ✓ | — | **PASS** (visual) | `04-main-thread-busy.png` |
| Sign-in form (Maestro) | — | — | **FAIL** (automation) | `08-after-sign-in-button.png` |
| Sign-in (Supabase API + dev auto-sign-in) | — | — | **PASS** | `09-home-after-real-account-signin.png` |
| **Home** tab | ✓ | — | **PASS** | `09-home-after-real-account-signin.png` |
| **Nutrition** tab | ✓ | — | **PASS** | `10-nutrition-light.png` |
| **Workout** tab | ✓ | — | **PASS** | `12-workout-light.png` |
| **Progress** tab | ✓ | — | **PASS** (see #5) | `13-progress-light.png` |
| Log food modal (open) | ✓ | — | **PASS** | `11-log-food-modal-light.png` |
| Log food modal (close → tab) | ✓ | — | **FAIL** (automation) | — |
| **Settings** hub | ✓ | ✓ | **BLOCKED** | `37-settings-dev-menu-blocker.png` |
| Settings panels (all) | — | — | **NOT TESTED** | — |
| Appearance light/dark toggle | — | — | **NOT TESTED** | — |
| Report issue / Request feature dialogs | — | — | **NOT TESTED** | — |
| Sunday check-in card + modal | — | — | **NOT REACHABLE** (Thu Jul 2; card is Sunday-only) | — |
| Workout session (start → finish) | — | — | **NOT TESTED** | — |
| Future You tab | — | — | **SKIPPED** (per plan) | — |
| Onboarding / image gen | — | — | **SKIPPED** (per plan) | — |
| Tab bar FAB logo | ✓ | — | **PASS** | `09`, `12`, `13` |
| Boot splash | — | — | **NOT CAPTURED** (dev client intro overlay) | — |

---

## Metro fixes applied (blockers only)

No new Metro/red-screen fixes this pass. App bundles and runs on live Metro. Prior pass fixes remain in working tree:

| File | Change (prior pass) |
|------|---------------------|
| `apps/mobile/lib/revenueCat.ts` | Removed duplicate export (Babel crash) |
| `apps/mobile/lib/futureYouPaywallModel.ts` | Optional `regionBlocked` param |
| `apps/mobile/components/onboarding/OnboardingFutureYouSuccess.tsx` | Optional `regionBlocked` prop |

---

## Issues (documented — not fixed per policy)

### 1. Settings gear opens Expo dev menu instead of app Settings (HIGH)

**Severity:** High  
**Screenshot:** `37-settings-dev-menu-blocker.png`

Tapping `home-settings` (and Maestro `open-settings-hub.yaml`) opens the **Expo development menu** overlay (Reload / Go home / DevTools) instead of navigating to `/(tabs)/settings`. Closing the overlay returns to Home; `settings-hub` never appears.

**Repro:**
1. Metro deep link → signed-in Home (`Good morning, Jimmy`)
2. Tap settings gear (top-right) or Maestro `tapOn id: home-settings`
3. Expo dev menu appears; app Settings does not

**Impact:** Blocks all Settings QA (appearance, panels, dialogs, delete-account sheet) on dev-client builds. Likely collision between app gear and Expo dev-client floating control in the top-right hit region.

**Note:** `apps/mobile/.maestro/subflows/open-settings-hub.yaml` comment says gear is inset to clear dev menu — not sufficient on iOS 26.5 sim in this pass.

---

### 2. Maestro cannot complete sign-in form (secure password field) (HIGH — E2E)

**Severity:** High (automation / regression gates)  
**Screenshots:** `08-after-sign-in-button.png`, Maestro run `2026-07-02_093056`

Maestro fills email but **does not enter password** into the secure `AuthTextField` (field appears empty after `inputText`). Submit stays on sign-in with no error. `auth-sign-in-email` testID is also absent from accessibility hierarchy when queried by Maestro.

**Repro:**
1. Welcome → Get Started → Sign in
2. Maestro: tap Email → input email → tap Password → input password → Sign In
3. Password field empty; no navigation

**Not an auth backend bug:** Same credentials succeed via Supabase API and via `EXPO_PUBLIC_DEV_AUTO_SIGN_IN_*` in `AuthContext`.

---

### 3. Log food modal close does not return to tab shell in Maestro (MEDIUM)

**Severity:** Medium  
**Screenshot:** `11-log-food-modal-light.png` (open state); failure after close in `qa-in-app-exploration.yaml`

Modal opens correctly from Nutrition FAB (`open-log-food`). Tapping `modal-close` (←) does not restore `tab-bar-nutrition` within 20s in Maestro (screen stays on Log Food). May be automation timing or navigation stack issue — not verified manually.

**Repro:** Nutrition → Log food FAB → tap ← back → tab bar not found by Maestro.

---

### 4. Settings deep link breaks dev client loader (MEDIUM)

**Severity:** Medium  
**Screenshot:** Maestro `2026-07-02_094751` (not copied — red error screen)

`openLink` to `http://127.0.0.1:8082/--/(tabs)/settings` shows **“Failed to load app from …”** Expo error screen. Requires Reload to recover.

---

### 5. Progress tab — ghost “WORKOUTS” text behind tab bar (MEDIUM)

**Severity:** Medium (visual)  
**Screenshot:** `13-progress-light.png`

On Progress, faint **“WORKOUTS”** label visible behind/through the bottom tab bar dock. Suggests z-index or scroll content bleed from an underlying layer.

---

### 6. Expo dev FAB overlaps primary actions (LOW)

**Severity:** Low  
**Screenshot:** `11-log-food-modal-light.png`

Semi-transparent **gear FAB** (Expo dev client) floats over the Log Food **Scan** button and other right-edge controls. Expected on dev builds; interferes with tap targets during QA.

---

### 7. Sunday check-in not reachable on Jul 2 (INFO)

**Severity:** Info  
**Screenshot:** N/A

Home has no `sunday-check-in-card` on **Thursday Jul 2** for the real account. E2E flow requires `EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY=true` (see `rn-sunday-check-in.yaml`). Not a bug — date gating.

---

### 8. Main thread busy on first Metro connect (MEDIUM — prior + observed)

**Severity:** Medium  
**Screenshot:** `04-main-thread-busy.png`

First connect after Metro start can freeze UI ~30s (Maestro “main thread busy”). Subsequent launches faster.

---

## Logo check

| Surface | Screenshot | Status |
|---------|------------|--------|
| Auth welcome (live Metro) | `04-main-thread-busy.png` | Gold mark + “NewYou” wordmark OK |
| Sign-in screen | `05-sign-in-screen.png` | Logo OK |
| Home (live, real account) | `09-home-after-real-account-signin.png` | Header OK; tab FAB gold mark + “NewYou” OK |
| Workout / Progress FAB | `12-workout-light.png`, `13-progress-light.png` | FAB logo OK |
| Settings | — | Not reached |
| Boot splash | — | Not isolated (dev client intro) |

---

## Maestro flows added this pass

| File | Purpose |
|------|---------|
| `qa-in-app-exploration.yaml` | Signed-in tab sweep (auto sign-in) |
| `qa-settings-and-theme.yaml` | Settings + theme (blocked at hub) |
| `qa-sign-in-credentials-direct.yaml` | testID-based sign-in attempt |
| `qa-log-food-modal.yaml` | Log food only |
| `qa-settings-open-test.yaml` | Settings gear repro |

**Run note:** Maestro requires Java — `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`

---

## Gate summary

| Gate | Status |
|------|--------|
| Live Metro bundle | **PASS** |
| Real account → Home | **PASS** (via dev auto-sign-in) |
| All main tabs (light) | **PASS** |
| Settings + dark theme | **FAIL** (blocked) |
| Form sign-in E2E | **FAIL** (Maestro password) |
| Future You / onboarding | Skipped |

---

## Recommended next steps (for you — not done in this pass)

1. **Settings on dev client:** Separate app settings hit target from Expo dev FAB (or disable dev FAB in QA profile) so gear opens `settings-hub`.
2. **Maestro sign-in:** Add `textContentType`/accessibility hooks for password, or use dev-only non-secure field for E2E only.
3. **Re-run settings/theme pass** once #1 is fixed — use `qa-settings-and-theme.yaml`.
4. **Sunday check-in:** Re-test with `EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY=true` if modal QA is needed mid-week.
5. **Progress ghost text:** Investigate layer behind `TabBarDock` on Progress screen.

---

## Screenshots index

All under `qa/deep-pass-2026-07-02/screenshots/`:

| File | Description |
|------|-------------|
| `01-smoke-pass.png` | Prior pass — stale embedded bundle (old Home) |
| `02`–`03` | Prior pass — sign-up Maestro env issues |
| `04-main-thread-busy.png` | Live bundle auth welcome + logo |
| `05`–`08` | Prior pass — sign-in form stuck (empty password in automation) |
| `09-home-after-real-account-signin.png` | **Real account Home** — “Good morning, Jimmy” |
| `10-nutrition-light.png` | Nutrition tab, macros, hydration |
| `11-log-food-modal-light.png` | Log food modal (All tab, empty recent) |
| `12-workout-light.png` | Workout tab — routines Mon–Wed |
| `13-progress-light.png` | Progress tab — weight, calories chart, ghost WORKOUTS text |
| `36-settings-tap-failure.png` | Accidental navigation to Expo dev-client launcher |
| `37-settings-dev-menu-blocker.png` | **Settings gear → Expo dev menu** (blocker) |
