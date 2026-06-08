import { describe, expect, it, vi } from "vitest";

import {
  FUTURE_YOU_OPENAI_MAX_ATTEMPTS,
  futureYouRetryDelayMs,
  withFutureYouRetries,
} from "./futureYouRetry";

describe("futureYouRetry", () => {
  it("uses exponential backoff delays", () => {
    expect(futureYouRetryDelayMs(1)).toBe(1000);
    expect(futureYouRetryDelayMs(2)).toBe(2000);
    expect(futureYouRetryDelayMs(3)).toBe(4000);
  });

  it("retries until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("ok");

    const sleep = vi.fn().mockResolvedValue(undefined);
    const onRetry = vi.fn();

    const result = await withFutureYouRetries(fn, { sleep, onRetry });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(1000);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it("throws after max attempts are exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      withFutureYouRetries(fn, { maxAttempts: FUTURE_YOU_OPENAI_MAX_ATTEMPTS, sleep }),
    ).rejects.toThrow("always fails");

    expect(fn).toHaveBeenCalledTimes(FUTURE_YOU_OPENAI_MAX_ATTEMPTS);
    expect(sleep).toHaveBeenCalledTimes(FUTURE_YOU_OPENAI_MAX_ATTEMPTS - 1);
  });
});
