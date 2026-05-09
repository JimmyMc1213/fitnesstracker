import { createContext, useContext } from "react";

export type FitnessSyncContextValue = {
  configured: boolean;
  sessionEmail: string | null;
  busy: boolean;
  lastError: string | null;
  lastSyncedLabel: string | null;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const disabledSync: FitnessSyncContextValue = {
  configured: false,
  sessionEmail: null,
  busy: false,
  lastError: null,
  lastSyncedLabel: null,
  signInWithEmail: async () => ({ error: "Sync unavailable" }),
  signOut: async () => {},
  syncNow: async () => {},
};

export const FitnessSyncContext = createContext<FitnessSyncContextValue>(disabledSync);

export function useFitnessSync(): FitnessSyncContextValue {
  return useContext(FitnessSyncContext);
}
