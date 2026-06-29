import type { SupabaseClient } from "@supabase/supabase-js";
import type { FutureYouJobStatus } from "@newyouai/types";

import { clientSupabaseKeyForFetch, type SupabaseEnv } from "../supabase/createSupabaseClient";
import { edgeFunctionErrorMessage } from "./edgeFunctionError";
import { invokeErrorMessage } from "./invokeErrorMessage";
import { invokeEdgeFunction } from "./invokeEdgeFunction";

export type FutureYouGenerateProfile = {
  goal: string;
  gender: string;
  weightLbs: number;
  goalWeightLbs?: number;
};

export type FutureYouGenerateRequest = {
  sourcePath: string;
  motivationId: string;
  profile: FutureYouGenerateProfile;
  timeline?: string;
};

export type FutureYouGenerateResult = {
  jobId: string;
  status: FutureYouJobStatus;
};

export class FutureYouGenerateError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid" | "conflict",
    readonly jobId?: string,
    readonly status?: FutureYouJobStatus,
  ) {
    super(message);
    this.name = "FutureYouGenerateError";
  }
}

export type FutureYouUploadResult = {
  path: string;
  uploadId: string;
  bucket: string;
};

export class FutureYouUploadError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouUploadError";
  }
}

export type FutureYouPollTeaser = {
  ready: true;
  motivationLabel: string;
  loadingPhrase: string;
};

export type FutureYouPollResponse = {
  jobId: string;
  status: FutureYouJobStatus;
  motivationId: string;
  updatedAt: string;
  error?: string | null;
  teaser?: FutureYouPollTeaser;
  previewSignedUrl?: string;
  resultSignedUrl?: string;
};

export class FutureYouPollError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid" | "not_found",
  ) {
    super(message);
    this.name = "FutureYouPollError";
  }
}

export type FutureYouReportRequest = {
  jobId?: string;
  context: string;
  category: string;
  message?: string;
};

export class FutureYouReportError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouReportError";
  }
}

export class FutureYouDeleteError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouDeleteError";
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFutureYouJobId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

function parseStatus(value: string | undefined): FutureYouJobStatus | undefined {
  if (value === "queued" || value === "generating" || value === "ready" || value === "failed") {
    return value;
  }
  return undefined;
}

function parseGenerateResponse(data: unknown): FutureYouGenerateResult {
  if (!data || typeof data !== "object") {
    throw new FutureYouGenerateError("Could not start generation. Try again.", "invalid");
  }

  const body = data as {
    error?: string;
    jobId?: string;
    status?: string;
  };

  if (typeof body.error === "string" && body.error.trim()) {
    if (typeof body.jobId === "string" && body.jobId.trim()) {
      const status = parseStatus(body.status);
      if (status === "failed") {
        throw new FutureYouGenerateError(body.error.trim(), "invalid", body.jobId.trim(), status);
      }
      throw new FutureYouGenerateError(
        body.error.trim(),
        "conflict",
        body.jobId.trim(),
        status,
      );
    }
    throw new FutureYouGenerateError(body.error.trim(), "invalid");
  }

  if (typeof body.jobId !== "string" || !body.jobId.trim()) {
    throw new FutureYouGenerateError("Could not start generation. Try again.", "invalid");
  }

  const status = parseStatus(body.status) ?? "generating";
  if (status === "failed") {
    throw new FutureYouGenerateError("Generation failed. Try again.", "invalid", body.jobId.trim(), status);
  }

  return {
    jobId: body.jobId.trim(),
    status,
  };
}

function parseUploadResponse(data: unknown): FutureYouUploadResult {
  if (!data || typeof data !== "object") {
    throw new FutureYouUploadError("Photo upload failed. Try again.", "invalid");
  }
  const err = data as { error?: string };
  if (typeof err.error === "string" && err.error.trim()) {
    throw new FutureYouUploadError(err.error.trim(), "invalid");
  }
  const body = data as Partial<FutureYouUploadResult>;
  if (typeof body.path !== "string" || !body.path.trim()) {
    throw new FutureYouUploadError("Photo upload failed. Try again.", "invalid");
  }
  return {
    path: body.path.trim(),
    uploadId: typeof body.uploadId === "string" ? body.uploadId : "",
    bucket: typeof body.bucket === "string" ? body.bucket : "future-you",
  };
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

  // A 200 status payload always carries a valid jobId + status. A failed job
  // legitimately includes an `error` field (its failure reason), so only treat a
  // top-level `error` as a fatal transport/envelope error when no job payload is
  // present — otherwise a failed job is misread as a transport failure and the
  // caller keeps polling forever instead of surfacing a terminal error.
  const hasJobPayload =
    typeof body.jobId === "string" &&
    isFutureYouJobId(body.jobId) &&
    parseStatus(body.status) !== undefined;

  if (!hasJobPayload) {
    if (typeof body.error === "string" && body.error.trim()) {
      throw new FutureYouPollError(body.error.trim(), "invalid");
    }
    throw new FutureYouPollError("Could not load generation status.", "invalid");
  }

  const status = parseStatus(body.status);
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
    jobId: (body.jobId as string).trim(),
    status,
    motivationId: body.motivationId.trim(),
    updatedAt: body.updatedAt.trim(),
  };

  // Surface a failed job's reason so the client can show a terminal error state.
  if (status === "failed" && typeof body.error === "string" && body.error.trim()) {
    response.error = body.error.trim();
  }

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

