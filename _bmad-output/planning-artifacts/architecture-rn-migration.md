---
name: RN Migration Architecture
phase: 3
status: complete
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
created: 2026-06-08
supersedes: null
---

# Architecture — PWA → React Native Migration

**Project:** New You AI (`fitnesstracker`)  
**Inputs:** migration brief, codebase inventory, technical research  
**Principle:** PWA (`apps/pwa`) unchanged as parity reference until RN-PARITY gate

---

## 1. Target monorepo structure

```
fitnesstracker/
├── apps/
│   ├── pwa/                    # Existing — parity baseline (no feature adds during RN build)
│   ├── web/                    # Out of scope
│   ├── admin/                  # Out of scope
│   └── mobile/                 # NEW — Expo + Expo Router
│       ├── app/                # File-based routes
│       ├── src/
│       │   ├── adapters/       # Storage, notifications, purchases
│       │   ├── components/     # RN-only UI
│       │   └── lib/            # Mobile-specific helpers
│       ├── .maestro/           # E2E flows
│       ├── app.config.ts
│       └── eas.json
├── packages/
│   ├── types/                  # Shared TS types, Zod schemas
│   ├── api-client/             # Supabase + Edge Functions (no DOM)
│   ├── core/                   # Business logic from PWA *.ts
│   ├── config/                 # Tokens, env, tailwind preset
│   └── ui/                     # Optional shared primitives (minimal)
├── supabase/                   # Unchanged at repo root
├── turbo.json
└── docs/
```

---

## 2. Migration pattern

### Vertical slices (recommended)

Build end-to-end features, not horizontal layers:

```
RN-0 scaffold → RN-1 extract types/core for slice → RN-2 auth → RN-3 shell
→ vertical slice: auth + onboarding[0-5] + home tab + Maestro smoke
→ RN-4 full onboarding → RN-5 home → RN-6 workout → …
```

### Shared logic boundaries

**Strict rule:** `packages/*` must not import:
- `window`, `document`, `localStorage`
- `react-dom`, CSS files
- Web-only libraries

**Adapter injection:**

```typescript
// packages/core/storage/types.ts
export interface PersistStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// apps/pwa — localStorage wrapper (future extraction)
// apps/mobile — AsyncStorage wrapper
```

### API client

Single source: extract from `fitnessCloudSync.ts`, `foodSearchService.ts`, `futureYou*Service.ts` into `packages/api-client` with:

```typescript
createApiClient({ supabase, invoke, fetch }) // injected
```

PWA and mobile both use factory; tests mock injectors.

---

## 3. Expo Router navigation map

### Shell routing (mirrors `appShellRouting.ts`)

| PWA state | RN route group |
|-----------|----------------|
| `loading` | Splash in root `_layout` |
| `auth` | `(auth)/*` |
| onboarding incomplete | `(onboarding)/[step]` |
| `app` | `(app)/(tabs)/*` |

### Tab mapping

| PWA `TabId` | Expo route | Notes |
|-------------|------------|-------|
| `home` | `(tabs)/home` | |
| `workout` | `(tabs)/workout` | |
| `nutrition` | `(tabs)/nutrition` | Log Food → modal |
| `progress` | `(tabs)/progress` | |
| `future_you` | `(tabs)/future-you` + FAB | Floating button on tab layout |
| `settings` | `(tabs)/settings` | Panel → stack push |
| `stretch` | `(tabs)/home?mobility=1` | Deep link param |

### Modal / overlay mapping

| PWA overlay | Expo pattern |
|-------------|--------------|
| `LogFoodScreen` | `(modals)/log-food` presentation modal |
| `SundayWeeklyCheckInFlow` | `(modals)/sunday-check-in` |
| Settings panels | `(app)/settings/[panel]` stack |
| Workout history | `(app)/workout/history` |
| Onboarding paywall | `(onboarding)/paywall` |

### Onboarding steps

