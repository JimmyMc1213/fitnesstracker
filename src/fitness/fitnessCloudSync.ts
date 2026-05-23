import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";

import { buildAppStateFromPersisted } from "./buildAppState";
import type { FitnessSyncContextValue } from "./FitnessSyncContext";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { savePersistedSlice, sliceFromAppState } from "./persistFitnessSlice";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";
import { loadSyncMeta, saveSyncMeta } from "./syncMeta";
import type { AppState } from "./types";

function userFacingSyncError(e: unknown, fallback: string): string {
  if (e instanceof SyntaxError) return "Saved data could not be read. Using your local defaults.";
  const msg = e instanceof Error ? e.message : fallback;
  if (/unicode escape|json\.parse|syntaxerror|unexpected token/i.test(msg)) {
    return "Saved data could not be read. Using your local defaults.";
  }
  return msg || fallback;
}

type FitnessUserRow = {
  user_id: string;
  payload: unknown;
  updated_at_ms: number;
};

async function fetchFitnessRemoteRow(userId: string): Promise<FitnessUserRow | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("fitness_user_data").select("*").eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return data as FitnessUserRow;
}

export function payloadToPersistedSlice(payload: unknown): PersistedFitnessSlice {
  return sliceFromAppState(buildAppStateFromPersisted(payload as Partial<PersistedFitnessSlice> | null));
}

/** Pull when cloud snapshot is newer than what we last reconciled. */
export async function pullRemoteIntoLocal(
  uid: string,
  localSlice: PersistedFitnessSlice,
  meta: { lastSeenRemoteUpdatedAtMs: number },
): Promise<
  | { applied: false }
  | { applied: true; mergedSlice: PersistedFitnessSlice; meta: { lastSeenRemoteUpdatedAtMs: number } }
> {
  const row = await fetchFitnessRemoteRow(uid);
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
  uid: string,
  localSlice: PersistedFitnessSlice,
): Promise<{ mergedSlice: PersistedFitnessSlice; meta: { lastSeenRemoteUpdatedAtMs: number } } | null> {
  const row = await fetchFitnessRemoteRow(uid);
  if (!row) return null;
  const remoteSlice = payloadToPersistedSlice(row.payload);
  const mergedSlice = mergePersistedFitnessSlices(localSlice, remoteSlice);
  return { mergedSlice, meta: { lastSeenRemoteUpdatedAtMs: row.updated_at_ms } };
}

async function tryPush(
  uid: string,
  slice: PersistedFitnessSlice,
  meta: { lastSeenRemoteUpdatedAtMs: number },
): Promise<{ ok: true; meta: { lastSeenRemoteUpdatedAtMs: number } } | { conflict: true } | { error: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Supabase not configured" };
  const now = Date.now();

  const { data: row } = await sb.from("fitness_user_data").select("updated_at_ms").eq("user_id", uid).maybeSingle();

  if (!row) {
    const { error } = await sb.from("fitness_user_data").insert({
      user_id: uid,
      payload: slice,
      updated_at_ms: now,
    });
    if (error) return { error: error.message };
    return { ok: true, meta: { lastSeenRemoteUpdatedAtMs: now } };
  }

  if (row.updated_at_ms !== meta.lastSeenRemoteUpdatedAtMs) {
    return { conflict: true };
  }

  const { data: updated, error } = await sb
    .from("fitness_user_data")
    .update({ payload: slice, updated_at_ms: now })
    .eq("user_id", uid)
    .eq("updated_at_ms", meta.lastSeenRemoteUpdatedAtMs)
    .select("updated_at_ms");

  if (error) return { error: error.message };
  if (!updated?.length) return { conflict: true };

  return { ok: true, meta: { lastSeenRemoteUpdatedAtMs: now } };
}

function formatSyncedLabel(ts: number | null): string | null {
  if (ts == null) return null;
  try {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return null;
  }
}

