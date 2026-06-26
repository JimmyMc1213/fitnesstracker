import {
  FITNESS_LOCAL_STORAGE_KEY,
  formatSyncedLabel,
  loadSyncMeta,
  normalizeOnboardingDraft,
  pullRemoteIntoLocal,
  pullRemoteMergeAlways,
  savePersistedSlice,
  saveSyncMeta,
  tryPush,
  userFacingSyncError,
} from "@newyouai/core";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import { useFitnessState } from "@/context/FitnessContext";
import { readLastAuthUserId, writeLastAuthUserId } from "@/lib/authSessionStorage";
import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { syncOnboardingStorageFromFitnessSlice } from "@/lib/onboardingStorage";
import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";
import { createSupabaseSyncClient } from "@/lib/fitness/createSupabaseSyncClient";
import { migratePersistedFitnessSlice } from "@/lib/fitness/migratePersistedFitnessSlice";
import { sliceFromAppState } from "@/lib/fitness/sliceFromAppState";
import { resetLocalAfterAccountDelete } from "@/lib/resetAfterAccountDelete";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

const HYDRATION_PULL_TIMEOUT_MS = 5000;
const PUSH_DEBOUNCE_MS = 1100;
const MAX_PUSH_RETRIES = 5;

const storageAdapter = createAsyncStorageAdapter();

export type FitnessSyncContextValue = {
  configured: boolean;
  busy: boolean;
  lastError: string | null;
  lastSyncedLabel: string | null;
  fitnessHydrated: boolean;
  syncNow: () => Promise<void>;
  restoreFromCloud: () => Promise<boolean>;
};

const FitnessSyncContext = createContext<FitnessSyncContextValue | null>(null);

const disabledStub: FitnessSyncContextValue = {
  configured: false,
  busy: false,
  lastError: null,
  lastSyncedLabel: null,
  fitnessHydrated: true,
  syncNow: async () => {},
  restoreFromCloud: async () => false,
};

