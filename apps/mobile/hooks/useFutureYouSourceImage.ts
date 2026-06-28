import { useEffect, useState } from "react";

import { fetchFutureYouJobSourcePhotoPath } from "@/lib/futureYouJobSourcePath";
import { preloadFutureYouImage } from "@/lib/futureYouImagePreload";
import { resolveFutureYouSourceImageUrl } from "@/lib/futureYouSourceImageUrl";

/** Resolve a display URL for the user's uploaded source photo. */
export function useFutureYouSourceImage(
  storagePath: string | undefined,
  jobId: string | undefined,
  enabled: boolean,
): { sourceUri: string | null; loading: boolean } {
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSourceUri(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSourceUri(null);

    void (async () => {
      let path = storagePath?.trim() ?? "";
      if (!path && jobId?.trim()) {
        path = (await fetchFutureYouJobSourcePhotoPath(jobId)) ?? "";
      }
      if (!path) {
        if (!cancelled) setLoading(false);
        return;
      }

      const url = await resolveFutureYouSourceImageUrl(path);
      if (cancelled) return;
      if (url) {
        await preloadFutureYouImage(url).catch(() => undefined);
        if (cancelled) return;
        setSourceUri(url);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, jobId, storagePath]);

  return { sourceUri, loading };
}
