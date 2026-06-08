# Expo / EAS (Phase H — not started)

Mobile app will live at `apps/mobile` when Phase H begins.

## Prerequisites (future)

- Expo SDK aligned with React 18
- EAS project linked to `@newyouai/mobile`
- Shared types from `packages/types` (after PWA extraction)

## Profiles (draft)

| Profile | Use |
|---------|-----|
| `development` | Simulator + dev client |
| `preview` | Internal TestFlight |
| `production` | App Store |

See `turborepo-migration-plan.md` §2.11 for PWA vs Expo feature parity gate before sunsetting the PWA.
