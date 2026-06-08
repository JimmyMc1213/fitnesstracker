import { describe, expect, it } from "vitest";
import {
  FUTURE_YOU_UPLOAD_MAX_BYTES,
  buildFutureYouSourcePath,
  detectFutureYouImageMimeFromBytes,
  parseFutureYouImageDataUrl,
  validateFutureYouImageDataUrl,
  validateFutureYouUploadBytes,
} from "./futureYouUploadGuards";

/** Minimal valid 1×1 JPEG (red pixel). */
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==";

const TINY_JPEG_DATA_URL = `data:image/jpeg;base64,${TINY_JPEG_BASE64}`;

describe("futureYouUploadGuards", () => {
  const userId = "11111111-1111-4111-8111-111111111111";

  it("builds source paths under the user folder", () => {
    expect(buildFutureYouSourcePath(userId, "abc-123", "jpg")).toBe(
      `users/${userId}/source/abc-123.jpg`,
    );
  });

  it("detects JPEG magic bytes", () => {
    const bytes = Uint8Array.from(atob(TINY_JPEG_BASE64), (c) => c.charCodeAt(0));
    expect(detectFutureYouImageMimeFromBytes(bytes)).toBe("image/jpeg");
  });

  it("parses a valid JPEG data URL", () => {
    const parsed = parseFutureYouImageDataUrl(TINY_JPEG_DATA_URL);
    expect(parsed).not.toBeNull();
    expect(parsed?.mimeType).toBe("image/jpeg");
    expect(parsed?.extension).toBe("jpg");
  });

  it("rejects non-image data URLs", () => {
    expect(parseFutureYouImageDataUrl("data:text/plain;base64,abc")).toBeNull();
    expect(parseFutureYouImageDataUrl("not-a-data-url")).toBeNull();
  });

  it("rejects declared MIME that does not match bytes", () => {
    const pngHeader = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const fake = `data:image/jpeg;base64,${btoa(String.fromCharCode(...pngHeader))}`;
    expect(parseFutureYouImageDataUrl(fake)).toBeNull();
  });

  it("accepts valid JPEG uploads", () => {
    const result = validateFutureYouImageDataUrl(TINY_JPEG_DATA_URL);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.upload.mimeType).toBe("image/jpeg");
    }
  });

  it("rejects empty uploads", () => {
    expect(validateFutureYouUploadBytes(new Uint8Array())).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it("rejects oversized uploads", () => {
    const bytes = new Uint8Array(FUTURE_YOU_UPLOAD_MAX_BYTES + 1);
    bytes[0] = 0xff;
    bytes[1] = 0xd8;
    bytes[2] = 0xff;
    expect(validateFutureYouUploadBytes(bytes)).toMatchObject({
      ok: false,
      status: 413,
      error: expect.stringContaining("10 MB"),
    });
  });

  it("rejects unknown binary formats", () => {
    expect(validateFutureYouUploadBytes(new Uint8Array([0, 1, 2, 3]))).toMatchObject({
      ok: false,
      status: 400,
      error: expect.stringContaining("Unsupported"),
    });
  });
});
