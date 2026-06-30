import "server-only";

import { createAdminClient } from "../supabase-admin";
import { isSupabaseConfigured } from "../env";
import { PROVIDERS, getProvider, type ProviderId, type ProviderState } from "./types";

type IntegrationRow = {
  provider: string;
  enabled: boolean;
  credentials: Record<string, string> | null;
  config: Record<string, unknown> | null;
  updated_at: string;
};

/**
 * Reads the stored credentials for a provider from the service-role-only
 * `admin_integrations` table. Returns null when not configured. Credentials are
 * never sent to the browser — only consumed in server code (adapters).
 */
export async function getProviderCredentials(id: ProviderId): Promise<Record<string, string> | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_integrations")
      .select("credentials, enabled")
      .eq("provider", id)
      .maybeSingle<IntegrationRow>();
    if (error || !data || !data.enabled) return null;
    return (data.credentials as Record<string, string> | null) ?? null;
  } catch {
    return null;
  }
}

/** Returns whether a provider has every required credential field stored and is enabled. */
export async function isProviderConnected(id: ProviderId): Promise<boolean> {
  const def = getProvider(id);
  if (def.stub) return false;
  const creds = await getProviderCredentials(id);
  if (!creds) return false;
  return def.fields.every((f) => Boolean(creds[f.key]?.trim?.()));
}

/** Lists every provider's connection state for the Integrations settings page. */
export async function listProviderStates(): Promise<ProviderState[]> {
  const rowsById = new Map<string, IntegrationRow>();
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("admin_integrations")
        .select("provider, enabled, credentials, config, updated_at");
      for (const row of (data as IntegrationRow[] | null) ?? []) {
        rowsById.set(row.provider, row);
      }
    } catch {
      // fall through to defaults
    }
  }
  return PROVIDERS.map((def) => {
    const row = rowsById.get(def.id);
    const creds = (row?.credentials as Record<string, string> | null) ?? {};
    return {
      id: def.id,
      enabled: Boolean(row?.enabled),
      configuredFields: def.fields.filter((f) => Boolean(creds[f.key])).map((f) => f.key),
    };
  });
}
