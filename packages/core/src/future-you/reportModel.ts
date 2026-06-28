import type { FutureYouReportCategory } from "./reportGuards";

export const FUTURE_YOU_REPORT_TRIGGER_LABEL = "Something wrong?";

export const FUTURE_YOU_REPORT_SHEET_TITLE = "Report this preview";
export const FUTURE_YOU_REPORT_SHEET_BODY =
  "Tell us what went wrong. We review reports to improve Future You previews.";
export const FUTURE_YOU_REPORT_SUBMIT_LABEL = "Send report";
export const FUTURE_YOU_REPORT_SUCCESS_MESSAGE = "Thanks, we'll review this.";
export const FUTURE_YOU_REPORT_ERROR_MESSAGE = "Could not send report. Try again.";

export const FUTURE_YOU_REPORT_CATEGORY_OPTIONS: ReadonlyArray<{
  id: FutureYouReportCategory;
  label: string;
}> = [
  { id: "not_accurate", label: "Doesn't look like me" },
  { id: "offensive", label: "Offensive or inappropriate" },
  { id: "unrealistic", label: "Looks unrealistic" },
  { id: "other", label: "Something else" },
];

export function futureYouReportCategoryLabel(category: FutureYouReportCategory): string {
  return FUTURE_YOU_REPORT_CATEGORY_OPTIONS.find((option) => option.id === category)?.label ?? category;
}
