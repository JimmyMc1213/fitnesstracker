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

/** Same key as PWA `onboardingDraft.ts` for draft resume parity. */
export const GYMMY_ONBOARDING_DRAFT_KEY = "gymmy_onboarding_draft";

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

export async function readGymmyOnboardingDraft(): Promise<OnboardingDraft | null> {
  try {
    const complete = await readOnboardingComplete();
    if (complete) {
      await AsyncStorage.removeItem(GYMMY_ONBOARDING_DRAFT_KEY);
      return null;
    }

    const raw = await AsyncStorage.getItem(GYMMY_ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = safeJsonParse<unknown>(raw, null, GYMMY_ONBOARDING_DRAFT_KEY);
    const normalized = normalizeOnboardingDraft(parsed);
    if (!isRestorableOnboardingDraft(normalized)) {
      await AsyncStorage.removeItem(GYMMY_ONBOARDING_DRAFT_KEY);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export async function writeGymmyOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await AsyncStorage.setItem(GYMMY_ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
}

export async function loadRestorableOnboardingDraft(
  fromMemory?: OnboardingDraft | null,
): Promise<OnboardingDraft | null> {
  const fromDedicated = await readGymmyOnboardingDraft();
  const fromState = isRestorableOnboardingDraft(fromMemory) ? fromMemory : null;
  const merged = mergeOnboardingDrafts(fromDedicated, fromState);
  return isRestorableOnboardingDraft(merged) ? merged : null;
}

export async function persistOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await writeGymmyOnboardingDraft(draft);
  await writeOnboardingComplete(false);
}

export async function clearOnboardingDraftStorage(): Promise<void> {
  await AsyncStorage.removeItem(GYMMY_ONBOARDING_DRAFT_KEY);
}

export { buildOnboardingDraft, type OnboardingDraftInput };
