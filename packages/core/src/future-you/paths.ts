/** Keep in sync with supabase/functions/_shared/future-you/paths.ts */

import { isFutureYouPathOwnedByUser } from "./storage";

const SOURCE_PATH_RE =
  /^users\/[^/]+\/source\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

/** Storage path for a generated Future You image: `users/{userId}/result/{jobId}.png`. */
export function buildFutureYouResultPath(userId: string, jobId: string): string {
  return `users/${userId}/result/${jobId}.png`;
}

/** True when `path` matches `users/{userId}/source/{uuid}.{jpg|png|webp}`. */
export function isFutureYouSourcePathForUser(path: string, userId: string): boolean {
  if (!SOURCE_PATH_RE.test(path)) return false;
  return isFutureYouPathOwnedByUser(path, userId);
}
