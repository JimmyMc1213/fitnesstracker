import { isAppShellLoading, resolveAppShellMainView } from "@newyouai/core";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAppShellRoutingInput } from "@/hooks/useAppShellGate";
import { useOnboardingStub } from "@/hooks/useOnboardingStub";
import { resolveDeepLink } from "@/lib/deepLinkRouter";
import { PASSWORD_RECOVERY_ROUTE } from "@/lib/authOAuth";

export function useDeepLinkHandler(
  completeOAuthFromUrl: (url: string) => Promise<{ error?: string; recovery?: boolean }>,
) {
  const shellInput = useAppShellRoutingInput();
  const { configured, sessionResolved, passwordRecoveryPending } = useAuth();
  const { onboardingStubHydrated } = useOnboardingStub();
  const pendingOAuthUrlRef = useRef<string | null>(null);
  const pendingNavigateUrlRef = useRef<string | null>(null);

  const authBootstrapReady = !configured || sessionResolved;

  const shellReady =
    authBootstrapReady &&
    (passwordRecoveryPending ||
      ((!configured || !shellInput.sessionEmail || onboardingStubHydrated) &&
        !isAppShellLoading(shellInput) &&
        resolveAppShellMainView(shellInput) === "app"));

  const handleUrl = async (url: string | null) => {
    if (!url) return;

    const action = resolveDeepLink(url);

    if (action.type === "oauth") {
      if (!authBootstrapReady) {
        pendingOAuthUrlRef.current = url;
        return;
      }
      const result = await completeOAuthFromUrl(action.url);
      if (result.recovery) {
        router.replace(PASSWORD_RECOVERY_ROUTE);
      }
      return;
    }

    if (!shellReady) {
      pendingNavigateUrlRef.current = url;
      return;
    }

    if (action.type === "navigate") {
      if (typeof action.href === "string") {
        router.push(action.href);
      } else {
        router.push(action.href);
      }
      return;
    }

    router.replace("/(tabs)/home");
  };

  useEffect(() => {
    if (!passwordRecoveryPending) return;
    router.replace(PASSWORD_RECOVERY_ROUTE);
  }, [passwordRecoveryPending]);

  useEffect(() => {
    if (!authBootstrapReady || !pendingOAuthUrlRef.current) return;
    const url = pendingOAuthUrlRef.current;
    pendingOAuthUrlRef.current = null;
    void completeOAuthFromUrl(url).then((result) => {
      if (result.recovery) router.replace(PASSWORD_RECOVERY_ROUTE);
    });
  }, [authBootstrapReady, completeOAuthFromUrl]);

  useEffect(() => {
    if (!shellReady || !pendingNavigateUrlRef.current) return;
    const url = pendingNavigateUrlRef.current;
    pendingNavigateUrlRef.current = null;
    void handleUrl(url);
  }, [shellReady]);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => handleUrl(url));

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, [authBootstrapReady, shellReady, completeOAuthFromUrl]);
}
