/** Keep in sync with src/fitness/futureYouPaths.ts */

export const FUTURE_YOU_BUCKET = "future-you";

export function futureYouUserPrefix(userId: string): string {
  return `users/${userId}/`;
}

export function isFutureYouPathOwnedByUser(path: string, userId: string): boolean {
  const prefix = futureYouUserPrefix(userId);
  return path === prefix.slice(0, -1) || path.startsWith(prefix);
}

const SOURCE_PATH_RE =
  /^users\/[^/]+\/source\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

export function buildFutureYouResultPath(userId: string, jobId: string): string {
  return `users/${userId}/result/${jobId}.png`;
}

/**
 * Low-resolution, detail-stripped teaser derived from the result image. Served to
 * non-entitled users behind the paywall blur instead of the full-resolution
 * result, so the paid asset can never be retrieved without an entitlement.
 */
export function buildFutureYouPreviewPath(userId: string, jobId: string): string {
  return `users/${userId}/preview/${jobId}.png`;
}

export function isFutureYouSourcePathForUser(path: string, userId: string): boolean {
  if (!SOURCE_PATH_RE.test(path)) return false;
  return isFutureYouPathOwnedByUser(path, userId);
}
