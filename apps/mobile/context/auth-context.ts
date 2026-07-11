import type { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type AuthResult = { error?: string; needsConfirmation?: boolean };

export type AuthContextValue = {
  configured: boolean;
  session: Session | null;
  sessionEmail: string | null;
  sessionResolved: boolean;
  passwordRecoveryPending: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<AuthResult>;
  signInWithApple: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  completeOAuthFromUrl: (redirectUrl: string) => Promise<{ error?: string; recovery?: boolean }>;
  updateEmail: (newEmail: string) => Promise<{ error?: string }>;
  requestPasswordChangeEmail: () => Promise<{ error?: string }>;
  completePasswordReset: (newPassword: string) => Promise<{ error?: string }>;
};

/** Kept in its own module so Fast Refresh does not recreate the context when AuthProvider edits hot reload. */
export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
