/** Keep in sync with src/fitness/futureYouStatus.ts */

import { getFutureYouMotivationById } from "../_shared/future-you/futureYouMotivations.ts";
import type { FutureYouJobStatus } from "../_shared/future-you/jobStatus.ts";

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

export type FutureYouPollJobRow = {
  id: string;
  status: FutureYouJobStatus;
  motivation_id: string;
  result_photo_path: string | null;
  error: string | null;
  updated_at: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isFutureYouJobId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function buildFutureYouPollResponse(
  job: FutureYouPollJobRow,
  options: {
    entitled: boolean;
    previewSignedUrl?: string | null;
    resultSignedUrl?: string | null;
  },
): FutureYouPollResponse {
  const response: FutureYouPollResponse = {
    jobId: job.id,
    status: job.status,
    motivationId: job.motivation_id,
    updatedAt: job.updated_at,
  };

  if (job.status === "failed" && job.error) {
    response.error = job.error;
  }

  if (job.status === "ready") {
    const motivation = getFutureYouMotivationById(job.motivation_id);
    response.teaser = {
      ready: true,
      motivationLabel: motivation?.label ?? job.motivation_id,
      loadingPhrase: motivation?.loadingPhrase ?? "Your Future You is ready",
    };

    if (!options.entitled && options.previewSignedUrl) {
      response.previewSignedUrl = options.previewSignedUrl;
    }

    if (options.entitled && options.resultSignedUrl) {
      response.resultSignedUrl = options.resultSignedUrl;
    }
  }

  return response;
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error: "Sign in to check Future You status." }, 401, corsHeaders);
}

export function notFoundResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error: "No Future You generation found." }, 404, corsHeaders);
}

export function badStatusResponse(error: string, corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error }, 400, corsHeaders);
}
