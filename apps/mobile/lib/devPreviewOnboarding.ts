import { writeOnboardingComplete } from "@/lib/onboardingStorage";

/** Dev-only: walk through onboarding without signing in. Stripped from production builds. */

let previewSessionActive = false;

function envPreviewEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_PREVIEW_ONBOARDING?.trim().toLowerCase();
  return flag === "1" || flag === "true";
}

export function isOnboardingPreviewActive(): boolean {
  if (typeof __DEV__ === "undefined" || !__DEV__) return false;
  return previewSessionActive || envPreviewEnabled();
}

export function startOnboardingPreview(): void {
  if (typeof __DEV__ === "undefined" || !__DEV__) return;
  previewSessionActive = true;
  void writeOnboardingComplete(false);
}

export function stopOnboardingPreview(): void {
  previewSessionActive = false;
}
