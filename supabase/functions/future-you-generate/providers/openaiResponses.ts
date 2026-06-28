import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { fetchWithTimeout } from "../../_shared/future-you/fetchWithTimeout.ts";
import { withFutureYouRetries } from "../../_shared/future-you/retry.ts";
import {
  decodeBase64ToBytes,
  extractOpenAiErrorDetail,
  type FutureYouImageProvider,
  type GeneratedImage,
  ImageProviderError,
  isTransientImageProviderError,
  normalizeMimeType,
} from "./types.ts";

/**
 * Maskless Future You transformation via the OpenAI Responses API.
 *
 * The mainline model drives the hosted `image_generation` tool. A source photo
 * is always in context, so `action: "auto"` lets the tool edit it. Use medium
 * quality — high quality routinely exceeds our stale-job window on real photos.
 * The model auto-revises the prompt; we capture `revised_prompt` for audit.
 */
const RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";
const OPENAI_MAINLINE_MODEL = "gpt-5.5";
/** Medium-quality edit completes in ~60–90s; high quality can exceed 5+ minutes. */
const OPENAI_FETCH_TIMEOUT_MS = 120_000;
/** Inputs are processed at high fidelity regardless of size, so cap the long edge. */
const MAX_LONG_EDGE_PX = 1024;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/**
 * Downscale the source so the long edge is at most MAX_LONG_EDGE_PX. A full-res
 * phone photo only costs more tokens for no quality benefit. Falls back to the
 * original bytes if the image cannot be decoded (e.g. an unsupported codec).
 */
async function downscaleLongEdge(
  bytes: Uint8Array,
  mimeType: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  try {
    const image = await Image.decode(bytes);
    const longEdge = Math.max(image.width, image.height);
    if (!longEdge || longEdge <= MAX_LONG_EDGE_PX) return { bytes, mimeType };

    const scale = MAX_LONG_EDGE_PX / longEdge;
    image.resize(
      Math.max(1, Math.round(image.width * scale)),
      Math.max(1, Math.round(image.height * scale)),
    );
    const encoded = await image.encode();
    return { bytes: encoded, mimeType: "image/png" };
  } catch {
    return { bytes, mimeType };
  }
}

type ResponsesOutputItem = {
  type?: string;
  status?: string;
  result?: string;
  revised_prompt?: string;
  error?: { message?: string; code?: string };
};

type ResponsesPayload = {
  error?: { message?: string; code?: string; type?: string };
  output?: ResponsesOutputItem[];
};

function findCompletedImageCall(
  output: ResponsesOutputItem[] | undefined,
): ResponsesOutputItem | undefined {
  if (!output?.length) return undefined;
  return output.find(
    (item) =>
      item.type === "image_generation_call" &&
      item.status === "completed" &&
      typeof item.result === "string" &&
      item.result.length > 0,
  );
}

async function callResponsesImageGen(
  imageBytes: Uint8Array,
  mimeType: string,
  prompt: string,
  apiKey: string,
): Promise<GeneratedImage> {
  console.log("openai-responses: starting Responses API call", {
    mainlineModel: OPENAI_MAINLINE_MODEL,
    promptLength: prompt.length,
    imageBytes: imageBytes.length,
    mimeType,
  });

  const dataUri = `data:${normalizeMimeType(mimeType)};base64,${bytesToBase64(imageBytes)}`;

  const response = await fetchWithTimeout(
    RESPONSES_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MAINLINE_MODEL,
        tool_choice: { type: "image_generation" },
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: dataUri },
            ],
          },
        ],
        tools: [
          {
            type: "image_generation",
            quality: "medium",
            size: "auto",
            action: "auto",
          },
        ],
      }),
    },
    OPENAI_FETCH_TIMEOUT_MS,
  );

  const responseText = await response.text();
  if (!response.ok) {
    console.error("openai-responses: HTTP error", {
      status: response.status,
      detail: extractOpenAiErrorDetail(responseText) ?? responseText.slice(0, 500),
    });
    throw new ImageProviderError("openai-responses", response.status, responseText);
  }

  let payload: ResponsesPayload;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error("OpenAI returned an invalid JSON response.");
  }

  if (payload.error?.message) {
    throw new Error(`OpenAI error: ${payload.error.message}`);
  }

  const outputTypes = payload.output?.map((item) => item.type).filter(Boolean) ?? [];
  console.log("openai-responses: Responses API returned", {
    status: response.status,
    outputTypes,
  });

  const call = findCompletedImageCall(payload.output);
  if (!call?.result) {
    const failedCall = payload.output?.find(
      (item) => item.type === "image_generation_call" && item.status === "failed",
    );
    if (failedCall) {
      const detail = failedCall.error?.message ?? failedCall.error?.code;
      throw new Error(
        detail ? `OpenAI image generation failed: ${detail}` : "OpenAI image generation call failed.",
      );
    }
    throw new Error(
      `OpenAI response did not include an image (output types: ${outputTypes.join(", ") || "none"}).`,
    );
  }

  console.log("openai-responses: image received", {
    revisedPromptLength: call.revised_prompt?.length ?? 0,
    resultBytesApprox: Math.round((call.result.length * 3) / 4),
  });

  return {
    imageBytes: decodeBase64ToBytes(call.result),
    revisedPrompt: call.revised_prompt,
  };
}

export function createOpenAIResponsesProvider(apiKey: string): FutureYouImageProvider {
  return {
    id: "openai-responses",
    generate: async (imageBytes, mimeType, prompt) => {
      const downscaled = await downscaleLongEdge(imageBytes, mimeType);
      // One transient retry only (429 / 5xx / network) — never retry a
      // successful image for quality reasons.
      return withFutureYouRetries(
        () => callResponsesImageGen(downscaled.bytes, downscaled.mimeType, prompt, apiKey),
        { maxAttempts: 2, shouldRetry: isTransientImageProviderError },
      );
    },
  };
}
