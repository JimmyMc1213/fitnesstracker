import {
  clientSupabaseKeyForFetch as clientSupabaseKeyForFetchFromEnv,
  createSupabaseClient,
  isSupabaseConfigured as isSupabaseConfiguredFromEnv,
  type SupabaseEnv,
} from "@newyouai/api-client";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: envTrim(import.meta.env.VITE_SUPABASE_URL),
    publishableKey: envTrim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
    anonKey: envTrim(import.meta.env.VITE_SUPABASE_ANON_KEY),
  };
}

/** Browser-safe Supabase API key: use Publishable (new dashboard), or legacy anon JWT (`eyJ…`). Never use secret/service JWT in the app. */
export function clientSupabaseKeyForFetch(): string {
  return clientSupabaseKeyForFetchFromEnv(getSupabaseEnv());
}

let devLoggedMisconfigured = false;

export function isSupabaseConfigured(): boolean {
  const env = getSupabaseEnv();
  const ok = isSupabaseConfiguredFromEnv(env);

  if (import.meta.env.DEV && !ok && !devLoggedMisconfigured) {
    devLoggedMisconfigured = true;
    const url = envTrim(env.url);
    const key = clientSupabaseKeyForFetchFromEnv(env);
    if (!url) console.info("[Fitcoach] VITE_SUPABASE_URL is missing or empty (check .env in project root).");
    else if (!/^https:\/\/.+/i.test(url)) console.info("[Fitcoach] VITE_SUPABASE_URL must start with https://");
    if (!key) {
      console.info(
        "[Fitcoach] Missing client key, set VITE_SUPABASE_PUBLISHABLE_KEY (recommended) or VITE_SUPABASE_ANON_KEY (legacy JWT anon).",
      );
    } else if (key.length < 12) {
      console.info("[Fitcoach] Supabase client key looks too short, paste the full publishable or anon JWT value.");
    }
  }

  return ok;
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached === undefined) {
    cached = createSupabaseClient(getSupabaseEnv(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cached;
}
