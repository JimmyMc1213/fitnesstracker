import { describe, expect, it } from "vitest";

import { createMemoryStorageAdapter } from "../storage/createMemoryStorageAdapter";
import { FITNESS_SYNC_META_KEY, loadSyncMeta, saveSyncMeta } from "./syncMeta";

describe("syncMeta", () => {
  it("round-trips lastSeenRemoteUpdatedAtMs under fitcoach:syncMeta:v1", async () => {
    const adapter = createMemoryStorageAdapter();
    await saveSyncMeta(adapter, { lastSeenRemoteUpdatedAtMs: 42_000 });
    const loaded = await loadSyncMeta(adapter);
    expect(loaded).toEqual({ lastSeenRemoteUpdatedAtMs: 42_000 });
    const raw = await adapter.getItem(FITNESS_SYNC_META_KEY);
    expect(raw).toContain("42000");
  });

  it("defaults to zero when missing", async () => {
    const adapter = createMemoryStorageAdapter();
    expect(await loadSyncMeta(adapter)).toEqual({ lastSeenRemoteUpdatedAtMs: 0 });
  });
});
