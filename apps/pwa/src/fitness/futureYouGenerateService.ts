import {
  FutureYouGenerateError as ApiFutureYouGenerateError,
  startFutureYouGeneration as startFutureYouGenerationApi,
  type FutureYouGenerateResult,
} from "@newyouai/api-client";
import type { FutureYouGenerateProfile, FutureYouGenerateRequest } from "./futureYouGenerateGuards";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouGenerateResult };

export { ApiFutureYouGenerateError as FutureYouGenerateError };

export function buildFutureYouGenerateProfile(
  profile: Pick<FutureYouGenerateProfile, "goal" | "gender" | "weightLbs" | "goalWeightLbs">,
): FutureYouGenerateProfile {
  return {
    goal: profile.goal,
    gender: profile.gender,
    weightLbs: profile.weightLbs,
    goalWeightLbs: profile.goalWeightLbs,
  };
}

/** Queue Future You generation after step 10c. */
export async function startFutureYouGeneration(
  request: FutureYouGenerateRequest,
): Promise<FutureYouGenerateResult> {
  if (!isSupabaseConfigured()) {
    throw new ApiFutureYouGenerateError("Sign in to create your Future You.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new ApiFutureYouGenerateError("Sign in to create your Future You.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouGenerateError("Sign in to create your Future You.", "auth_required");
  }

  return startFutureYouGenerationApi(sb, request);
}
