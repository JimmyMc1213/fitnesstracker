import { isFutureYouPostPayEntitled } from "@newyouai/core";
import type { FutureYouPreview, SubscriptionTier } from "@newyouai/types";
import { useEffect, useMemo, useState } from "react";

import {
  cacheFutureYouResultUrl,
  getCachedFutureYouResultUrl,
  preloadFutureYouImage,
} from "@/lib/futureYouImagePreload";
import { isFutureYouDevEntitlementEnabled } from "@/lib/futureYouDevFlags";
import { pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

export type FutureYouGalleryImageState = { uri: string | null; loading: boolean };

/**
 * Resolves (and preloads) the signed result URL for each kept preview by jobId. Signed URLs
 * expire after ~1h, so cached entries are reused and missing ones are re-polled on mount.
 */
export function useFutureYouGalleryImages(
  previews: FutureYouPreview[] | undefined,
  subscriptionTier: SubscriptionTier | null | undefined,
): Record<string, FutureYouGalleryImageState> {
  const entitled =
    isFutureYouPostPayEntitled(subscriptionTier) || isFutureYouDevEntitlementEnabled();

  const jobIds = useMemo(
    () => (previews ?? []).map((preview) => preview.jobId.trim()).filter(Boolean),
    [previews],
  );
  const jobIdsKey = jobIds.join(",");

  const [state, setState] = useState<Record<string, FutureYouGalleryImageState>>({});

  useEffect(() => {
    if (!entitled || jobIds.length === 0) {
      setState({});
      return;
    }

    let cancelled = false;

    setState((prev) => {
      const next: Record<string, FutureYouGalleryImageState> = {};
      for (const jobId of jobIds) {
        const cached = getCachedFutureYouResultUrl(jobId);
        if (cached) next[jobId] = { uri: cached, loading: false };
        else next[jobId] = prev[jobId] ?? { uri: null, loading: true };
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
            setState((prev) => ({ ...prev, [jobId]: { uri: url, loading: false } }));
          } else {
            setState((prev) => ({ ...prev, [jobId]: { uri: null, loading: false } }));
          }
        } catch {
          if (cancelled) return;
          setState((prev) => ({ ...prev, [jobId]: { uri: null, loading: false } }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // jobIdsKey captures the set of ids; entitled gates fetching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitled, jobIdsKey]);

  return state;
}
