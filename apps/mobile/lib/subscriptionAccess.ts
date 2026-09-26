import { isSubscriptionRowEntitled } from "@newyouai/core";

import { readRevenueCatProAccess } from "@/lib/revenueCat";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type SubscriptionAccessRow = {
  is_active?: boolean | null;
  expires_at?: string | null;
};

/** True when the admin override (or another subscriptions row) grants pro. */
export async function fetchServerSubscriptionGrantsPro(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const sb = getSupabase();
  if (!sb) return false;

  try {
    const {
      data: { session },
    } = await sb.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return false;

    const { data, error } = await sb
      .from("subscriptions")
      .select("is_active, expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return false;

    const row = data as SubscriptionAccessRow;
    return isSubscriptionRowEntitled(
      {
        is_active: row.is_active === true,
        expires_at: typeof row.expires_at === "string" ? row.expires_at : null,
      },
      Date.now(),
    );
  } catch {
    return false;
  }
}

/** Pro from the server override or from an already-active RevenueCat entitlement. */
export async function readGrantedProAccess(): Promise<boolean> {
  const [serverGranted, storeGranted] = await Promise.all([
    fetchServerSubscriptionGrantsPro(),
    readRevenueCatProAccess(),
  ]);
  return serverGranted || storeGranted;
}
