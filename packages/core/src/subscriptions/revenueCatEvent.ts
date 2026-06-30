/** Keep in sync with supabase/functions/_shared/subscriptions/revenueCatEvent.ts */

// Pure mapping of RevenueCat webhook events to our subscriptions row shape.

export type RevenueCatEvent = {
  type?: unknown;
  id?: unknown;
  app_user_id?: unknown;
  product_id?: unknown;
  entitlement_id?: unknown;
  entitlement_ids?: unknown;
  expiration_at_ms?: unknown;
  store?: unknown;
};

export type RevenueCatWebhookBody = {
  event?: RevenueCatEvent;
};

export type SubscriptionRecord = {
  entitlement: string;
  is_active: boolean;
  product_id: string | null;
  store: string | null;
  expires_at: string | null;
  rc_event_id: string | null;
};

export type MappedEvent =
  | { kind: "ignore"; reason: string }
  | { kind: "invalid"; reason: string }
  | { kind: "upsert"; userId: string; record: SubscriptionRecord };

/** Event types we ignore entirely (no entitlement impact for this app). */
const IGNORED_EVENT_TYPES = new Set(["TEST", "SUBSCRIBER_ALIAS", "TRANSFER"]);

/** Types that grant access when no explicit expiration is present (e.g. lifetime / non-renewing). */
const ACTIVE_WITHOUT_EXPIRATION = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
]);

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pickEntitlement(event: RevenueCatEvent): string {
  const ids = event.entitlement_ids;
  if (Array.isArray(ids)) {
    const strings = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
    if (strings.includes("pro")) return "pro";
    if (strings.length > 0) return strings[0];
  }
  return asString(event.entitlement_id) ?? "pro";
}

function expirationMs(event: RevenueCatEvent): number | null {
  const raw = event.expiration_at_ms;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function computeIsActive(
  type: string,
  expirationAtMs: number | null,
  nowMs: number,
): boolean {
  if (type === "EXPIRATION" || type === "SUBSCRIPTION_PAUSED") return false;
  if (expirationAtMs !== null) return expirationAtMs > nowMs;
  return ACTIVE_WITHOUT_EXPIRATION.has(type);
}

/** Map a raw RevenueCat webhook body to an action for the subscriptions table. */
export function mapRevenueCatEvent(
  body: RevenueCatWebhookBody | null | undefined,
  nowMs: number,
): MappedEvent {
  const event = body?.event;
  if (!event || typeof event !== "object") {
    return { kind: "invalid", reason: "Missing event" };
  }

  const type = asString(event.type);
  if (!type) return { kind: "invalid", reason: "Missing event type" };

  if (IGNORED_EVENT_TYPES.has(type)) {
    return { kind: "ignore", reason: `Ignored event type ${type}` };
  }

  const userId = asString(event.app_user_id);
  if (!userId) return { kind: "invalid", reason: "Missing app_user_id" };

  const expMs = expirationMs(event);

  return {
    kind: "upsert",
    userId,
    record: {
      entitlement: pickEntitlement(event),
      is_active: computeIsActive(type, expMs, nowMs),
      product_id: asString(event.product_id),
      store: asString(event.store),
      expires_at: expMs !== null ? new Date(expMs).toISOString() : null,
      rc_event_id: asString(event.id),
    },
  };
}
