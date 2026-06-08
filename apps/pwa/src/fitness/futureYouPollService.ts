import type { FutureYouPollResponse } from "./futureYouStatus";
import { isFutureYouJobId } from "./futureYouStatus";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { clientSupabaseKeyForFetch, getSupabase, isSupabaseConfigured } from "./supabaseClient";

export class FutureYouPollError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid" | "not_found",
  ) {
    super(message);
    this.name = "FutureYouPollError";
  }
}

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

function parsePollStatus(value: string | undefined): FutureYouJobStatus | undefined {
  if (value === "queued" || value === "generating" || value === "ready" || value === "failed") {
    return value;
  }
  return undefined;
}

export function parseFutureYouPollResponse(data: unknown): FutureYouPollResponse {
  if (!data || typeof data !== "object") {
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  const body = data as {
    error?: string;
    jobId?: string;
    status?: string;
    motivationId?: string;
    updatedAt?: string;
    teaser?: FutureYouPollResponse["teaser"];
    previewSignedUrl?: string;
    resultSignedUrl?: string;
  };

  if (typeof body.error === "string" && body.error.trim()) {
    throw new FutureYouPollError(body.error.trim(), "invalid");
  }

  if (typeof body.jobId !== "string" || !isFutureYouJobId(body.jobId)) {
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  const status = parsePollStatus(body.status);
  if (!status) {
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  if (typeof body.motivationId !== "string" || !body.motivationId.trim()) {
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  if (typeof body.updatedAt !== "string" || !body.updatedAt.trim()) {
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  const response: FutureYouPollResponse = {
    jobId: body.jobId.trim(),
    status,
    motivationId: body.motivationId.trim(),
    updatedAt: body.updatedAt.trim(),
  };

  if (body.teaser) {
    response.teaser = body.teaser;
  }

  if (typeof body.previewSignedUrl === "string" && body.previewSignedUrl.trim()) {
    response.previewSignedUrl = body.previewSignedUrl.trim();
  }

  if (typeof body.resultSignedUrl === "string" && body.resultSignedUrl.trim()) {
    response.resultSignedUrl = body.resultSignedUrl.trim();
  }

  return response;
}

/** Poll Future You job status during onboarding (pre-pay — no full image URL). */
export async function pollFutureYouJobStatus(jobId: string): Promise<FutureYouPollResponse> {
  const trimmedJobId = jobId.trim();
  if (!isFutureYouJobId(trimmedJobId)) {
    throw new FutureYouPollError("Invalid generation job.", "invalid");
  }

  if (!isSupabaseConfigured()) {
    throw new FutureYouPollError("Sign in to check generation status.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new FutureYouPollError("Sign in to check generation status.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new FutureYouPollError("Sign in to check generation status.", "auth_required");
  }

  const baseUrl = envTrim(import.meta.env.VITE_SUPABASE_URL).replace(/\/+$/, "");
  const url = `${baseUrl}/functions/v1/future-you-status?jobId=${encodeURIComponent(trimmedJobId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: clientSupabaseKeyForFetch(),
    },
  });

  if (response.status === 401) {
    throw new FutureYouPollError("Sign in to check generation status.", "auth_required");
  }

  if (response.status === 404) {
    throw new FutureYouPollError("Generation job not found.", "not_found");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new FutureYouPollError("Could not load generation status.", "unavailable");
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof (data as { error?: string }).error === "string" ?
        (data as { error: string }).error.trim()
      : "Could not load generation status.";
    throw new FutureYouPollError(message || "Could not load generation status.", "unavailable");
  }

  return parseFutureYouPollResponse(data);
}
