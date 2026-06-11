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
# Terminal 1 — from repo root
npm run dev:mobile:client

# Terminal 2 — from apps/mobile
npm run test:e2e
```

The smoke flow launches `app.newyouai.mobile`, waits for the home screen (`testID: home-title`), and asserts the RN-0-01 placeholder copy.

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

## Parity gate

PWA stays live at `app.newyouai.app` until RN-PARITY sign-off. See [`pwa-to-rn-migration-plan.md`](../_bmad-output/planning-artifacts/pwa-to-rn-migration-plan.md).
