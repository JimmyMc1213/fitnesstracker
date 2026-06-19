import { clearOnboardingDraftStorage, writeOnboardingComplete } from "@/lib/onboardingStorage";

/** Dev-only helpers for walking onboarding on simulator without reinstalling. */
export function isOnboardingDevToolsEnabled(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__ && process.env.EXPO_PUBLIC_ONBOARDING_DEV_TOOLS === "1";
}

export async function resetOnboardingProgress(): Promise<void> {
  await clearOnboardingDraftStorage();
  await writeOnboardingComplete(false);
}
