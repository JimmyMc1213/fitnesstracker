import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildAppStateFromPersisted } from "./buildAppState";
import { FITNESS_LOCAL_STORAGE_KEY, loadPersistedSlice, savePersistedSlice } from "./persistFitnessSlice";
import { resetLocalAfterAccountDelete } from "./resetAfterAccountDelete";
import { loadSyncMeta, saveSyncMeta } from "./syncMeta";

describe("resetLocalAfterAccountDelete", () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears onboarding and sync markers without touching auth", () => {
    savePersistedSlice({
      ...buildAppStateFromPersisted({
        onboardingComplete: true,
        displayName: "Alex",
        workoutsCompletedByDay: { "2026-05-01": true },
      }),
      onboardingComplete: true,
      onboardingProfile: { goal: "cut" } as never,
      displayName: "Alex",
      workoutsCompletedByDay: { "2026-05-01": true },
    } as never);
    saveSyncMeta({ lastSeenRemoteUpdatedAtMs: 99_999 });

    let nextState = buildAppStateFromPersisted(loadPersistedSlice());
    resetLocalAfterAccountDelete((updater) => {
      nextState = typeof updater === "function" ? updater(nextState) : updater;
      return nextState;
    });

    expect(nextState.onboardingComplete).toBe(false);
    expect(nextState.onboardingDraft).toBeNull();
    expect(nextState.experienceLevelChosen).toBe(false);
    const persisted = JSON.parse(store[FITNESS_LOCAL_STORAGE_KEY] ?? "{}");
    expect(persisted.onboardingComplete).toBe(false);
    expect(persisted.onboardingProfile).toBeNull();
    expect(loadSyncMeta().lastSeenRemoteUpdatedAtMs).toBe(0);
  });
});
