import { Image } from "react-native";

const previewUrlByJobId = new Map<string, string>();
const resultUrlByJobId = new Map<string, string>();
const sourceUrlByPath = new Map<string, string>();

export function cacheFutureYouPreviewUrl(jobId: string, url: string): void {
  const trimmed = jobId.trim();
  if (!trimmed || !url.trim()) return;
  previewUrlByJobId.set(trimmed, url.trim());
}

export function getCachedFutureYouPreviewUrl(jobId: string): string | undefined {
  return previewUrlByJobId.get(jobId.trim());
}

export function cacheFutureYouResultUrl(jobId: string, url: string): void {
  const trimmed = jobId.trim();
  if (!trimmed || !url.trim()) return;
  resultUrlByJobId.set(trimmed, url.trim());
}

export function getCachedFutureYouResultUrl(jobId: string): string | undefined {
  return resultUrlByJobId.get(jobId.trim());
}

export function cacheFutureYouSourceUrl(storagePath: string, url: string): void {
  const trimmed = storagePath.trim();
  if (!trimmed || !url.trim()) return;
  sourceUrlByPath.set(trimmed, url.trim());
}

export function getCachedFutureYouSourceUrl(storagePath: string): string | undefined {
  return sourceUrlByPath.get(storagePath.trim());
}

/** Decode image in memory so the hero can swap in without a visible flash. */
export function preloadFutureYouImage(src: string): Promise<boolean> {
  return Image.prefetch(src);
}
