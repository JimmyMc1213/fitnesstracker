/** Keep in sync with supabase/functions/future-you-report/guards.ts */

export const FUTURE_YOU_REPORT_CONTEXTS = ["onboarding_success", "home"] as const;
export type FutureYouReportContext = (typeof FUTURE_YOU_REPORT_CONTEXTS)[number];

export const FUTURE_YOU_REPORT_CATEGORIES = [
  "not_accurate",
  "offensive",
  "unrealistic",
  "other",
] as const;
export type FutureYouReportCategory = (typeof FUTURE_YOU_REPORT_CATEGORIES)[number];

export type FutureYouReportRequest = {
  jobId?: string;
  context: FutureYouReportContext;
  category: FutureYouReportCategory;
  message?: string;
};

export const FUTURE_YOU_REPORT_MESSAGE_MAX = 500;

export function isFutureYouReportContext(value: string): value is FutureYouReportContext {
  return (FUTURE_YOU_REPORT_CONTEXTS as readonly string[]).includes(value);
}

export function isFutureYouReportCategory(value: string): value is FutureYouReportCategory {
  return (FUTURE_YOU_REPORT_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeFutureYouReportMessage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, FUTURE_YOU_REPORT_MESSAGE_MAX);
}
