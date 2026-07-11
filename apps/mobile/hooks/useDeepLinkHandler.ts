import { isAppShellLoading, resolveAppShellMainView } from "@newyouai/core";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAppShellRoutingInput } from "@/hooks/useAppShellGate";
import { useOnboardingStub } from "@/hooks/useOnboardingStub";
import { parseOAuthRedirectUrl } from "@/lib/authOAuth";
import { resolveDeepLink } from "@/lib/deepLinkRouter";

export function useDeepLinkHandler(
  completeOAuthFromUrl: (url: string) => Promise<{ error?: string; recovery?: boolean }>,
) {
  const shellInput = useAppShellRoutingInput();
  const { configured, sessionResolved } = useAuth();
  const { onboardingStubHydrated } = useOnboardingStub();
  const pendingUrlRef = useRef<string | null>(null);

  const oauthReady = !configured || sessionResolved;

  const shellReady =
    oauthReady &&
    (!configured || !shellInput.sessionEmail || onboardingStubHydrated) &&
    !isAppShellLoading(shellInput) &&
    resolveAppShellMainView(shellInput) === "app";

  const handleUrl = async (url: string | null) => {
    if (!url) return;

    const action = resolveDeepLink(url);

    if (action.type === "oauth") {
      if (!oauthReady) {
        pendingUrlRef.current = url;
        return;
      }

      const parsed = parseOAuthRedirectUrl(action.url);
      if (!parsed.ok) {
        router.push({
          pathname: "/(auth)/sign-in",
          params: { linkError: parsed.error },
        });
        return;
      }

      const result = await completeOAuthFromUrl(action.url);
      if (result.error) {
        router.push({
          pathname: "/(auth)/sign-in",
          params: { linkError: result.error },
        });
        return;
      }
      if (parsed.ok && (parsed.tokens.type === "recovery" || result.recovery)) {
        router.push("/(auth)/reset-password");
        return;
      }
      return;
    }

    if (!shellReady) {
      pendingUrlRef.current = url;
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
    if (!oauthReady || !pendingUrlRef.current) return;
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    void handleUrl(url);
  }, [oauthReady, shellReady]);

  useEffect(() => {
    void Linking.getInitialURL().then((url) => handleUrl(url));

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, [oauthReady, shellReady, completeOAuthFromUrl]);
}
