import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_ENTITLEMENT_ID = "pro";
const PRO_ENTITLEMENT_IDENTIFIERS = new Set(["pro", "New You AI Pro"]);
const KNOWN_PRO_PRODUCT_IDS = new Set(["newyouai_pro_monthly", "newyouai_pro_yearly"]);
const REVENUECAT_API = "https://api.revenuecat.com/v1";

type RevenueCatEntitlement = {
  expires_date?: string | null;
  product_identifier?: string | null;
};

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
    subscriptions?: Record<string, { expires_date?: string | null; product_identifier?: string }>;
  };
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isEntitlementActive(entitlement: RevenueCatEntitlement | undefined): boolean {
  if (!entitlement) return false;
  const expires = entitlement.expires_date?.trim();
  if (!expires) return true;
  const expiresMs = Date.parse(expires);
  return Number.isFinite(expiresMs) && expiresMs > Date.now();
}

function resolveProFromSubscriber(data: RevenueCatSubscriberResponse): {
  isActive: boolean;
  productId: string | null;
  expiresAt: string | null;
} {
  const entitlements = data.subscriber?.entitlements ?? {};
  for (const [key, value] of Object.entries(entitlements)) {
    if (PRO_ENTITLEMENT_IDENTIFIERS.has(key) && isEntitlementActive(value)) {
      return {
        isActive: true,
        productId: value.product_identifier ?? null,
        expiresAt: value.expires_date ?? null,
      };
    }
  }

  const subscriptions = data.subscriber?.subscriptions ?? {};
  for (const sub of Object.values(subscriptions)) {
    const productId = sub.product_identifier ?? "";
    if (!KNOWN_PRO_PRODUCT_IDS.has(productId)) continue;
    const expires = sub.expires_date?.trim();
    if (!expires || Date.parse(expires) > Date.now()) {
      return { isActive: true, productId: productId || null, expiresAt: expires ?? null };
    }
  }

  return { isActive: false, productId: null, expiresAt: null };
}

async function resolveAuthenticatedAdmin(req: Request): Promise<{
  userId: string;
  adminClient: SupabaseClient;
} | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("sync-pro-entitlement: missing Supabase env");
    return null;
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) return null;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { userId: user.id, adminClient };
}

async function fetchRevenueCatSubscriber(
  userId: string,
  apiKey: string,
): Promise<RevenueCatSubscriberResponse | null> {
  const response = await fetch(
    `${REVENUECAT_API}/subscribers/${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("sync-pro-entitlement: RevenueCat lookup failed", {
      userId,
      status: response.status,
      body: body.slice(0, 500),
    });
    return null;
  }

  return (await response.json()) as RevenueCatSubscriberResponse;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const auth = await resolveAuthenticatedAdmin(req);
  if (!auth) {
    return jsonResponse(401, { error: "Sign in to sync subscription." });
  }

  const apiKey = Deno.env.get("REVENUECAT_SECRET_API_KEY")?.trim();
  if (!apiKey) {
    console.error("sync-pro-entitlement: REVENUECAT_SECRET_API_KEY not set");
    return jsonResponse(503, { error: "Subscription sync is not configured." });
  }

  const subscriber = await fetchRevenueCatSubscriber(auth.userId, apiKey);
  if (!subscriber) {
    return jsonResponse(502, { error: "Could not verify subscription." });
  }

  const pro = resolveProFromSubscriber(subscriber);
  const nowIso = new Date().toISOString();
  const { error } = await auth.adminClient.from("future_you_entitlements").upsert(
    {
      user_id: auth.userId,
      entitlement_id: PRO_ENTITLEMENT_ID,
      is_active: pro.isActive,
      product_id: pro.productId,
      expires_at: pro.expiresAt,
      last_event_type: "client_sync",
      last_event_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("sync-pro-entitlement: upsert failed", { userId: auth.userId, error });
    return jsonResponse(500, { error: "Could not save entitlement." });
  }

  console.info("sync-pro-entitlement: updated", {
    userId: auth.userId,
    isActive: pro.isActive,
    expiresAt: pro.expiresAt,
  });

  return jsonResponse(200, { isActive: pro.isActive });
});
