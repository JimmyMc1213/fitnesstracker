/** Keep in sync with supabase/functions/issue-report/guards.ts */

export const ISSUE_REPORT_CATEGORIES = ["bug", "feature", "other"] as const;
export type IssueReportCategory = (typeof ISSUE_REPORT_CATEGORIES)[number];

export type IssueReportRequest = {
  category: IssueReportCategory;
  message?: string;
  appVersion?: string;
  platform?: string;
  deviceModel?: string;
};

export const ISSUE_REPORT_MESSAGE_MAX = 1000;
export const ISSUE_REPORT_APP_VERSION_MAX = 64;
export const ISSUE_REPORT_PLATFORM_MAX = 32;
export const ISSUE_REPORT_DEVICE_MODEL_MAX = 128;

export function isIssueReportCategory(value: string): value is IssueReportCategory {
  return (ISSUE_REPORT_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeIssueReportMessage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, ISSUE_REPORT_MESSAGE_MAX);
}

export function normalizeIssueReportMetadata(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
