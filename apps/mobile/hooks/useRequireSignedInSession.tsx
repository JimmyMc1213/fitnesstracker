import type { ReactNode } from "react";
import { Redirect, router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { isVisualParityWebFrame } from "@/lib/visualParity";

/** Blocks protected stacks until Supabase validates a signed-in user. */
export function useRequireSignedInSession() {
  const { session, sessionResolved } = useAuth();

  const bypass = isVisualParityWebFrame();
  const ready = bypass || sessionResolved;
  const allowed = bypass || hasAuthenticatedUser(session);

  useEffect(() => {
    if (bypass || !sessionResolved || hasAuthenticatedUser(session)) return;
    router.replace("/(auth)");
  }, [bypass, session, sessionResolved]);

  return { ready, allowed };
}

export function RequireSignedInSession({ children }: { children: ReactNode }) {
  const { session, sessionResolved } = useAuth();

  if (isVisualParityWebFrame()) return children;
  if (!sessionResolved) return null;
  if (!hasAuthenticatedUser(session)) return <Redirect href="/(auth)" />;
  return children;
}
