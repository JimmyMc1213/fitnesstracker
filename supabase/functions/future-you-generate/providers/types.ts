/** Result of a single maskless Future You generation. */
export type GeneratedImage = {
  imageBytes: Uint8Array;
  /** The mainline model's auto-revised prompt, for audit/logging. */
  revisedPrompt?: string;
};

/**
 * Maskless single-image provider contract for Future You generation.
 *
 * Takes the user's source selfie + a positive prompt and returns one
 * transformed image plus the revised prompt.
 */
export interface FutureYouImageProvider {
  readonly id: string;
  generate(imageBytes: Uint8Array, mimeType: string, prompt: string): Promise<GeneratedImage>;
}

export class ImageProviderError extends Error {
  providerId: string;
  status: number;
  body: string;

  constructor(providerId: string, status: number, body: string) {
    super(formatImageProviderErrorMessage(providerId, status, body));
    this.name = "ImageProviderError";
    this.providerId = providerId;
    this.status = status;
    this.body = body;
  }
}

/** Pull a human-readable message from an OpenAI JSON error body. */
export function extractOpenAiErrorDetail(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: string; type?: string };
    };
    const err = parsed.error;
    if (!err) return undefined;
    const parts = [err.message, err.code ? `code=${err.code}` : null].filter(Boolean);
    return parts.join(" ") || undefined;
  } catch {
    const trimmed = body.trim();
    return trimmed ? trimmed.slice(0, 300) : undefined;
  }
}

function formatImageProviderErrorMessage(
  providerId: string,
  status: number,
  body: string,
): string {
  const detail = extractOpenAiErrorDetail(body);
  if (detail) return `Image generation failed (${status}): ${detail}`;
  return `${providerId} image generation failed (${status}).`;
}

/**
 * Distinct job error stored when the Responses image_generation_call returns
 * status="failed" with no error detail (HTTP 200) — a likely content/safety
 * refusal rather than a transient outage. The client maps this code to copy
 * like "This photo couldn't be used — try one with different framing or
 * lighting." Kept in sync with packages/core/src/future-you/generationPillModel.ts.
 */
export const FUTURE_YOU_GENERATION_REFUSED_ERROR = "generation_refused";

/**
 * Message thrown by the OpenAI Responses provider when image_generation_call
 * comes back failed with no error message/code. Mirrors the literal in
 * providers/openaiResponses.ts (which must not be modified) so we can classify
 * the no-detail refusal here without touching the provider.
 */
const IMAGE_GENERATION_NO_DETAIL_FAILURE = "OpenAI image generation call failed.";

/**
 * True when the failure is a content/safety refusal (image_generation_call
 * failed with no error detail on HTTP 200) rather than a transient/transport
 * error. These must not be retried and should surface a usable, distinct reason.
 */
export function isImageGenerationRefusal(error: unknown): boolean {
  return error instanceof Error && error.message.trim() === IMAGE_GENERATION_NO_DETAIL_FAILURE;
}

/** Map any thrown value to a user-visible job error string. */
export function formatGenerationError(error: unknown): string {
  if (isImageGenerationRefusal(error)) {
    return FUTURE_YOU_GENERATION_REFUSED_ERROR;
  }
  if (error instanceof ImageProviderError) {
    return error.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return "Generation failed.";
}

/**
 * Transient failures worth one retry: rate limiting (429), upstream/server
 * errors (5xx), and network/timeout failures. Non-transient client errors
 * (e.g. 400/401/403) must fail immediately, and a successful image is never
 * retried.
 */
export function isTransientImageProviderError(error: unknown): boolean {
  if (error instanceof ImageProviderError) {
    return error.status === 429 || error.status >= 500;
  }
  // AbortSignal.timeout() rejects with a TimeoutError DOMException; fetch
  // network failures throw a TypeError.
  if (error instanceof DOMException) {
    return error.name === "TimeoutError" || error.name === "AbortError";
  }
  if (error instanceof TypeError) return true;
  return false;
}

export function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function normalizeMimeType(mimeType: string): string {
  return mimeType === "image/jpg" ? "image/jpeg" : mimeType;
}
