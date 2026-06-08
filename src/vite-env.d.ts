/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy dashboard: JWT anon / public (`eyJ…`). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** New dashboard: Publishable key (browser-safe). Preferred when both are set. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Comma-separated emails that skip new-user onboarding (legacy accounts). */
  readonly VITE_LEGACY_USER_EMAILS?: string;
  /** Local dev fallback when VITE_LEGACY_USER_EMAILS is unset (personal account). */
  readonly VITE_DEV_SKIP_EMAIL?: string;
  /** Set at build time on Vercel (`preview` | `production`). */
  readonly VITE_VERCEL_ENV?: string;
  /** Public privacy policy URL linked from Future You consent. */
  readonly VITE_PRIVACY_POLICY_URL?: string;
}
