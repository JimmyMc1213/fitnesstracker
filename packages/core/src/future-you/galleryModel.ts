import type { FutureYouJobStatus } from "./jobs";
import type { HomeFutureYouEntryMode } from "./homeEntryModel";

export const FUTURE_YOU_GALLERY_SAVE_LABEL = "Save to photos";
export const FUTURE_YOU_GALLERY_SAVING_LABEL = "Saving…";
export const FUTURE_YOU_GALLERY_SAVE_SUCCESS = "Saved to your device.";
export const FUTURE_YOU_GALLERY_EMPTY_TITLE = "No NewYou previews yet";
export const FUTURE_YOU_GALLERY_TRY_CTA_LABEL = "Try NewYou";
export const FUTURE_YOU_GALLERY_COUNT_ONE = "1 preview";

export function formatFutureYouGalleryCount(count: number): string {
  if (count === 1) return FUTURE_YOU_GALLERY_COUNT_ONE;
  return `${count} previews`;
}
export const FUTURE_YOU_GALLERY_TAP_HINT = "Tap to view";
export const FUTURE_YOU_DETAIL_BACK_LABEL = "Gallery";
export const FUTURE_YOU_FULLSCREEN_DONE_LABEL = "Done";
export const FUTURE_YOU_DETAIL_TAP_FULLSCREEN_HINT = "Tap image for full screen";

export type FutureYouGalleryItem = {
  id: string;
  imageSrc: string | null;
  caption: string;
  dateLabel: string;
  loading: boolean;
};

export function formatFutureYouGalleryDate(readyAtIso: string | undefined): string {
  if (!readyAtIso?.trim()) return "NewYou preview";
  const parsed = Date.parse(readyAtIso);
  if (!Number.isFinite(parsed)) return "NewYou preview";
  return new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildFutureYouGalleryItem(opts: {
  jobId: string | undefined;
  imageSrc: string | null;
  timeline: string;
  motivationLabel: string | null;
  readyAtIso: string | undefined;
  loading: boolean;
}): FutureYouGalleryItem | null {
  const id = opts.jobId?.trim();
  if (!id) return null;

  const caption =
    opts.motivationLabel ? `${opts.timeline} · ${opts.motivationLabel}` : `You in ${opts.timeline}`;

  return {
    id,
    imageSrc: opts.imageSrc,
    caption,
    dateLabel: formatFutureYouGalleryDate(opts.readyAtIso),
    loading: opts.loading,
  };
}

export function shouldShowFutureYouGalleryTile(
  mode: HomeFutureYouEntryMode | null,
  generationStatus: FutureYouJobStatus | "idle",
): boolean {
  return mode === "reveal" || generationStatus === "queued" || generationStatus === "generating";
}
