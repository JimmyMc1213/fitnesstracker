import { createOpenAIResponsesProvider } from "./openaiResponses.ts";
import type { FutureYouImageProvider } from "./types.ts";

export type { FutureYouImageProvider } from "./types.ts";
export { ImageProviderError } from "./types.ts";

/** Thrown when the selected provider has no API key configured. */
export class ImageProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProviderUnavailableError";
  }
}

/**
 * Resolve the maskless Responses-API provider for Future You generation.
 * Throws ImageProviderUnavailableError if OPENAI_API_KEY is missing.
 */
export function getFutureYouImageProvider(): FutureYouImageProvider {
  const apiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (!apiKey) {
    throw new ImageProviderUnavailableError("OPENAI_API_KEY is not set.");
  }
  return createOpenAIResponsesProvider(apiKey);
}
