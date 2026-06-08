# New You AI

npm workspaces + Turborepo monorepo for the New You AI fitness platform.

## Apps

| Package | Path | Domain | Description |
|---------|------|--------|-------------|
| `@newyouai/pwa` | `apps/pwa` | `app.newyouai.app` | Vite React PWA (product) |
| `@newyouai/web` | `apps/web` | `newyouai.app` | Next.js marketing site |
| `@newyouai/admin` | `apps/admin` | `admin.newyouai.app` | Next.js staff dashboard |

## Commands (repo root)

```bash
npm ci
npm run dev:pwa
npm run dev:web
npm run dev:admin
npm run build
npm run test
npm run test:e2e
npm run typecheck
```

## Packages

| Package | Status |
|---------|--------|
| `@newyouai/config` | Tailwind preset + tsconfig base (used by web/admin) |
| `@newyouai/types` | Stub — types still live in `apps/pwa/src/fitness/types.ts` |
| `@newyouai/api-client`, `@newyouai/core`, `@newyouai/ui` | Stubs for future extraction |

## Migration status

Phases A–G complete on `monorepo` branch. Plan: `_bmad-output/planning-artifacts/turborepo-migration-plan.md`.

## Restore point

Before monorepo migration: branch `backup/pre-monorepo-migration`, tag `pre-monorepo-migration`.
