import { clientSupabaseKeyForFetch } from "@newyouai/api-client";

import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabaseClient";

/** Push RevenueCat pro status to the server after purchase, restore, or sign-in. */
export async function syncProEntitlementToServer(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const sb = getSupabase();
  if (!sb) return false;

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return false;

  const baseUrl = getSupabaseEnv().url.replace(/\/+$/, "");
  const url = `${baseUrl}/functions/v1/sync-pro-entitlement`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: clientSupabaseKeyForFetch(getSupabaseEnv()),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("[syncProEntitlement] server sync failed", response.status);
      return false;
    }

    const data = (await response.json()) as { isActive?: boolean };
    return data.isActive === true;
  } catch (error) {
    console.warn("[syncProEntitlement] request failed", error);
    return false;
  }
}
