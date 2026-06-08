# Vercel monorepo deploy

Three projects, same GitHub repo:

| Project | Root Directory | Domain |
|---------|----------------|--------|
| `newyouai-app` | `apps/pwa` | `app.newyouai.app` |
| `newyouai-web` | `apps/web` | `newyouai.app` |
| `newyouai-admin` | `apps/admin` | `admin.newyouai.app` |

Each app includes a `vercel.json` with monorepo install/build commands.

Until you set **Root Directory** on the existing project, a root `vercel.json` bridges deploys:
- Build: `npx turbo run build --filter=@newyouai/pwa`
- Output: `apps/pwa/dist`

## Phase G checklist

1. Complete turbo build on `monorepo` branch.
2. Point existing Vercel project → `apps/pwa` (then remove root `vercel.json`).
3. Create web + admin projects.
4. DNS: apex + `app` + `admin` CNAMEs.
5. Supabase Auth → add `https://app.newyouai.app/**` redirect URLs.

## Rollback

Document previous root directory and domain mapping before switching production.