export function useFitnessCloudSync(
  syncSig: string,
  state: AppState,
  setState: Dispatch<SetStateAction<AppState>>,
): FitnessSyncContextValue {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshSession = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    setSession(data.session ?? null);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void refreshSession();
    const { data: sub } = sb.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshSession]);

  const runPullForUser = useCallback(
    async (uid: string) => {
      const sb = getSupabase();
      if (!sb) return;
      setBusy(true);
      setLastError(null);
      try {
        const localSlice = sliceFromAppState(stateRef.current);
        const meta = loadSyncMeta();
        const pull = await pullRemoteIntoLocal(uid, localSlice, meta);
        if (pull.applied) {
          savePersistedSlice(pull.mergedSlice);
          saveSyncMeta(pull.meta);
          setState(buildAppStateFromPersisted(pull.mergedSlice));
        }
      } catch (e) {
        setLastError(userFacingSyncError(e, "Sync pull failed"));
      } finally {
        setBusy(false);
      }
    },
    [setState],
  );

  useEffect(() => {
    if (!configured || !session?.user?.id) return;
    void runPullForUser(session.user.id);
  }, [configured, session?.user?.id, runPullForUser]);

  useEffect(() => {
    if (!configured || !session?.user?.id) return;
    const uid = session.user.id;
    const id = window.setTimeout(async () => {
      setBusy(true);
      setLastError(null);
      try {
        let meta = loadSyncMeta();
        let slice = sliceFromAppState(stateRef.current);
        let result = await tryPush(uid, slice, meta);
        let retries = 0;
        while ("conflict" in result && result.conflict && retries < 5) {
          const merged = await pullRemoteMergeAlways(uid, sliceFromAppState(stateRef.current));
          if (merged) {
            savePersistedSlice(merged.mergedSlice);
            saveSyncMeta(merged.meta);
            setState(buildAppStateFromPersisted(merged.mergedSlice));
            slice = merged.mergedSlice;
            meta = merged.meta;
          } else {
            meta = loadSyncMeta();
            slice = sliceFromAppState(stateRef.current);
          }
          result = await tryPush(uid, slice, meta);
          retries++;
        }
        if ("error" in result && result.error) {
          setLastError(result.error);
        } else if ("ok" in result && result.ok) {
          saveSyncMeta(result.meta);
          setLastSyncedAt(Date.now());
        }
      } catch (e) {
        setLastError(userFacingSyncError(e, "Sync push failed"));
      } finally {
        setBusy(false);
      }
    }, 1100);
    return () => window.clearTimeout(id);
  }, [configured, session?.user?.id, syncSig, setState]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sync." };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sync." };
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });

    // Account already exists — try signing in with the supplied password.
    if (error?.message?.toLowerCase().includes("already registered") ||
        error?.message?.toLowerCase().includes("already exists") ||
        error?.message?.toLowerCase().includes("user already")) {
      const { error: signInError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (!signInError) return {};
      return { error: "An account with that email already exists. Check your password and try signing in instead." };
    }

    if (error) return { error: error.message };
    // Email confirmation disabled — session arrives immediately.
    if (data.session) return {};
    // Email confirmation still enabled — try sign-in in case already confirmed.
    const { error: signInError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (!signInError) return {};
    return { needsConfirmation: true };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setSession(null);
  }, []);

  const syncNow = useCallback(async () => {
    const sb = getSupabase();
    const uid = session?.user?.id;
    if (!sb || !uid) return;
    setBusy(true);
    setLastError(null);
    try {
      await runPullForUser(uid);
      let meta = loadSyncMeta();
      let slice = sliceFromAppState(stateRef.current);
      let result = await tryPush(uid, slice, meta);
      let retries = 0;
      while ("conflict" in result && result.conflict && retries < 5) {
        const merged = await pullRemoteMergeAlways(uid, sliceFromAppState(stateRef.current));
        if (merged) {
          savePersistedSlice(merged.mergedSlice);
          saveSyncMeta(merged.meta);
          setState(buildAppStateFromPersisted(merged.mergedSlice));
          slice = merged.mergedSlice;
          meta = merged.meta;
        } else {
          meta = loadSyncMeta();
          slice = sliceFromAppState(stateRef.current);
        }
        result = await tryPush(uid, slice, meta);
        retries++;
      }
      if ("error" in result && result.error) setLastError(result.error);
      else if ("ok" in result && result.ok) {
        saveSyncMeta(result.meta);
        setLastSyncedAt(Date.now());
      }
    } catch (e) {
      setLastError(userFacingSyncError(e, "Sync failed"));
    } finally {
      setBusy(false);
    }
  }, [session?.user?.id, runPullForUser, setState]);

  return {
    configured,
    sessionEmail: session?.user?.email ?? null,
    busy,
    lastError,
    lastSyncedLabel: formatSyncedLabel(lastSyncedAt),
    signInWithPassword,
    signUpWithEmail,
    signOut,
    syncNow,
  };
}
