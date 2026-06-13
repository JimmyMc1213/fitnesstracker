import type { PersistedFitnessSlice } from "@newyouai/types";

import { isFitnessPayloadTooLarge } from "./fitnessPayloadGuard";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import type { FitnessSyncMeta } from "./syncMeta";
import { createEmptyPersistedSlice } from "./testFixtures";

export type FitnessUserRow = {
  user_id: string;
  payload: unknown;
  updated_at_ms: number;
};

export type FitnessSyncClient = {
  fetchRow: (userId: string) => Promise<FitnessUserRow | null>;
  insertRow: (
    userId: string,
    payload: unknown,
    updatedAtMs: number,
  ) => Promise<{ error?: string }>;
  updateRow: (
    userId: string,
    payload: unknown,
    updatedAtMs: number,
    expectedRemoteUpdatedAtMs: number,
  ) => Promise<{ updatedAtMs: number } | { conflict: true } | { error: string }>;
};

/** Normalize remote JSON payload into a full persisted fitness slice. */
export function payloadToPersistedSlice(payload: unknown): PersistedFitnessSlice {
  const partial =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Partial<PersistedFitnessSlice>)
      : null;
  const empty = createEmptyPersistedSlice();
  if (!partial) return empty;
  return mergePersistedFitnessSlices(empty, { ...empty, ...partial });
}

/** Pull when cloud snapshot is newer than what we last reconciled. */
export async function pullRemoteIntoLocal(
  client: FitnessSyncClient,
  uid: string,
  localSlice: PersistedFitnessSlice,
  meta: FitnessSyncMeta,
): Promise<
  | { applied: false }
  | { applied: true; mergedSlice: PersistedFitnessSlice; meta: FitnessSyncMeta }
> {
  const row = await client.fetchRow(uid);
  if (!row) return { applied: false };
  if (row.updated_at_ms <= meta.lastSeenRemoteUpdatedAtMs) return { applied: false };

  const remoteSlice = payloadToPersistedSlice(row.payload);
  const mergedSlice = mergePersistedFitnessSlices(localSlice, remoteSlice);
  return {
    applied: true,
    mergedSlice,
    meta: { lastSeenRemoteUpdatedAtMs: row.updated_at_ms },
  };
}

/** Merge unconditionally (after optimistic-lock conflict). */
export async function pullRemoteMergeAlways(
  client: FitnessSyncClient,
  uid: string,
  localSlice: PersistedFitnessSlice,
): Promise<{ mergedSlice: PersistedFitnessSlice; meta: FitnessSyncMeta } | null> {
  const row = await client.fetchRow(uid);
  if (!row) return null;
  const remoteSlice = payloadToPersistedSlice(row.payload);
  const mergedSlice = mergePersistedFitnessSlices(localSlice, remoteSlice);
  return { mergedSlice, meta: { lastSeenRemoteUpdatedAtMs: row.updated_at_ms } };
}

export async function tryPush(
  client: FitnessSyncClient,
  uid: string,
  slice: PersistedFitnessSlice,
  meta: FitnessSyncMeta,
): Promise<
  { ok: true; meta: FitnessSyncMeta } | { conflict: true } | { error: string }
> {
  if (isFitnessPayloadTooLarge(slice)) {
    return { error: "Your saved data is too large to sync. Remove old logs or contact support." };
  }

  const now = Date.now();
  const row = await client.fetchRow(uid);

  if (!row) {
    const { error } = await client.insertRow(uid, slice, now);
    if (error) return { error };
    return { ok: true, meta: { lastSeenRemoteUpdatedAtMs: now } };
  }

  if (row.updated_at_ms !== meta.lastSeenRemoteUpdatedAtMs) {
    return { conflict: true };
  }

  const result = await client.updateRow(uid, slice, now, meta.lastSeenRemoteUpdatedAtMs);
  if ("error" in result && result.error) return { error: result.error };
  if ("conflict" in result && result.conflict) return { conflict: true };

  return { ok: true, meta: { lastSeenRemoteUpdatedAtMs: now } };
}
