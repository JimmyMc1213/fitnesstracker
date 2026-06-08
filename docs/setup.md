# New You AI — Monorepo setup

## Prerequisites

- Node 22 (`nvm use`)
- npm 11+
- Supabase CLI (optional, for local backend)

## Install

```bash
npm ci
```

## Development

```bash
npm run dev:pwa      # Product app → http://localhost:5173
npm run dev:web      # Marketing → http://localhost:3000
npm run dev:admin    # Admin → http://localhost:3001
```

## Environment

- Root `.env` is loaded by `apps/pwa` (vite + predev script).
- See [env-matrix.md](./env-matrix.md) for per-app variables.

## Production URLs

| App | Domain |
|-----|--------|
| PWA | https://app.newyouai.app |
| Marketing | https://newyouai.app |
| Admin | https://admin.newyouai.app |

Deploy config: [vercel.md](./vercel.md)

Future mobile: [eas-ios.md](./eas-ios.md) (Phase H, not started)

## Quality gates

```bash
npx turbo run typecheck build test
npm run test:e2e
```
