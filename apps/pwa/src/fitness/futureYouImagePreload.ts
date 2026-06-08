const previewUrlByJobId = new Map<string, string>();
const resultUrlByJobId = new Map<string, string>();

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

/** Decode image in memory so the hero can swap in without a visible flash. */
export function preloadFutureYouImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Future You image failed to load"));
    img.src = src;
  });
}
