import type { FutureYouJobStatus } from "@newyouai/types";
import { useEffect, useState } from "react";

import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

type Options = {
  jobId: string | undefined;
  status: FutureYouJobStatus | "idle";
};

function isFutureYouHeroGenerating(status: FutureYouJobStatus | "idle"): boolean {
  return status === "queued" || status === "generating";
}

/** Blurred Future You preview for paywall hero when generation is ready. */
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
      try {
        const response = await pollFutureYouJobStatus(trimmedJobId);
        if (cancelled) return;
        const url = futureYouPollImageUrl(response, false);
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
  }, [status, jobId]);

  return { imageUri, loading };
}
