import {
  FutureYouUploadError as ApiFutureYouUploadError,
  uploadFutureYouPhoto as uploadFutureYouPhotoApi,
  unwrapFutureYouUploadOutcome,
  type FutureYouUploadResult,
} from "@newyouai/api-client";

import { e2eMockFutureYouUpload } from "@/lib/e2e/futureYouMock";

import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "./supabaseClient";

export type { FutureYouUploadResult };

export { ApiFutureYouUploadError as FutureYouUploadError };

import { isFutureYouPhotoDataUrl, isLocalFutureYouPhotoUri } from "@/lib/futureYouPhotoUri";

async function requireAuthedClient() {
  if (!isSupabaseConfigured()) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }
  const sb = getSupabase();
  if (!sb) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }

  try {
    await sb.auth.refreshSession();
  } catch {
    // Offline refresh can fail; fall back to the persisted session below.
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouUploadError("Sign in to upload your photo.", "auth_required");
  }

  return sb;
}

/** Read a compressed on-device JPEG as base64 and upload via the JSON data-URL path (RN-safe). */
async function uploadFutureYouPhotoFromUri(localUri: string): Promise<FutureYouUploadResult> {
  const FileSystem = await import("expo-file-system/legacy");
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (!base64) {
    throw new ApiFutureYouUploadError("Could not read that photo. Try another image.", "invalid");
  }

  const sb = await requireAuthedClient();
  return unwrapFutureYouUploadOutcome(
    await uploadFutureYouPhotoApi(sb, getSupabaseEnv(), `data:image/jpeg;base64,${base64}`),
  );
}

/** Upload a compressed JPEG (local file URI or data URL). */
export async function uploadFutureYouPhoto(source: string): Promise<FutureYouUploadResult> {
  const mocked = e2eMockFutureYouUpload(source);
  if (mocked) return mocked;

  const trimmed = source.trim();
  if (isLocalFutureYouPhotoUri(trimmed)) {
    return uploadFutureYouPhotoFromUri(trimmed);
  }

  const sb = await requireAuthedClient();
  if (isFutureYouPhotoDataUrl(trimmed)) {
    return unwrapFutureYouUploadOutcome(await uploadFutureYouPhotoApi(sb, getSupabaseEnv(), trimmed));
  }

  throw new ApiFutureYouUploadError("Invalid photo. Choose another image.", "invalid");
}

/** Use stored upload path when present; otherwise upload the local photo. */
export async function resolveFutureYouSourcePath(options: {
  photoStoragePath?: string;
  photoPreview?: string | null;
}): Promise<string> {
  const storedPath = options.photoStoragePath?.trim();
  if (storedPath) return storedPath;

  const preview = options.photoPreview?.trim();
  if (!preview) {
    throw new ApiFutureYouUploadError("Upload your photo again.", "invalid");
  }

  const uploaded = await uploadFutureYouPhoto(preview);
  return uploaded.path;
}
