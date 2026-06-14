# Visual parity — PWA vs RN (browser)

Compare PWA and React Native side-by-side in the browser while matching RN UI to the PWA baseline.

## Start both apps

```bash
npm run dev:visual-parity
```

| App | URL |
|-----|-----|
| PWA (reference) | http://localhost:5173 |
| RN (Expo Web) | http://localhost:8086 |

Both launch with:

- **Seed:** `coach-nutrition` (workout done + protein logged → populated Home)
- **Theme:** dark
- **Auth:** bypassed for local visual work only (no sign-in required)
- **Layout:** phone-width frame (~393px) centered in the browser

## Scope

- **Main app tabs first** (Home, Workout, Nutrition, Progress, Future You, Settings)
- **Onboarding** — separate pass later
- **Final sign-off** — still verify on iOS simulator (fonts, safe areas, native sheets)

## Notes

- Expo Web is a first pass; native iOS may differ slightly after browser parity is close.
- Restart servers after changing `EXPO_PUBLIC_*` or `VITE_*` env vars.
- Do not use visual-parity auth bypass in preview/production builds.
