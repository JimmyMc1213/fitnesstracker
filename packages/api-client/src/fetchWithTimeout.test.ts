import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetchWithTimeout";

describe("fetchWithTimeout", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("returns the fetch response when the request completes in time", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );

    const response = await fetchWithTimeout("https://example.com", { method: "GET" }, 1000);
    expect(response.status).toBe(200);
  });

  it("aborts when the timeout elapses", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const onAbort = () => {
            reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
          };
          if (init?.signal?.aborted) {
            onAbort();
            return;
          }
          init?.signal?.addEventListener("abort", onAbort);
        });
      }),
    );

    const pending = fetchWithTimeout("https://example.com", { method: "GET" }, 50);
    const rejection = expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await vi.advanceTimersByTimeAsync(50);
    await rejection;
  });
});
