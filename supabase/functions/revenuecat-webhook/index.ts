import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PRO_ENTITLEMENT_ID = "pro";
const PRO_ENTITLEMENT_IDENTIFIERS = new Set(["pro", "New You AI Pro"]);
const KNOWN_PRO_PRODUCT_IDS = new Set(["newyouai_pro_monthly", "newyouai_pro_yearly"]);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEACTIVATING_EVENT_TYPES = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);

type RevenueCatWebhookEvent = {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  entitlement_id?: string;
  entitlement_ids?: string[];
  product_id?: string;
  store?: string;
  environment?: string;
  period_type?: string;
  expiration_at_ms?: number | null;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function secretMatches(provided: string, expected: string): boolean {
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function isProEvent(event: RevenueCatWebhookEvent): boolean {
  const ids = event.entitlement_ids ?? (event.entitlement_id ? [event.entitlement_id] : null);
  if (ids?.some((id) => PRO_ENTITLEMENT_IDENTIFIERS.has(id))) return true;
  return event.product_id ? KNOWN_PRO_PRODUCT_IDS.has(event.product_id) : false;
}

function computeIsActive(event: RevenueCatWebhookEvent): boolean {
  if (event.type && DEACTIVATING_EVENT_TYPES.has(event.type)) return false;
  const expMs = event.expiration_at_ms ?? null;
  if (expMs == null) return true;
  return expMs > Date.now();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET")?.trim();
  if (!secret) {
    console.error("revenuecat-webhook: REVENUECAT_WEBHOOK_SECRET not set");
    return jsonResponse(500, { error: "Webhook not configured" });
  }

  const authHeader = req.headers.get("Authorization")?.trim() ?? "";
  if (!secretMatches(authHeader, secret)) {
    console.warn("revenuecat-webhook: rejected request with invalid Authorization header");
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("revenuecat-webhook: missing Supabase env");
    return jsonResponse(500, { error: "Server misconfigured" });
  }

  let event: RevenueCatWebhookEvent | undefined;
  try {
    const body = await req.json();
    event = body?.event as RevenueCatWebhookEvent | undefined;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON" });
  }

  if (!event) {
    return jsonResponse(400, { error: "Missing event" });
  }

  const appUserId = event.app_user_id?.trim();
  if (!appUserId || !UUID_RE.test(appUserId)) {
    console.log("revenuecat-webhook: skipping non-uuid app_user_id", {
      type: event.type,
      hasAppUserId: Boolean(appUserId),
    });
    return jsonResponse(200, { received: true, skipped: "unmapped_app_user_id" });
  }

  if (!isProEvent(event)) {
    console.log("revenuecat-webhook: skipping non-pro event", {
      type: event.type,
      productId: event.product_id,
    });
    return jsonResponse(200, { received: true, skipped: "non_pro_event" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const isActive = computeIsActive(event);
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
  const nowIso = new Date().toISOString();

  const { error } = await admin.from("future_you_entitlements").upsert(
    {
      user_id: appUserId,
      entitlement_id: PRO_ENTITLEMENT_ID,
      is_active: isActive,
      product_id: event.product_id ?? null,
      store: event.store ?? null,
      environment: event.environment ?? null,
      period_type: event.period_type ?? null,
      expires_at: expiresAt,
      original_app_user_id: event.original_app_user_id ?? null,
      last_event_type: event.type ?? null,
      last_event_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("revenuecat-webhook: upsert failed", { userId: appUserId, error });
    return jsonResponse(500, { error: "Failed to persist entitlement" });
  }

  console.log("revenuecat-webhook: entitlement updated", {
    userId: appUserId,
    type: event.type,
    isActive,
    expiresAt,
  });

  return jsonResponse(200, { received: true, isActive });
});
