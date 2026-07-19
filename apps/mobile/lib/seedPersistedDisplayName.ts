import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  normalizeOnboardingDraft,
  savePersistedSlice,
} from "@newyouai/core";
import type { PersistedFitnessSlice } from "@newyouai/types";

import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { isRestorableOnboardingDraft, readOnboardingDraft, writeOnboardingDraft } from "@/lib/onboardingStorage";

const storageAdapter = createAsyncStorageAdapter();

function isPlaceholderDisplayName(name: string | undefined): boolean {
  return (name?.trim().toLowerCase() ?? "") === "friend";
}

/** Writes the account name into local fitness + onboarding draft when still blank. */
export async function seedPersistedDisplayName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  const existingSlice =
    (await loadPersistedSlice<PersistedFitnessSlice>(storageAdapter, FITNESS_LOCAL_STORAGE_KEY)) ?? {};
  const nextSlice: Partial<PersistedFitnessSlice> = { ...existingSlice };
  let sliceDirty = false;

  if (!nextSlice.displayName?.trim() || isPlaceholderDisplayName(nextSlice.displayName)) {
    nextSlice.displayName = trimmed;
    sliceDirty = true;
  }

  const draftFromSlice = normalizeOnboardingDraft(nextSlice.onboardingDraft);
  if (
    isRestorableOnboardingDraft(draftFromSlice) &&
    (!draftFromSlice.displayName.trim() || isPlaceholderDisplayName(draftFromSlice.displayName))
  ) {
    nextSlice.onboardingDraft = { ...draftFromSlice, displayName: trimmed };
    sliceDirty = true;
  }

  if (sliceDirty) {
    await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, nextSlice);
  }

  const dedicatedDraft = await readOnboardingDraft();
  if (
    isRestorableOnboardingDraft(dedicatedDraft) &&
    (!dedicatedDraft.displayName.trim() || isPlaceholderDisplayName(dedicatedDraft.displayName))
  ) {
    await writeOnboardingDraft({ ...dedicatedDraft, displayName: trimmed });
  }
}
