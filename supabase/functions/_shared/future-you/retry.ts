/** Keep in sync with src/fitness/futureYouRetry.ts */

export const FUTURE_YOU_OPENAI_MAX_ATTEMPTS = 3;
export const FUTURE_YOU_OPENAI_RETRY_BASE_MS = 1000;

export function futureYouRetryDelayMs(attempt: number, baseMs = FUTURE_YOU_OPENAI_RETRY_BASE_MS): number {
  return baseMs * 2 ** (attempt - 1);
}

export async function withFutureYouRetries<T>(
  fn: (attempt: number) => Promise<T>,
  options?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
    sleep?: (ms: number) => Promise<void>;
    /**
     * Optional predicate to gate retries. Return false to fail immediately
     * without retrying (e.g. non-transient HTTP errors). Defaults to retrying
     * all errors, preserving existing callers.
     */
    shouldRetry?: (error: unknown) => boolean;
  },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? FUTURE_YOU_OPENAI_MAX_ATTEMPTS;
  const baseDelayMs = options?.baseDelayMs ?? FUTURE_YOU_OPENAI_RETRY_BASE_MS;
  const sleep = options?.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) break;
      if (options?.shouldRetry && !options.shouldRetry(error)) break;
      options?.onRetry?.(attempt, error);
      await sleep(futureYouRetryDelayMs(attempt, baseDelayMs));
    }
  }

  throw lastError;
}
