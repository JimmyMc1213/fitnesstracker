import type {
  FutureYouGenerateResult,
  FutureYouPollResponse,
  FutureYouUploadResult,
} from "@newyouai/api-client";

/** Dev/E2E only — stubs upload/generate/poll Edge Functions (Maestro without real AI). */
export function isE2eMockFutureYouEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU === "true";
}

/** Maestro/simulator only — injects a tiny JPEG instead of opening camera/gallery. */
export function isE2eMockFutureYouCameraEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU_CAMERA === "true";
}

export const E2E_MOCK_FUTURE_YOU_JOB_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

export const E2E_MOCK_FUTURE_YOU_STORAGE_PATH = "e2e/mock/source.jpg";

/** Minimal 1×1 JPEG for upload smoke without camera. */
export const E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP/gH/yHD/2BBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==";

export function e2eMockFutureYouUpload(_imageDataUrl: string): FutureYouUploadResult | null {
  if (!isE2eMockFutureYouEnabled()) return null;
  return {
    path: E2E_MOCK_FUTURE_YOU_STORAGE_PATH,
    uploadId: "e2e-future-you-upload",
    bucket: "future-you",
  };
}

export function e2eMockFutureYouGenerate(): FutureYouGenerateResult | null {
  if (!isE2eMockFutureYouEnabled()) return null;
  return {
    jobId: E2E_MOCK_FUTURE_YOU_JOB_ID,
    status: "generating",
  };
}

export function e2eMockFutureYouPoll(jobId: string): FutureYouPollResponse | null {
  if (!isE2eMockFutureYouEnabled()) return null;
  const trimmed = jobId.trim();
  if (trimmed !== E2E_MOCK_FUTURE_YOU_JOB_ID) return null;
  return {
    jobId: trimmed,
    status: "ready",
    motivationId: "maintain_generic_healthier",
    updatedAt: new Date().toISOString(),
    resultSignedUrl: E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL,
  };
}
