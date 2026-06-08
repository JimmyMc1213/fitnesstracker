import { describe, expect, it } from "vitest";
import {
  buildFutureYouPollResponse,
  futureYouPollImageUrl,
  isFutureYouJobId,
} from "./futureYouStatus";

const baseJob = {
  id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  motivation_id: "cut_m_veins",
  result_photo_path: "users/u1/result/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee.png",
  error: null,
  updated_at: "2026-05-29T12:00:00.000Z",
};

describe("futureYouStatus", () => {
  it("accepts valid UUID job ids", () => {
    expect(isFutureYouJobId("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")).toBe(true);
    expect(isFutureYouJobId("not-a-uuid")).toBe(false);
  });

  it("returns generating status while job is in flight", () => {
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "generating" },
      { entitled: false },
    );
    expect(response.status).toBe("generating");
    expect(response.teaser).toBeUndefined();
    expect(response.resultSignedUrl).toBeUndefined();
  });

  it("returns queued status without teaser or result URL", () => {
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "queued" },
      { entitled: false },
    );
    expect(response.status).toBe("queued");
    expect(response.teaser).toBeUndefined();
    expect(response.resultSignedUrl).toBeUndefined();
  });

  it("returns ready status with teaser metadata and preview URL pre-pay", () => {
    const previewUrl = "https://example.com/signed-preview.png";
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "ready" },
      { entitled: false, previewSignedUrl: previewUrl },
    );
    expect(response.status).toBe("ready");
    expect(response.teaser).toEqual({
      ready: true,
      motivationLabel: "Visible veins & definition",
      loadingPhrase: "Enhancing arm definition…",
    });
    expect(response.previewSignedUrl).toBe(previewUrl);
    expect(response.resultSignedUrl).toBeUndefined();
  });

  it("returns resultSignedUrl only when entitled and ready", () => {
    const signedUrl = "https://example.com/signed-result.png";
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "ready" },
      { entitled: true, resultSignedUrl: signedUrl },
    );
    expect(response.resultSignedUrl).toBe(signedUrl);
  });

  it("does not leak result URL when entitled but signed URL missing", () => {
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "ready" },
      { entitled: true, resultSignedUrl: null },
    );
    expect(response.resultSignedUrl).toBeUndefined();
    expect(response.previewSignedUrl).toBeUndefined();
  });

  it("prefers full result URL for post-pay reveal resolution", () => {
    const previewUrl = "https://example.com/preview.png";
    const resultUrl = "https://example.com/result.png";
    const prePay = buildFutureYouPollResponse(
      { ...baseJob, status: "ready" },
      { entitled: false, previewSignedUrl: previewUrl },
    );
    const postPay = buildFutureYouPollResponse(
      { ...baseJob, status: "ready" },
      { entitled: true, resultSignedUrl: resultUrl },
    );
    expect(futureYouPollImageUrl(prePay, false)).toBe(previewUrl);
    expect(futureYouPollImageUrl(postPay, true)).toBe(resultUrl);
    expect(futureYouPollImageUrl(postPay, true)).toBe(
      futureYouPollImageUrl(
        { previewSignedUrl: previewUrl, resultSignedUrl: resultUrl },
        true,
      ),
    );
  });

  it("includes error message when job failed", () => {
    const response = buildFutureYouPollResponse(
      { ...baseJob, status: "failed", error: "Generation failed." },
      { entitled: false },
    );
    expect(response.status).toBe("failed");
    expect(response.error).toBe("Generation failed.");
    expect(response.teaser).toBeUndefined();
  });
});
