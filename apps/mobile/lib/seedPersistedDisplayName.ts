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

/** Writes the account name into local fitness + onboarding draft when still blank. */
export async function seedPersistedDisplayName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  const existingSlice =
    (await loadPersistedSlice<PersistedFitnessSlice>(storageAdapter, FITNESS_LOCAL_STORAGE_KEY)) ?? {};
  const nextSlice: PersistedFitnessSlice = { ...existingSlice };
  let sliceDirty = false;

  if (!nextSlice.displayName?.trim()) {
    nextSlice.displayName = trimmed;
    sliceDirty = true;
  }

  const draftFromSlice = normalizeOnboardingDraft(nextSlice.onboardingDraft);
  if (isRestorableOnboardingDraft(draftFromSlice) && !draftFromSlice.displayName.trim()) {
    nextSlice.onboardingDraft = { ...draftFromSlice, displayName: trimmed };
    sliceDirty = true;
  }

  if (sliceDirty) {
    await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, nextSlice);
  }

  const dedicatedDraft = await readOnboardingDraft();
  if (isRestorableOnboardingDraft(dedicatedDraft) && !dedicatedDraft.displayName.trim()) {
    await writeOnboardingDraft({ ...dedicatedDraft, displayName: trimmed });
  }
}
