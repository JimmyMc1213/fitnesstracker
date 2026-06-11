---
name: PWA to React Native Migration — Technical Research
research_type: technical
date: 2026-06-08
stepsCompleted:
  - step-01-init
  - step-02-technical-overview
  - step-03-integration-patterns
  - step-04-architectural-patterns
  - step-05-implementation-research
  - step-06-research-synthesis
status: complete
---

# Technical Research: PWA → React Native Migration

**Topic:** Vite/React tab-state PWA (`apps/pwa`) → Expo React Native (`apps/mobile`)  
**Context:** New You AI monorepo, Supabase backend unchanged, iOS App Store first, solo dev + AI  
**Inputs:** `pwa-to-rn-migration-brief.md`, `pwa-codebase-inventory.md`

---

## Executive summary

| Decision | Recommendation | Confidence |
|----------|----------------|------------|
| Native platform | **Expo managed workflow + dev client + EAS Build** | High |
| Navigation | **Expo Router** (file-based tabs + modal stacks) | High |
| Styling | **NativeWind v4** + tokens from `theme.ts` | High |
| Code sharing | **Turborepo packages** — extract incrementally from PWA | High |
| Auth | **Supabase JS + SecureStore adapter** + `expo-auth-session` OAuth | High |
| Offline/storage | **AsyncStorage** (persist slice) + **SecureStore** (auth) | High |
| Push | **expo-notifications** + APNs; optional Edge Function for token registry | High |
| E2E tests | **Maestro** (local + EAS Workflows) | High |
| Unit tests | **Vitest** in `packages/*` (unchanged) | High |
| IAP / paywall | **RevenueCat (`react-native-purchases`)** — required before App Store with paywall UI | High |
| Anti-pattern | **WebView wrapper** — reject | — |

**IAP decision (PO gate):** The PWA paywall displays real prices ($14.99/mo, $69.99/yr) and sets `subscriptionTier: "pro"` to unlock Future You. Apple [Guideline 3.1.1](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase) requires IAP for digital subscriptions in native apps. **Do not ship App Store build with purchase UI unless StoreKit is wired.** Use RevenueCat for solo-dev velocity; map entitlement `pro` → existing `subscriptionTier` in persist slice.

---

## 1. Expo vs bare React Native

### Recommendation: **Expo (managed + dev client)**

| Factor | Expo | Bare RN |
|--------|------|---------|
| Solo dev + AI | EAS Build, OTA optional, unified config | More native/Xcode maintenance |
| Camera, push, auth | First-party Expo modules | Manual linking |
| Monorepo | Works with npm workspaces + Turborepo | Same, more config |
| Supabase | Official Expo guide + tutorials | Same SDK |
| Maestro E2E | Documented EAS Workflow integration | Same |
| Future You / IAP | `react-native-purchases` via dev client | Same |

**When bare RN would win:** Custom native modules not in Expo, heavy native UIKit. Not applicable here.

**Version target:** Expo SDK 52+ (React Native 0.76+), align with React 18.3 in PWA until deliberate upgrade.

**iOS minimum:** **iOS 15.0** — balances Expo module support and device coverage.

