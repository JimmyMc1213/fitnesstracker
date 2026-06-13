import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildOnboardingDraft,
  mergeOnboardingDrafts,
  normalizeOnboardingDraft,
  ONBOARDING_DRAFT_VERSION,
  safeJsonParse,
  type OnboardingDraftInput,
} from "@newyouai/core";
import type { OnboardingDraft } from "@newyouai/types";

import {
  DEFAULT_ONBOARDING_COMPLETE,
  ONBOARDING_COMPLETE_STORAGE_KEY,
} from "@/lib/onboardingStub";

export const ONBOARDING_DRAFT_STORAGE_KEY = "newyou_onboarding_draft";
const LEGACY_ONBOARDING_DRAFT_KEY = "gymmy_onboarding_draft";

export function isRestorableOnboardingDraft(draft: OnboardingDraft | null | undefined): draft is OnboardingDraft {
  return draft != null && draft.version === ONBOARDING_DRAFT_VERSION && draft.stepIndex >= 0;
}

export async function readOnboardingComplete(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_COMPLETE_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // fall through to default
  }
  return DEFAULT_ONBOARDING_COMPLETE;
}

export async function writeOnboardingComplete(value: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETE_STORAGE_KEY, value ? "true" : "false");
}

async function readDraftRaw(): Promise<string | null> {
  const current = await AsyncStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  if (current) return current;

  const legacy = await AsyncStorage.getItem(LEGACY_ONBOARDING_DRAFT_KEY);
  if (!legacy) return null;

  await AsyncStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, legacy);
  await AsyncStorage.removeItem(LEGACY_ONBOARDING_DRAFT_KEY);
  return legacy;
}

export async function readOnboardingDraft(): Promise<OnboardingDraft | null> {
  try {
    const complete = await readOnboardingComplete();
    if (complete) {
      await AsyncStorage.multiRemove([ONBOARDING_DRAFT_STORAGE_KEY, LEGACY_ONBOARDING_DRAFT_KEY]);
      return null;
    }

    const raw = await readDraftRaw();
    if (!raw) return null;
    const parsed = safeJsonParse<unknown>(raw, null, ONBOARDING_DRAFT_STORAGE_KEY);
    const normalized = normalizeOnboardingDraft(parsed);
    if (!isRestorableOnboardingDraft(normalized)) {
      await AsyncStorage.multiRemove([ONBOARDING_DRAFT_STORAGE_KEY, LEGACY_ONBOARDING_DRAFT_KEY]);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export async function writeOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  await AsyncStorage.removeItem(LEGACY_ONBOARDING_DRAFT_KEY);
}

export async function loadRestorableOnboardingDraft(
  fromMemory?: OnboardingDraft | null,
): Promise<OnboardingDraft | null> {
  const fromDedicated = await readOnboardingDraft();
  const fromState = isRestorableOnboardingDraft(fromMemory) ? fromMemory : null;
  const merged = mergeOnboardingDrafts(fromDedicated, fromState);
  return isRestorableOnboardingDraft(merged) ? merged : null;
}

export async function persistOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await writeOnboardingDraft(draft);
  await writeOnboardingComplete(false);
}

export async function clearOnboardingDraftStorage(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDING_DRAFT_STORAGE_KEY, LEGACY_ONBOARDING_DRAFT_KEY]);
}

export { buildOnboardingDraft, type OnboardingDraftInput };
