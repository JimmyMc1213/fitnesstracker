import { Redirect, useSegments } from "expo-router";

import { RequireSignedInSession } from "@/hooks/useRequireSignedInSession";
import { useAuth } from "@/context/AuthContext";
import { hasAuthenticatedUser } from "@/lib/authSession";
import { isVisualParityWebFrame } from "@/lib/visualParity";

/** Hard redirect to welcome when a protected route renders without a Supabase user. */
export function AuthSessionRedirect() {
  const { session, sessionResolved } = useAuth();
  const segments = useSegments();

  if (isVisualParityWebFrame()) return null;
  if (!sessionResolved) return null;
  if (hasAuthenticatedUser(session)) return null;
  if (segments[0] === "(auth)") return null;

  return <Redirect href="/(auth)" />;
}

export { RequireSignedInSession };
