/** Keep in sync with src/fitness/futureYouUploadGuards.ts */

export const FUTURE_YOU_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const FUTURE_YOU_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type FutureYouUploadMimeType = (typeof FUTURE_YOU_UPLOAD_MIME_TYPES)[number];

export type FutureYouUploadFileExtension = "jpg" | "png" | "webp";

export type ParsedFutureYouUpload = {
  bytes: Uint8Array;
  mimeType: FutureYouUploadMimeType;
  extension: FutureYouUploadFileExtension;
};

export type FutureYouUploadValidationError = {
  ok: false;
  error: string;
  status: 400 | 413;
};

export type FutureYouUploadValidationSuccess = {
  ok: true;
  upload: ParsedFutureYouUpload;
};

export type FutureYouUploadValidationResult =
  | FutureYouUploadValidationSuccess
  | FutureYouUploadValidationError;

const MIME_TO_EXTENSION: Record<FutureYouUploadMimeType, FutureYouUploadFileExtension> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const FUTURE_YOU_BUCKET = "future-you";

export function buildFutureYouSourcePath(
  userId: string,
  uploadId: string,
  extension: FutureYouUploadFileExtension,
): string {
  return `users/${userId}/source/${uploadId}.${extension}`;
}

export function extensionForFutureYouMime(mimeType: FutureYouUploadMimeType): FutureYouUploadFileExtension {
  return MIME_TO_EXTENSION[mimeType];
}

export function isFutureYouUploadMimeType(value: string): value is FutureYouUploadMimeType {
  return (FUTURE_YOU_UPLOAD_MIME_TYPES as readonly string[]).includes(value);
}

export function detectFutureYouImageMimeFromBytes(bytes: Uint8Array): FutureYouUploadMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function decodeBase64ToBytes(base64: string): Uint8Array | null {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

const DATA_URL_RE = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\s]+)$/i;

export function parseFutureYouImageDataUrl(dataUrl: string): ParsedFutureYouUpload | null {
  const trimmed = dataUrl.trim();
  if (!trimmed) return null;

  const match = DATA_URL_RE.exec(trimmed);
  if (!match) return null;

  const declaredMime = match[1].toLowerCase();
  if (!isFutureYouUploadMimeType(declaredMime)) return null;

  const bytes = decodeBase64ToBytes(match[2].replace(/\s/g, ""));
  if (!bytes || bytes.length === 0) return null;

  const detectedMime = detectFutureYouImageMimeFromBytes(bytes);
  if (!detectedMime) return null;

  const normalizedDeclared = declaredMime === "image/jpg" ? "image/jpeg" : declaredMime;
  const normalizedDetected = detectedMime === "image/jpg" ? "image/jpeg" : detectedMime;
  if (normalizedDeclared !== normalizedDetected) return null;

  return {
    bytes,
    mimeType: detectedMime,
    extension: extensionForFutureYouMime(detectedMime),
  };
}

export function validateFutureYouUploadBytes(bytes: Uint8Array): FutureYouUploadValidationResult {
  if (!bytes.length) {
    return { ok: false, error: "Photo file is empty.", status: 400 };
  }

  if (bytes.length > FUTURE_YOU_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      error: "Photo is too large. Use an image under 10 MB.",
      status: 413,
    };
  }

  const mimeType = detectFutureYouImageMimeFromBytes(bytes);
  if (!mimeType) {
    return {
      ok: false,
      error: "Unsupported photo format. Use JPEG, PNG, or WebP.",
      status: 400,
    };
  }

  return {
    ok: true,
    upload: {
      bytes,
      mimeType,
      extension: extensionForFutureYouMime(mimeType),
    },
  };
}

export function validateFutureYouImageDataUrl(dataUrl: string): FutureYouUploadValidationResult {
  const parsed = parseFutureYouImageDataUrl(dataUrl);
  if (!parsed) {
    return {
      ok: false,
      error: "Invalid photo. Choose a JPEG, PNG, or WebP image.",
      status: 400,
    };
  }
  return validateFutureYouUploadBytes(parsed.bytes);
}

function jsonResponse(body: unknown, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export function unauthorizedResponse(corsHeaders: Record<string, string>): Response {
  return jsonResponse({ error: "Sign in to upload your Future You photo." }, 401, corsHeaders);
}

export function badUploadResponse(
  error: string,
  status: 400 | 413,
  corsHeaders: Record<string, string>,
): Response {
  return jsonResponse({ error }, status, corsHeaders);
}
