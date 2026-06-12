import type { PersistStorageAdapter, SyncStorageLike } from "./types";

/** Wraps a sync Storage-like API (e.g. `localStorage`) as an async adapter. */
export function createLocalStorageAdapter(storage: SyncStorageLike): PersistStorageAdapter {
  return {
    getItem: (key) => Promise.resolve(storage.getItem(key)),
    setItem: (key, value) => {
      storage.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      storage.removeItem(key);
      return Promise.resolve();
    },
  };
}
