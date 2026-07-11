import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  loadSyncMeta,
  pullRemoteMergeAlways,
  savePersistedSlice,
  saveSyncMeta,
  tryPush,
} from "@newyouai/core";
import type { OnboardingProfile, PersistedFitnessSlice } from "@newyouai/types";
import * as FileSystem from "expo-file-system/legacy";

import {
  FutureYouUploadError as ApiFutureYouUploadError,
  uploadFutureYouPhoto as uploadFutureYouPhotoApi,
  type FutureYouUploadResult,
} from "@newyouai/api-client";

import { e2eMockFutureYouUpload } from "@/lib/e2e/futureYouMock";
import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { createSupabaseSyncClient } from "@/lib/fitness/createSupabaseSyncClient";
import { ageFromDateOfBirth } from "@/lib/onboardingProfile";

import { getSupabase, getSupabaseEnv, isSupabaseConfigured } from "./supabaseClient";

import { isFutureYouPhotoDataUrl, isLocalFutureYouPhotoUri } from "@/lib/futureYouPhotoUri";

export type { FutureYouUploadResult };

export { ApiFutureYouUploadError as FutureYouUploadError };

const storageAdapter = createAsyncStorageAdapter();

/** Edge upload age checks read onboardingProfile.dateOfBirth from fitness_user_data. */
export async function prepareFutureYouUploadProfile(
  profile: Pick<OnboardingProfile, "dateOfBirth" | "age" | "heightIn" | "weightLbs" | "gender" | "goal">,
): Promise<void> {
  const dateOfBirth = profile.dateOfBirth?.trim();
  if (!dateOfBirth || !isSupabaseConfigured()) return;

  const sb = getSupabase();
  const {
    data: { session },
  } = await sb?.auth.getSession() ?? { data: { session: null } };
  const uid = session?.user?.id;
  const client = createSupabaseSyncClient();
  if (!uid || !client) return;

  const localSlice =
    (await loadPersistedSlice<PersistedFitnessSlice>(storageAdapter, FITNESS_LOCAL_STORAGE_KEY)) ?? {};
  const existingProfile = localSlice.onboardingProfile ?? undefined;

  const age = ageFromDateOfBirth(dateOfBirth) ?? profile.age ?? existingProfile?.age ?? 0;
  // Merge onto whatever profile exists; only dateOfBirth is required server-side for the
  // age gate, so a sparse profile is an acceptable partial push here.
  const onboardingProfile = {
    ...(existingProfile ?? {}),
    dateOfBirth,
    age,
    heightIn: profile.heightIn ?? existingProfile?.heightIn ?? 0,
    weightLbs: profile.weightLbs ?? existingProfile?.weightLbs ?? 0,
    gender: profile.gender ?? existingProfile?.gender,
    goal: profile.goal ?? existingProfile?.goal,
  } as OnboardingProfile;

  let meta = await loadSyncMeta(storageAdapter);
  // Intentional partial slice: the sync engine merges against the remote row, so we only
  // carry the fields we know locally rather than a full PersistedFitnessSlice.
  let slice = { ...localSlice, onboardingProfile } as PersistedFitnessSlice;
  let result = await tryPush(client, uid, slice, meta);

  for (let retries = 0; "conflict" in result && result.conflict && retries < 3; retries++) {
    const merged = await pullRemoteMergeAlways(client, uid, slice);
    if (merged) {
      slice = {
        ...merged.mergedSlice,
        onboardingProfile,
      };
      meta = merged.meta;
    } else {
      meta = await loadSyncMeta(storageAdapter);
    }
    result = await tryPush(client, uid, slice, meta);
  }

  if ("ok" in result && result.ok) {
    await saveSyncMeta(storageAdapter, result.meta);
    await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, slice);
  }
}

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
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (!base64) {
    throw new ApiFutureYouUploadError("Could not read that photo. Try another image.", "invalid");
  }

  const sb = await requireAuthedClient();
  return uploadFutureYouPhotoApi(sb, getSupabaseEnv(), `data:image/jpeg;base64,${base64}`);
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
    return uploadFutureYouPhotoApi(sb, getSupabaseEnv(), trimmed);
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
