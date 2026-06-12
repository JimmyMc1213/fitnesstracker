/** Async key-value storage contract shared by PWA and mobile. */
export interface PersistStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Sync storage surface (e.g. `localStorage`) injectable into {@link createLocalStorageAdapter}. */
export interface SyncStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Factory that produces a {@link PersistStorageAdapter} for platform wiring. */
export type PersistStorageAdapterFactory = () => PersistStorageAdapter;
