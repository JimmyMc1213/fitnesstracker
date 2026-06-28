import type { Session, User } from "@supabase/supabase-js";

/** First name / display label from Supabase auth metadata (email sign-up, Apple, etc.). */
export function displayNameFromUser(user: Session["user"] | User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  if (!meta || typeof meta !== "object") return null;
  const raw = meta.full_name ?? meta.name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
