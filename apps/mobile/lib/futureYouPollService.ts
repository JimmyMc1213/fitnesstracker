import {
  FutureYouPollError as ApiFutureYouPollError,
  pollFutureYouJobStatus as pollFutureYouJobStatusApi,
  type FutureYouPollResponse,
} from "@newyouai/api-client";

import { e2eMockFutureYouPoll } from "@/lib/e2e/futureYouMock";

import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabaseClient";

export type { FutureYouPollResponse };

export { ApiFutureYouPollError as FutureYouPollError };

/** Poll Future You job status during onboarding. */
export async function pollFutureYouJobStatus(jobId: string): Promise<FutureYouPollResponse> {
  const mocked = e2eMockFutureYouPoll(jobId);
  if (mocked) return mocked;

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
