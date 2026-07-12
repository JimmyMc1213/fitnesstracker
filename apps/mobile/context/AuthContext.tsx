import type { Session } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

import { AuthContext, type AuthContextValue } from "@/context/auth-context";
import { mapOAuthSessionError, parseOAuthRedirectUrl } from "@/lib/authOAuth";
import { authEmailRedirectUrl } from "@/lib/authRedirect";
import { changeUserPassword, updateUserEmail } from "@/lib/accountAuth";
import { enforceAuthGenerationIfNeeded } from "@/lib/authEnforcement";
import { authenticatedUserEmail } from "@/lib/authSession";
import { displayNameFromUser } from "@/lib/displayNameFromUser";
import { seedPersistedDisplayName } from "@/lib/seedPersistedDisplayName";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

const DUPLICATE_EMAIL_PATTERNS = ["already registered", "already exists", "user already"];

/** Never leave the app on a spinner if Supabase or SecureStore is slow/unreachable. */
const AUTH_BOOTSTRAP_TIMEOUT_MS = 10_000;

function isDuplicateEmailError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return DUPLICATE_EMAIL_PATTERNS.some((pattern) => lower.includes(pattern));
}

function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link we sent you.";
  }
  return message;
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
    if (error) return { error: mapSignInError(error.message) };
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

  const signUpWithEmail = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign up." };

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(" ");

    const seedNameFromSession = async (session: Session | null) => {
      const resolved = displayNameFromUser(session?.user) ?? fullName;
      if (resolved) await seedPersistedDisplayName(resolved);
    };

    const { data, error } = await sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: authEmailRedirectUrl(),
        data: {
          first_name: trimmedFirst,
          last_name: trimmedLast,
          full_name: fullName,
        },
      },
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
  },
  []);

  const completeOAuthRedirect = useCallback(async (redirectUrl: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Add Supabase keys to sign in." };

    const parsed = parseOAuthRedirectUrl(redirectUrl);
    if (!parsed.ok) {
      if (parsed.cancelled) return {};
      return { error: mapOAuthSessionError(parsed.error) };
    }

    const { data, error } = await sb.auth.setSession({
      access_token: parsed.tokens.accessToken,
      refresh_token: parsed.tokens.refreshToken,
    });
    if (error) return { error: mapOAuthSessionError(error.message) };

    const resolvedName = displayNameFromUser(data.session?.user);
    if (resolvedName) await seedPersistedDisplayName(resolvedName);
    if (data.session) {
      setSession(data.session);
      setSessionResolved(true);
    }
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
      const givenName = credential.fullName?.givenName?.trim() ?? "";
      const familyName = credential.fullName?.familyName?.trim() ?? "";

      const { data: authData, error } = await sb.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        ...(credential.authorizationCode
          ? { access_token: credential.authorizationCode }
          : {}),
      });
      if (error) return { error: mapOAuthSessionError(error.message, "apple") };

      if (authData.session) {
        setSession(authData.session);
        setSessionResolved(true);
      }

      if (authData.user && (fullName || givenName || familyName)) {
        const existingMeta = authData.user.user_metadata ?? {};
        if (!existingMeta.full_name) {
          await sb.auth.updateUser({
            data: {
              first_name: givenName || undefined,
              last_name: familyName || undefined,
              full_name: fullName || undefined,
            },
          });
        }
      }

      const resolvedName = fullName || displayNameFromUser(authData.user);
      if (resolvedName) await seedPersistedDisplayName(resolvedName);
      return {};
    } catch (e) {
      if (e && typeof e === "object" && "code" in e) {
        const code = String((e as { code?: string }).code);
        if (code === "ERR_REQUEST_CANCELED") return {};
      }
      const message = e instanceof Error ? e.message : "Apple Sign-In failed.";
      return { error: mapOAuthSessionError(message, "apple") };
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

export { useAuth } from "@/context/auth-context";
export type { AuthContextValue, AuthResult } from "@/context/auth-context";
