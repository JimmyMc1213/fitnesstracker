import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { buildBodyEditMask } from "../_shared/future-you/buildBodyEditMask.ts";
import { preserveIdentityRegion } from "../_shared/future-you/preserveIdentityRegion.ts";
import { withFutureYouRetries } from "../_shared/future-you/retry.ts";

export class OpenAIImageError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`OpenAI image edit failed (${status})`);
    this.name = "OpenAIImageError";
    this.status = status;
    this.body = body;
  }
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

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
  const blob = new Blob([imageBytes], { type: mimeType === "image/jpg" ? "image/jpeg" : mimeType });
  form.append("image", blob, mimeToFilename(mimeType));
  form.append("mask", new Blob([maskBytes], { type: "image/png" }), "mask.png");
  form.append("model", "gpt-image-1");
  form.append("prompt", prompt);
  form.append("input_fidelity", "high");
  form.append("quality", "high");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new OpenAIImageError(response.status, responseText);
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

export async function editFutureYouImageWithRetries(
  imageBytes: Uint8Array,
  mimeType: string,
  prompt: string,
  apiKey: string,
  onRetry?: (attempt: number, error: unknown) => void,
): Promise<Uint8Array> {
  return withFutureYouRetries(
    () => callOpenAIImageEdit(imageBytes, mimeType, prompt, apiKey),
    { onRetry },
  );
}
