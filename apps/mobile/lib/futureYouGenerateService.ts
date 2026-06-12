import {
  FutureYouGenerateError as ApiFutureYouGenerateError,
  startFutureYouGeneration as startFutureYouGenerationApi,
  type FutureYouGenerateResult,
} from "@newyouai/api-client";
import type { NutritionGoal, OnboardingProfile, UserGender } from "@newyouai/types";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouGenerateResult };

export { ApiFutureYouGenerateError as FutureYouGenerateError };

export type FutureYouGenerateProfile = {
  goal: NutritionGoal;
  gender: UserGender;
  weightLbs: number;
  goalWeightLbs?: number;
};

export type FutureYouGenerateRequest = {
  sourcePath: string;
  motivationId: string;
  profile: FutureYouGenerateProfile;
  timeline?: string;
};

export function buildFutureYouGenerateProfile(
  profile: Pick<OnboardingProfile, "goal" | "gender" | "weightLbs" | "goalWeightLbs">,
): FutureYouGenerateProfile {
  return {
    goal: profile.goal ?? "maintain",
    gender: profile.gender ?? "other",
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
