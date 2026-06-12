import type { FutureYouPollResponse } from "@newyouai/api-client";

/** Signed image URL from a poll response (paywall preview vs post-pay result). */
export function futureYouPollImageUrl(
  response: Pick<FutureYouPollResponse, "previewSignedUrl" | "resultSignedUrl">,
  preferFullResult: boolean,
): string | undefined {
  if (preferFullResult) {
    return response.resultSignedUrl ?? response.previewSignedUrl;
  }
  return response.previewSignedUrl ?? response.resultSignedUrl;
}
