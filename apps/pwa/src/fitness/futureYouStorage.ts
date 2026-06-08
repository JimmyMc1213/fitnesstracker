/** Private Supabase Storage bucket for Future You photos (see migration 004). */
export const FUTURE_YOU_BUCKET = "future-you";

/** Prefix for all objects owned by a user: `users/{userId}/`. */
export function futureYouUserPrefix(userId: string): string {
  return `users/${userId}/`;
}

/** True when `path` is under `users/{userId}/` (matches storage RLS). */
export function isFutureYouPathOwnedByUser(path: string, userId: string): boolean {
  const prefix = futureYouUserPrefix(userId);
  return path === prefix.slice(0, -1) || path.startsWith(prefix);
}
