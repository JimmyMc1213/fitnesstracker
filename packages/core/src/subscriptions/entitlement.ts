/** Keep in sync with supabase/functions/_shared/subscriptions/entitlement.ts */

export type SubscriptionEntitlementRow = {
  is_active?: boolean | null;
  expires_at?: string | null;
};

/** A subscriptions row grants access when it is active and not past its expiration. */
export function isSubscriptionRowEntitled(
  row: SubscriptionEntitlementRow | null | undefined,
  nowMs: number,
): boolean {
  if (!row || row.is_active !== true) return false;
  if (!row.expires_at) return true;
  const expMs = Date.parse(row.expires_at);
  if (Number.isNaN(expMs)) return true;
  return expMs > nowMs;
}

/**
 * Pro access is the union of a live RevenueCat entitlement and the server
 * subscriptions row (paid webhook or admin override).
 */
export function grantsProAccess(input: {
  revenueCatActive: boolean;
  subscription: SubscriptionEntitlementRow | null | undefined;
  nowMs: number;
}): boolean {
  return input.revenueCatActive || isSubscriptionRowEntitled(input.subscription, input.nowMs);
}
