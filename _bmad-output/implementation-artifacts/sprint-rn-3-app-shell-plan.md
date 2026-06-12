# Sprint RN-3 — Core Navigation & App Shell

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready)  
**Epic:** `epic-rn-3`  
**Swarm branch:** `epic-rn-3/core-navigation-app-shell`  
**Goal:** Replace the RN-2 tabs stub with a PWA-parity app shell — tab bar + Future You FAB, `appShellRouting`, modal/settings route scaffolding, and navigation Maestro smoke — so RN-4 onboarding can plug into a stable router.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M2 (navigation shell)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 Expo Router navigation map  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-3  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

A signed-in user sees the PWA-parity tab bar (Home, Nutrition, Workout, Progress + Future You FAB), shell routing resolves loading → auth → app (with onboarding stub), modal and settings stacks exist as navigable shells, and tab-navigation Maestro passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-3` |
| Branch | `epic-rn-3/core-navigation-app-shell` |
| Start story | **RN-3-01** (`rn-3-01-tab-bar-future-you-fab.md`) |
| Story files | All 6 exist under `implementation-artifacts/rn-3-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (epic close) | Tab navigation Maestro + auth-all still green (see below) |

**Kickoff:** `/bmad-swarm epic-rn-3` or `dev this story rn-3-01-tab-bar-future-you-fab.md`

**Swarm order (strict):**

```
RN-3-01 → RN-3-02 → RN-3-03 → RN-3-04 → RN-3-05 → RN-3-06 → epic-rn-3-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 / RN-1 / RN-2 | **Done** | Foundation, packages, auth + session |
| Tab layout | **Stub** | Expo template: `index` + `two`; placeholder home with sign-out |
| `useAuthGate` | **Auth-only** | `(auth)` ↔ `(tabs)`; no onboarding or hydration routing |
| `appShellRouting` | **PWA only** | `apps/pwa/src/fitness/appShellRouting.ts` — not yet in `packages/core` |
| Modals | **Template** | Generic `modal.tsx` from Expo scaffold |
| Settings | **Missing** | No settings tab/stack |
| Deep links | **Partial** | OAuth via `expo-linking` in RN-2; no general `newyouai://` router |

---

## Execute in this order

| # | Story | Story file | PR target | Status |
|---|-------|------------|-----------|--------|
| 1 | **RN-3-01** | `rn-3-01-tab-bar-future-you-fab.md` | 1 PR | ready-for-dev |
| 2 | **RN-3-02** | `rn-3-02-app-shell-routing.md` | 1 PR | backlog |
| 3 | **RN-3-03** | `rn-3-03-modal-route-shells.md` | 1 PR | backlog |
| 4 | **RN-3-04** | `rn-3-04-settings-stack-navigation.md` | 1 PR | backlog |
| 5 | **RN-3-05** | `rn-3-05-error-loading-boundaries.md` | 1 PR | backlog |
| 6 | **RN-3-06** | `rn-3-06-deep-link-handler-stub.md` | 1 PR | backlog |
| 7 | Retro | `epic-rn-3-retrospective` | — | optional |

---

## RN-3-01 — Tab bar with Future You FAB

**Story file:** `rn-3-01-tab-bar-future-you-fab.md`

**Deliverables:**

- Replace Expo template tabs with PWA-parity routes: `home`, `nutrition`, `workout`, `progress`, `future-you`
- Custom tab bar: 4 main tabs + elevated Future You FAB (label **NewYou**)
- Placeholder screen per tab with `testID` for Maestro (`tab-home`, `tab-nutrition`, etc.)
- NativeWind + theme tokens; icons aligned with PWA tab set (home, kitchen, barbell, trending, future-you)
- Remove template `two.tsx` and generic modal link from tab header

**PWA ref:** `FitnessApp.tsx` `MAIN_TABS`, `FUTURE_YOU_TAB`, `tabbar-dock`

**Maestro (add):** `rn-tab-navigation.yaml` — sign in → tap each tab → verify screen testID

**Story gate:** typecheck + `npm run test:e2e:auth-all` still passes

