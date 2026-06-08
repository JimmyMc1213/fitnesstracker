import { createContext, useContext } from "react";

export type FitnessSyncContextValue = {
  configured: boolean;
  sessionEmail: string | null;
  /** False until Supabase getSession() finishes (or sync is disabled). */
  sessionResolved: boolean;
  busy: boolean;
  lastError: string | null;
  lastSyncedLabel: string | null;
  /** False until session resolved and initial cloud pull completes (or timeout / no sync). */
  fitnessHydrated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: "apple" | "google") => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  /** Increments after a successful account deletion (reset welcome / onboarding UI). */
  welcomeResetNonce: number;
  /** Requires `{ confirmed: true }` — only call after the user completes delete confirmations in Settings. */
  deleteAccount: (opts: { confirmed: true }) => Promise<{ error?: string; dryRun?: boolean }>;
  syncNow: () => Promise<void>;
  /** Unconditional cloud pull + merge into local state (welcome sign-in restore). */
  restoreFromCloud: () => Promise<boolean>;
};

const disabledSync: FitnessSyncContextValue = {
  configured: false,
  sessionEmail: null,
  sessionResolved: true,
  busy: false,
  lastError: null,
  lastSyncedLabel: null,
  fitnessHydrated: true,
  signInWithPassword: async () => ({ error: "Sync unavailable" }),
  signInWithOAuth: async () => ({ error: "Sync unavailable" }),
  signUpWithEmail: async () => ({ error: "Sync unavailable" as string }),
  changePassword: async () => ({ error: "Sync unavailable" }),
  updateEmail: async () => ({ error: "Sync unavailable" }),
  signOut: async () => {},
  welcomeResetNonce: 0,
  deleteAccount: async () => ({ error: "Sync unavailable" as string }),
  syncNow: async () => {},
  restoreFromCloud: async () => false,
};

export const FitnessSyncContext = createContext<FitnessSyncContextValue>(disabledSync);

export function useFitnessSync(): FitnessSyncContextValue {
  return useContext(FitnessSyncContext);
}
