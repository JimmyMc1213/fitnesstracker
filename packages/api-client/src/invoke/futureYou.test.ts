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

  it("returns age block on 403 age_restricted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "age_restricted" }),
      }),
    );

    const result = await startFutureYouGeneration(mockClient(vi.fn()), validEnv, {
      sourcePath: "users/u1/source/a.jpg",
      motivationId: "cut_m_veins",
      profile: { goal: "cut", gender: "male", weightLbs: 190 },
    });

    expect(result).toEqual({ blocked: "age" });
  });
});

describe("uploadFutureYouPhoto", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses upload response via direct fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ path: "users/u1/source/x.jpg", uploadId: "up-1", bucket: "future-you" }),
      }),
    );

    const result = await uploadFutureYouPhoto(
      mockClient(vi.fn()),
      validEnv,
      "data:image/jpeg;base64,abc",
    );

    expect(result.path).toBe("users/u1/source/x.jpg");
  });

  it("uploads multipart FormData without forcing JSON content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ path: "users/u1/source/x.jpg", uploadId: "up-1", bucket: "future-you" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.append("file", new Blob(["abc"], { type: "image/jpeg" }), "future-you.jpg");

    await uploadFutureYouPhoto(mockClient(vi.fn()), validEnv, formData);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/functions/v1/future-you-upload",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: expect.not.objectContaining({ "Content-Type": expect.anything() }),
      }),
    );
  });

  it("returns age block on 403 age_restricted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "age_restricted" }),
      }),
    );

    const result = await uploadFutureYouPhoto(
      mockClient(vi.fn()),
      validEnv,
      "data:image/jpeg;base64,abc",
    );

    expect(result).toEqual({ blocked: "age" });
  });

  it("returns region block on 403 region_restricted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "region_restricted" }),
      }),
    );

    const result = await uploadFutureYouPhoto(
      mockClient(vi.fn()),
      validEnv,
      "data:image/jpeg;base64,abc",
    );

    expect(result).toEqual({ blocked: "region" });
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

  it("parses failed job error without treating it as a transport error", () => {
    const response = parseFutureYouPollResponse({
      jobId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      status: "failed",
      motivationId: "cut_m_veins",
      updatedAt: "2026-01-01T00:00:00.000Z",
      error: "Source photo not found.",
    });

    expect(response.status).toBe("failed");
    expect(response.error).toBe("Source photo not found.");
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
