import { FITNESS_LOCAL_STORAGE_KEY, createEmptyPersistedSlice, savePersistedSlice } from "@newyouai/core";
import type { AppState, PersistedFitnessSlice } from "@newyouai/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { buildFitnessAppState } from "@/lib/fitness/buildFitnessAppState";
import { clearOnboardingDraftStorage, writeOnboardingComplete } from "@/lib/onboardingStorage";

const storageAdapter = createAsyncStorageAdapter();

/** Clears onboarding markers and local fitness data so the welcome screen can show again. */
export async function resetLocalAfterAccountDelete(): Promise<AppState> {
  await clearOnboardingDraftStorage();
  await writeOnboardingComplete(false);
  await AsyncStorage.removeItem(FITNESS_LOCAL_STORAGE_KEY);

  const empty = createEmptyPersistedSlice();
  const nextSlice: PersistedFitnessSlice = {
    ...empty,
    onboardingComplete: false,
    onboardingDraft: null,
    onboardingProfile: null,
    experienceLevelChosen: false,
    equipmentSetupChosen: false,
    unitPreferencesChosen: false,
  };
  await savePersistedSlice(storageAdapter, FITNESS_LOCAL_STORAGE_KEY, nextSlice);
  return buildFitnessAppState(nextSlice);
}
