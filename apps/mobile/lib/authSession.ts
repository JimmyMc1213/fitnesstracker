import type { Session } from "@supabase/supabase-js";

/** True when Supabase returned a signed-in user for this device session. */
export function hasAuthenticatedUser(session: Session | null | undefined): boolean {
  return Boolean(session?.user?.id);
}

export function authenticatedUserEmail(session: Session | null | undefined): string | null {
  const email = session?.user?.email?.trim();
  return email ? email : null;
}

/** Shell routing treats any validated Supabase user as signed in. */
export function routingSessionEmail(
  session: Session | null | undefined,
  email: string | null | undefined,
): string | null {
  if (!hasAuthenticatedUser(session)) return null;
  if (email?.trim()) return email.trim();
  return `${session!.user!.id}@session.local`;
}
