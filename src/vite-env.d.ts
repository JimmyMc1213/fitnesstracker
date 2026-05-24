/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy dashboard: JWT anon / public (`eyJ…`). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** New dashboard: Publishable key (browser-safe). Preferred when both are set. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Comma-separated emails that skip new-user onboarding (legacy accounts). */
  readonly VITE_LEGACY_USER_EMAILS?: string;
  /** Set at build time on Vercel (`preview` | `production`). */
  readonly VITE_VERCEL_ENV?: string;
}
