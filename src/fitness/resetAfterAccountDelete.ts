import type { Dispatch, SetStateAction } from "react";

import { buildAppStateFromPersisted } from "./buildAppState";
import { seedDefaultData } from "./defaultSeed";
import { clearOnboardingDraftStorage } from "./onboardingDraft";
import {
  FITNESS_LOCAL_STORAGE_KEY,
  loadPersistedSlice,
  savePersistedSlice,
  sliceFromAppState,
} from "./persistFitnessSlice";
import { saveSyncMeta } from "./syncMeta";
import type { AppState } from "./types";

/** Clears cloud sync markers and local fitness data so the welcome screen can show again. */
export function resetLocalAfterAccountDelete(setState: Dispatch<SetStateAction<AppState>>): void {
  clearOnboardingDraftStorage();
  saveSyncMeta({ lastSeenRemoteUpdatedAtMs: 0 });
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(FITNESS_LOCAL_STORAGE_KEY);
  }
  seedDefaultData();
  const base = sliceFromAppState(buildAppStateFromPersisted(loadPersistedSlice()));
  const nextSlice = {
    ...base,
    onboardingComplete: false,
    onboardingDraft: null,
    onboardingProfile: null,
    experienceLevelChosen: false,
    equipmentSetupChosen: false,
    unitPreferencesChosen: false,
  };
  savePersistedSlice(nextSlice);
  setState(buildAppStateFromPersisted(nextSlice));
}
