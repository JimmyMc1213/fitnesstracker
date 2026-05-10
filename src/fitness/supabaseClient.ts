import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

/** Browser-safe Supabase API key: use Publishable (new dashboard), or legacy anon JWT (`eyJ…`). Never use secret/service JWT in the app. */
function clientSupabaseKey(): string {
  const publishable = envTrim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const anonJwt = envTrim(import.meta.env.VITE_SUPABASE_ANON_KEY);
  return publishable || anonJwt;
}

let devLoggedMisconfigured = false;

export function isSupabaseConfigured(): boolean {
  const url = envTrim(import.meta.env.VITE_SUPABASE_URL);
  const key = clientSupabaseKey();
  const urlOk = /^https:\/\/.+/i.test(url);
  const keyOk = key.length >= 12;
  const ok = urlOk && keyOk;

  if (import.meta.env.DEV && !ok && !devLoggedMisconfigured) {
    devLoggedMisconfigured = true;
    if (!url) console.info("[Fitcoach] VITE_SUPABASE_URL is missing or empty (check .env in project root).");
    else if (!urlOk) console.info("[Fitcoach] VITE_SUPABASE_URL must start with https://");
    if (!key) {
      console.info(
        "[Fitcoach] Missing client key — set VITE_SUPABASE_PUBLISHABLE_KEY (recommended) or VITE_SUPABASE_ANON_KEY (legacy JWT anon).",
      );
    } else if (!keyOk) {
      console.info("[Fitcoach] Supabase client key looks too short — paste the full publishable or anon JWT value.");
    }
  }

  return ok;
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = envTrim(import.meta.env.VITE_SUPABASE_URL);
  const key = clientSupabaseKey();
  if (cached === undefined) {
    cached = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cached;
}
