import {
  normalizeFutureYouReportMessage,
  type FutureYouReportRequest,
} from "./futureYouReportGuards";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export class FutureYouReportError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouReportError";
  }
}

function parseReportResponse(data: unknown): { reportId: string } {
  if (!data || typeof data !== "object") {
    throw new FutureYouReportError("Could not send report. Try again.", "invalid");
  }

  const body = data as { error?: string; ok?: boolean; reportId?: string };
  if (typeof body.error === "string" && body.error.trim()) {
    throw new FutureYouReportError(body.error.trim(), "invalid");
  }
  if (body.ok !== true || typeof body.reportId !== "string" || !body.reportId.trim()) {
    throw new FutureYouReportError("Could not send report. Try again.", "invalid");
  }

  return { reportId: body.reportId.trim() };
}

function logDevReportFallback(request: FutureYouReportRequest): { reportId: string } {
  console.warn("[future-you-report] dev fallback — report logged locally", request);
  return { reportId: "dev-local" };
}

/** Submit a Future You quality report from onboarding success or Home. */
export async function submitFutureYouReport(
  request: FutureYouReportRequest,
  options?: { previewMode?: boolean },
): Promise<{ reportId: string }> {
  const payload: FutureYouReportRequest = {
    ...request,
    message: normalizeFutureYouReportMessage(request.message),
  };

  if (options?.previewMode) {
    return logDevReportFallback(payload);
  }

  if (!isSupabaseConfigured()) {
    if (import.meta.env.DEV) {
      return logDevReportFallback(payload);
    }
    throw new FutureYouReportError("Sign in to send a report.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (import.meta.env.DEV) {
      return logDevReportFallback(payload);
    }
    throw new FutureYouReportError("Sign in to send a report.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new FutureYouReportError("Sign in to send a report.", "auth_required");
  }

  const { data, error } = await sb.functions.invoke("future-you-report", {
    body: payload,
  });

  if (error) {
    throw new FutureYouReportError(error.message || "Could not send report. Try again.", "unavailable");
  }

  return parseReportResponse(data);
}
