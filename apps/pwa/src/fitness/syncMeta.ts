import { FITNESS_SYNC_META_KEY, type FitnessSyncMeta } from "@newyouai/core";

export type { FitnessSyncMeta };

export function loadSyncMeta(): FitnessSyncMeta {
  try {
    const raw = localStorage.getItem(FITNESS_SYNC_META_KEY);
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

export function saveSyncMeta(meta: FitnessSyncMeta): void {
  try {
    localStorage.setItem(FITNESS_SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* quota */
  }
}