---

## RN-3-02 — appShellRouting parity

**Story file:** `rn-3-02-app-shell-routing.md`

**Deliverables:**

- Extract `appShellRouting.ts` + tests to `packages/core` (PWA re-exports; no behavior change)
- Add `useAppShellGate` hook replacing auth-only `useAuthGate` for shell decisions
- Route groups: `(auth)`, `(onboarding)` stub, `(tabs)` app
- `(onboarding)/index.tsx` stub — "Onboarding ships in RN-4" with `testID="onboarding-stub"`
- Wire `onboardingComplete` from local stub state (AsyncStorage key or dev flag) until RN-OFFLINE/RN-4
- Loading gate: session bootstrap + signed-in hydration placeholder (no cloud sync yet)

**PWA ref:** `appShellRouting.ts`, `appShellRouting.test.ts`, `FitnessApp.tsx` shell routing input

**Story gate:** typecheck + Vitest for `packages/core` appShellRouting + auth-all green

---

## RN-3-03 — Modal route shells

**Story file:** `rn-3-03-modal-route-shells.md`

**Deliverables:**

- `(modals)/log-food.tsx` — presentation modal shell + `testID="modal-log-food"`
- `(modals)/sunday-check-in.tsx` — presentation modal shell + `testID="modal-sunday-check-in"`
- Navigation helpers: `router.push('/(modals)/log-food')` from nutrition tab stub
- Tab bar hide when modal open (Expo Router modal presentation handles overlay)

**PWA ref:** `LogFoodScreen.tsx`, `SundayWeeklyCheckInFlow.tsx`

**Maestro:** extend `rn-tab-navigation.yaml` — open log-food modal from nutrition stub

**Story gate:** typecheck

---

## RN-3-04 — Settings stack navigation

**Story file:** `rn-3-04-settings-stack-navigation.md`

**Deliverables:**

- `(tabs)/settings/_layout.tsx` stack navigator (hidden from tab bar — gear entry from home stub)
- `(tabs)/settings/index.tsx` — settings hub shell listing panel routes
- `(tabs)/settings/[panel].tsx` — dynamic panel shell (e.g. `account`, `notifications`) with back nav
- `testID` on settings hub and one sample panel

**PWA ref:** `ScreenSettings.tsx` panel routing

**Story gate:** typecheck

---

## RN-3-05 — Error/loading boundaries

**Story file:** `rn-3-05-error-loading-boundaries.md`

**Deliverables:**

- Root `ErrorBoundary` fallback UI (friendly message + retry) — extend Expo Router export
- `SessionLoadingGate` → reusable `AppShellLoading` with branded spinner
- Route-level error boundary for `(tabs)` group
- `testID="app-shell-error"` / `testID="app-shell-loading"` for Maestro/debug

**PWA ref:** `AppSplashScreen`, loading states in `FitnessApp.tsx`

**Story gate:** typecheck

---

## RN-3-06 — Deep link handler stub

**Story file:** `rn-3-06-deep-link-handler-stub.md`

**Deliverables:**

- `lib/deepLinkRouter.ts` — parse `newyouai://` paths per architecture §3
- `useDeepLinkHandler` in root layout — stub handlers: `stretch` → home, `settings/*` → settings stack
- OAuth paths delegate to existing `authOAuth` (no regression)
- Document schemes in `docs/env-matrix.md` + `app.config.ts` `scheme`

**PWA ref:** URL params / `navigate('stretch')` in `FitnessApp.tsx`

**Story gate:** typecheck + auth-all green (OAuth deep links unaffected)

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Tab bar + FY FAB layout & placeholder screens | Full Home/Coach UI (RN-5) |
| `appShellRouting` extract + `useAppShellGate` | Onboarding wizard steps (RN-4) |
| `(onboarding)` stub route group | Fitness cloud sync / hydration (RN-OFFLINE) |
| Modal + settings **shells** (navigable, empty) | Log Food / Sunday check-in **content** (RN-7, RN-8) |
| Error/loading boundaries | Settings panel **content** (RN-10) |
| Deep link stub + OAuth coexistence | Universal links / App Store links (RN-STORE) |
| Maestro tab-navigation smoke | Tab bar hide for workout editor, gallery, etc. (RN-6+) |
| `EXPO_PUBLIC_RN_FEATURE_*` doc note | Feature-flagged tab rollout (optional follow-up) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, `apps/mobile/.env` with `EXPO_PUBLIC_SUPABASE_*`

