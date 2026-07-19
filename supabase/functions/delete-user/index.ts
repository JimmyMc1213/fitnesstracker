import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

import { purgeUserFutureYou } from "../_shared/future-you/purgeUserFutureYou.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed", step: "method" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized", step: "auth_header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("delete-user: missing Supabase env");
      return jsonResponse({ error: "Server misconfigured", step: "env" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("delete-user: getUser failed", userError);
      return jsonResponse({ error: "Unauthorized", step: "get_user" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dryRun === true;
    if (dryRun) {
      return jsonResponse({ ok: true, dryRun: true, userId: user.id });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let removedFutureYouObjects = 0;
    try {
      const purged = await purgeUserFutureYou(adminClient, user.id);
      removedFutureYouObjects = purged.removedObjects;
      console.info("delete-user: purged Future You", {
        userId: user.id,
        removedObjects: removedFutureYouObjects,
      });
    } catch (purgeError) {
      console.error("delete-user: Future You purge failed", purgeError);
      return jsonResponse(
        {
          error: "Could not delete your Future You data. Try again.",
          step: "future_you_purge",
        },
        500,
      );
    }

    const { error: dataDeleteError } = await adminClient
      .from("fitness_user_data")
      .delete()
      .eq("user_id", user.id);
    if (dataDeleteError) {
      console.error("delete-user: fitness_user_data", dataDeleteError);
      return jsonResponse(
        {
          error: "Could not delete your data. Try again.",
          step: "fitness_user_data",
          debug: { removedFutureYouObjects },
        },
        500,
      );
    }

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error("delete-user: auth.admin.deleteUser", authDeleteError);
      return jsonResponse(
        {
          error: "Could not delete your account. Try again.",
          step: "auth_delete",
          debug: {
            removedFutureYouObjects,
            authDeleteMessage: authDeleteError.message,
          },
        },
        500,
      );
    }

    return jsonResponse({ ok: true, debug: { removedFutureYouObjects } });
  } catch (e) {
    console.error("delete-user error", e);
    return jsonResponse({ error: "Account deletion failed. Try again.", step: "unexpected" }, 500);
  }
});
