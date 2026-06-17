export {
  MIN_WEIGH_INS_FOR_FULL_RECAP,
  SUNDAY_CHECK_IN_STEPS,
  buildSundayCheckInData,
  commitSundayCheckIn,
  dismissSundayCheckIn,
  hasSundayCheckInHistoryForKey,
  isSundayCheckInComplete,
  isSundayCheckInDay,
  shouldShowSundayCheckIn,
  shouldShowSundayCheckInCard,
  sundayNoonForCurrentWeek,
  type SundayCheckInCoachItem,
  type SundayCheckInCommitmentOption,
  type SundayCheckInDailyWeight,
  type SundayCheckInData,
  type SundayCheckInDayCell,
  type SundayCheckInFuelUpdate,
  type SundayCheckInMetric,
} from "@newyouai/core";

export const DEV_PREVIEW_SUNDAY_EVENT = "fitcoach:dev:previewSunday";

export type DevPreviewSundayEventDetail = { active: boolean };

export function isDevPreviewSundayUrl(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("previewSunday") === "1";
}

function dispatchDevPreviewSundayChange(active: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DevPreviewSundayEventDetail>(DEV_PREVIEW_SUNDAY_EVENT, { detail: { active } }),
  );
}

export function setDevPreviewSundayUrl(active: boolean): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (active) url.searchParams.set("previewSunday", "1");
  else url.searchParams.delete("previewSunday");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  dispatchDevPreviewSundayChange(active);
}

export function clearDevPreviewSundayUrl(): void {
  setDevPreviewSundayUrl(false);
}

export function toggleDevPreviewSundayUrl(): boolean {
  const next = !isDevPreviewSundayUrl();
  setDevPreviewSundayUrl(next);
  return next;
}
