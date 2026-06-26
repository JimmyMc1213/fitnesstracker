/**
 * Image-edit provider abstraction for Future You generation.
 *
 * Each provider takes the user's source selfie + a prompt and returns the
 * transformed image bytes. The active provider is chosen at runtime via the
 * FUTURE_YOU_IMAGE_PROVIDER env var (see ./index.ts).
 */
export interface ImageEditProvider {
  readonly id: string;
  editImage(imageBytes: Uint8Array, mimeType: string, prompt: string): Promise<Uint8Array>;
}

export class ImageProviderError extends Error {
  providerId: string;
  status: number;
  body: string;

  constructor(providerId: string, status: number, body: string) {
    super(`${providerId} image edit failed (${status})`);
    this.name = "ImageProviderError";
    this.providerId = providerId;
    this.status = status;
    this.body = body;
  }
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
