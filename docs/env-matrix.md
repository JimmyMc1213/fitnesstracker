# Environment variable matrix

| Variable | PWA | Mobile | Web | Admin | Notes |
|----------|:---:|:------:|:---:|:-----:|-------|
| `VITE_SUPABASE_URL` | yes | — | — | — | PWA client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | — | — | — | PWA client (recommended) |
| `VITE_SUPABASE_ANON_KEY` | yes | — | — | — | PWA legacy JWT anon key |
| `EXPO_PUBLIC_SUPABASE_URL` | — | yes | — | — | Mobile client — same project URL as PWA |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | yes | — | — | Mobile client (recommended) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — | opt | — | — | Mobile legacy JWT anon key |
| `NEXT_PUBLIC_SUPABASE_URL` | — | — | — | yes | Admin auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | — | — | yes | Admin auth |
| `SUPABASE_SERVICE_ROLE_KEY` | — | — | — | server | Never client-exposed (`VITE_*`, `EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`) |
| `ADMIN_ALLOWED_EMAILS` | — | — | — | yes | Comma-separated staff emails |
| `VITE_PRIVACY_POLICY_URL` | yes | — | — | — | Default `https://newyouai.app/privacy` |
| `VITE_TERMS_URL` | yes | — | — | — | Default `https://newyouai.app/terms` |

Edge function secrets (`OPENAI_API_KEY`, etc.) stay in Supabase dashboard.

## Mobile (`@newyouai/mobile`)

Expo inlines `EXPO_PUBLIC_*` at build time. Values are **not** read from the monorepo root `.env` automatically — use `apps/mobile/.env` for local dev (see [`apps/mobile/.env.example`](../apps/mobile/.env.example)).

### Local dev

Copy the example and set the same Supabase project as the PWA:

```bash
cp apps/mobile/.env.example apps/mobile/.env
# EXPO_PUBLIC_SUPABASE_URL — same as VITE_SUPABASE_URL in root .env
# EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY — same as VITE_SUPABASE_PUBLISHABLE_KEY
```

Restart Metro after changing `.env`.

### EAS builds (preview / production)

Set secrets on the Expo project (not committed):

```bash
cd apps/mobile
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://….supabase.co" --scope project
eas secret:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_…" --scope project
```

`development` / `e2e-test` simulator builds do not need Supabase until RN-2 (auth). Smoke tests (RN-0-03) run without these vars.

### PWA ↔ mobile mapping

| PWA (root `.env`) | Mobile (`apps/mobile/.env`) |
|-------------------|----------------------------|
| `VITE_SUPABASE_URL` | `EXPO_PUBLIC_SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_ANON_KEY` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |

Use the **publishable** key when available (matches PWA `supabaseClient.ts` preference). Never put `SUPABASE_SERVICE_ROLE_KEY` or other server secrets in mobile env.

### Future (documented for RN-1+)

| Variable | Epic | Notes |
|----------|------|-------|
| `EXPO_PUBLIC_RN_FEATURE_*` | RN-3+ | Gradual tab enablement during migration |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | RN-10 | Mirror `VITE_PRIVACY_POLICY_URL` when settings ship |
| `EXPO_PUBLIC_TERMS_URL` | RN-10 | Mirror `VITE_TERMS_URL` when settings ship |
