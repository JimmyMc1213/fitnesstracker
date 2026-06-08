import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export type FutureYouUploadResult = {
  path: string;
  uploadId: string;
  bucket: string;
};

export class FutureYouUploadError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouUploadError";
  }
}

function parseUploadResponse(data: unknown): FutureYouUploadResult {
  if (!data || typeof data !== "object") {
    throw new FutureYouUploadError("Photo upload failed. Try again.", "invalid");
  }
  const err = data as { error?: string };
  if (typeof err.error === "string" && err.error.trim()) {
    throw new FutureYouUploadError(err.error.trim(), "invalid");
  }
  const body = data as Partial<FutureYouUploadResult>;
  if (typeof body.path !== "string" || !body.path.trim()) {
    throw new FutureYouUploadError("Photo upload failed. Try again.", "invalid");
  }
  return {
    path: body.path.trim(),
    uploadId: typeof body.uploadId === "string" ? body.uploadId : "",
    bucket: typeof body.bucket === "string" ? body.bucket : "future-you",
  };
}

/** Upload a compressed JPEG data URL from onboarding step 10b. */
export async function uploadFutureYouPhoto(imageDataUrl: string): Promise<FutureYouUploadResult> {
  if (!isSupabaseConfigured()) {
    throw new FutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }
  const sb = getSupabase();
  if (!sb) {
    throw new FutureYouUploadError("Sign in to upload your photo.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new FutureYouUploadError("Sign in to upload your photo.", "auth_required");
  }

  const { data, error } = await sb.functions.invoke("future-you-upload", {
    body: { imageDataUrl },
  });

  if (error) {
    throw new FutureYouUploadError(error.message || "Photo upload failed. Try again.", "unavailable");
  }

  return parseUploadResponse(data);
}
