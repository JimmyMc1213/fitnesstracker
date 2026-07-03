import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  savePersistedSlice,
} from "@newyouai/core";
import type { AppState, PersistedFitnessSlice } from "@newyouai/types";
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
import { AppState as RNAppState } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { e2eFitnessSeedByName, type E2eFitnessSeedName } from "@/lib/e2e/fitnessPersistSeed";
import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";
import { sliceFromAppState } from "@/lib/fitness/sliceFromAppState";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { writeOnboardingComplete } from "@/lib/onboardingStorage";
import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { isVisualParityWebFrame } from "@/lib/visualParity";

function e2eSeedFromEnv(): Partial<PersistedFitnessSlice> | null {
  if (!__DEV__) return null;
  const raw = process.env.EXPO_PUBLIC_E2E_FITNESS_SEED?.trim();
  if (!raw) return null;
  return e2eFitnessSeedByName(raw as E2eFitnessSeedName);
}

function canLoadFitnessData(session: Session | null, sessionResolved: boolean): boolean {
  if (isVisualParityWebFrame()) return true;
  return sessionResolved && hasAuthenticatedUser(session);
}

type FitnessContextValue = {
  state: AppState | null;
  hydrated: boolean;
  /** Increments whenever fitness state is persisted, drives cloud sync debounce. */
  syncRevision: number;
  setFitnessState: (updater: AppState | ((prev: AppState) => AppState)) => void;
  replaceFitnessState: (next: AppState) => void;
};

const FitnessContext = createContext<FitnessContextValue | null>(null);

const storageAdapter = createAsyncStorageAdapter();

/**
 * Delay before flushing the in-memory fitness state to disk. Keeps rapid updates
 * (e.g. typing set weights/reps on the keypad) from serializing the entire state
 * slice and hitting AsyncStorage on every keystroke, which janks the workout UI.
 */
const PERSIST_DEBOUNCE_MS = 500;

export function FitnessProvider({ children }: { children: ReactNode }) {
  const { session, sessionResolved } = useAuth();
  const [state, setState] = useState<AppState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncRevision, setSyncRevision] = useState(0);

  const fitnessAccessAllowed = canLoadFitnessData(session, sessionResolved);

  useEffect(() => {
    if (fitnessAccessAllowed) return;
    setState(null);
    setHydrated(sessionResolved);
  }, [fitnessAccessAllowed, sessionResolved]);

  useEffect(() => {
    if (!fitnessAccessAllowed) return;

    let cancelled = false;

    void (async () => {
      setHydrated(false);
      const e2eSeed = e2eSeedFromEnv();
      if (e2eSeed) {
        if (e2eSeed.onboardingComplete) {
          await writeOnboardingComplete(true);
        }
        await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, e2eSeed as PersistedFitnessSlice);
      }
      const slice = await loadPersistedSlice<PersistedFitnessSlice>(
        storageAdapter,
        FITNESS_LOCAL_STORAGE_KEY,
      );
      if (cancelled) return;
      setState(buildFitnessAppState(slice));
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [fitnessAccessAllowed, session?.user?.id]);

  const latestStateRef = useRef<AppState | null>(state);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef(false);

  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  const writeToStorage = useCallback((next: AppState) => {
    void savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, sliceFromAppState(next));
    setSyncRevision((n) => n + 1);
  }, []);

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (!pendingSaveRef.current) return;
    pendingSaveRef.current = false;
    const next = latestStateRef.current;
    if (next) writeToStorage(next);
  }, [writeToStorage]);

  const schedulePersist = useCallback(() => {
    pendingSaveRef.current = true;
    if (saveTimerRef.current) return;
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      flushPendingSave();
    }, PERSIST_DEBOUNCE_MS);
  }, [flushPendingSave]);

  const setFitnessState = useCallback(
    (updater: AppState | ((prev: AppState) => AppState)) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = typeof updater === "function" ? updater(prev) : updater;
        latestStateRef.current = next;
        schedulePersist();
        return next;
      });
    },
    [schedulePersist],
  );

  const replaceFitnessState = useCallback(
    (next: AppState) => {
      latestStateRef.current = next;
      setState(next);
      flushPendingSave();
      writeToStorage(next);
    },
    [flushPendingSave, writeToStorage],
  );

  // Flush any pending write when the app is backgrounded or the provider unmounts,
  // so a debounced update is never lost on app exit.
  useEffect(() => {
    const sub = RNAppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") flushPendingSave();
    });
    return () => sub.remove();
  }, [flushPendingSave]);

  useEffect(() => () => flushPendingSave(), [flushPendingSave]);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      syncRevision,
      setFitnessState,
      replaceFitnessState,
    }),
    [state, hydrated, syncRevision, setFitnessState, replaceFitnessState],
  );

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
}

export function useFitnessState(): FitnessContextValue {
  const ctx = useContext(FitnessContext);
  if (!ctx) {
    throw new Error("useFitnessState must be used within FitnessProvider");
  }
  return ctx;
}
