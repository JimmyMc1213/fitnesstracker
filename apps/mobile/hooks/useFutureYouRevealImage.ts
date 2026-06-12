import type { FutureYouJobStatus, SubscriptionTier } from "@newyouai/types";
import { useEffect, useState } from "react";

import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { isFutureYouPostPayEntitled } from "@/lib/futureYouSuccessModel";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

type Options = {
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
  subscriptionTier: SubscriptionTier | null | undefined;
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/** Unblurred Future You image after subscribe when generation is ready. */
export function useFutureYouRevealImage({
  jobId,
  status,
  subscriptionTier,
}: Options): { imageUri: string | null; loading: boolean } {
  const entitled = isFutureYouPostPayEntitled(subscriptionTier);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setImageUri(null);

    if (!entitled) {
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
      try {
        const response = await pollFutureYouJobStatus(trimmedJobId);
        if (cancelled) return;
        const url = futureYouPollImageUrl(response, true);
        setImageUri(url ?? null);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof FutureYouPollError && error.code === "not_found") {
          setImageUri(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entitled, status, jobId]);

  return { imageUri, loading };
}
