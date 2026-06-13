import type { PersistedFitnessSlice } from "@newyouai/types";
import { describe, expect, it, vi } from "vitest";

import {
  type FitnessSyncClient,
  type FitnessUserRow,
  pullRemoteIntoLocal,
  pullRemoteMergeAlways,
  tryPush,
} from "./fitnessCloudSyncEngine";
import { MAX_FITNESS_PAYLOAD_BYTES } from "./fitnessPayloadGuard";
import { createEmptyPersistedSlice } from "./testFixtures";

function mockClient(handlers: Partial<FitnessSyncClient>): FitnessSyncClient {
  return {
    fetchRow: vi.fn(async () => null),
    insertRow: vi.fn(async () => ({})),
    updateRow: vi.fn(async () => ({ updatedAtMs: Date.now() })),
    ...handlers,
  };
}

describe("fitnessCloudSyncEngine", () => {
  it("inserts when no cloud row exists", async () => {
    const insertRow = vi.fn(async () => ({}));
    const client = mockClient({ fetchRow: vi.fn(async () => null), insertRow });
    const slice = createEmptyPersistedSlice({ displayName: "local" });

    const result = await tryPush(client, "user-1", slice, { lastSeenRemoteUpdatedAtMs: 0 });

    expect(result).toMatchObject({ ok: true });
    expect(insertRow).toHaveBeenCalledOnce();
  });

  it("skips pull when remote is stale", async () => {
    const row: FitnessUserRow = {
      user_id: "user-1",
      payload: { displayName: "remote" },
      updated_at_ms: 100,
    };
    const client = mockClient({ fetchRow: vi.fn(async () => row) });
    const local = createEmptyPersistedSlice({ displayName: "local" });

    const result = await pullRemoteIntoLocal(client, "user-1", local, {
      lastSeenRemoteUpdatedAtMs: 200,
    });

    expect(result).toEqual({ applied: false });
  });

  it("merges when remote is newer", async () => {
    const row: FitnessUserRow = {
      user_id: "user-1",
      payload: { displayName: "remote" },
      updated_at_ms: 500,
    };
    const client = mockClient({ fetchRow: vi.fn(async () => row) });
    const local = createEmptyPersistedSlice({ displayName: "local" });

    const result = await pullRemoteIntoLocal(client, "user-1", local, {
      lastSeenRemoteUpdatedAtMs: 100,
    });

    expect(result.applied).toBe(true);
    if (result.applied) {
      expect(result.mergedSlice.displayName).toBe("remote");
      expect(result.meta.lastSeenRemoteUpdatedAtMs).toBe(500);
    }
  });

  it("returns conflict when remote updated_at_ms drifted before push", async () => {
    const row: FitnessUserRow = {
      user_id: "user-1",
      payload: {},
      updated_at_ms: 999,
    };
    const client = mockClient({ fetchRow: vi.fn(async () => row) });
    const slice = createEmptyPersistedSlice();

    const result = await tryPush(client, "user-1", slice, { lastSeenRemoteUpdatedAtMs: 100 });

    expect(result).toEqual({ conflict: true });
  });

  it("returns conflict when optimistic update finds no matching row", async () => {
    const row: FitnessUserRow = {
      user_id: "user-1",
      payload: {},
      updated_at_ms: 100,
    };
    const updateRow = vi.fn(async () => ({ conflict: true as const }));
    const client = mockClient({
      fetchRow: vi.fn(async () => row),
      updateRow,
    });
    const slice = createEmptyPersistedSlice();

    const result = await tryPush(client, "user-1", slice, { lastSeenRemoteUpdatedAtMs: 100 });

    expect(result).toEqual({ conflict: true });
    expect(updateRow).toHaveBeenCalledOnce();
  });

  it("short-circuits oversized payloads", async () => {
    const client = mockClient({});
    const huge = createEmptyPersistedSlice({
      displayName: "x".repeat(MAX_FITNESS_PAYLOAD_BYTES),
    } as Partial<PersistedFitnessSlice>);

    const result = await tryPush(client, "user-1", huge, { lastSeenRemoteUpdatedAtMs: 0 });

    expect(result).toMatchObject({ error: expect.stringContaining("too large") });
    expect(client.fetchRow).not.toHaveBeenCalled();
  });

  it("pullRemoteMergeAlways merges without meta gate", async () => {
    const row: FitnessUserRow = {
      user_id: "user-1",
      payload: { displayName: "cloud" },
      updated_at_ms: 50,
    };
    const client = mockClient({ fetchRow: vi.fn(async () => row) });
    const local = createEmptyPersistedSlice({ displayName: "local" });

    const merged = await pullRemoteMergeAlways(client, "user-1", local);

    expect(merged?.mergedSlice.displayName).toBe("cloud");
    expect(merged?.meta.lastSeenRemoteUpdatedAtMs).toBe(50);
  });
});