function parseReportResponse(data: unknown): { reportId: string } {
  if (!data || typeof data !== "object") {
    throw new FutureYouReportError("Could not send report. Try again.", "invalid");
  }

  const body = data as { error?: string; ok?: boolean; reportId?: string };
  if (typeof body.error === "string" && body.error.trim()) {
    throw new FutureYouReportError(body.error.trim(), "invalid");
  }
  if (body.ok !== true || typeof body.reportId !== "string" || !body.reportId.trim()) {
    throw new FutureYouReportError("Could not send report. Try again.", "invalid");
  }

  return { reportId: body.reportId.trim() };
}

function parseDeleteResponse(data: unknown): { removedObjects: number } {
  if (!data || typeof data !== "object") {
    throw new FutureYouDeleteError("Could not delete NewYou. Try again.", "invalid");
  }

  const body = data as { error?: string; ok?: boolean; removedObjects?: number };
  if (typeof body.error === "string" && body.error.trim()) {
    throw new FutureYouDeleteError(body.error.trim(), "invalid");
  }
  if (body.ok !== true) {
    throw new FutureYouDeleteError("Could not delete NewYou. Try again.", "invalid");
  }

  return { removedObjects: typeof body.removedObjects === "number" ? body.removedObjects : 0 };
}

/** Image generation can take 60–120s; default invoke timeouts are too short. */
const FUTURE_YOU_GENERATE_TIMEOUT_MS = 180_000;

/** Queue Future You generation after step 10c. Caller must ensure auth. */
export async function startFutureYouGeneration(
  client: SupabaseClient,
  env: SupabaseEnv,
  request: FutureYouGenerateRequest,
): Promise<FutureYouGenerateResult> {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) {
    throw new FutureYouGenerateError("Sign in to create your Future You.", "auth_required");
  }

  const baseUrl = envTrim(env.url).replace(/\/+$/, "");
  const url = `${baseUrl}/functions/v1/future-you-generate`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: clientSupabaseKeyForFetch(env),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(FUTURE_YOU_GENERATE_TIMEOUT_MS),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new FutureYouGenerateError("Could not start generation. Try again.", "unavailable");
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error.trim()
        : "Could not start generation. Try again.";
    throw new FutureYouGenerateError(message || "Could not start generation. Try again.", "unavailable");
  }

  try {
    return parseGenerateResponse(data);
  } catch (err) {
    if (err instanceof FutureYouGenerateError && err.code === "conflict" && err.jobId) {
      return {
        jobId: err.jobId,
        status: err.status ?? "generating",
      };
    }
    throw err;
  }
}

/** Upload a compressed JPEG data URL from onboarding step 10b. Caller must ensure auth. */
export async function uploadFutureYouPhoto(
  client: SupabaseClient,
  imageDataUrl: string,
): Promise<FutureYouUploadResult> {
  const { data, error } = await invokeEdgeFunction<unknown>(client, "future-you-upload", {
    imageDataUrl,
  });

  if (error) {
    throw new FutureYouUploadError(
      invokeErrorMessage(error) || "Photo upload failed. Try again.",
      "unavailable",
    );
  }

  return parseUploadResponse(data);
}

/** Poll Future You job status during onboarding (pre-pay — no full image URL). */
export async function pollFutureYouJobStatus(
  client: SupabaseClient,
  env: SupabaseEnv,
  jobId: string,
): Promise<FutureYouPollResponse> {
  const trimmedJobId = jobId.trim();
  if (!isFutureYouJobId(trimmedJobId)) {
    throw new FutureYouPollError("Invalid generation job.", "invalid");
  }

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) {
    throw new FutureYouPollError("Sign in to check generation status.", "auth_required");
  }

  const baseUrl = envTrim(env.url).replace(/\/+$/, "");
  const url = `${baseUrl}/functions/v1/future-you-status?jobId=${encodeURIComponent(trimmedJobId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: clientSupabaseKeyForFetch(env),
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
      data && typeof data === "object" && typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error.trim()
        : "Could not load generation status.";
    throw new FutureYouPollError(message || "Could not load generation status.", "unavailable");
  }

  return parseFutureYouPollResponse(data);
}

/** Submit a Future You quality report from onboarding success or Home. Caller must ensure auth. */
export async function submitFutureYouReport(
  client: SupabaseClient,
  request: FutureYouReportRequest,
): Promise<{ reportId: string }> {
  const { data, error } = await invokeEdgeFunction<unknown>(client, "future-you-report", request);

  if (error) {
    throw new FutureYouReportError(
      invokeErrorMessage(error) || "Could not send report. Try again.",
      "unavailable",
    );
  }

  return parseReportResponse(data);
}

/**
 * Delete the user's Future You data. Pass a `jobId` to remove a single preview (row + its
 * stored images); omit it to permanently delete all Future You photos and jobs. Caller must
 * ensure auth.
 */
export async function deleteFutureYou(
  client: SupabaseClient,
  jobId?: string,
): Promise<{ removedObjects: number }> {
  const body = jobId?.trim() ? { jobId: jobId.trim() } : {};
  const { data, error } = await invokeEdgeFunction<unknown>(client, "future-you-delete", body);

  if (error) {
    throw new FutureYouDeleteError(
      await edgeFunctionErrorMessage(error, "Could not delete NewYou. Try again."),
      "unavailable",
    );
  }

  return parseDeleteResponse(data);
}
