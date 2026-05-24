const STORAGE_KEY = "fitcoach:dev:previewOnboarding";

export function isDevPreviewOnboardingUrl(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("previewOnboarding") === "1";
}

export function isDevPreviewOnboardingStored(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function isDevPreviewOnboardingEnabled(): boolean {
  return isDevPreviewOnboardingUrl() || isDevPreviewOnboardingStored();
}

export function isDevToolbarEnabled(): boolean {
  if (!import.meta.env.DEV || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("devTools") === "1";
}

export function setDevPreviewOnboardingStored(enabled: boolean): void {
  if (!import.meta.env.DEV || typeof window === "undefined") return;
  if (enabled) localStorage.setItem(STORAGE_KEY, "1");
  else localStorage.removeItem(STORAGE_KEY);
}

export function clearDevPreviewOnboardingUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("previewOnboarding")) return;
  url.searchParams.delete("previewOnboarding");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}
