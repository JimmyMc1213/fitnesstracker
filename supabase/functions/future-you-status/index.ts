import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import { FUTURE_YOU_BUCKET } from "../_shared/future-you/paths.ts";
import {
  badStatusResponse,
  buildFutureYouPollResponse,
  isFutureYouJobId,
  notFoundResponse,
  unauthorizedResponse,
  type FutureYouPollJobRow,
} from "./guards.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JOB_SELECT = "id, status, motivation_id, result_photo_path, error, updated_at";

type AuthContext = {
  userId: string;
  userClient: SupabaseClient;
  adminClient: SupabaseClient;
};

async function resolveAuthenticatedContext(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("future-you-status: missing Supabase env");
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

  return { userId: user.id, userClient, adminClient };
}

/** Phase 7 step 30: replace with subscription / StoreKit entitlement check. */
async function isFutureYouEntitled(_userId: string, _adminClient: SupabaseClient): Promise<boolean> {
  const stub = Deno.env.get("FUTURE_YOU_ENTITLEMENT_STUB")?.trim().toLowerCase();
  if (stub === "true" || stub === "1" || stub === "yes") return true;
  return false;
}

async function loadJob(
  userClient: SupabaseClient,
  jobId: string | null,
): Promise<FutureYouPollJobRow | null> {
  if (jobId) {
    const { data, error } = await userClient
      .from("future_you_jobs")
      .select(JOB_SELECT)
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      console.error("future-you-status: job lookup failed", error);
      throw new Error("Could not load generation status.");
    }

    return data as FutureYouPollJobRow | null;
  }

  const { data, error } = await userClient
    .from("future_you_jobs")
    .select(JOB_SELECT)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("future-you-status: latest job lookup failed", error);
    throw new Error("Could not load generation status.");
  }

  return data as FutureYouPollJobRow | null;
}

async function createResultSignedUrl(
  adminClient: SupabaseClient,
  resultPath: string,
): Promise<string | null> {
  const { data, error } = await adminClient.storage
    .from(FUTURE_YOU_BUCKET)
    .createSignedUrl(resultPath, 3600);

  if (error || !data?.signedUrl) {
    console.error("future-you-status: signed URL failed", { resultPath, error });
    return null;
  }

  return data.signedUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = await resolveAuthenticatedContext(req);
    if (!auth) {
      return unauthorizedResponse(corsHeaders);
    }

    const url = new URL(req.url);
    const rawJobId = url.searchParams.get("jobId")?.trim() ?? "";
    const jobId = rawJobId || null;

    if (jobId && !isFutureYouJobId(jobId)) {
      return badStatusResponse("Invalid job id.", corsHeaders);
    }

    const job = await loadJob(auth.userClient, jobId);
    if (!job) {
      return notFoundResponse(corsHeaders);
    }

    const entitled = await isFutureYouEntitled(auth.userId, auth.adminClient);
    let previewSignedUrl: string | null = null;
    let resultSignedUrl: string | null = null;

    if (job.status === "ready" && job.result_photo_path) {
      const signedUrl = await createResultSignedUrl(auth.adminClient, job.result_photo_path);
      if (entitled) {
        resultSignedUrl = signedUrl;
      } else {
        previewSignedUrl = signedUrl;
      }
    }

    const body = buildFutureYouPollResponse(job, { entitled, previewSignedUrl, resultSignedUrl });

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("future-you-status error", e);
    return new Response(JSON.stringify({ error: "Could not load generation status." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
