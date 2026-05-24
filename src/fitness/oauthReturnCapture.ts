/** Session flag: Save Progress OAuth completed or is in-flight (survives redirect). */
export const SAVE_PROGRESS_AUTH_KEY = "onboarding:save-progress-auth";

export function isOAuthReturn(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  if (hash.includes("access_token") || hash.includes("error=")) return true;
  return new URLSearchParams(window.location.search).has("code");
}

/** Persist OAuth return before Supabase clears the URL hash / session resolves. */
export function captureOAuthReturnForSaveProgress(): void {
  if (typeof window === "undefined") return;
  if (isOAuthReturn()) {
    sessionStorage.setItem(SAVE_PROGRESS_AUTH_KEY, "1");
  }
}

export function isSaveProgressAuthPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SAVE_PROGRESS_AUTH_KEY) === "1";
}

export function clearSaveProgressAuthPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SAVE_PROGRESS_AUTH_KEY);
}

export function shouldClearStaleSaveProgressSession(opts: {
  oauthReturn: boolean;
  saveProgressAuthPending: boolean;
  signedInEmail: string;
  alreadyCleared: boolean;
}): boolean {
  if (opts.oauthReturn) return false;
  if (opts.saveProgressAuthPending) return false;
  if (opts.alreadyCleared || !opts.signedInEmail.trim()) return false;
  return true;
}
