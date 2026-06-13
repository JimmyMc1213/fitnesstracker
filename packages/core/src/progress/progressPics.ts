import type { ProgressPicEntry, ProgressPicsLockConfig, WeightEntry } from "@newyouai/types";

export type ProgressPicGalleryItem = {
  key: string;
  dateKey: string;
  photoDataUrl: string;
  sortMs: number;
  source: "gallery" | "weigh-in";
  galleryId?: string;
  weighInDateKey?: string;
};

export function newProgressPicId(): string {
  return `pp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeProgressPics(raw: unknown): ProgressPicEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ProgressPicEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || !o.id.trim()) continue;
    if (typeof o.dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.dateKey)) continue;
    if (typeof o.photoDataUrl !== "string" || !o.photoDataUrl.startsWith("data:image/")) continue;
    const addedAtIso =
      typeof o.addedAtIso === "string" && o.addedAtIso.trim() ? o.addedAtIso.trim() : new Date().toISOString();
    out.push({ id: o.id.trim(), dateKey: o.dateKey, photoDataUrl: o.photoDataUrl, addedAtIso });
  }
  return out;
}

export function normalizeProgressPicsLock(raw: unknown): ProgressPicsLockConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const pinHash = (raw as Record<string, unknown>).pinHash;
  if (typeof pinHash !== "string" || !pinHash.startsWith("pp")) return null;
  return { pinHash };
}

function entrySortMs(dateKey: string, iso?: string): number {
  if (iso) {
    const t = Date.parse(iso);
    if (Number.isFinite(t)) return t;
  }
  return Date.parse(`${dateKey}T12:00:00`);
}

export function collectProgressPicGalleryItems(
  progressPics: ProgressPicEntry[] | undefined,
  weightLog: WeightEntry[] | undefined,
): ProgressPicGalleryItem[] {
  const items: ProgressPicGalleryItem[] = [];

  for (const p of progressPics ?? []) {
    items.push({
      key: `g-${p.id}`,
      dateKey: p.dateKey,
      photoDataUrl: p.photoDataUrl,
      sortMs: entrySortMs(p.dateKey, p.addedAtIso),
      source: "gallery",
      galleryId: p.id,
    });
  }

  for (const w of weightLog ?? []) {
    if (!w.photoDataUrl) continue;
    items.push({
      key: `w-${w.dateKey}`,
      dateKey: w.dateKey,
      photoDataUrl: w.photoDataUrl,
      sortMs: entrySortMs(w.dateKey, w.loggedAtIso),
      source: "weigh-in",
      weighInDateKey: w.dateKey,
    });
  }

  return items.sort((a, b) => b.sortMs - a.sortMs);
}

/** @deprecated Weigh-in photos belong on weightLog.photoDataUrl only. Kept for legacy migration helpers. */
export function upsertWeighInProgressPic(
  progressPics: ProgressPicEntry[],
  dateKey: string,
  photoDataUrl: string | undefined,
): ProgressPicEntry[] {
  const withoutDay = progressPics.filter((p) => p.dateKey !== dateKey);
  if (!photoDataUrl) return withoutDay;
  return [
    ...withoutDay,
    {
      id: newProgressPicId(),
      dateKey,
      photoDataUrl,
      addedAtIso: new Date().toISOString(),
    },
  ];
}

/** Backfill fields missing on in-memory state after hot reload or older persisted blobs. */
export function withProgressPicsDefaults<T extends { progressPics?: ProgressPicEntry[]; progressPicsLock?: ProgressPicsLockConfig | null }>(
  state: T,
): T & { progressPics: ProgressPicEntry[]; progressPicsLock: ProgressPicsLockConfig | null } {
  return {
    ...state,
    progressPics: state.progressPics ?? [],
    progressPicsLock: state.progressPicsLock ?? null,
  };
}

export function formatProgressPicDate(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