```bash
# Java (Maestro)
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — use 8082 if 8081 is taken
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — from apps/mobile
npm run test:e2e:auth-all          # regression: RN-2 auth flows
npm run test:e2e:tab-nav           # after RN-3-01 (add script)
```

Auth YAML flows use `openLink` → `http://127.0.0.1:8082` — Metro **must** be on port 8082 when 8081 is occupied.

**Onboarding stub testing (RN-3-02+):** Set dev flag or AsyncStorage key to force `onboardingComplete: false` → user lands on `(onboarding)` stub, not tabs.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

### Epic close (RN-3-06)

- [ ] `rn-tab-navigation.yaml` green (all main tabs + Future You FAB)
- [ ] `rn-tab-navigation.yaml` opens log-food modal from nutrition stub
- [ ] `npm run test:e2e:auth-all` green (no auth regression)
- [ ] Manual: signed-in user with `onboardingComplete: true` → tabs; `false` → onboarding stub
- [ ] Manual: settings stack push/pop from home gear
- [ ] Manual: `newyouai://settings/account` opens settings panel stub (simulator `xcrun simctl openurl`)
- [ ] `epic-rn-3` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-3/core-navigation-app-shell`
2. Run swarm or `dev this story <rn-3-XX>.md` in order 01 → 06
3. One focused PR per story (target; epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-3-06: run tab-nav + auth-all Maestro sweep + mark epic `done`

---

## Definition of done (epic)

1. Signed-in user with onboarding complete sees PWA-parity tab bar + Future You FAB.
2. Signed-in user with onboarding incomplete lands on `(onboarding)` stub (not tabs).
3. Signed-out user cannot reach tabs or onboarding (auth gate).
4. Modal shells (`log-food`, `sunday-check-in`) are reachable from tab stubs.
5. Settings stack navigates hub → panel → back.
6. Root error/loading boundaries render branded fallbacks.
7. Deep link stub routes `newyouai://` paths without breaking OAuth.
8. Tab-navigation Maestro + auth-all Maestro green.

---

## Unblocks

| Downstream | Needs from RN-3 |
|------------|-----------------|
| RN-4 Onboarding v2 | `(onboarding)` route group + `appShellRouting` + `canReachOnboardingWizard` |
| RN-5 Home & coach | `(tabs)/home` route + tab shell |
| RN-6 Workout | `(tabs)/workout` route |
| RN-7 Nutrition | `(tabs)/nutrition` + `(modals)/log-food` |
| RN-8 Progress | `(tabs)/progress` + sunday modal shell |
| RN-9 Future You | `(tabs)/future-you` + FAB |
| RN-10 Settings | Settings stack scaffold |
| M2 timeline | App shell validated → PWA feature freeze candidate |

---

## Risks

| Risk | Mitigation |
|------|------------|
| `useAuthGate` vs `useAppShellGate` race | Shell router owns all post-session redirects; no form-level `router.replace` (RN-2 lesson) |
| Tab bar custom layout complexity | Start with Expo Router `Tabs` + `tabBar` prop custom component |
| `appShellRouting` extract breaks PWA | Re-export from PWA path; run existing Vitest before/after |
| Onboarding stub vs real flow confusion | Clear `testID="onboarding-stub"` + sprint scope lock |
| Metro port 8081 conflict | Always `--port 8082` + Maestro `openLink` already set |
| Deep link conflicts with OAuth | OAuth paths handled first in `deepLinkRouter`; unit tests |

---

## Next action

**`/bmad-swarm epic-rn-3`** — starts at **RN-3-01**.

Or: `dev this story rn-3-01-tab-bar-future-you-fab.md`
