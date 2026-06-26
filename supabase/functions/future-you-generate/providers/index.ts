import { withFutureYouRetries } from "../../_shared/future-you/retry.ts";
import { createGrokProvider } from "./grok.ts";
import { createOpenAIProvider } from "./openai.ts";
import type { ImageEditProvider } from "./types.ts";

export type { ImageEditProvider } from "./types.ts";
export { ImageProviderError } from "./types.ts";

export type ImageProviderId = "openai" | "grok";

/** Thrown when the selected provider has no API key configured. */
export class ImageProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProviderUnavailableError";
  }
}

export function resolveImageProviderId(): ImageProviderId {
  const raw = Deno.env.get("FUTURE_YOU_IMAGE_PROVIDER")?.trim().toLowerCase();
  if (raw === "grok") return "grok";
  return "openai";
}

/**
 * Resolve the active image provider from env. Defaults to OpenAI; set
 * FUTURE_YOU_IMAGE_PROVIDER=grok (and XAI_API_KEY) to use Grok instead.
 * Throws ImageProviderUnavailableError if the selected provider's key is missing.
 */
export function getImageProvider(): ImageEditProvider {
  const id = resolveImageProviderId();

  if (id === "grok") {
    const apiKey = Deno.env.get("XAI_API_KEY")?.trim();
    if (!apiKey) {
      throw new ImageProviderUnavailableError(
        "FUTURE_YOU_IMAGE_PROVIDER=grok but XAI_API_KEY is not set.",
      );
    }
    return createGrokProvider(apiKey);
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    throw new ImageProviderUnavailableError("OPENAI_API_KEY is not set.");
  }
  return createOpenAIProvider(apiKey);
}

export function editFutureYouImageWithRetries(
  provider: ImageEditProvider,
  imageBytes: Uint8Array,
  mimeType: string,
  prompt: string,
  onRetry?: (attempt: number, error: unknown) => void,
): Promise<Uint8Array> {
  // Cap attempts: each call is ~60s, so 3 retries could exceed Supabase's ~150s
  // request limit. Two attempts fit while still covering a transient failure.
  return withFutureYouRetries(
    () => provider.editImage(imageBytes, mimeType, prompt),
    { onRetry, maxAttempts: 2 },
  );
}
