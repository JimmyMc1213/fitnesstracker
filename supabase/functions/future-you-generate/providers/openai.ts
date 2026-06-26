import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { fetchWithTimeout } from "../../_shared/future-you/fetchWithTimeout.ts";
import { buildBodyEditMask } from "../../_shared/future-you/buildBodyEditMask.ts";
import { preserveIdentityRegion } from "../../_shared/future-you/preserveIdentityRegion.ts";
import {
  decodeBase64ToBytes,
  ImageProviderError,
  normalizeMimeType,
  type ImageEditProvider,
} from "./types.ts";

/**
 * gpt-image-2 is the recommended upgrade from gpt-image-1: best-in-class
 * identity preservation for edits. Note: it always runs at high fidelity, so
 * passing `input_fidelity` returns a 400 — do not re-add it.
 */
const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_IMAGE_FETCH_TIMEOUT_MS = 90_000;

function mimeToFilename(mimeType: string): string {
  if (mimeType === "image/png") return "source.png";
  if (mimeType === "image/webp") return "source.webp";
  return "source.jpg";
}

async function callOpenAIImageEdit(
  imageBytes: Uint8Array,
  mimeType: string,
  prompt: string,
  apiKey: string,
): Promise<Uint8Array> {
  const decoded = await Image.decode(imageBytes);
  if (!decoded.width || !decoded.height) {
    throw new Error("Could not decode source image dimensions.");
  }

  const maskBytes = await buildBodyEditMask(decoded.width, decoded.height);

  const form = new FormData();
  const blob = new Blob([imageBytes], { type: normalizeMimeType(mimeType) });
  form.append("image", blob, mimeToFilename(mimeType));
  form.append("mask", new Blob([maskBytes], { type: "image/png" }), "mask.png");
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("prompt", prompt);
  // "high" exceeds Supabase's 150s function limit (~150s+ per call); "medium"
  // returns comparable quality in ~60s and completes reliably.
  form.append("quality", "medium");

  const response = await fetchWithTimeout(
    "https://api.openai.com/v1/images/edits",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    },
    OPENAI_IMAGE_FETCH_TIMEOUT_MS,
  );

  const responseText = await response.text();
  if (!response.ok) {
    throw new ImageProviderError("openai", response.status, responseText);
  }

  let payload: { data?: { b64_json?: string }[] };
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw new Error("OpenAI returned an invalid JSON response.");
  }

  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI response did not include an image.");
  }

  const editedBytes = decodeBase64ToBytes(b64);
  return preserveIdentityRegion(imageBytes, editedBytes);
}

export function createOpenAIProvider(apiKey: string): ImageEditProvider {
  return {
    id: "openai",
    editImage: (imageBytes, mimeType, prompt) =>
      callOpenAIImageEdit(imageBytes, mimeType, prompt, apiKey),
  };
}
