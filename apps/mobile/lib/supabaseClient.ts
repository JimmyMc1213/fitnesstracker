import {
  createSupabaseClient,
  isSupabaseConfigured as isSupabaseConfiguredFromEnv,
  type SupabaseEnv,
} from "@newyouai/api-client";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseSecureStoreAdapter } from "./supabaseSecureStore";

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: envTrim(process.env.EXPO_PUBLIC_SUPABASE_URL),
    publishableKey: envTrim(process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    anonKey: envTrim(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  };
}

export function isSupabaseConfigured(): boolean {
  return isSupabaseConfiguredFromEnv(getSupabaseEnv());
}

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!isSupabaseConfiguredFromEnv(env)) return null;
  if (cached === undefined) {
    cached = createSupabaseClient(env, {
      auth: {
        storage: getSupabaseSecureStoreAdapter(),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return cached;
}

/** Clears cached client — for tests only. */
export function resetSupabaseClientCache(): void {
  cached = undefined;
}
