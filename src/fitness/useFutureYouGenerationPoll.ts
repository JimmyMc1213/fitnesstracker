import { useEffect, useRef, useState } from "react";

import type { FutureYouDraft } from "./futureYouDraft";
import { cacheFutureYouPreviewUrl, preloadFutureYouImage } from "./futureYouImagePreload";
import { patchGenerationReadyAt } from "./futureYouPageModel";
import { FUTURE_YOU_GENERATION_POLL_INTERVAL_MS, shouldPollFutureYouGeneration } from "./futureYouGenerationPillModel";
import type { FutureYouJobStatus } from "./futureYouJobs";
import { FutureYouPollError, pollFutureYouJobStatus } from "./futureYouPollService";
import { futureYouPollImageUrl } from "./futureYouStatus";

const PREVIEW_READY_MS = 12000;

type Options = {
  futureYou: FutureYouDraft;
  onFutureYouPatch: (patch: Partial<FutureYouDraft>) => void;
  /** Poll while user is on steps 11–27 during onboarding. */
  pollEnabled: boolean;
  previewMode?: boolean;
};

export function useFutureYouGenerationPoll({
  futureYou,
  onFutureYouPatch,
  pollEnabled,
  previewMode = false,
}: Options): FutureYouJobStatus | "idle" {
  const status = futureYou.generationStatus ?? "idle";
  const jobId = futureYou.generationJobId?.trim() ?? "";
  const onPatchRef = useRef(onFutureYouPatch);
  onPatchRef.current = onFutureYouPatch;

  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (!previewMode || !jobId || status === "ready") {
      setPreviewReady(false);
      return;
    }
    const id = window.setTimeout(() => setPreviewReady(true), PREVIEW_READY_MS);
    return () => window.clearTimeout(id);
  }, [previewMode, jobId, status]);

  useEffect(() => {
    if (previewMode && previewReady && status !== "ready" && jobId) {
      onPatchRef.current({ generationStatus: "ready" });
    }
  }, [previewMode, previewReady, status, jobId]);

  useEffect(() => {
    if (previewMode) return;
    if (!shouldPollFutureYouGeneration(futureYou, pollEnabled)) return;

    let cancelled = false;
    let timeoutId = 0;

    async function pollOnce() {
      if (cancelled || !jobId) return;
      try {
        const response = await pollFutureYouJobStatus(jobId);
        if (cancelled) return;
        onPatchRef.current({
          generationJobId: response.jobId,
          ...patchGenerationReadyAt(response.status, response.updatedAt),
        });
        if (response.status === "ready") {
          const previewUrl = futureYouPollImageUrl(response, false);
          if (previewUrl) {
            cacheFutureYouPreviewUrl(jobId, previewUrl);
            void preloadFutureYouImage(previewUrl).catch(() => undefined);
          }
        }
        if (response.status !== "ready" && response.status !== "failed") {
          timeoutId = window.setTimeout(pollOnce, FUTURE_YOU_GENERATION_POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof FutureYouPollError && error.code === "not_found") {
          return;
        }
        timeoutId = window.setTimeout(pollOnce, FUTURE_YOU_GENERATION_POLL_INTERVAL_MS);
      }
    }

    void pollOnce();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [futureYou, jobId, pollEnabled, previewMode, status]);

  if (previewMode && previewReady) return "ready";
  return status;
}
