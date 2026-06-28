import type { FutureYouDraft } from "@newyouai/types";

import type { HomeFutureYouEntryMode } from "./homeEntryModel";
import type { FutureYouJobStatus } from "./jobs";

/** ISO timestamp that starts the 2-week redo window (ready time, or legacy fallbacks). */
export function futureYouRedoAnchorIso(draft: FutureYouDraft | undefined): string | undefined {
  const readyAt = draft?.generationReadyAt?.trim();
  if (readyAt) return readyAt;
  if (draft?.generationStatus === "ready") {
    const consentAt = draft.photoAiConsentAt?.trim();
    if (consentAt) return consentAt;
  }
  return undefined;
}

/** Minimum time between transformation updates when user already has a ready preview. */
export const FUTURE_YOU_REDO_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;

/** Bypass the 2-week redo gate after the user reports the active result. */
export function shouldSkipFutureYouRedoCooldown(
  draft: FutureYouDraft | undefined,
  devBypass = false,
): boolean {
  if (devBypass) return true;
  const reported = draft?.reportedJobId?.trim();
  const active = draft?.generationJobId?.trim();
  return Boolean(reported && active && reported === active);
}

export const FUTURE_YOU_PAGE_NEW_CHIP_LABEL = "New";
/** Accessible label for the gallery new-transformation control. */
export const FUTURE_YOU_PAGE_NEW_CHIP_ARIA_LABEL = "New NewYou transformation";

export const FUTURE_YOU_PAGE_REVEAL_LEDE = "You can generate a new one every 2 weeks.";
export const FUTURE_YOU_PAGE_EMPTY_LEDE =
  "Create an AI preview of the body transformation you are working toward.";
export const FUTURE_YOU_PAGE_BLOCKED_LEDE =
  "Future You is only available for users ages 18–80.";

export const FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO = "New photo";
export const FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION = "Pick your look";
export const FUTURE_YOU_PAGE_GENERATE_LABEL = "Generate transformation";

export const FUTURE_YOU_REPLACE_DIALOG_TITLE = "Update your transformation?";
export const FUTURE_YOU_REPLACE_DIALOG_BODY =
  "Upload a new photo to generate a fresh preview. Choose whether to remove your current one or keep both.";
export const FUTURE_YOU_REPLACE_DELETE_LABEL = "Remove current preview";
export const FUTURE_YOU_REPLACE_KEEP_LABEL = "Keep current & add new";
export const FUTURE_YOU_REPLACE_CANCEL_LABEL = "Cancel";

export function msUntilFutureYouRedoEligible(
  readyAtIso: string | undefined,
  nowMs = Date.now(),
): number {
  if (!readyAtIso?.trim()) return FUTURE_YOU_REDO_INTERVAL_MS;
  const readyMs = Date.parse(readyAtIso);
  if (!Number.isFinite(readyMs)) return 0;
  return Math.max(0, FUTURE_YOU_REDO_INTERVAL_MS - (nowMs - readyMs));
}

export function formatDaysUntilFutureYouRedo(msRemaining: number): string {
  if (msRemaining <= 0) return "0 days";
  const days = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
  if (days === 1) return "one day";
  return `${days} days`;
}

/** True when user may start a new transformation from the NewYou tab. */
export function canRedoFutureYouTransformation(
  mode: HomeFutureYouEntryMode | null,
  generationStatus: FutureYouJobStatus | "idle",
  readyAtIso: string | undefined,
  previewMode = false,
  nowMs = Date.now(),
  skipRedoCooldown = false,
): boolean {
  if (
    !skipRedoCooldown &&
    readyAtIso?.trim() &&
    msUntilFutureYouRedoEligible(readyAtIso, nowMs) > 0
  ) {
    return false;
  }
  if (mode !== "reveal") return true;
  if (previewMode) return generationStatus === "ready";
  if (generationStatus === "queued" || generationStatus === "generating") return false;
  if (generationStatus !== "ready") return true;
  if (skipRedoCooldown) return true;
  return msUntilFutureYouRedoEligible(readyAtIso, nowMs) === 0;
}

export function shouldPromptFutureYouReplaceDialog(
  mode: HomeFutureYouEntryMode | null,
  generationStatus: FutureYouJobStatus | "idle",
  readyAtIso: string | undefined,
  previewMode = false,
  nowMs = Date.now(),
  skipRedoCooldown = false,
): boolean {
  if (mode !== "reveal" || generationStatus !== "ready") return false;
  if (previewMode || skipRedoCooldown) return true;
  return msUntilFutureYouRedoEligible(readyAtIso, nowMs) === 0;
}

export function futureYouPageLede(mode: HomeFutureYouEntryMode | null): string {
  if (mode === "reveal") return FUTURE_YOU_PAGE_REVEAL_LEDE;
  return FUTURE_YOU_PAGE_EMPTY_LEDE;
}

export function futureYouPageRedoLede(msUntilRedo: number, skipRedoCooldown = false): string | null {
  if (skipRedoCooldown || msUntilRedo <= 0) return null;
  return `You can upload again in ${formatDaysUntilFutureYouRedo(msUntilRedo)}.`;
}

export function patchGenerationReadyAt(
  status: FutureYouJobStatus,
  updatedAt: string,
): Partial<FutureYouDraft> {
  if (status === "ready") {
    return { generationStatus: status, generationReadyAt: updatedAt };
  }
  return { generationStatus: status };
}