Sources: [Expo Supabase guide](https://docs.expo.dev/guides/using-supabase), [Supabase Expo tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

---

## 2. Code-sharing strategy

### Recommendation: **Monorepo packages — incremental extraction**

```
packages/types/       ← AppState, TabId, API types, Zod schemas
packages/api-client/  ← Supabase client factory, Edge Function invoke (no DOM)
packages/core/        ← coach, workout, nutrition, onboarding, sync merge logic
packages/config/      ← env conventions, brand tokens (extend existing)
packages/ui/          ← minimal shared; most UI stays platform-specific
```

**Extraction order (matches vertical slices):**
1. `types` — copy from `apps/pwa/src/fitness/types.ts` (split DOM-free types)
2. `core` — pure `*.ts` + port Vitest tests first
3. `api-client` — `foodSearchService`, `futureYou*Service`, `fitnessCloudSync` network layer
4. PWA imports from packages (no behavior change) — validates extraction
5. Mobile consumes same packages

**Shareability estimate (validated against inventory):**
- ~40% TS logic portable (97 Vitest files, ~60 high-value for extraction)
- ~0% UI/CSS portable

**Anti-pattern:** Copy-paste PWA files into mobile — use packages with storage/network adapters injected.

---

## 3. Styling: NativeWind vs StyleSheet

### Recommendation: **NativeWind v4**

| Option | Pros | Cons |
|--------|------|------|
| **NativeWind** | Team knows Tailwind from `apps/web`/`apps/admin`; utility-first matches rapid AI-assisted UI | Learning curve for RN-specific patterns |
| StyleSheet | Zero deps, performant | Rebuilding 7.4k CSS lines is slower without utilities |
| Tamagui | Cross-platform design system | New abstraction; PWA doesn't use it |

**Approach:**
- Derive design tokens from `apps/pwa/src/fitness/theme.ts` + CSS variables in `index.css` (colors, spacing, radii)
- Put tokens in `packages/config/tokens.ts`
- NativeWind maps tokens via `tailwind.config` preset shared with web where sensible
- **Do not** port `index.css` literally

---

## 4. Navigation: Expo Router mapping

PWA uses in-memory `TabId` + panel stacks — no URL router.

### Recommended route tree

```
app/
  _layout.tsx                 # Root: auth provider, splash
  index.tsx                   # Redirect: session → (app) or (auth)
  (auth)/
    welcome.tsx
    sign-in.tsx
  (onboarding)/
    [step].tsx                # Dynamic step 0–28, 100, 101
  (app)/
    _layout.tsx               # Tab bar + Future You FAB
    (tabs)/
      home.tsx
      workout.tsx
      nutrition.tsx
      progress.tsx
      settings.tsx
    future-you/
      index.tsx               # Gallery (also reachable from FAB)
      [id].tsx                # Detail
      upload.tsx
  (modals)/
    log-food.tsx
    sunday-check-in.tsx
    workout-summary.tsx
    weigh-in.tsx
    settings/
      [panel].tsx             # you, account, fuel-targets, etc.
```

**Deep linking:** Scheme `newyouai://` + universal links `app.newyouai.app` → map to tab/modal/onboarding step. Encode state PWA currently holds in memory.

**Protected routes:** Expo Router `Stack.Protected` or redirect in root layout based on Supabase session + onboarding completion (mirror `appShellRouting.ts`).

Source: [Expo Router protected routes pattern](https://docs.expo.dev/router/advanced/authentication/)

---

## 5. Offline & storage

PWA: `localStorage` (`fitcoach:persist:v1`) + debounced Supabase push — **not** offline-first precache.

### Recommendation

| Data | Native storage |
|------|----------------|
| Auth session | `expo-secure-store` via Supabase auth adapter (or LargeSecureStore pattern for large JWT) |
| Fitness persist slice | `@react-native-async-storage/async-storage` — same JSON schema |
| Onboarding draft | AsyncStorage — same key strategy as PWA |
| Sensitive flags | SecureStore |

**Sync:** Reuse `mergePersistedFitnessSlices` from `packages/core` — inject `StorageAdapter` interface:

```typescript
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

**No WatermelonDB/SQLite** for MVP — matches PWA complexity; revisit if perf issues on large history.

Sources: [Supabase RN auth storage](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth)

---

## 6. Auth adapter pattern

### Recommendation

| Method | Implementation |
|--------|----------------|
| Email/password | `supabase.auth.signInWithPassword` / `signUp` — same as PWA |
| Google OAuth | `expo-auth-session` + Supabase OAuth redirect |
| Apple Sign-In | **Enable on native** — required for App Store if other social login offered; use Supabase Apple provider |
| Session persist | SecureStore adapter, `detectSessionInUrl: false` |
| Deep link return | `expo-linking` + handle OAuth callback |

**Env vars:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (mirror PWA naming in `docs/env-matrix.md`).

---

## 7. Push notifications

PWA: Web Notifications + `notification-sw.js` + `notificationScheduler.ts`.

### Recommendation: **expo-notifications**

| PWA | RN |
|-----|-----|
| `Notification.requestPermission()` | `Notifications.requestPermissionsAsync()` |
| Service worker show | `Notifications.scheduleNotificationAsync()` |
| Context-aware copy | Port `notificationScheduler.ts` to `packages/core` |

**Backend gap:** PWA has no push token table. For reliable cross-device push on native, add optional Supabase table + Edge Function to register APNs tokens (adapter-only, not schema redesign of fitness data). **Defer token registry to RN-PUSH epic** — local scheduled notifications can ship first for parity with PWA local scheduling.

---

## 8. Library replacement matrix

| PWA dependency | RN replacement | Notes |
|----------------|----------------|-------|
| `@supabase/supabase-js` | Same | RN-compatible |
| `react` / `react-dom` | `react-native` | 18.x align |
| `framer-motion` | `react-native-reanimated` + `react-native-gesture-handler` | Motion parity, not pixel-perfect |
| `@ark-ui/react` | `@gorhom/bottom-sheet`, RN `Modal` | Sheets/overlays |
| `@dnd-kit/*` | `react-native-draggable-flatlist` | Workout exercise reorder |
| `@zxing/browser` | `expo-camera` + barcode scanning API | Nutrition barcode |
| `@tabler/icons-react` | `@tabler/icons-react-native` or `lucide-react-native` | Icon parity |
| Web Notifications | `expo-notifications` | See §7 |
| `localStorage` | AsyncStorage + adapter | See §5 |
| Paywall stub | `react-native-purchases` (RevenueCat) | See §9 |

---

## 9. IAP / StoreKit recommendation

### Context

- PWA: `OnboardingPaywall` → `onSelectTier("pro")` sets local `subscriptionTier` — **no payment processor**
- Prices hardcoded in `paywallPlans.ts`: $14.99/mo (14-day trial), $69.99/yr
- Future You entitlement gated on `subscriptionTier === "pro"`

### Recommendation: **RevenueCat for MVP App Store path**

| Approach | Verdict |
|----------|---------|
| Keep PWA stub on native | ❌ App Store rejection if purchase UI shown |
| Raw StoreKit 2 only | ✅ Possible but slower for solo dev |
| **RevenueCat** | ✅ **Recommended** — wraps StoreKit, sandbox testing, links to Supabase user ID |

**Implementation:**
1. Create App Store Connect subscription products (monthly + yearly) matching PWA price points
2. RevenueCat entitlement `pro` → sync to `subscriptionTier` in persist slice on purchase/restore
3. Custom paywall UI matching PWA (`OnboardingPaywall`) — use RevenueCat offerings for live prices, not hardcoded
4. Webhook (optional): RevenueCat → Supabase edge function for server-side tier sync

**Phasing:**
- **RN-4 onboarding:** Paywall UI parity with StoreKit sandbox (RevenueCat)
- **RN-STORE:** App Store products live before production submission
- **TestFlight:** Sandbox IAP testing required

Sources: [RevenueCat Expo docs](https://www.revenuecat.com/docs/getting-started/installation/expo), [Expo + RevenueCat tutorial](https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial)

---

## 10. Anti-patterns to avoid

1. **WebView wrapper** — Apple rejects thin shells; no parity guarantees
2. **Port all components before wiring one flow** — use vertical slices
3. **DOM imports in shared packages** — breaks mobile bundle
4. **Expo Go for E2E/IAP testing** — use dev client builds
5. **Hardcoded paywall prices on native** — use StoreKit/RevenueCat offerings
6. **Sunset PWA before parity gate** — brief requires PWA stays live

---

## 11. Test strategy alignment

| Layer | Tool | Notes |
|-------|------|-------|
| Shared logic | Vitest in `packages/*` | Port tests before UI |
| Mobile unit | Vitest + `@testing-library/react-native` (optional) | Lighter than PWA |
| E2E iOS | **Maestro** | `.maestro/*.yaml`, `testID` on critical elements |
| CI | GitHub Actions + EAS Workflow | Mirror FTI-68 pattern |

Maestro: no npm deps in app; tests run against dev client/simulator build. EAS `e2e-test` profile for CI.

Sources: [Maestro React Native](https://docs.maestro.dev/get-started/supported-platform/react-native), [Expo EAS Maestro workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)

---

## 12. Open items for Phase 3 architecture

- [ ] Exact universal link URL schema
- [ ] RevenueCat ↔ Supabase user ID linking strategy
- [ ] Push token Edge Function spec (RN-PUSH)
- [ ] Feature flag mechanism for gradual rollout

---

## References

1. [Expo — Using Supabase](https://docs.expo.dev/guides/using-supabase)
2. [Supabase — Expo React Native tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
3. [Supabase — Social auth Expo](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth)
4. [Maestro — React Native](https://docs.maestro.dev/get-started/supported-platform/react-native)
5. [Expo — E2E with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
6. [RevenueCat — Expo installation](https://www.revenuecat.com/docs/getting-started/installation/expo)
7. [Apple App Store Review Guidelines 3.1.1](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)
