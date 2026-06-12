import { afterEach, describe, expect, it, vi } from "vitest";

import { FITNESS_LOCAL_STORAGE_KEY } from "./constants";
import { createLocalStorageAdapter } from "./createLocalStorageAdapter";
import { createMemoryStorageAdapter } from "./createMemoryStorageAdapter";
import { loadPersistedSlice, savePersistedSlice } from "./persist";
import { resetSafeJsonParseLogs } from "./safeJsonParse";
import type { SyncStorageLike } from "./types";

function createMockSyncStorage(initial: Record<string, string> = {}): SyncStorageLike {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

describe("FITNESS_LOCAL_STORAGE_KEY", () => {
  it("matches PWA persist key", () => {
    expect(FITNESS_LOCAL_STORAGE_KEY).toBe("fitcoach:persist:v1");
  });
});

describe("createMemoryStorageAdapter", () => {
  it("reads, writes, and removes items", async () => {
    const adapter = createMemoryStorageAdapter({ foo: "bar" });

    await expect(adapter.getItem("foo")).resolves.toBe("bar");
    await adapter.setItem("baz", "qux");
    await expect(adapter.getItem("baz")).resolves.toBe("qux");
    await adapter.removeItem("foo");
    await expect(adapter.getItem("foo")).resolves.toBeNull();
  });
});

describe("createLocalStorageAdapter", () => {
  it("wraps sync storage as async promises", async () => {
    const sync = createMockSyncStorage();
    const adapter = createLocalStorageAdapter(sync);

    await adapter.setItem("k", "v");
    await expect(adapter.getItem("k")).resolves.toBe("v");
    await adapter.removeItem("k");
    await expect(adapter.getItem("k")).resolves.toBeNull();
  });
});

describe("loadPersistedSlice", () => {
  afterEach(() => {
    resetSafeJsonParseLogs();
    vi.restoreAllMocks();
  });

  it("returns null when key is missing", async () => {
    const adapter = createMemoryStorageAdapter();
    await expect(loadPersistedSlice(adapter, FITNESS_LOCAL_STORAGE_KEY)).resolves.toBeNull();
  });

  it("parses valid JSON", async () => {
    const adapter = createMemoryStorageAdapter({
      [FITNESS_LOCAL_STORAGE_KEY]: JSON.stringify({ theme: "dark", onboardingComplete: true }),
    });

    await expect(loadPersistedSlice<{ theme: string; onboardingComplete: boolean }>(
      adapter,
      FITNESS_LOCAL_STORAGE_KEY,
    )).resolves.toEqual({ theme: "dark", onboardingComplete: true });
  });

  it("returns null for invalid JSON and logs once", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const adapter = createMemoryStorageAdapter({
      [FITNESS_LOCAL_STORAGE_KEY]: "{not-json",
    });

    await expect(loadPersistedSlice(adapter, FITNESS_LOCAL_STORAGE_KEY)).resolves.toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain(FITNESS_LOCAL_STORAGE_KEY);

    await expect(loadPersistedSlice(adapter, FITNESS_LOCAL_STORAGE_KEY)).resolves.toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("savePersistedSlice", () => {
  it("persists JSON via adapter", async () => {
    const adapter = createMemoryStorageAdapter();
    const slice = { theme: "light", stepsTarget: 8000 };

    await savePersistedSlice(adapter, FITNESS_LOCAL_STORAGE_KEY, slice);

    const raw = await adapter.getItem(FITNESS_LOCAL_STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual(slice);
  });

  it("swallows setItem errors", async () => {
    const adapter: ReturnType<typeof createMemoryStorageAdapter> = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error("quota");
      },
      removeItem: async () => {},
    };

    await expect(
      savePersistedSlice(adapter, FITNESS_LOCAL_STORAGE_KEY, { theme: "dark" }),
    ).resolves.toBeUndefined();
  });
});
