# Vercel monorepo deploy

Three projects, same GitHub repo:

| Project | Root Directory | Domain |
|---------|----------------|--------|
| `newyouai-app` | `apps/pwa` | `app.newyouai.app` |
| `newyouai-web` | `apps/web` | `newyouai.app` |
| `newyouai-admin` | `apps/admin` | `admin.newyouai.app` |

Each app includes a `vercel.json` with monorepo install/build commands.

## Deployed projects

| Vercel project | Root Directory | Domain |
|----------------|----------------|--------|
| `fitnesstracker` | `apps/pwa` | `app.newyouai.app` |
| `newyouai-web` | `apps/web` | `newyouai.app` |
| `newyouai-admin` | `apps/admin` | `admin.newyouai.app` |

Production branch: `monorepo` on all three.

## Phase G checklist

1. ~~Complete turbo build on `monorepo` branch.~~
2. ~~Point existing Vercel project → `apps/pwa`.~~
3. ~~Create web + admin projects.~~
4. ~~DNS: apex + `app` + `admin` records.~~ (apex A → `76.76.21.21`; subdomains CNAME → `cname.vercel-dns.com`)
5. Supabase Auth → add `https://app.newyouai.app/**` redirect URLs.

## Rollback

Document previous root directory and domain mapping before switching production.
