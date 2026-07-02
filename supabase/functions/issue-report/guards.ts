/** Keep in sync with packages/core/src/issue-report/reportGuards.ts */

export const ISSUE_REPORT_CATEGORIES = ["bug", "feature", "other", "email-change"] as const;
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

function normalizeOptionalString(
  value: unknown,
  max: number,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export function parseIssueReportRequest(body: unknown):
  | { ok: true; request: IssueReportRequest }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid report payload." };
  }

  const raw = body as Record<string, unknown>;
  const category = typeof raw.category === "string" ? raw.category.trim() : "";

  if (!isIssueReportCategory(category)) {
    return { ok: false, error: "Pick a category for your report." };
  }

  let message: string | undefined;
  if (raw.message !== undefined && raw.message !== null && raw.message !== "") {
    if (typeof raw.message !== "string") {
      return { ok: false, error: "Invalid report message." };
    }
    const trimmed = raw.message.trim();
    if (trimmed.length > ISSUE_REPORT_MESSAGE_MAX) {
      return {
        ok: false,
        error: `Message must be ${ISSUE_REPORT_MESSAGE_MAX} characters or fewer.`,
      };
    }
    if (trimmed) message = trimmed;
  }

  const appVersion = normalizeOptionalString(raw.appVersion, ISSUE_REPORT_APP_VERSION_MAX);
  const platform = normalizeOptionalString(raw.platform, ISSUE_REPORT_PLATFORM_MAX);
  const deviceModel = normalizeOptionalString(raw.deviceModel, ISSUE_REPORT_DEVICE_MODEL_MAX);

  return {
    ok: true,
    request: { category, message, appVersion, platform, deviceModel },
  };
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: "Sign in to send a report." }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function badReportResponse(
  error: string,
  corsHeaders: Record<string, string>,
  status = 400,
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
