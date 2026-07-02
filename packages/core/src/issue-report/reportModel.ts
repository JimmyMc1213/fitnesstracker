import type { IssueReportCategory } from "./reportGuards";

export const ISSUE_REPORT_SETTINGS_LABEL = "Report a problem";

export const ISSUE_REPORT_SHEET_TITLE = "Report a problem";
export const ISSUE_REPORT_SHEET_BODY =
  "Tell us what went wrong or what you'd like improved. We review every report.";
export const ISSUE_REPORT_SUBMIT_LABEL = "Send report";
export const ISSUE_REPORT_SUCCESS_MESSAGE = "Thanks — we received your report.";
export const ISSUE_REPORT_ERROR_MESSAGE = "Could not send report. Try again.";

export const FEATURE_REQUEST_SETTINGS_LABEL = "Request a feature";
export const FEATURE_REQUEST_SHEET_TITLE = "Request a feature";
export const FEATURE_REQUEST_SHEET_BODY =
  "Tell us what you'd love to see. We read every request.";
export const FEATURE_REQUEST_INPUT_LABEL = "What feature would you like?";
export const FEATURE_REQUEST_INPUT_PLACEHOLDER =
  "Describe the feature and how it would help you.";
export const FEATURE_REQUEST_SUBMIT_LABEL = "Send request";
export const FEATURE_REQUEST_SUCCESS_MESSAGE = "Thanks, we received your feature request.";

export const EMAIL_ACCOUNT_SHEET_TITLE = "Email";
export const EMAIL_CHANGE_REQUEST_LINK = "Want to change email?";
export const EMAIL_CHANGE_REQUEST_TITLE = "Request email change";
export const EMAIL_CHANGE_REQUEST_BODY =
  "Tell us why you need to change your email address. We review every request and will follow up.";
export const EMAIL_CHANGE_REQUEST_INPUT_LABEL = "Why do you want to change your email?";
export const EMAIL_CHANGE_REQUEST_INPUT_PLACEHOLDER =
  "Describe the reason for your request.";
export const EMAIL_CHANGE_REQUEST_SUBMIT_LABEL = "Send request";
export const EMAIL_CHANGE_REQUEST_SUCCESS_MESSAGE = "Thanks — we received your request.";

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
  if (category === "email-change") {
    return ["user-report", "email-change"];
  }

  const categoryLabel =
    category === "bug" ? "Bug"
    : category === "feature" ? "Feature"
    : "other";
  return ["user-report", categoryLabel];
}

export function formatEmailChangeRequestMessage(currentEmail: string, reason: string): string {
  return `Current email: ${currentEmail.trim()}\n\nReason:\n${reason.trim()}`;
}
