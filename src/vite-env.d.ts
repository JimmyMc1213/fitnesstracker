/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy dashboard: JWT anon / public (`eyJ…`). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** New dashboard: Publishable key (browser-safe). Preferred when both are set. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
