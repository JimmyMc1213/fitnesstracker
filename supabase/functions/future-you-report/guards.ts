/** Keep in sync with src/fitness/futureYouReportGuards.ts */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function isFutureYouJobId(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function isFutureYouReportContext(value: string): value is FutureYouReportContext {
  return (FUTURE_YOU_REPORT_CONTEXTS as readonly string[]).includes(value);
}

export function isFutureYouReportCategory(value: string): value is FutureYouReportCategory {
  return (FUTURE_YOU_REPORT_CATEGORIES as readonly string[]).includes(value);
}

export function parseFutureYouReportRequest(body: unknown):
  | { ok: true; request: FutureYouReportRequest }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid report payload." };
  }

  const raw = body as Record<string, unknown>;
  const context = typeof raw.context === "string" ? raw.context.trim() : "";
  const category = typeof raw.category === "string" ? raw.category.trim() : "";

  if (!isFutureYouReportContext(context)) {
    return { ok: false, error: "Invalid report context." };
  }
  if (!isFutureYouReportCategory(category)) {
    return { ok: false, error: "Pick a reason for your report." };
  }

  let jobId: string | undefined;
  if (raw.jobId !== undefined && raw.jobId !== null && raw.jobId !== "") {
    if (typeof raw.jobId !== "string" || !isFutureYouJobId(raw.jobId)) {
      return { ok: false, error: "Invalid job id." };
    }
    jobId = raw.jobId.trim();
  }

  let message: string | undefined;
  if (raw.message !== undefined && raw.message !== null && raw.message !== "") {
    if (typeof raw.message !== "string") {
      return { ok: false, error: "Invalid report message." };
    }
    const trimmed = raw.message.trim();
    if (trimmed.length > FUTURE_YOU_REPORT_MESSAGE_MAX) {
      return { ok: false, error: `Message must be ${FUTURE_YOU_REPORT_MESSAGE_MAX} characters or fewer.` };
    }
    if (trimmed) message = trimmed;
  }

  return {
    ok: true,
    request: { jobId, context, category, message },
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
