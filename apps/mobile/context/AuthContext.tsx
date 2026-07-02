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
import { changeUserPassword, updateUserEmail } from "@/lib/accountAuth";
import { enforceAuthGenerationIfNeeded } from "@/lib/authEnforcement";
import { authenticatedUserEmail } from "@/lib/authSession";
import { displayNameFromUser } from "@/lib/displayNameFromUser";
import { seedPersistedDisplayName } from "@/lib/seedPersistedDisplayName";
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
  signInWithApple: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  completeOAuthFromUrl: (redirectUrl: string) => Promise<{ error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DUPLICATE_EMAIL_PATTERNS = ["already registered", "already exists", "user already"];

/** Never leave the app on a spinner if Supabase or SecureStore is slow/unreachable. */
const AUTH_BOOTSTRAP_TIMEOUT_MS = 10_000;

function isDuplicateEmailError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return DUPLICATE_EMAIL_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  const refreshSession = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setSession(null);
      setSessionResolved(true);
      return;
    }
    try {
      const { data: userResult, error: userError } = await sb.auth.getUser();
      if (userError || !userResult.user) {
        try {
          await sb.auth.signOut({ scope: "local" });
        } catch {
          /* stale token cleanup */
        }
        setSession(null);
        return;
      }
      const { data } = await sb.auth.getSession();
      setSession(data.session ?? null);
    } catch {
      setSession(null);
    } finally {
      setSessionResolved(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let bootstrapFinished = false;

    const finishBootstrap = () => {
      if (cancelled || bootstrapFinished) return;
      bootstrapFinished = true;
      setSessionResolved(true);
    };

    const bootstrapTimeoutId = setTimeout(finishBootstrap, AUTH_BOOTSTRAP_TIMEOUT_MS);

    void (async () => {
      try {
        await enforceAuthGenerationIfNeeded();
        if (cancelled) return;

        if (!configured) {
          setSession(null);
          return;
        }

        const sb = getSupabase();
        if (!sb) {
          setSession(null);
          return;
        }

        await refreshSession();
        if (cancelled) return;

        const { data: sub } = sb.auth.onAuthStateChange(async (_event, nextSession) => {
          if (!nextSession?.user?.id) {
            setSession(null);
            setSessionResolved(true);
            return;
          }
          try {
            const { data: userResult, error: userError } = await sb.auth.getUser();
            if (userError || !userResult.user) {
              setSession(null);
            } else {
              setSession(nextSession);
            }
          } catch {
            setSession(null);
          } finally {
            setSessionResolved(true);
          }
        });

        unsubscribe = () => sub.subscription.unsubscribe();
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        clearTimeout(bootstrapTimeoutId);
        finishBootstrap();
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(bootstrapTimeoutId);
      unsubscribe?.();
    };
  }, [configured, refreshSession]);

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
    const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    if (data.session) setSession(data.session);
    setSessionResolved(true);
    return {};
  }, []);

  useEffect(() => {
    if (!__DEV__ || !configured || !sessionResolved || session?.user?.email) return;

    const email = String(process.env.EXPO_PUBLIC_DEV_AUTO_SIGN_IN_EMAIL ?? "").trim();
    const password = String(process.env.EXPO_PUBLIC_DEV_AUTO_SIGN_IN_PASSWORD ?? "").trim();
    if (!email || !password) return;

    void signInWithPassword(email, password);
  }, [configured, sessionResolved, session?.user?.email, signInWithPassword]);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign up." };

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    const seedNameFromSession = async (session: Session | null) => {
      const resolved = displayNameFromUser(session?.user) ?? trimmedName;
      if (resolved) await seedPersistedDisplayName(resolved);
    };

    const { data, error } = await sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: trimmedName } },
    });

    if (isDuplicateEmailError(error?.message)) {
      const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (!signInError) {
        await seedNameFromSession(signInData.session ?? null);
        if (signInData.session) setSession(signInData.session);
        setSessionResolved(true);
        return {};
      }
      return {
        error:
          "An account with that email already exists. Check your password and try signing in instead.",
      };
    }

    if (error) return { error: error.message };
    if (data.session) {
      await seedNameFromSession(data.session);
      setSession(data.session);
      setSessionResolved(true);
      return {};
    }

    const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (!signInError) {
      await seedNameFromSession(signInData.session ?? null);
      if (signInData.session) setSession(signInData.session);
      setSessionResolved(true);
      return {};
    }
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
      if (sb) await sb.auth.signOut({ scope: "local" });
    } catch {
      // Best-effort remote sign-out; local session must still clear (RN-2-05).
    } finally {
      setSession(null);
      setSessionResolved(true);
    }
  }, []);

  const updateEmail = useCallback(
    async (newEmail: string) => updateUserEmail(session?.user?.email, newEmail),
    [session?.user?.email],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) =>
      changeUserPassword(session?.user?.email, currentPassword, newPassword),
    [session?.user?.email],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      session,
      sessionEmail: authenticatedUserEmail(session),
      sessionResolved,
      signInWithPassword,
      signUpWithEmail,
      signInWithApple,
      signOut,
      completeOAuthFromUrl: completeOAuthRedirect,
      updateEmail,
      changePassword,
    }),
    [
      configured,
      session,
      sessionResolved,
      signInWithPassword,
      signUpWithEmail,
      signInWithApple,
      signOut,
      completeOAuthRedirect,
      updateEmail,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
