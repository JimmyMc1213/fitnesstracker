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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns job id and status from generate response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
          status: "ready",
        }),
      }),
    );

    const result = await startFutureYouGeneration(
      mockClient(vi.fn()),
      validEnv,
      {
        sourcePath: "users/u1/source/a.jpg",
        motivationId: "cut_m_veins",
        profile: { goal: "cut", gender: "male", weightLbs: 190 },
      },
    );

    expect(result).toEqual({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "ready",
    });
  });

  it("treats conflict responses as an existing in-flight job", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          error: "Generation already in progress.",
          jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
          status: "generating",
        }),
      }),
    );

    const result = await startFutureYouGeneration(
      mockClient(vi.fn()),
      validEnv,
      {
        sourcePath: "users/u1/source/a.jpg",
        motivationId: "cut_m_veins",
        profile: { goal: "cut", gender: "male", weightLbs: 190 },
      },
    );

    expect(result.status).toBe("generating");
    expect(result.jobId).toBe("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
  });

  it("throws FutureYouGenerateError on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Edge offline" }),
      }),
    );

    await expect(
      startFutureYouGeneration(mockClient(vi.fn()), validEnv, {
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
  });
});

describe("pollFutureYouJobStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses poll response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
          status: "ready",
          motivationId: "cut_m_veins",
          updatedAt: "2026-01-01T00:00:00.000Z",
        }),
      }),
    );

    const result = await pollFutureYouJobStatus(
      mockClient(vi.fn()),
      validEnv,
      "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    );

    expect(result.status).toBe("ready");
  });
});

describe("parseFutureYouPollResponse", () => {
  it("throws on invalid payload", () => {
    expect(() => parseFutureYouPollResponse({})).toThrow(FutureYouPollError);
  });
});

describe("submitFutureYouReport", () => {
  it("returns report id", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { ok: true, reportId: "rep-1" },
      error: null,
    });

    const result = await submitFutureYouReport(mockClient(invoke), {
      context: "home",
      category: "offensive",
    });

    expect(result.reportId).toBe("rep-1");
  });
});