function displayNameFromUser(user: Session["user"] | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  if (!meta || typeof meta !== "object") return null;
  const raw = meta.full_name ?? meta.name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function persistSliceWithMigration(slice: ReturnType<typeof sliceFromAppState>) {
  const { slice: migrated, dirty } = migratePersistedFitnessSlice(slice);
  return dirty ? migrated : slice;
}

export function FitnessSyncProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const { session, sessionResolved } = useAuth();
  const { state, hydrated: fitnessLocalHydrated, syncRevision, setFitnessState, replaceFitnessState } =
    useFitnessState();

  const [fitnessHydrated, setFitnessHydrated] = useState(!configured);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const seedDisplayName = useCallback(
    (name: string) => {
      setFitnessState((prev) => {
        if (prev.displayName.trim()) return prev;
        return { ...prev, displayName: name };
      });
    },
    [setFitnessState],
  );

  useEffect(() => {
    const name = displayNameFromUser(session?.user);
    if (name) seedDisplayName(name);
  }, [session?.user, seedDisplayName]);

  const applyMergedSlice = useCallback(
    async (mergedSlice: ReturnType<typeof sliceFromAppState>, meta: { lastSeenRemoteUpdatedAtMs: number }) => {
      const persisted = persistSliceWithMigration(mergedSlice);
      await saveSyncMeta(storageAdapter, meta);
      await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, persisted);
      await syncOnboardingStorageFromFitnessSlice(persisted);
      replaceFitnessState(buildFitnessAppState(persisted));
    },
    [replaceFitnessState],
  );

  const runPullForUser = useCallback(
    async (uid: string) => {
      const client = createSupabaseSyncClient();
      if (!client || !stateRef.current) return;

      setBusy(true);
      setLastError(null);
      try {
        const localSlice = sliceFromAppState(stateRef.current);
        const meta = await loadSyncMeta(storageAdapter);
        const needsFullRestore =
          localSlice.onboardingComplete !== true && normalizeOnboardingDraft(localSlice.onboardingDraft) == null;

        if (needsFullRestore) {
          const merged = await pullRemoteMergeAlways(client, uid, localSlice);
          if (merged) {
            await applyMergedSlice(merged.mergedSlice, merged.meta);
          }
          return;
        }

        const pull = await pullRemoteIntoLocal(client, uid, localSlice, meta);
        if (pull.applied) {
          await applyMergedSlice(pull.mergedSlice, pull.meta);
        }
      } catch (e) {
        setLastError(userFacingSyncError(e, "Sync pull failed"));
      } finally {
        setBusy(false);
      }
    },
    [applyMergedSlice],
  );

  useEffect(() => {
    if (!configured) {
      setFitnessHydrated(true);
      return;
    }
    if (!sessionResolved || !fitnessLocalHydrated) return;

    if (!session?.user?.id) {
      setFitnessHydrated(true);
      return;
    }

    setFitnessHydrated(false);
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setFitnessHydrated(true);
    }, HYDRATION_PULL_TIMEOUT_MS);

    const uid = session.user.id;

    void (async () => {
      try {
        const lastUid = await readLastAuthUserId();
        if (lastUid && lastUid !== uid) {
          const next = await resetLocalAfterAccountDelete();
          replaceFitnessState(next);
        }
        await runPullForUser(uid);
        await writeLastAuthUserId(uid);
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setFitnessHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [configured, sessionResolved, fitnessLocalHydrated, session?.user?.id, runPullForUser, replaceFitnessState]);

  const runPushWithConflictRetry = useCallback(async (uid: string) => {
    const client = createSupabaseSyncClient();
    if (!client || !stateRef.current) return;

    setBusy(true);
    setLastError(null);
    try {
      let meta = await loadSyncMeta(storageAdapter);
      let slice = sliceFromAppState(stateRef.current);
      let result = await tryPush(client, uid, slice, meta);
      let retries = 0;

      while ("conflict" in result && result.conflict && retries < MAX_PUSH_RETRIES) {
        const current = stateRef.current;
        if (!current) break;
        const merged = await pullRemoteMergeAlways(client, uid, sliceFromAppState(current));
        if (merged) {
          const persisted = persistSliceWithMigration(merged.mergedSlice);
          await saveSyncMeta(storageAdapter, merged.meta);
          await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, persisted);
          replaceFitnessState(buildFitnessAppState(persisted));
          slice = persisted;
          meta = merged.meta;
        } else {
          meta = await loadSyncMeta(storageAdapter);
          slice = sliceFromAppState(stateRef.current);
        }
        result = await tryPush(client, uid, slice, meta);
        retries++;
      }

      if ("error" in result && result.error) {
        setLastError(result.error);
      } else if ("ok" in result && result.ok) {
        await saveSyncMeta(storageAdapter, result.meta);
        setLastSyncedAt(Date.now());
      }
    } catch (e) {
      setLastError(userFacingSyncError(e, "Sync push failed"));
    } finally {
      setBusy(false);
    }
  }, [replaceFitnessState]);

  useEffect(() => {
    if (!configured || !session?.user?.id || !fitnessHydrated) return;

    const uid = session.user.id;
    const id = setTimeout(() => {
      void runPushWithConflictRetry(uid);
    }, PUSH_DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [configured, session?.user?.id, syncRevision, fitnessHydrated, runPushWithConflictRetry]);

  const syncNow = useCallback(async () => {
    const uid = session?.user?.id;
    if (!configured || !uid) return;

    setBusy(true);
    setLastError(null);
    try {
      await runPullForUser(uid);
      await runPushWithConflictRetry(uid);
    } catch (e) {
      setLastError(userFacingSyncError(e, "Sync failed"));
    } finally {
      setBusy(false);
    }
  }, [configured, session?.user?.id, runPullForUser, runPushWithConflictRetry]);

  const restoreFromCloud = useCallback(async (): Promise<boolean> => {
    const uid = session?.user?.id;
    const client = createSupabaseSyncClient();
    if (!configured || !uid || !client || !stateRef.current) return false;

    setBusy(true);
    setLastError(null);
    try {
      const localSlice = sliceFromAppState(stateRef.current);
      const merged = await pullRemoteMergeAlways(client, uid, localSlice);
      if (!merged) return false;
      await applyMergedSlice(merged.mergedSlice, merged.meta);
      return true;
    } catch (e) {
      setLastError(userFacingSyncError(e, "Sync restore failed"));
      return false;
    } finally {
      setBusy(false);
    }
  }, [configured, session?.user?.id, applyMergedSlice]);

  const value = useMemo(
    (): FitnessSyncContextValue => ({
      configured,
      busy,
      lastError,
      lastSyncedLabel: formatSyncedLabel(lastSyncedAt),
      fitnessHydrated,
      syncNow,
      restoreFromCloud,
    }),
    [configured, busy, lastError, lastSyncedAt, fitnessHydrated, syncNow, restoreFromCloud],
  );

  return <FitnessSyncContext.Provider value={value}>{children}</FitnessSyncContext.Provider>;
}

export function useFitnessSync(): FitnessSyncContextValue {
  const ctx = useContext(FitnessSyncContext);
  return ctx ?? disabledStub;
}
