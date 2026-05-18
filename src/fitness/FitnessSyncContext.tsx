import { createContext, useContext } from "react";

export type FitnessSyncContextValue = {
  configured: boolean;
  sessionEmail: string | null;
  busy: boolean;
  lastError: string | null;
  lastSyncedLabel: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const disabledSync: FitnessSyncContextValue = {
  configured: false,
  sessionEmail: null,
  busy: false,
  lastError: null,
  lastSyncedLabel: null,
  signInWithPassword: async () => ({ error: "Sync unavailable" }),
  signUpWithEmail: async () => ({ error: "Sync unavailable" as string }),
  signOut: async () => {},
  syncNow: async () => {},
};

export const FitnessSyncContext = createContext<FitnessSyncContextValue>(disabledSync);

export function useFitnessSync(): FitnessSyncContextValue {
  return useContext(FitnessSyncContext);
}
