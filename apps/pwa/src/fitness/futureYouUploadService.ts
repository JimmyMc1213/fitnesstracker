import {
  FutureYouUploadError as ApiFutureYouUploadError,
  isFutureYouAccessBlocked,
  isFutureYouAgeBlocked,
  uploadFutureYouPhoto as uploadFutureYouPhotoApi,
  type FutureYouUploadResult,
} from "@newyouai/api-client";
import {
  FUTURE_YOU_PAGE_BLOCKED_LEDE,
  FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE,
} from "@newyouai/core";
import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouUploadResult };

export { ApiFutureYouUploadError as FutureYouUploadError };

/** Upload a compressed JPEG data URL from onboarding step 10b. */
export async function uploadFutureYouPhoto(imageDataUrl: string): Promise<FutureYouUploadResult> {
  if (!isSupabaseConfigured()) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }
  const sb = getSupabase();
  if (!sb) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "auth_required");
  }

  const outcome = await uploadFutureYouPhotoApi(sb, getSupabaseEnv(), imageDataUrl);
  if (isFutureYouAccessBlocked(outcome)) {
    if (isFutureYouAgeBlocked(outcome)) {
      throw new ApiFutureYouUploadError(FUTURE_YOU_PAGE_BLOCKED_LEDE, "invalid");
    }
    throw new ApiFutureYouUploadError(FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE, "invalid");
  }
  return outcome;
}
