import type { SupabaseClient } from "@supabase/supabase-js";
import type { IssueReportRequest } from "@newyouai/core";

import { invokeErrorMessage } from "./invokeErrorMessage";
import { invokeEdgeFunction } from "./invokeEdgeFunction";

export class IssueReportError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "IssueReportError";
  }
}

function parseIssueReportResponse(data: unknown): { reportId: string; linearIssueUrl?: string } {
  if (!data || typeof data !== "object") {
    throw new IssueReportError("Could not send report. Try again.", "invalid");
  }

  const body = data as {
    error?: string;
    ok?: boolean;
    reportId?: string;
    linearIssueUrl?: string;
  };

  if (typeof body.error === "string" && body.error.trim()) {
    throw new IssueReportError(body.error.trim(), "invalid");
  }
  if (body.ok !== true || typeof body.reportId !== "string" || !body.reportId.trim()) {
    throw new IssueReportError("Could not send report. Try again.", "invalid");
  }

  return {
    reportId: body.reportId.trim(),
    linearIssueUrl:
      typeof body.linearIssueUrl === "string" && body.linearIssueUrl.trim()
        ? body.linearIssueUrl.trim()
        : undefined,
  };
}

/** Submit an in-app issue report from Settings. Caller must ensure auth. */
export async function submitIssueReport(
  client: SupabaseClient,
  request: IssueReportRequest,
): Promise<{ reportId: string; linearIssueUrl?: string }> {
  const { data, error } = await invokeEdgeFunction<unknown>(client, "issue-report", request);

  if (error) {
    throw new IssueReportError(
      invokeErrorMessage(error) || "Could not send report. Try again.",
      "unavailable",
    );
  }

  return parseIssueReportResponse(data);
}
