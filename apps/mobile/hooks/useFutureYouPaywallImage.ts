import type { FutureYouJobStatus } from "@newyouai/types";
import { useEffect, useState } from "react";

import {
  cacheFutureYouPreviewUrl,
  getCachedFutureYouPreviewUrl,
  preloadFutureYouImage,
} from "@/lib/futureYouImagePreload";
import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

type Options = {
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/**
 * Blurred Future You preview for the paywall hero. Reuses the URL cached by the
 * generation poll and decodes the image (Image.prefetch) before display so the
 * hero swaps in instantly instead of loading when the paywall mounts.
 */
export function useFutureYouPaywallImage({ jobId, status }: Options): {
  imageUri: string | null;
  loading: boolean;
} {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageUri(null);

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
      async function showWhenPreloaded(url: string) {
        cacheFutureYouPreviewUrl(trimmedJobId, url);
        await preloadFutureYouImage(url);
        if (cancelled) return;
        setImageUri(url);
        setLoading(false);
      }

      const cachedUrl = getCachedFutureYouPreviewUrl(trimmedJobId);
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
          setImageUri(null);
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, jobId]);

  return { imageUri, loading };
}
