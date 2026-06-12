import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type AuthContextValue = {
  configured: boolean;
  session: Session | null;
  sessionEmail: string | null;
  sessionResolved: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionResolved, setSessionResolved] = useState(!configured);

  const refreshSession = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setSessionResolved(true);
      return;
    }
    try {
      const { data } = await sb.auth.getSession();
      setSession(data.session ?? null);
    } catch {
      setSession(null);
    } finally {
      setSessionResolved(true);
    }
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    void refreshSession();
    const { data: sub } = sb.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionResolved(true);
    });

    return () => sub.subscription.unsubscribe();
  }, [refreshSession]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign in." };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      session,
      sessionEmail: session?.user?.email ?? null,
      sessionResolved,
      signInWithPassword,
      signOut,
    }),
    [configured, session, sessionResolved, signInWithPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
