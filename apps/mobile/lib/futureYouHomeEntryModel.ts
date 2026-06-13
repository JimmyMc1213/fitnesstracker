import type { FutureYouDraft } from "@newyouai/types";

import type { HomeFutureYouEntryMode } from "@/lib/homeFutureYouModel";

export const FUTURE_YOU_HOME_HEADER_LABEL = "NewYou";
export const FUTURE_YOU_SKIPPER_PILL_HEADLINE = "You still haven't tried NewYou?";
export const FUTURE_YOU_SKIPPER_PILL_SUBLINE =
  "Click here to upload and get your NewYou Transformation";
export const FUTURE_YOU_SKIPPER_PILL_DISMISS_ARIA = "Dismiss NewYou reminder";
export const FUTURE_YOU_HOME_HEADER_ARIA = "Open NewYou";

const ACTIVE_GENERATION = new Set(["queued", "generating", "ready"]);

function hasFutureYouMedia(draft: FutureYouDraft): boolean {
  if (draft.photoStoragePath?.trim()) return true;
  const status = draft.generationStatus;
  return status != null && ACTIVE_GENERATION.has(status);
}

export function hasNotUsedNewYou(
  mode: HomeFutureYouEntryMode | null,
  photoBlocked: boolean,
): boolean {
  return mode === "upload_prompt" && !photoBlocked;
}

export type FutureYouHomeEntryInput = {
  mode: HomeFutureYouEntryMode | null;
  photoBlocked: boolean;
  onboardingComplete: boolean;
  futureYou: FutureYouDraft | undefined;
  todayDateKey: string;
};

export function shouldShowHomeNewYouHeaderButton(input: FutureYouHomeEntryInput): boolean {
  if (!input.onboardingComplete) return false;
  return hasNotUsedNewYou(input.mode, input.photoBlocked);
}

export function shouldShowFutureYouSkipperReminderPill(input: FutureYouHomeEntryInput): boolean {
  if (!shouldShowHomeNewYouHeaderButton(input)) return false;

  const draft = input.futureYou ?? {};
  if (draft.remindersMuted === true) return false;
  if (draft.reminderDismissedDateKey === input.todayDateKey) return false;
  if (hasFutureYouMedia(draft)) return false;

  return true;
}
