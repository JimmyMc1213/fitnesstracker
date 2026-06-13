import type { PersistStorageAdapter } from "../storage/types";

export const FITNESS_SYNC_META_KEY = "fitcoach:syncMeta:v1";

export type FitnessSyncMeta = {
  /** Last `updated_at_ms` from Supabase we reconciled with (compare-and-swap baseline). */
  lastSeenRemoteUpdatedAtMs: number;
};

export async function loadSyncMeta(adapter: PersistStorageAdapter): Promise<FitnessSyncMeta> {
  try {
    const raw = await adapter.getItem(FITNESS_SYNC_META_KEY);
    if (!raw) return { lastSeenRemoteUpdatedAtMs: 0 };
    const o = JSON.parse(raw) as Partial<FitnessSyncMeta>;
    return {
      lastSeenRemoteUpdatedAtMs:
        typeof o.lastSeenRemoteUpdatedAtMs === "number" && Number.isFinite(o.lastSeenRemoteUpdatedAtMs)
          ? o.lastSeenRemoteUpdatedAtMs
          : 0,
    };
  } catch {
    return { lastSeenRemoteUpdatedAtMs: 0 };
  }
}

export async function saveSyncMeta(adapter: PersistStorageAdapter, meta: FitnessSyncMeta): Promise<void> {
  try {
    await adapter.setItem(FITNESS_SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* quota */
  }
}