Dynamic route `(onboarding)/[step].tsx` with step registry mirroring `onboardingSteps.ts` + `onboardingRouting.ts` logic in `packages/core`.

---

## 4. Native platform decisions

| Decision | Value |
|----------|-------|
| Expo workflow | Managed + **dev client** (required for camera, IAP, push) |
| iOS minimum | **15.0** |
| Bundle ID | `app.newyouai.mobile` (confirm in App Store Connect) |
| URL scheme | `newyouai://` |
| Universal links | `app.newyouai.app` paths (Phase RN-STORE) |
| EAS profiles | `development`, `preview` (TestFlight internal), `production` |

### Permissions matrix

| Permission | Feature | Package |
|------------|---------|---------|
| Camera | Future You photo, barcode | `expo-camera` |
| Photo library | Progress pics, upload | `expo-image-picker` |
| Notifications | Reminders | `expo-notifications` |
| Network | All sync | default |

---

## 5. Auth architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Auth screens│────▶│ Supabase GoTrue  │────▶│ SecureStore │
└─────────────┘     └──────────────────┘     └─────────────┘
                            │
                            ▼
                   fitness_user_data sync
                            │
                            ▼
                   packages/core merge
```

- OAuth: `expo-auth-session` + `WebBrowser.openAuthSessionAsync`
- Apple Sign-In: **enabled** (Supabase provider already configured)
- Session: LargeSecureStore or SecureStore adapter per Supabase Expo docs
- RevenueCat: `Purchases.logIn(supabaseUserId)` after auth

---

## 6. Purchases architecture

```
OnboardingPaywall (RN UI, PWA parity)
        │
        ▼
react-native-purchases (RevenueCat)
        │
        ▼
StoreKit 2 (Apple)
        │
        ▼
Entitlement "pro" → subscriptionTier in persist slice → sync to Supabase
```

- Product IDs: `newyou_pro_monthly`, `newyou_pro_yearly` (App Store Connect)
- Restore purchases on settings account panel
- PWA stub behavior preserved in **dev** via `__DEV__` mock tier flag only — not in production builds

---

## 7. Test architecture hooks

| Concern | Location |
|---------|----------|
| Vitest unit | `packages/*/src/**/*.test.ts` |
| Maestro E2E | `apps/mobile/.maestro/*.yaml` |
| testID convention | `{screen}-{element}` e.g. `home-weigh-in-button` |
| CI | `.github/workflows/ci.yml` + optional `.eas/workflows/e2e-ios.yml` |

---

## 8. Traceability hooks

| ID pattern | Example |
|------------|---------|
| FR | `FR-M4` (migration PRD) |
| PWA screen | `W-02` (inventory) |
| Epic | `RN-6` |
| Story | `RN-6-03` |
| Maestro | `rn-workout-session.yaml` |
| Vitest | `workoutAutofill.test.ts` |

Story files: `_bmad-output/implementation-artifacts/rn-{epic}-{story}.md`

---

## 9. Feature flags & rollout

- `EXPO_PUBLIC_RN_FEATURE_*` env flags for gradual tab enablement during development
- PWA remains production at `app.newyouai.app` until RN-PARITY sign-off
- Recommend **PWA feature freeze** after RN-3 (app shell + auth) validated

---

## 10. PWA deprecation

**Default: none.** PWA stays live. Cutover is a separate PO decision after RN-PARITY.

---

## 11. Architecture decisions log

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Expo managed + dev client | Solo dev, first-party modules |
| ADR-002 | NativeWind | Tailwind familiarity from web/admin |
| ADR-003 | Vertical slice migration | Faster parity proof, less rework |
| ADR-004 | AsyncStorage for persist | Matches PWA JSON blob model |
| ADR-005 | RevenueCat for IAP | App Store compliance + velocity |
| ADR-006 | Maestro over Detox | Zero instrumentation, EAS integration |
| ADR-007 | No WebView migration | Rejected anti-pattern |
