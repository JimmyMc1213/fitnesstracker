import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

/** Redirects between `(auth)` and `(tabs)` based on Supabase session. */
export function useAuthGate() {
  const { configured, session, sessionResolved } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!sessionResolved) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!configured) {
      if (inAuthGroup) router.replace("/(tabs)");
      return;
    }

    if (!session && !inAuthGroup) {
      router.replace("/(auth)");
      return;
    }

    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [configured, session, sessionResolved, segments, router]);
}
