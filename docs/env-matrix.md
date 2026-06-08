# Environment variable matrix

| Variable | PWA | Web | Admin | Notes |
|----------|:---:|:---:|:-----:|-------|
| `VITE_SUPABASE_URL` | yes | — | — | Client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | — | — | Client |
| `NEXT_PUBLIC_SUPABASE_URL` | — | — | yes | Admin auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | — | yes | Admin auth |
| `SUPABASE_SERVICE_ROLE_KEY` | — | — | server | Never `NEXT_PUBLIC_*` |
| `ADMIN_ALLOWED_EMAILS` | — | — | yes | Comma-separated staff emails |
| `VITE_PRIVACY_POLICY_URL` | yes | — | — | Default `https://newyouai.app/privacy` |
| `VITE_TERMS_URL` | yes | — | — | Default `https://newyouai.app/terms` |

Edge function secrets (`OPENAI_API_KEY`, etc.) stay in Supabase dashboard.
