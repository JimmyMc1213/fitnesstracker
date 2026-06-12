import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FutureYouGenerateError,
  FutureYouPollError,
  parseFutureYouPollResponse,
  pollFutureYouJobStatus,
  startFutureYouGeneration,
  submitFutureYouReport,
  uploadFutureYouPhoto,
} from "./futureYou";

const validEnv = {
  url: "https://example.supabase.co",
  publishableKey: "sb_publishable_abcdefghij",
};

function mockClient(
  invoke: ReturnType<typeof vi.fn>,
  session: { access_token: string } | null = { access_token: "token-1" },
): SupabaseClient {
  return {
    functions: { invoke },
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
  } as unknown as SupabaseClient;
}

describe("startFutureYouGeneration", () => {
  it("returns job id and status from invoke response", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee", status: "queued" },
      error: null,
    });

    const result = await startFutureYouGeneration(mockClient(invoke), {
      sourcePath: "users/u1/source/a.jpg",
      motivationId: "cut_m_veins",
      profile: { goal: "cut", gender: "male", weightLbs: 190 },
    });

    expect(result).toEqual({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "queued",
    });
  });

  it("treats conflict responses as an existing in-flight job", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        error: "Generation already in progress.",
        jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        status: "generating",
      },
      error: null,
    });

    const result = await startFutureYouGeneration(mockClient(invoke), {
      sourcePath: "users/u1/source/a.jpg",
      motivationId: "cut_m_veins",
      profile: { goal: "cut", gender: "male", weightLbs: 190 },
    });

    expect(result.status).toBe("generating");
    expect(result.jobId).toBe("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
  });

  it("throws FutureYouGenerateError on invoke failure", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("Edge offline"),
    });

    await expect(
      startFutureYouGeneration(mockClient(invoke), {
        sourcePath: "users/u1/source/a.jpg",
        motivationId: "cut_m_veins",
        profile: { goal: "cut", gender: "male", weightLbs: 190 },
      }),
    ).rejects.toBeInstanceOf(FutureYouGenerateError);
  });
});

describe("uploadFutureYouPhoto", () => {
  it("parses upload response", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { path: "users/u1/source/x.jpg", uploadId: "up-1", bucket: "future-you" },
      error: null,
    });

    const result = await uploadFutureYouPhoto(mockClient(invoke), "data:image/jpeg;base64,abc");
    expect(result.path).toBe("users/u1/source/x.jpg");
    expect(invoke).toHaveBeenCalledWith("future-you-upload", {
      body: { imageDataUrl: "data:image/jpeg;base64,abc" },
    });
  });
});

describe("submitFutureYouReport", () => {
  it("parses report response", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { ok: true, reportId: "rep-1" },
      error: null,
    });

    const result = await submitFutureYouReport(mockClient(invoke), {
      context: "home",
      category: "other",
    });
    expect(result.reportId).toBe("rep-1");
  });
});

describe("parseFutureYouPollResponse", () => {
  it("parses generating status without teaser or image URL", () => {
    expect(
      parseFutureYouPollResponse({
        jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        status: "generating",
        motivationId: "cut_m_veins",
        updatedAt: "2026-05-29T12:00:00.000Z",
      }),
    ).toEqual({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "generating",
      motivationId: "cut_m_veins",
      updatedAt: "2026-05-29T12:00:00.000Z",
    });
  });
});

describe("pollFutureYouJobStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches status with injected env and session token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        status: "generating",
        motivationId: "cut_m_veins",
        updatedAt: "2026-05-29T12:00:00.000Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = mockClient(vi.fn());
    const response = await pollFutureYouJobStatus(
      client,
      validEnv,
      "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    );

    expect(response.status).toBe("generating");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/future-you-status?jobId=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-1",
          apikey: validEnv.publishableKey,
        }),
      }),
    );
  });

  it("maps 404 to not_found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "not found" }),
      }),
    );

    await expect(
      pollFutureYouJobStatus(
        mockClient(vi.fn()),
        validEnv,
        "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      ),
    ).rejects.toMatchObject({ code: "not_found" });
  });
});
