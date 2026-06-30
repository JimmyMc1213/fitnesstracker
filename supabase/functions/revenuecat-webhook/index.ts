import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
  mapRevenueCatEvent,
  type RevenueCatWebhookBody,
} from "../_shared/subscriptions/revenueCatEvent.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verify the inbound request carries the shared secret configured in the
 * RevenueCat dashboard (Integrations -> Webhooks -> Authorization header).
 */
function isAuthorized(req: Request): boolean {
  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH")?.trim();
  if (!expected) {
    console.error("revenuecat-webhook: REVENUECAT_WEBHOOK_AUTH not set");
    return false;
  }
  const provided = req.headers.get("Authorization")?.trim() ?? "";
  return provided === expected;
}

function getAdminClient(): SupabaseClient | null {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("revenuecat-webhook: missing Supabase env");
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!isAuthorized(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: RevenueCatWebhookBody | null;
  try {
    body = (await req.json()) as RevenueCatWebhookBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const mapped = mapRevenueCatEvent(body, Date.now());

  if (mapped.kind === "invalid") {
    console.warn("revenuecat-webhook: invalid event", mapped.reason);
    return jsonResponse({ error: mapped.reason }, 400);
  }

  if (mapped.kind === "ignore") {
    return jsonResponse({ ok: true, ignored: mapped.reason });
  }

  const admin = getAdminClient();
  if (!admin) {
    return jsonResponse({ error: "Server not configured" }, 500);
  }

  const { userId, record } = mapped;

  try {
    // Idempotency: skip exact webhook redeliveries (same RevenueCat event id).
    if (record.rc_event_id) {
      const { data: existing } = await admin
        .from("subscriptions")
        .select("rc_event_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing?.rc_event_id && existing.rc_event_id === record.rc_event_id) {
        return jsonResponse({ ok: true, deduped: true });
      }
    }

    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        entitlement: record.entitlement,
        is_active: record.is_active,
        product_id: record.product_id,
        store: record.store,
        expires_at: record.expires_at,
        rc_event_id: record.rc_event_id,
        raw: body?.event ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("revenuecat-webhook: upsert failed", error);
      return jsonResponse({ error: "Could not persist subscription" }, 500);
    }

    console.info("revenuecat-webhook: applied", {
      userId,
      isActive: record.is_active,
      productId: record.product_id,
      eventId: record.rc_event_id,
    });

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error("revenuecat-webhook error", e);
    return jsonResponse({ error: "Webhook processing failed" }, 500);
  }
});
