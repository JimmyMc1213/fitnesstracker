import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import {
  FUTURE_YOU_BUCKET,
  buildFutureYouPreviewPath,
} from "../_shared/future-you/paths.ts";
import { buildFutureYouPreviewPng } from "../_shared/future-you/previewImage.ts";
import {
  FUTURE_YOU_JOB_STALE_ERROR,
  isFutureYouJobStale,
} from "../_shared/future-you/staleJob.ts";
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

function isStubAllowed(): boolean {
  const url = Deno.env.get("SUPABASE_URL")?.toLowerCase() ?? "";
  return url.includes("localhost") || url.includes("127.0.0.1") || url.includes("kong");
}

/** Reads public.future_you_entitlements (RevenueCat webhook / sync-pro-entitlement). */
async function isFutureYouEntitled(userId: string, adminClient: SupabaseClient): Promise<boolean> {
  const { data, error } = await adminClient
    .from("future_you_entitlements")
    .select("is_active, expires_at")
    .eq("user_id", userId)
    .eq("entitlement_id", "pro")
    .maybeSingle();

  if (error) {
    console.error("future-you-status: entitlement lookup failed", error);
  } else if (data?.is_active) {
    const expiresAtMs = data.expires_at ? new Date(data.expires_at).getTime() : null;
    if (expiresAtMs == null || expiresAtMs > Date.now()) return true;
  }

  if (isStubAllowed()) {
    const stub = Deno.env.get("FUTURE_YOU_ENTITLEMENT_STUB")?.trim().toLowerCase();
    if (stub === "true" || stub === "1" || stub === "yes") {
      console.warn("future-you-status: granting entitlement via local dev stub");
      return true;
    }
  }

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

async function createStorageSignedUrl(
  adminClient: SupabaseClient,
  path: string,
): Promise<string | null> {
  const { data, error } = await adminClient.storage
    .from(FUTURE_YOU_BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    console.error("future-you-status: signed URL failed", { path, error });
    return null;
  }

  return data.signedUrl;
}

/** Backfill teaser objects for jobs that finished before preview uploads existed. */
async function ensurePreviewObject(
  adminClient: SupabaseClient,
  userId: string,
  job: FutureYouPollJobRow,
): Promise<string | null> {
  const previewPath = buildFutureYouPreviewPath(userId, job.id);
  const existing = await createStorageSignedUrl(adminClient, previewPath);
  if (existing) return previewPath;

  if (!job.result_photo_path) return null;

  const { data, error } = await adminClient.storage
    .from(FUTURE_YOU_BUCKET)
    .download(job.result_photo_path);
  if (error || !data) {
    console.error("future-you-status: preview backfill download failed", {
      jobId: job.id,
      resultPath: job.result_photo_path,
      error,
    });
    return null;
  }

  try {
    const resultBytes = new Uint8Array(await data.arrayBuffer());
    const previewBytes = await buildFutureYouPreviewPng(resultBytes);
    const { error: uploadError } = await adminClient.storage
      .from(FUTURE_YOU_BUCKET)
      .upload(previewPath, previewBytes, {
        contentType: "image/png",
        upsert: true,
      });
    if (uploadError) {
      console.error("future-you-status: preview backfill upload failed", {
        jobId: job.id,
        previewPath,
        uploadError,
      });
      return null;
    }
    console.info("future-you-status: preview backfilled", { jobId: job.id, previewPath });
    return previewPath;
  } catch (previewError) {
    console.error("future-you-status: preview backfill encode failed", {
      jobId: job.id,
      previewError,
    });
    return null;
  }
}

async function reconcileStaleJob(
  adminClient: SupabaseClient,
  userId: string,
  job: FutureYouPollJobRow,
): Promise<FutureYouPollJobRow> {
  if (!isFutureYouJobStale(job.updated_at, job.status)) return job;

  console.warn("future-you-status: failing stale job", {
    jobId: job.id,
    status: job.status,
    updatedAt: job.updated_at,
  });

  const updatedAt = new Date().toISOString();
  const { error } = await adminClient
    .from("future_you_jobs")
    .update({
      status: "failed",
      error: FUTURE_YOU_JOB_STALE_ERROR,
      updated_at: updatedAt,
    })
    .eq("id", job.id)
    .eq("user_id", userId);

  if (error) {
    console.error("future-you-status: stale job update failed", { jobId: job.id, error });
    return job;
  }

  return {
    ...job,
    status: "failed",
    error: FUTURE_YOU_JOB_STALE_ERROR,
    updated_at: updatedAt,
  };
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

    let job = await loadJob(auth.userClient, jobId);
    if (!job) {
      return notFoundResponse(corsHeaders);
    }

    job = await reconcileStaleJob(auth.adminClient, auth.userId, job);

    const entitled = await isFutureYouEntitled(auth.userId, auth.adminClient);
    let previewSignedUrl: string | null = null;
    let resultSignedUrl: string | null = null;

    if (job.status === "ready" && job.result_photo_path) {
      if (entitled) {
        resultSignedUrl = await createStorageSignedUrl(auth.adminClient, job.result_photo_path);
      } else {
        const previewPath =
          (await ensurePreviewObject(auth.adminClient, auth.userId, job)) ??
          buildFutureYouPreviewPath(auth.userId, job.id);
        previewSignedUrl = await createStorageSignedUrl(auth.adminClient, previewPath);
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
