import {
  IssueReportError as ApiIssueReportError,
  submitIssueReport as submitIssueReportApi,
} from "@newyouai/api-client";
import {
  normalizeIssueReportMessage,
  normalizeIssueReportMetadata,
  type IssueReportCategory,
  type IssueReportRequest,
} from "@newyouai/core";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export { ApiIssueReportError as IssueReportError };

export type SubmitIssueReportInput = {
  category: IssueReportCategory;
  message?: string;
};

function logDevReportFallback(request: IssueReportRequest): { reportId: string } {
  console.warn("[issue-report] dev fallback, report logged locally", request);
  return { reportId: "dev-local" };
}

function buildIssueReportMetadata(): Pick<IssueReportRequest, "appVersion" | "platform" | "deviceModel"> {
  const appVersion =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    undefined;

  const platform = Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web"
    ? Platform.OS
    : undefined;

  return {
    appVersion: normalizeIssueReportMetadata(appVersion, 64),
    platform: normalizeIssueReportMetadata(platform, 32),
  };
}

/** Submit an in-app issue report from Settings. */
export async function submitIssueReport(
  input: SubmitIssueReportInput,
): Promise<{ reportId: string; linearIssueUrl?: string }> {
  const payload: IssueReportRequest = {
    category: input.category,
    message: normalizeIssueReportMessage(input.message),
    ...buildIssueReportMetadata(),
  };

  if (!isSupabaseConfigured()) {
    if (__DEV__) {
      return logDevReportFallback(payload);
    }
    throw new ApiIssueReportError("Sign in to send a report.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (__DEV__) {
      return logDevReportFallback(payload);
    }
    throw new ApiIssueReportError("Sign in to send a report.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiIssueReportError("Sign in to send a report.", "auth_required");
  }

  return submitIssueReportApi(sb, payload);
}
