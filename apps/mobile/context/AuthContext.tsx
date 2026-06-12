import type { Session } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { mapOAuthSessionError, parseOAuthRedirectUrl } from "@/lib/authOAuth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

type AuthResult = { error?: string; needsConfirmation?: boolean };

type AuthContextValue = {
  configured: boolean;
  session: Session | null;
  sessionEmail: string | null;
  sessionResolved: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: "google") => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  completeOAuthFromUrl: (redirectUrl: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DUPLICATE_EMAIL_PATTERNS = ["already registered", "already exists", "user already"];

function isDuplicateEmailError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return DUPLICATE_EMAIL_PATTERNS.some((pattern) => lower.includes(pattern));
}

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

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void refreshSession();
      }
    };
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, [refreshSession]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign in." };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign up." };

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const { data, error } = await sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: trimmedName } },
    });

    if (isDuplicateEmailError(error?.message)) {
      const { error: signInError } = await sb.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (!signInError) return {};
      return {
        error:
          "An account with that email already exists. Check your password and try signing in instead.",
      };
    }

    if (error) return { error: error.message };
    if (data.session) return {};

    const { error: signInError } = await sb.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (!signInError) return {};
    return { needsConfirmation: true };
  }, []);

  const completeOAuthRedirect = useCallback(async (redirectUrl: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign in." };

    const parsed = parseOAuthRedirectUrl(redirectUrl);
    if (!parsed.ok) {
      if (parsed.cancelled) return {};
      return { error: mapOAuthSessionError(parsed.error) };
    }

    const { error } = await sb.auth.setSession({
      access_token: parsed.tokens.accessToken,
      refresh_token: parsed.tokens.refreshToken,
    });
    if (error) return { error: mapOAuthSessionError(error.message) };
    return {};
  }, []);

  const signInWithOAuth = useCallback(
    async (provider: "google") => {
      const sb = getSupabase();
      if (!sb) return { error: "Add Supabase keys to sign in." };

      let makeRedirectUri: (options: { scheme: string; path: string }) => string;
      try {
        ({ makeRedirectUri } = await import("expo-auth-session"));
      } catch {
        return {
          error: "Google sign-in needs a dev client rebuild (expo-auth-session). Rebuild with EAS, then retry.",
        };
      }

      const redirectTo = makeRedirectUri({ scheme: "newyouai", path: "auth/callback" });
      const { data, error } = await sb.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { error: mapOAuthSessionError(error.message) };
      if (!data?.url) return { error: "Could not start sign-in. Try again." };

      try {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === "cancel" || result.type === "dismiss") return {};
        if (result.type !== "success") {
          return { error: "Sign-in was interrupted. Try again." };
        }
        return completeOAuthRedirect(result.url);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Sign-in failed.";
        return { error: mapOAuthSessionError(message) };
      }
    },
    [completeOAuthRedirect],
  );

  const signInWithApple = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign in." };
    if (Platform.OS !== "ios") return { error: "Apple Sign-In is only available on iOS." };

    let AppleAuthentication: typeof import("expo-apple-authentication");
    try {
      AppleAuthentication = await import("expo-apple-authentication");
    } catch {
      return {
        error: "Apple Sign-In needs a dev client rebuild (expo-apple-authentication). Rebuild with EAS, then retry.",
      };
    }

    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) return { error: "Apple Sign-In is not available on this device." };

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { error: "Apple Sign-In did not return an identity token." };
      }

      const fullName = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      const { data: authData, error } = await sb.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) return { error: mapOAuthSessionError(error.message) };

      if (fullName && authData.user && !authData.user.user_metadata?.full_name) {
        await sb.auth.updateUser({ data: { full_name: fullName } });
      }
      return {};
    } catch (e) {
      if (e && typeof e === "object" && "code" in e) {
        const code = String((e as { code?: string }).code);
        if (code === "ERR_REQUEST_CANCELED") return {};
      }
      const message = e instanceof Error ? e.message : "Apple Sign-In failed.";
      return { error: mapOAuthSessionError(message) };
    }
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    try {
      if (sb) await sb.auth.signOut();
    } catch {
      // Best-effort remote sign-out; local session must still clear (RN-2-05).
    } finally {
      setSession(null);
      setSessionResolved(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      session,
      sessionEmail: session?.user?.email ?? null,
      sessionResolved,
      signInWithPassword,
      signUpWithEmail,
      signInWithOAuth,
      signInWithApple,
      signOut,
      completeOAuthFromUrl: completeOAuthRedirect,
    }),
    [
      configured,
      session,
      sessionResolved,
      signInWithPassword,
      signUpWithEmail,
      signInWithOAuth,
      signInWithApple,
      signOut,
      completeOAuthRedirect,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
