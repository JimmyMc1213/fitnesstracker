import { useEffect, useState } from "react";

import {
  cacheFutureYouPreviewUrl,
  getCachedFutureYouPreviewUrl,
  preloadFutureYouImage,
} from "./futureYouImagePreload";
import { futureYouRevealPlaceholderImage } from "./futureYouRevealPlaceholder";
import { futureYouPollImageUrl } from "./futureYouStatus";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { FutureYouPollError, pollFutureYouJobStatus } from "./futureYouPollService";
import type { UserGender } from "./types";

type Options = {
  jobId: string | undefined;
  gender: UserGender | undefined;
  status: FutureYouJobStatus | "idle";
  previewMode: boolean;
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/** Resolves the blurred Future You hero on paywall (preview URL when ready; no silhouette flash while loading). */
export function useFutureYouPaywallImage({
  jobId,
  gender,
  status,
  previewMode,
}: Options): { imageSrc: string | null; loading: boolean } {
  const placeholder = futureYouRevealPlaceholderImage(gender);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageSrc(null);

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

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const cachedUrl = getCachedFutureYouPreviewUrl(trimmedJobId);

      async function showWhenPreloaded(url: string) {
        cacheFutureYouPreviewUrl(trimmedJobId, url);
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
        const url = futureYouPollImageUrl(response, false);
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
  }, [previewMode, status, jobId]);

  if (previewMode) {
    return { imageSrc: placeholder, loading: false };
  }

  return { imageSrc, loading };
}
