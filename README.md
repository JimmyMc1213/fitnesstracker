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

## Restore point

Before monorepo migration: branch `backup/pre-monorepo-migration`, tag `pre-monorepo-migration`.
