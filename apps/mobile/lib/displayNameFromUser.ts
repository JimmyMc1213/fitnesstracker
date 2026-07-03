import type { Session, User } from "@supabase/supabase-js";

/** First name / display label from Supabase auth metadata (email sign-up, Apple, etc.). */
export function displayNameFromUser(user: Session["user"] | User | null | undefined): string | null {
  if (!user) return null;
  const meta = user.user_metadata;
  if (!meta || typeof meta !== "object") return null;
  const fullName = typeof meta.full_name === "string" ? meta.full_name.trim() : "";
  if (fullName) return fullName;

  const firstName = typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const lastName = typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;

  const legacyName = typeof meta.name === "string" ? meta.name.trim() : "";
  return legacyName.length > 0 ? legacyName : null;
}
