# Vercel monorepo deploy

Three **separate** Vercel projects, same GitHub repo. Admin is staff-only backend — never deploy it to the consumer app project.

| Project | Root Directory | Domain | Production branch |
|---------|----------------|--------|-------------------|
| `fitnesstracker` (PWA) | `apps/pwa` | `app.newyouai.app` | `monorepo` or `main` |
| `newyouai-web` | `apps/web` | `newyouai.app` | `monorepo` or `main` |
| `newyouai-admin` | `apps/admin` | `admin.newyouai.app` | **`admin`** |

Each app includes a `vercel.json` with monorepo install/build commands and `turbo-ignore` so a push that only touches `apps/admin/` does **not** rebuild the PWA or marketing site.

## Admin (`admin.newyouai.app`)

- Vercel project: **`newyouai-admin`** only — Root Directory **`apps/admin`**
- Production branch: **`admin`**
- Required env (Vercel → newyouai-admin → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_ALLOWED_EMAILS` (comma-separated staff emails)
  - `NEXT_PUBLIC_ADMIN_SITE_URL` = `https://admin.newyouai.app`
  - `NEXT_PUBLIC_PWA_URL` = `https://app.newyouai.app` (impersonation only)

## Supabase Auth redirect URLs

Add **both** (different products):

- `https://app.newyouai.app/**` — consumer PWA
- `https://admin.newyouai.app/**` — staff magic-link sign-in

## Phase G checklist

1. ~~Complete turbo build on `monorepo` branch.~~
2. ~~Point existing Vercel project → `apps/pwa`.~~
3. ~~Create web + admin projects.~~
4. ~~DNS: apex + `app` + `admin` records.~~ (apex A → `76.76.21.21`; subdomains CNAME → `cname.vercel-dns.com`)
5. Supabase Auth → add redirect URLs above.

## Rollback

Document previous root directory and domain mapping before switching production.
