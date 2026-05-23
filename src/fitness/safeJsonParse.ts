let loggedKeys = new Set<string>();

/** Parse JSON with fallback; log once per key on failure. */
export function safeJsonParse<T>(raw: string, fallback: T, logKey: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    if (!loggedKeys.has(logKey)) {
      loggedKeys.add(logKey);
      const detail = e instanceof Error ? e.message : String(e);
      console.warn(`[Fitcoach] Could not parse persisted data (${logKey}): ${detail}`);
    }
    return fallback;
  }
}

/** Reset log dedupe — for tests only. */
export function resetSafeJsonParseLogs(): void {
  loggedKeys = new Set();
}
