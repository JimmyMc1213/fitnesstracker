import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";

import { buildAppStateFromPersisted } from "./buildAppState";
import type { FitnessSyncContextValue } from "./FitnessSyncContext";
import { migratePersistedFitnessSlice } from "./migrateTrainingSchedule";
import { mergePersistedFitnessSlices } from "./mergePersistedFitnessSlices";
import { normalizeOnboardingDraft } from "./onboardingDraft";
import type { PersistedFitnessSlice } from "./persistFitnessSlice";
import { savePersistedSlice, sliceFromAppState } from "./persistFitnessSlice";
import { deleteUserAccount, isDeleteAccountDryRunEnabled } from "./deleteUserAccount";
import { isFitnessPayloadTooLarge } from "./fitnessPayloadGuard";
import { resetLocalAfterAccountDelete } from "./resetAfterAccountDelete";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";
import { loadSyncMeta, saveSyncMeta } from "./syncMeta";
import type { AppState } from "./types";

const HYDRATION_PULL_TIMEOUT_MS = 5000;

function displayNameFromUser(user: Session["user"] | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  if (!meta || typeof meta !== "object") return null;
  const raw = meta.full_name ?? meta.name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function persistSliceWithMigration(slice: PersistedFitnessSlice): PersistedFitnessSlice {
  const { slice: migrated, dirty } = migratePersistedFitnessSlice(slice);
  if (!dirty) return slice;
  const next: PersistedFitnessSlice = {
    ...slice,
    onboardingProfile: migrated.onboardingProfile ?? slice.onboardingProfile ?? null,
    workoutTemplates: migrated.workoutTemplates ?? slice.workoutTemplates,
  };
  savePersistedSlice(next);
  return next;
}

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
  if (isFitnessPayloadTooLarge(slice)) {
    return { error: "Your saved data is too large to sync. Remove old logs or contact support." };
  }

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

export async function updateUserEmail(
  currentEmail: string | null | undefined,
  newEmail: string,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sync." };
  if (!currentEmail) return { error: "Sign in to change your email." };

  const trimmed = newEmail.trim();
  if (!trimmed.includes("@")) return { error: "Enter a valid email address." };
  if (trimmed.toLowerCase() === currentEmail.toLowerCase()) {
    return { error: "That's already your email." };
  }

  const { error } = await sb.auth.updateUser({ email: trimmed });
  if (error) return { error: error.message };
  return {};
}

export function useFitnessCloudSync(
  syncSig: string,
  state: AppState,
  setState: Dispatch<SetStateAction<AppState>>,
  opts?: { setFitnessHydrated?: (hydrated: boolean) => void },
): FitnessSyncContextValue {
  const setFitnessHydrated = opts?.setFitnessHydrated;
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionResolved, setSessionResolved] = useState(!configured);
  const [fitnessHydrated, setLocalFitnessHydrated] = useState(!configured);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [welcomeResetNonce, setWelcomeResetNonce] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshSession = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setSessionResolved(true);
      return;
    }
    const { data } = await sb.auth.getSession();
    setSession(data.session ?? null);
    setSessionResolved(true);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void refreshSession();
    const { data: sub } = sb.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      const name = displayNameFromUser(sess?.user);
      if (!name) return;
      setState((s) => {
        if (s.displayName.trim()) return s;
        const next = { ...s, displayName: name };
        savePersistedSlice(sliceFromAppState(next));
        return next;
      });
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshSession, setState]);

  const runPullForUser = useCallback(
    async (uid: string) => {
      const sb = getSupabase();
      if (!sb) return;
      setBusy(true);
      setLastError(null);
      try {
        const localSlice = sliceFromAppState(stateRef.current);
        const meta = loadSyncMeta();
        const needsFullRestore =
          localSlice.onboardingComplete !== true && normalizeOnboardingDraft(localSlice.onboardingDraft) == null;

        if (needsFullRestore) {
          const merged = await pullRemoteMergeAlways(uid, localSlice);
          if (merged) {
            const persisted = persistSliceWithMigration(merged.mergedSlice);
            saveSyncMeta(merged.meta);
            savePersistedSlice(persisted);
            setState(buildAppStateFromPersisted(persisted));
          }
          return;
        }

        const pull = await pullRemoteIntoLocal(uid, localSlice, meta);
        if (pull.applied) {
          const merged = persistSliceWithMigration(pull.mergedSlice);
          saveSyncMeta(pull.meta);
          savePersistedSlice(merged);
          setState(buildAppStateFromPersisted(merged));
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
    if (!configured) {
      setLocalFitnessHydrated(true);
      setFitnessHydrated?.(true);
      return;
    }
    if (!sessionResolved) return;

    if (!session?.user?.id) {
      setLocalFitnessHydrated(true);
      setFitnessHydrated?.(true);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setLocalFitnessHydrated(true);
        setFitnessHydrated?.(true);
      }
    }, HYDRATION_PULL_TIMEOUT_MS);

    void runPullForUser(session.user.id).finally(() => {
      if (!cancelled) {
        window.clearTimeout(timeoutId);
        setLocalFitnessHydrated(true);
        setFitnessHydrated?.(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [configured, sessionResolved, session?.user?.id, runPullForUser, setFitnessHydrated]);

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
            const migrated = persistSliceWithMigration(merged.mergedSlice);
            saveSyncMeta(merged.meta);
            savePersistedSlice(migrated);
            setState(buildAppStateFromPersisted(migrated));
            slice = migrated;
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

  useEffect(() => {
    if (!import.meta.env.DEV || !configured || !sessionResolved || session?.user?.email) return;

    const email = String(import.meta.env.VITE_DEV_AUTO_SIGN_IN_EMAIL ?? "").trim();
    const password = String(import.meta.env.VITE_DEV_AUTO_SIGN_IN_PASSWORD ?? "").trim();
    if (!email || !password) return;

    void signInWithPassword(email, password);
  }, [configured, sessionResolved, session?.user?.email, signInWithPassword]);

  const signInWithOAuth = useCallback(async (provider: "apple" | "google") => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sync." };
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      },
    });
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

    // Account already exists, try signing in with the supplied password.
    if (error?.message?.toLowerCase().includes("already registered") ||
        error?.message?.toLowerCase().includes("already exists") ||
        error?.message?.toLowerCase().includes("user already")) {
      const { error: signInError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (!signInError) return {};
      return { error: "An account with that email already exists. Check your password and try signing in instead." };
    }

    if (error) return { error: error.message };
    const signedInUser = data.session?.user ?? data.user;
    const nameFromSignUp = displayNameFromUser(signedInUser);
    if (nameFromSignUp) {
      setState((s) => {
        if (s.displayName.trim()) return s;
        const next = { ...s, displayName: nameFromSignUp };
        savePersistedSlice(sliceFromAppState(next));
        return next;
      });
    }
    // Email confirmation disabled, session arrives immediately.
    if (data.session) return {};
    // Email confirmation still enabled, try sign-in in case already confirmed.
    const { error: signInError } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (!signInError) return {};
    return { needsConfirmation: true };
  }, [setState]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sync." };
    const email = session?.user?.email;
    if (!email) return { error: "Sign in to change your password." };

    const { error: verifyError } = await sb.auth.signInWithPassword({ email, password: currentPassword });
    if (verifyError) return { error: "Current password is incorrect." };

    const { error } = await sb.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  }, [session?.user?.email]);

  const updateEmail = useCallback(
    async (newEmail: string) => updateUserEmail(session?.user?.email, newEmail),
    [session?.user?.email],
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setSession(null);
    setWelcomeResetNonce((n) => n + 1);
  }, []);

  const deleteAccount = useCallback(async (opts: { confirmed: true }) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sync." };

    const dryRun = isDeleteAccountDryRunEnabled();
    setBusy(true);
    setLastError(null);
    try {
      return await deleteUserAccount({
        confirmed: opts.confirmed,
        userId: session?.user?.id,
        dryRun,
        invokeDeleteUser: (body) => sb.functions.invoke("delete-user", { method: "POST", body }),
        signOut: async () => {
          await sb.auth.signOut();
          setSession(null);
        },
        onDeleted: () => {
          resetLocalAfterAccountDelete(setState);
          setWelcomeResetNonce((n) => n + 1);
        },
      });
    } catch (e) {
      return { error: userFacingSyncError(e, "Account deletion failed. Try again.") };
    } finally {
      setBusy(false);
    }
  }, [session?.user?.id, setState]);

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
          const migrated = persistSliceWithMigration(merged.mergedSlice);
          saveSyncMeta(merged.meta);
          savePersistedSlice(migrated);
          setState(buildAppStateFromPersisted(migrated));
          slice = migrated;
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

  const restoreFromCloud = useCallback(async (): Promise<boolean> => {
    const uid = session?.user?.id;
    if (!configured || !uid) return false;
    setBusy(true);
    setLastError(null);
    try {
      const localSlice = sliceFromAppState(stateRef.current);
      const merged = await pullRemoteMergeAlways(uid, localSlice);
      if (!merged) return false;
      const persisted = persistSliceWithMigration(merged.mergedSlice);
      saveSyncMeta(merged.meta);
      savePersistedSlice(persisted);
      setState(buildAppStateFromPersisted(persisted));
      return true;
    } catch (e) {
      setLastError(userFacingSyncError(e, "Sync restore failed"));
      return false;
    } finally {
      setBusy(false);
    }
  }, [configured, session?.user?.id, setState]);

  return {
    configured,
    sessionEmail: session?.user?.email ?? null,
    sessionResolved,
    busy,
    lastError,
    lastSyncedLabel: formatSyncedLabel(lastSyncedAt),
    fitnessHydrated,
    signInWithPassword,
    signInWithOAuth,
    signUpWithEmail,
    changePassword,
    updateEmail,
    signOut,
    welcomeResetNonce,
    deleteAccount,
    syncNow,
    restoreFromCloud,
  };
}
