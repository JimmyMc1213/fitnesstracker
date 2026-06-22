import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FITNESS_LOCAL_STORAGE_KEY,
  FITNESS_SYNC_META_KEY,
  savePersistedSlice,
  createEmptyPersistedSlice,
} from "@newyouai/core";

import { createAsyncStorageAdapter } from "@/lib/createAsyncStorageAdapter";
import { clearLastAuthUserId } from "@/lib/authSessionStorage";
import {
  clearOnboardingDraftStorage,
  writeOnboardingComplete,
} from "@/lib/onboardingStorage";
import { ONBOARDING_COMPLETE_STORAGE_KEY } from "@/lib/onboardingStub";
import { getSupabase, getSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseSecureStoreAdapter } from "@/lib/supabaseSecureStore";
import { isVisualParityWebFrame } from "@/lib/visualParity";

const AUTH_ENFORCEMENT_KEY = "@newyouai/authEnforcementGeneration";

/** Bump when auth must be re-enforced for installs with stale local-only sessions. */
export const AUTH_ENFORCEMENT_GENERATION = 3;

const fitnessStorage = createAsyncStorageAdapter();

async function clearSupabaseAuthStorage(): Promise<void> {
  const adapter = getSupabaseSecureStoreAdapter();
  const projectRef = getSupabaseEnv().url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const keys = [
    projectRef ? `sb-${projectRef}-auth-token` : null,
    "supabase.auth.token",
  ].filter(Boolean) as string[];
  await Promise.all(keys.map((key) => adapter.removeItem(key).catch(() => undefined)));
}

/** One-time wipe: signed-out app shell + no ghost fitness/onboarding local state. */
export async function enforceAuthGenerationIfNeeded(): Promise<boolean> {
  if (isVisualParityWebFrame()) return false;

  const stored = await AsyncStorage.getItem(AUTH_ENFORCEMENT_KEY);
  if (stored === String(AUTH_ENFORCEMENT_GENERATION)) return false;

  const sb = getSupabase();
  try {
    if (sb) await sb.auth.signOut({ scope: "local" });
  } catch {
    /* best effort */
  }

  await clearSupabaseAuthStorage();
  await clearLastAuthUserId();
  await clearOnboardingDraftStorage();
  await writeOnboardingComplete(false);
  await AsyncStorage.multiRemove([
    ONBOARDING_COMPLETE_STORAGE_KEY,
    FITNESS_LOCAL_STORAGE_KEY,
    FITNESS_SYNC_META_KEY,
  ]);
  await savePersistedSlice(fitnessStorage, FITNESS_LOCAL_STORAGE_KEY, createEmptyPersistedSlice());
  await AsyncStorage.setItem(AUTH_ENFORCEMENT_KEY, String(AUTH_ENFORCEMENT_GENERATION));
  return true;
}
