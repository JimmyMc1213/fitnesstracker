import { isFutureYouPostPayEntitled } from "@newyouai/core";
import type { FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";
import { useEffect, useState } from "react";

import {
  cacheFutureYouResultUrl,
  getCachedFutureYouResultUrl,
  preloadFutureYouImage,
} from "@/lib/futureYouImagePreload";
import { isFutureYouDevEntitlementEnabled } from "@/lib/futureYouDevFlags";
import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

type Options = {
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
  subscriptionTier: SubscriptionTier | null | undefined;
  previewMode?: boolean;
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/** Unblurred Future You image after subscribe when generation is ready. */
export function useFutureYouRevealImage({
  jobId,
  status,
  subscriptionTier,
  previewMode = false,
}: Options): { imageUri: string | null; loading: boolean } {
  const entitled =
    isFutureYouPostPayEntitled(subscriptionTier, previewMode) || isFutureYouDevEntitlementEnabled();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageUri(null);

    if (previewMode) {
      setLoading(false);
      return;
    }

    const trimmedJobId = jobId?.trim() ?? "";
    if (!trimmedJobId) {
      setLoading(false);
      return;
    }

    if (status !== "ready") {
      setLoading(isFutureYouHeroGenerating(status));
      return;
    }

    const cachedUrl = getCachedFutureYouResultUrl(trimmedJobId);
    if (cachedUrl) {
      setImageUri(cachedUrl);
      setLoading(false);
      return;
    }

    if (!entitled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      async function showWhenPreloaded(url: string) {
        cacheFutureYouResultUrl(trimmedJobId, url);
        await preloadFutureYouImage(url);
        if (cancelled) return;
        setImageUri(url);
        setLoading(false);
      }

      try {
        const response = await pollFutureYouJobStatus(trimmedJobId);
        if (cancelled) return;
        const url = futureYouPollImageUrl(response, true);
        if (!url) {
          setLoading(false);
          return;
        }
        await showWhenPreloaded(url);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof FutureYouPollError && error.code === "not_found") {
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entitled, previewMode, status, jobId]);

  return { imageUri, loading };
}
