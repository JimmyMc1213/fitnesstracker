import { formatDaysUntilFutureYouRedo } from "./pageModel";

export const FUTURE_YOU_DELETE_TRIGGER_LABEL = "Delete NewYou";
export const FUTURE_YOU_DELETE_CONFIRM_TITLE = "Delete NewYou?";
export const FUTURE_YOU_DELETE_CONFIRM_MESSAGE =
  "This permanently removes your selfie and AI preview from our servers. Your workout plan and subscription stay the same.";
export const FUTURE_YOU_DELETE_CONFIRM_LABEL = "Delete";
export const FUTURE_YOU_DELETE_FINAL_TITLE = "Are you sure?";
export const FUTURE_YOU_DELETE_FINAL_CONFIRM_LABEL = "Yes, delete";
export const FUTURE_YOU_DELETE_FINAL_BODY =
  "This cannot be undone. Your preview and photos will be removed from our servers.";
export const FUTURE_YOU_DELETE_CANCEL_LABEL = "Keep";
export const FUTURE_YOU_DELETE_ERROR_MESSAGE = "Could not delete NewYou. Try again.";

export function futureYouDeleteCooldownNotice(msUntilRedo: number): string | null {
  if (msUntilRedo <= 0) return null;
  return `The upload cooldown does not reset when you delete. You will need to wait ${formatDaysUntilFutureYouRedo(msUntilRedo)} before you can upload again.`;
}
