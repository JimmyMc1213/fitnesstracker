import type { PersistStorageAdapter } from "./types";

/** In-memory adapter for unit tests and ephemeral environments. */
export function createMemoryStorageAdapter(
  initial: Record<string, string> = {},
): PersistStorageAdapter {
  const store = new Map<string, string>(Object.entries(initial));

  return {
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async (key) => {
      store.delete(key);
    },
  };
}
