import { fetchWithTimeout } from "../../_shared/future-you/fetchWithTimeout.ts";
import { preserveIdentityRegion } from "../../_shared/future-you/preserveIdentityRegion.ts";
import {
  decodeBase64ToBytes,
  ImageProviderError,
  normalizeMimeType,
  type ImageEditProvider,
} from "./types.ts";

/**
 * xAI Grok Imagine image editing.
 *
 * Differences from OpenAI that matter here:
 * - JSON body only (multipart/form-data is rejected by the xAI API).
 * - The source image is passed as a base64 data URI, not a file part.
 * - No mask parameter is supported, so identity is held by the prompt plus the
 *   shared preserveIdentityRegion() face composite applied to the output.
 */
const GROK_IMAGE_MODEL = "grok-imagine-image-quality";
const GROK_EDIT_ENDPOINT = "https://api.x.ai/v1/images/edits";
const GROK_FETCH_TIMEOUT_MS = 90_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

type GrokImageResult = {
  b64_json?: string;
  url?: string;
};

type GrokEditResponse = {
  data?: GrokImageResult[];
  block_reason?: string | null;
};

async function callGrokImageEdit(
  imageBytes: Uint8Array,
  mimeType: string,
  prompt: string,
  apiKey: string,
): Promise<Uint8Array> {
  const dataUri = `data:${normalizeMimeType(mimeType)};base64,${bytesToBase64(imageBytes)}`;

  const response = await fetchWithTimeout(
    GROK_EDIT_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_IMAGE_MODEL,
        prompt,
        image: { url: dataUri },
        response_format: "b64_json",
      }),
    },
    GROK_FETCH_TIMEOUT_MS,
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new ImageProviderError("grok", response.status, responseText);
  }

  let payload: GrokEditResponse;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error("Grok returned an invalid JSON response.");
  }

  if (payload.block_reason) {
    throw new Error(`Grok blocked the image edit: ${payload.block_reason}`);
  }

  const item = payload.data?.[0];
  let editedBytes: Uint8Array;
  if (item?.b64_json) {
    editedBytes = decodeBase64ToBytes(item.b64_json);
  } else if (item?.url) {
    const imageResponse = await fetchWithTimeout(item.url, { method: "GET" }, GROK_FETCH_TIMEOUT_MS);
    if (!imageResponse.ok) {
      throw new Error("Could not download Grok result image.");
    }
    editedBytes = new Uint8Array(await imageResponse.arrayBuffer());
  } else {
    throw new Error("Grok response did not include an image.");
  }

  return preserveIdentityRegion(imageBytes, editedBytes);
}

export function createGrokProvider(apiKey: string): ImageEditProvider {
  return {
    id: "grok",
    editImage: (imageBytes, mimeType, prompt) =>
      callGrokImageEdit(imageBytes, mimeType, prompt, apiKey),
  };
}
