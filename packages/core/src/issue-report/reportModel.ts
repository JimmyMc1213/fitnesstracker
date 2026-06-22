import type { IssueReportCategory } from "./reportGuards";

export const ISSUE_REPORT_SETTINGS_LABEL = "Report a problem";

export const ISSUE_REPORT_SHEET_TITLE = "Report a problem";
export const ISSUE_REPORT_SHEET_BODY =
  "Tell us what went wrong or what you'd like improved. We review every report.";
export const ISSUE_REPORT_SUBMIT_LABEL = "Send report";
export const ISSUE_REPORT_SUCCESS_MESSAGE = "Thanks — we received your report.";
export const ISSUE_REPORT_ERROR_MESSAGE = "Could not send report. Try again.";

export const ISSUE_REPORT_CATEGORY_OPTIONS: ReadonlyArray<{
  id: IssueReportCategory;
  label: string;
}> = [
  { id: "bug", label: "Something is broken" },
  { id: "feature", label: "Feature idea" },
  { id: "other", label: "Something else" },
];

export function issueReportCategoryLabel(category: IssueReportCategory): string {
  return ISSUE_REPORT_CATEGORY_OPTIONS.find((option) => option.id === category)?.label ?? category;
}

/** Linear label names applied when auto-creating an issue from the app. */
export function linearLabelsForIssueReportCategory(category: IssueReportCategory): string[] {
  const categoryLabel =
    category === "bug" ? "Bug"
    : category === "feature" ? "Feature"
    : "other";
  return ["user-report", categoryLabel];
}
