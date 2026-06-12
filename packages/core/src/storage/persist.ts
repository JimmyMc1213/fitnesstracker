import { safeJsonParse } from "./safeJsonParse";
import type { PersistStorageAdapter } from "./types";

/** Load and safely parse a persisted JSON object from storage. */
export async function loadPersistedSlice<T extends Record<string, unknown> = Record<string, unknown>>(
  adapter: PersistStorageAdapter,
  key: string,
): Promise<Partial<T> | null> {
  try {
    const raw = await adapter.getItem(key);
    if (!raw) return null;
    return safeJsonParse<Partial<T> | null>(raw, null, key);
  } catch {
    return null;
  }
}

/** Serialize and persist a JSON object; swallows quota / storage errors. */
export async function savePersistedSlice<T extends Record<string, unknown>>(
  adapter: PersistStorageAdapter,
  key: string,
  slice: T,
): Promise<void> {
  try {
    await adapter.setItem(key, JSON.stringify(slice));
  } catch {
    /* quota */
  }
}
