# Expo / EAS — `@newyouai/mobile`

Native iOS app: [`apps/mobile/`](../apps/mobile/)

## Status

| Story | Status |
|-------|--------|
| RN-0-01 Expo scaffold | Done |
| RN-0-02 EAS profiles + dev client | Done |
| RN-0-03 Maestro E2E harness | Done — smoke flow + `e2e-test` profile |
| RN-0-04 Env matrix | Done — `EXPO_PUBLIC_SUPABASE_*` in `docs/env-matrix.md` |
| RN-0-05 CI mobile typecheck | Done — GitHub Actions + turbo env |
| RN-0-06 NativeWind + tokens | Done — `packages/config/tokens.ts`, NativeWind v4 in mobile |
| RN-0-07 Root layout + splash | Done — `ThemeShell`, `BootSplash`, `theme-vars` light/dark |

## Two ways to run locally

### Option A — Expo Go (RN-0-01 only, quickest)

Works for the placeholder scaffold. **Not** sufficient for Maestro, camera, or IAP later.

```bash
cd apps/mobile
npx expo start --ios --port 8082
```

Use `--port 8082` if port 8081 is taken by another project.

### Option B — Dev client (RN-0-02+, required for migration)

Custom native build via EAS. Use this path going forward.

**One-time setup:**

```bash
cd apps/mobile
npm run eas login          # or: npx eas-cli login (NOT npx eas — wrong package)
npm run eas init
```

`eas init` creates the Expo project. Because we use dynamic `app.config.ts`, EAS cannot auto-write the project ID — it is committed in `app.config.ts` under `extra.eas.projectId`.

```bash
npm run eas build -- --profile development --platform ios
```

> **Important:** Use `eas-cli`, not `eas`. Running `npx eas init` pulls a unrelated npm package and fails with `could not determine executable to run`.

When the build finishes, install the `.app` on your simulator (EAS dashboard → download, or follow CLI prompts).

**Daily dev (after dev client is installed on simulator):**

```bash
# from repo root
npm run dev:mobile:client

# or from apps/mobile
npm run ios
```

Press `i` if the simulator does not open automatically.

## Monorepo

- Package: `@newyouai/mobile`
- Metro: `apps/mobile/metro.config.js` (watchFolders → repo root)
- URL scheme: `newyouai://`
- iOS bundle ID: `app.newyouai.mobile`

## EAS profiles

| Profile | Use | Simulator |
|---------|-----|-----------|
| `development` | Dev client for local Metro | Yes |
| `preview` | Internal TestFlight | No |
| `production` | App Store | No |

```bash
cd apps/mobile
npm run eas build -- --profile development --platform ios   # simulator dev client
npm run eas build -- --profile preview --platform ios         # TestFlight internal
npm run eas build -- --profile production --platform ios      # App Store
```

Config: [`apps/mobile/eas.json`](../apps/mobile/eas.json)

## Maestro E2E (RN-0-03)

Smoke tests live in [`apps/mobile/.maestro/`](../apps/mobile/.maestro/). Maestro is **not** an npm dependency — install the CLI once on your Mac.

**Prerequisites:** JDK 17+ (Maestro runs on the JVM). On macOS with Homebrew: `brew install openjdk@17` and ensure `java` is on your `PATH`.

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"   # installer adds this to ~/.zshrc
```

Verify: `maestro --version`

### Local smoke (dev client)

Requires the **dev client** installed on the iOS simulator (RN-0-02) and Metro serving the bundle:

```bash
# Java (Maestro)
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — use 8082 if 8081 is taken by another project
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — from apps/mobile
npm run test:e2e
```

The smoke flow launches `app.newyouai.mobile`, waits for the home screen (`testID: home-title`), and asserts the RN-0-06 placeholder copy.

### Auth Maestro (RN-2)

With Supabase configured in `apps/mobile/.env`, auth flows use `clearState`/`clearKeychain` and connect to Metro via `openLink` → port **8082** (must match Terminal 1).

```bash
npm run test:e2e:auth
npm run test:e2e:auth-all        # epic RN-2 sweep (provisions test user + runs all 4 flows)
MAESTRO_TEST_EMAIL=... MAESTRO_TEST_PASSWORD=... npm run test:e2e:auth-sign-in
MAESTRO_TEST_SIGNUP_NAME=... MAESTRO_TEST_SIGNUP_EMAIL=... MAESTRO_TEST_SIGNUP_PASSWORD=... npm run test:e2e:auth-sign-up
MAESTRO_TEST_EMAIL=... MAESTRO_TEST_PASSWORD=... npm run test:e2e:auth-sign-out
```

See [`sprint-rn-2-auth-session-plan.md`](../_bmad-output/implementation-artifacts/sprint-rn-2-auth-session-plan.md).

**OAuth / Apple (RN-2-03+):** Rebuild the dev client after pulling auth changes (`expo-apple-authentication`, `expo-auth-session`). Apple Sign-In requires the Sign in with Apple capability — verify on a physical device or TestFlight if the simulator sheet fails. Google OAuth redirect URLs: [`docs/env-matrix.md`](env-matrix.md#oauth-redirect-uris-rn-2-03).

**Apple Sign-In (RN-2-04):** Enabled in Supabase (`external.apple`, client ID `app.newyouai.mobile`) and Apple Developer (App ID capability). Rebuild the dev client after changing `app.config.ts` or native auth modules. Full Apple auth testing requires a physical device or TestFlight; simulator behavior varies.

### E2E simulator build (CI / RN-0-05)

The `e2e-test` profile produces a simulator `.app` without a dev client — used by EAS Workflows for Maestro on PRs (future CI job):

```bash
cd apps/mobile
npm run eas build -- --profile e2e-test --platform ios
```

### testID convention

Use `{screen}-{element}` on critical UI (see test design). Smoke flow: `home-screen`, `home-title`.

## Environment

Mobile env vars: [`docs/env-matrix.md`](env-matrix.md) (RN-0-04). Local template: [`apps/mobile/.env.example`](../apps/mobile/.env.example).

Supabase client code lands in RN-2; until then, smoke tests and the placeholder app do not require `.env`.

## Camera permissions (RN-7-07 barcode)

| Permission | Platform | Purpose |
|------------|----------|---------|
| `NSCameraUsageDescription` | iOS | Barcode scanning in Log Food + Future You photo capture |
| `CAMERA` | Android | Same |

Configured in [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) via the `expo-camera` config plugin (`barcodeScannerEnabled: true`). **Rebuild the dev client** after pulling barcode changes — Expo Go does not include native barcode scanning.

Simulator / Maestro: use **Enter barcode manually** in the scanner overlay (no physical camera required).

## Parity gate

PWA stays live at `app.newyouai.app` until RN-PARITY sign-off. See [`pwa-to-rn-migration-plan.md`](../_bmad-output/planning-artifacts/pwa-to-rn-migration-plan.md).
