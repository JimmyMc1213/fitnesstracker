import {
  FutureYouUploadError as ApiFutureYouUploadError,
  uploadFutureYouPhoto as uploadFutureYouPhotoApi,
  type FutureYouUploadResult,
} from "@newyouai/api-client";

import { e2eMockFutureYouUpload } from "@/lib/e2e/futureYouMock";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouUploadResult };

export { ApiFutureYouUploadError as FutureYouUploadError };

/** Upload a compressed JPEG data URL from onboarding step 10b. */
export async function uploadFutureYouPhoto(imageDataUrl: string): Promise<FutureYouUploadResult> {
  const mocked = e2eMockFutureYouUpload(imageDataUrl);
  if (mocked) return mocked;

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

  return uploadFutureYouPhotoApi(sb, imageDataUrl);
}
