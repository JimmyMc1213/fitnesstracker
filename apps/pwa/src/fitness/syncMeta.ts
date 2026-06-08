const KEY = "fitcoach:syncMeta:v1";

export type FitnessSyncMeta = {
  /** Last `updated_at_ms` from Supabase we reconciled with (compare-and-swap baseline). */
  lastSeenRemoteUpdatedAtMs: number;
};

export function loadSyncMeta(): FitnessSyncMeta {
  try {
    const raw = localStorage.getItem(KEY);
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
    localStorage.setItem(KEY, JSON.stringify(meta));
  } catch {
    /* quota */
  }
}
