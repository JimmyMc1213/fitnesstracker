import {
  FUTURE_YOU_GENERATION_POLL_INTERVAL_MS,
  FUTURE_YOU_JOB_STALE_ERROR,
  patchGenerationReadyAt,
  shouldPollFutureYouGeneration,
  isFutureYouJobStale,
} from "@newyouai/core";
import type { FutureYouDraft, FutureYouJobStatus } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";

import {
  cacheFutureYouPreviewUrl,
  cacheFutureYouResultUrl,
  preloadFutureYouImage,
} from "@/lib/futureYouImagePreload";
import { FutureYouPollError, pollFutureYouJobStatus } from "@/lib/futureYouPollService";
import { futureYouPollImageUrl } from "@/lib/futureYouStatus";

const PREVIEW_READY_MS = 12000;

type Options = {
  futureYou: FutureYouDraft;
  onFutureYouPatch: (patch: Partial<FutureYouDraft>) => void;
  /** Poll while tab/detail is active or onboarding steps 11–27. */
  pollEnabled: boolean;
  previewMode?: boolean;
  onGenerationFailed?: (message: string) => void;
};

export function useFutureYouGenerationPoll({
  futureYou,
  onFutureYouPatch,
  pollEnabled,
  previewMode = false,
  onGenerationFailed,
}: Options): FutureYouJobStatus | "idle" {
  const status = futureYou.generationStatus ?? "idle";
  const jobId = futureYou.generationJobId?.trim() ?? "";
  const onPatchRef = useRef(onFutureYouPatch);
  onPatchRef.current = onFutureYouPatch;
  const onGenerationFailedRef = useRef(onGenerationFailed);
  onGenerationFailedRef.current = onGenerationFailed;

  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (!previewMode || !jobId || status === "ready") {
      setPreviewReady(false);
      return;
    }
    const id = setTimeout(() => setPreviewReady(true), PREVIEW_READY_MS);
    return () => clearTimeout(id);
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
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function pollOnce() {
      if (cancelled || !jobId) return;
      try {
        const response = await pollFutureYouJobStatus(jobId);
        if (cancelled) return;
        let status = response.status;
        let pollError = response.error?.trim() || undefined;
        if (isFutureYouJobStale(response.updatedAt, status)) {
          status = "failed";
          pollError = pollError ?? FUTURE_YOU_JOB_STALE_ERROR;
        }
        onPatchRef.current({
          generationJobId: response.jobId,
          ...patchGenerationReadyAt(status, response.updatedAt),
          ...(status === "failed"
            ? { generationError: pollError }
            : { generationError: undefined }),
        });
        if (status === "failed" && pollError) {
          onGenerationFailedRef.current?.(pollError);
        }
        if (status === "ready") {
          const previewUrl = futureYouPollImageUrl(response, false);
          if (previewUrl) {
            cacheFutureYouPreviewUrl(jobId, previewUrl);
            void preloadFutureYouImage(previewUrl).catch(() => undefined);
          }
          const resultUrl = futureYouPollImageUrl(response, true);
          if (resultUrl) {
            cacheFutureYouResultUrl(jobId, resultUrl);
            void preloadFutureYouImage(resultUrl).catch(() => undefined);
          }
        }
        if (status !== "ready" && status !== "failed") {
          timeoutId = setTimeout(pollOnce, FUTURE_YOU_GENERATION_POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) return;
        if (error instanceof FutureYouPollError && error.code === "not_found") {
          onPatchRef.current({
            generationStatus: "failed",
            generationError: "not_found",
          });
          onGenerationFailedRef.current?.("not_found");
          return;
        }
        timeoutId = setTimeout(pollOnce, FUTURE_YOU_GENERATION_POLL_INTERVAL_MS);
      }
    }

    void pollOnce();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [futureYou, jobId, pollEnabled, previewMode, status]);

  if (previewMode && previewReady) return "ready";
  return status;
}
