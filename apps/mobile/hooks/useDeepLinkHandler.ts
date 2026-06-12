import { isAppShellLoading, resolveAppShellMainView } from "@newyouai/core";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAppShellRoutingInput } from "@/hooks/useAppShellGate";
import { useOnboardingStub } from "@/hooks/useOnboardingStub";
import { resolveDeepLink } from "@/lib/deepLinkRouter";

export function useDeepLinkHandler(completeOAuthFromUrl: (url: string) => Promise<{ error?: string }>) {
  const shellInput = useAppShellRoutingInput();
  const { configured, sessionResolved } = useAuth();
  const { onboardingStubHydrated } = useOnboardingStub();
  const pendingUrlRef = useRef<string | null>(null);

  const shellReady =
    (!configured || sessionResolved) &&
    (!configured || !shellInput.sessionEmail || onboardingStubHydrated) &&
    !isAppShellLoading(shellInput) &&
    resolveAppShellMainView(shellInput) === "app";

  const handleUrl = async (url: string | null) => {
    if (!url) return;

    if (!shellReady) {
      pendingUrlRef.current = url;
      return;
    }

    const action = resolveDeepLink(url);

    if (action.type === "oauth") {
      await completeOAuthFromUrl(action.url);
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
    if (!shellReady || !pendingUrlRef.current) return;
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    void handleUrl(url);
  }, [shellReady]);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => handleUrl(url));

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, [shellReady, completeOAuthFromUrl]);
}
