import {
  FutureYouPollError as ApiFutureYouPollError,
  parseFutureYouPollResponse,
  pollFutureYouJobStatus as pollFutureYouJobStatusApi,
  type FutureYouPollResponse,
} from "@newyouai/api-client";
import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouPollResponse };

export { ApiFutureYouPollError as FutureYouPollError, parseFutureYouPollResponse };

/** Poll Future You job status during onboarding (pre-pay — no full image URL). */
export async function pollFutureYouJobStatus(jobId: string): Promise<FutureYouPollResponse> {
  if (!isSupabaseConfigured()) {
    throw new ApiFutureYouPollError("Sign in to check generation status.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new ApiFutureYouPollError("Sign in to check generation status.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouPollError("Sign in to check generation status.", "auth_required");
  }

  return pollFutureYouJobStatusApi(sb, getSupabaseEnv(), jobId);
}
