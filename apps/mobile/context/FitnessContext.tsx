import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  savePersistedSlice,
} from "@newyouai/core";
import type { AppState, PersistedFitnessSlice } from "@newyouai/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { e2eFitnessSeedByName, type E2eFitnessSeedName } from "@/lib/e2e/fitnessPersistSeed";
import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";
import { sliceFromAppState } from "@/lib/fitness/sliceFromAppState";
import { writeOnboardingComplete } from "@/lib/onboardingStorage";
import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";

function e2eSeedFromEnv(): Partial<PersistedFitnessSlice> | null {
  if (!__DEV__) return null;
  const raw = process.env.EXPO_PUBLIC_E2E_FITNESS_SEED?.trim();
  if (!raw) return null;
  return e2eFitnessSeedByName(raw as E2eFitnessSeedName);
}

type FitnessContextValue = {
  state: AppState | null;
  hydrated: boolean;
  setFitnessState: (updater: AppState | ((prev: AppState) => AppState)) => void;
  replaceFitnessState: (next: AppState) => void;
};

const FitnessContext = createContext<FitnessContextValue | null>(null);

const storageAdapter = createAsyncStorageAdapter();

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
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
  }, []);

  const persistState = useCallback((next: AppState) => {
    void savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, sliceFromAppState(next));
  }, []);

  const setFitnessState = useCallback(
    (updater: AppState | ((prev: AppState) => AppState)) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = typeof updater === "function" ? updater(prev) : updater;
        persistState(next);
        return next;
      });
    },
    [persistState],
  );

  const replaceFitnessState = useCallback(
    (next: AppState) => {
      setState(next);
      persistState(next);
    },
    [persistState],
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      setFitnessState,
      replaceFitnessState,
    }),
    [state, hydrated, setFitnessState, replaceFitnessState],
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
