import { useEffect, useState } from "react";

import {
  cacheFutureYouResultUrl,
  getCachedFutureYouResultUrl,
  preloadFutureYouImage,
} from "./futureYouImagePreload";
import { futureYouRevealPlaceholderImage } from "./futureYouRevealPlaceholder";
import { futureYouPollImageUrl } from "./futureYouStatus";
import { isFutureYouPostPayEntitled } from "./futureYouSuccessModel";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { FutureYouPollError, pollFutureYouJobStatus } from "./futureYouPollService";
import type { SubscriptionTier, UserGender } from "./types";

type Options = {
  jobId: string | undefined;
  gender: UserGender | undefined;
  status: FutureYouJobStatus | "idle";
  subscriptionTier: SubscriptionTier | null | undefined;
  previewMode: boolean;
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/** Resolves the unblurred Future You image after pay (signed URL when entitled; no silhouette flash while loading). */
export function useFutureYouRevealImage({
  jobId,
  gender,
  status,
  subscriptionTier,
  previewMode,
}: Options): { imageSrc: string | null; loading: boolean } {
  const entitled = isFutureYouPostPayEntitled(subscriptionTier, previewMode);
  const placeholder = futureYouRevealPlaceholderImage(gender);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageSrc(null);

    if (!entitled || previewMode) {
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

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const cachedUrl = getCachedFutureYouResultUrl(trimmedJobId);

      async function showWhenPreloaded(url: string) {
        cacheFutureYouResultUrl(trimmedJobId, url);
        await preloadFutureYouImage(url);
        if (cancelled) return;
        setImageSrc(url);
        setLoading(false);
      }

      if (cachedUrl) {
        try {
          await showWhenPreloaded(cachedUrl);
          return;
        } catch {
          if (cancelled) return;
        }
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

  if (previewMode || !entitled) {
    return { imageSrc: placeholder, loading: false };
  }

  return { imageSrc, loading };
}
