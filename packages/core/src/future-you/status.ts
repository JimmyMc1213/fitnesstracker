/** Keep in sync with supabase/functions/future-you-status/guards.ts */

import { getFutureYouMotivationById } from "./motivations";
import type { FutureYouJobStatus } from "./jobs";

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
  /** Present when status is ready — metadata for blurred paywall hook, not the image URL. */
  teaser?: FutureYouPollTeaser;
  /** Blurred paywall hero — returned when ready and user is not entitled (pre-pay). */
  previewSignedUrl?: string;
  /** Full result signed URL — returned when ready and user is entitled (post-pay). */
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

/** Signed image URL from a poll response (paywall vs post-pay). */
export function futureYouPollImageUrl(
  response: Pick<FutureYouPollResponse, "previewSignedUrl" | "resultSignedUrl">,
  preferFullResult: boolean,
): string | undefined {
  if (preferFullResult) {
    return response.resultSignedUrl ?? response.previewSignedUrl;
  }
  return response.previewSignedUrl ?? response.resultSignedUrl;
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
