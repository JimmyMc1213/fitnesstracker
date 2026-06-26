import { useEffect, useMemo, useState } from "react";

import type { FutureYouPreview } from "./futureYouDraft";
import {
  cacheFutureYouResultUrl,
  getCachedFutureYouResultUrl,
  preloadFutureYouImage,
} from "./futureYouImagePreload";
import { futureYouPollImageUrl } from "./futureYouStatus";
import { isFutureYouPostPayEntitled } from "./futureYouSuccessModel";
import { pollFutureYouJobStatus } from "./futureYouPollService";
import type { SubscriptionTier } from "./types";

export type FutureYouGalleryImageState = { src: string | null; loading: boolean };

/**
 * Resolves (and preloads) the signed result URL for each kept preview by jobId. Signed URLs
 * expire after ~1h, so cached entries are reused and missing ones are re-polled on mount.
 */
export function useFutureYouGalleryImages(
  previews: FutureYouPreview[] | undefined,
  subscriptionTier: SubscriptionTier | null | undefined,
  previewMode: boolean,
): Record<string, FutureYouGalleryImageState> {
  const entitled = isFutureYouPostPayEntitled(subscriptionTier, previewMode);

  const jobIds = useMemo(
    () => (previews ?? []).map((preview) => preview.jobId.trim()).filter(Boolean),
    [previews],
  );
  const jobIdsKey = jobIds.join(",");

  const [state, setState] = useState<Record<string, FutureYouGalleryImageState>>({});

  useEffect(() => {
    if (!entitled || previewMode || jobIds.length === 0) {
      setState({});
      return;
    }

    let cancelled = false;

    setState((prev) => {
      const next: Record<string, FutureYouGalleryImageState> = {};
      for (const jobId of jobIds) {
        const cached = getCachedFutureYouResultUrl(jobId);
        if (cached) next[jobId] = { src: cached, loading: false };
        else next[jobId] = prev[jobId] ?? { src: null, loading: true };
      }
      return next;
    });

    void (async () => {
      for (const jobId of jobIds) {
        if (cancelled) return;
        if (getCachedFutureYouResultUrl(jobId)) continue;
        try {
          const response = await pollFutureYouJobStatus(jobId);
          if (cancelled) return;
          const url = futureYouPollImageUrl(response, true);
          if (url) {
            cacheFutureYouResultUrl(jobId, url);
            await preloadFutureYouImage(url);
            if (cancelled) return;
            setState((prev) => ({ ...prev, [jobId]: { src: url, loading: false } }));
          } else {
            setState((prev) => ({ ...prev, [jobId]: { src: null, loading: false } }));
          }
        } catch {
          if (cancelled) return;
          setState((prev) => ({ ...prev, [jobId]: { src: null, loading: false } }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitled, previewMode, jobIdsKey]);

  return state;
}
