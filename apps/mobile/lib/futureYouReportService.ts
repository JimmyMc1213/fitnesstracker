import {
  FutureYouReportError as ApiFutureYouReportError,
  submitFutureYouReport as submitFutureYouReportApi,
} from "@newyouai/api-client";
import { normalizeFutureYouReportMessage, type FutureYouReportRequest } from "@newyouai/core";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export { ApiFutureYouReportError as FutureYouReportError };

function logDevReportFallback(request: FutureYouReportRequest): { reportId: string } {
  console.warn("[future-you-report] dev fallback, report logged locally", request);
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
    if (__DEV__) {
      return logDevReportFallback(payload);
    }
    throw new ApiFutureYouReportError("Sign in to send a report.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (__DEV__) {
      return logDevReportFallback(payload);
    }
    throw new ApiFutureYouReportError("Sign in to send a report.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouReportError("Sign in to send a report.", "auth_required");
  }

  return submitFutureYouReportApi(sb, payload);
}
