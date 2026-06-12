import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";

export type SupabaseEnv = {
  url: string;
  publishableKey?: string;
  anonKey?: string;
};

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

/** Browser-safe Supabase API key: prefer publishable (new dashboard), else legacy anon JWT (`eyJ…`). */
export function clientSupabaseKeyForFetch(env: SupabaseEnv): string {
  const publishable = envTrim(env.publishableKey);
  const anonJwt = envTrim(env.anonKey);
  return publishable || anonJwt;
}

export function isSupabaseConfigured(env: SupabaseEnv): boolean {
  const url = envTrim(env.url);
  const key = clientSupabaseKeyForFetch(env);
  const urlOk = /^https:\/\/.+/i.test(url);
  const keyOk = key.length >= 12;
  return urlOk && keyOk;
}

export function createSupabaseClient(
  env: SupabaseEnv,
  options?: SupabaseClientOptions<"public">,
): SupabaseClient | null {
  if (!isSupabaseConfigured(env)) return null;
  const url = envTrim(env.url);
  const key = clientSupabaseKeyForFetch(env);
  return createClient(url, key, options);
}
