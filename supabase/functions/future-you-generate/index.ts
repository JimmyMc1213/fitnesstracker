import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

import { enforceMinimumAge } from "../_shared/age/resolveUserAge.ts";
import { enforceAllowedRegion } from "../_shared/region/resolveUserRegion.ts";
import { buildFutureYouPrompt } from "../_shared/future-you/buildFutureYouPrompt.ts";
import {
  FUTURE_YOU_BUCKET,
  buildFutureYouResultPath,
} from "../_shared/future-you/paths.ts";
import {
  FUTURE_YOU_JOB_STALE_ERROR,
  isFutureYouJobStale,
} from "../_shared/future-you/staleJob.ts";
import {
  badGenerateResponse,
  conflictActiveJobResponse,
  unauthorizedResponse,
  validateFutureYouGenerateRequest,
  type FutureYouGenerateRequest,
} from "./guards.ts";
import {
  getFutureYouImageProvider,
  ImageProviderUnavailableError,
  type FutureYouImageProvider,
} from "./providers/index.ts";
import { formatGenerationError, ImageProviderError } from "./providers/types.ts";

// EdgeRuntime is provided as a global by the Supabase edge runtime at deploy
// time (via the edge-runtime.d.ts import above), but standalone `deno check`
// does not resolve it. Declare the minimal shape we use so type-checking passes.
declare global {
  // deno-lint-ignore no-var
  var EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ActiveJobRow = {
  id: string;
  status: string;
  updated_at: string;
};

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
    console.error("future-you-generate: missing Supabase env");
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

async function findActiveJob(adminClient: SupabaseClient, userId: string): Promise<ActiveJobRow | null> {
  const { data, error } = await adminClient
    .from("future_you_jobs")
    .select("id, status, updated_at")
    .eq("user_id", userId)
    .in("status", ["queued", "generating"])
    .maybeSingle();

  if (error) {
    console.error("future-you-generate: active job lookup failed", error);
    throw new Error("Could not start generation.");
  }

  return data as ActiveJobRow | null;
}

async function failJob(
  adminClient: SupabaseClient,
  jobId: string,
  userId: string,
  message: string,
) {
  await updateJob(adminClient, jobId, userId, {
    status: "failed",
    error: message,
  });
}

/** Clear stale in-flight jobs so users can retry after edge timeouts. */
async function reconcileStaleActiveJob(
  adminClient: SupabaseClient,
  userId: string,
): Promise<ActiveJobRow | null> {
  const active = await findActiveJob(adminClient, userId);
  if (!active) return null;
  if (!isFutureYouJobStale(active.updated_at, active.status)) return active;

  console.warn("future-you-generate: failing stale active job", {
    jobId: active.id,
    status: active.status,
    updatedAt: active.updated_at,
  });
  await failJob(adminClient, active.id, userId, FUTURE_YOU_JOB_STALE_ERROR);
  return null;
}

async function updateJob(
  adminClient: SupabaseClient,
  jobId: string,
  userId: string,
  patch: {
    status?: "queued" | "generating" | "ready" | "failed";
    result_photo_path?: string | null;
    error?: string | null;
    revised_prompt?: string | null;
  },
) {
  const { error } = await adminClient
    .from("future_you_jobs")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", userId);

  if (error) {
    console.error("future-you-generate: job update failed", { jobId, patch, error });
    throw new Error("Could not update generation job.");
  }
}

/**
 * Mark a job ready. Persists revised_prompt when the column exists; if migration
 * 008 has not been applied yet, falls back to a ready update without it so the
 * generation still completes. The revised prompt is logged regardless.
 */
async function markJobReady(
  adminClient: SupabaseClient,
  jobId: string,
  userId: string,
  resultPath: string,
  revisedPrompt: string | undefined,
) {
  try {
    await updateJob(adminClient, jobId, userId, {
      status: "ready",
      result_photo_path: resultPath,
      error: null,
      revised_prompt: revisedPrompt ?? null,
    });
  } catch (error) {
    console.warn(
      "future-you-generate: ready update with revised_prompt failed, retrying without it",
      { jobId, error },
    );
    await updateJob(adminClient, jobId, userId, {
      status: "ready",
      result_photo_path: resultPath,
      error: null,
    });
  }
}

function detectImageMime(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

async function downloadSourcePhoto(
  adminClient: SupabaseClient,
  sourcePath: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const { data, error } = await adminClient.storage.from(FUTURE_YOU_BUCKET).download(sourcePath);
  if (error || !data) {
    throw new Error("Source photo not found.");
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  if (!bytes.length) {
    throw new Error("Source photo is empty.");
  }

  return { bytes, mimeType: detectImageMime(bytes) };
}

async function runGenerationJob(
  adminClient: SupabaseClient,
  userId: string,
  jobId: string,
  request: FutureYouGenerateRequest,
  provider: FutureYouImageProvider,
) {
  try {
    await updateJob(adminClient, jobId, userId, { status: "generating", error: null });

    const prompt = buildFutureYouPrompt({
      profile: request.profile,
      motivationId: request.motivationId,
      timeline: request.timeline,
    });

    const { bytes, mimeType } = await downloadSourcePhoto(adminClient, request.sourcePath);

    console.log("future-you-generate: calling provider", {
      jobId,
      provider: provider.id,
      sourceBytes: bytes.length,
      promptLength: prompt.length,
    });

    const { imageBytes, revisedPrompt } = await provider.generate(bytes, mimeType, prompt);

    console.log("future-you-generate: generation complete", {
      jobId,
      provider: provider.id,
      revisedPrompt: revisedPrompt ?? null,
    });

    const resultPath = buildFutureYouResultPath(userId, jobId);
    const { error: uploadError } = await adminClient.storage
      .from(FUTURE_YOU_BUCKET)
      .upload(resultPath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      throw new Error("Could not save generated image.");
    }

    await markJobReady(adminClient, jobId, userId, resultPath, revisedPrompt);
  } catch (error) {
    const message = formatGenerationError(error);
    console.error("future-you-generate: job failed", {
      jobId,
      message,
      ...(error instanceof ImageProviderError
        ? { status: error.status, body: error.body.slice(0, 1000) }
        : { error }),
    });
    await updateJob(adminClient, jobId, userId, {
      status: "failed",
      error: message,
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
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

    const ageBlock = await enforceMinimumAge(auth.adminClient, auth.userId, corsHeaders);
    if (ageBlock) {
      return ageBlock;
    }

    const regionBlock = await enforceAllowedRegion(auth.adminClient, auth.userId, corsHeaders);
    if (regionBlock) {
      return regionBlock;
    }

    let provider: FutureYouImageProvider;
    try {
      provider = getFutureYouImageProvider();
    } catch (error) {
      if (error instanceof ImageProviderUnavailableError) {
        console.error("future-you-generate: image provider unavailable", error.message);
        return new Response(JSON.stringify({ error: "Generation is temporarily unavailable." }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    const body = await req.json().catch(() => ({}));
    const validated = validateFutureYouGenerateRequest(body, auth.userId);
    if (!validated.ok) {
      return badGenerateResponse(validated.error, validated.status, corsHeaders);
    }

    const activeJob = await reconcileStaleActiveJob(auth.adminClient, auth.userId);
    if (activeJob) {
      return conflictActiveJobResponse(activeJob.id, activeJob.status, corsHeaders);
    }

    const { error: sourceDownloadError } = await auth.adminClient.storage
      .from(FUTURE_YOU_BUCKET)
      .download(validated.request.sourcePath);
    if (sourceDownloadError) {
      return badGenerateResponse("Source photo not found.", 400, corsHeaders);
    }

    const { data: job, error: insertError } = await auth.adminClient
      .from("future_you_jobs")
      .insert({
        user_id: auth.userId,
        status: "queued",
        motivation_id: validated.request.motivationId,
        source_photo_path: validated.request.sourcePath,
      })
      .select("id")
      .single();

    if (insertError || !job) {
      console.error("future-you-generate: job insert failed", insertError);
      if (insertError?.code === "23505") {
        const retryActive = await reconcileStaleActiveJob(auth.adminClient, auth.userId);
        if (retryActive) {
          return conflictActiveJobResponse(retryActive.id, retryActive.status, corsHeaders);
        }
      }
      return new Response(JSON.stringify({ error: "Could not start generation. Try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobId = job.id as string;

    // Return the job immediately and finish generation in the background so the
    // client gets a durable jobId to poll.
    EdgeRuntime.waitUntil(
      runGenerationJob(auth.adminClient, auth.userId, jobId, validated.request, provider),
    );

    return new Response(JSON.stringify({ jobId, status: "queued" }), {
      status: 202,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("future-you-generate error", e);
    return new Response(JSON.stringify({ error: "Generation failed. Try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
