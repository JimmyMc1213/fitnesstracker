import { useEffect, useRef, useState } from "react";

import { useFitnessSync } from "./FitnessSyncContext";
import {
  clearSaveProgressAuthPending,
  isOAuthReturn,
  isSaveProgressAuthPending,
  shouldClearStaleSaveProgressSession,
} from "./oauthReturnCapture";
import { loadPersistedSlice } from "./persistFitnessSlice";
import { shouldSkipOnboarding } from "./onboardingSkip";

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

type Props = {
  onSkip: () => void;
  onSignedIn: () => void;
};

export function OnboardingSaveProgress({ onSkip, onSignedIn }: Props) {
  const sync = useFitnessSync();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);
  const clearedStaleSessionRef = useRef(false);
  const signedInEmail = sync.sessionEmail?.trim() ?? "";

  useEffect(() => {
    if (isOAuthReturn()) return;
    if (
      shouldSkipOnboarding({
        persisted: loadPersistedSlice(),
        sessionEmail: signedInEmail,
        forcePreview: false,
      })
    ) {
      return;
    }
    if (
      !shouldClearStaleSaveProgressSession({
        oauthReturn: false,
        saveProgressAuthPending: isSaveProgressAuthPending(),
        signedInEmail,
        alreadyCleared: clearedStaleSessionRef.current,
      })
    ) {
      return;
    }
    clearedStaleSessionRef.current = true;
    void sync.signOut();
  }, [signedInEmail, sync]);

  function handleSwitchAccount() {
    clearSaveProgressAuthPending();
    void sync.signOut();
  }

  function handleSignedInContinue() {
    clearSaveProgressAuthPending();
    onSignedIn();
  }

  async function handleOAuth(provider: "apple" | "google") {
    if (!sync.configured) {
      setError("Cloud sync is not configured. You can skip and sign in later.");
      return;
    }
    setError(null);
    setLoading(provider);
    const result = await sync.signInWithOAuth(provider);
    setLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
  }

  return (
    <div className="onboarding-save-progress">
      <div className="onboarding-save-progress__actions">
        {signedInEmail ? (
          <>
            <p className="onboarding-save-progress__signed-in">
              Signed in as <strong>{signedInEmail}</strong>
            </p>
            <button type="button" className="tap onboarding-oauth-btn onboarding-oauth-btn--apple" onClick={handleSignedInContinue}>
              Continue
            </button>
            <button
              type="button"
              className="tap onboarding-save-progress__switch-account"
              onClick={handleSwitchAccount}
            >
              Use a different account
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="tap onboarding-oauth-btn onboarding-oauth-btn--apple"
              disabled={loading != null}
              onClick={() => void handleOAuth("apple")}
            >
              <AppleIcon />
              {loading === "apple" ? "Signing in…" : "Sign in with Apple"}
            </button>
            <button
              type="button"
              className="tap onboarding-oauth-btn onboarding-oauth-btn--google"
              disabled={loading != null}
              onClick={() => void handleOAuth("google")}
            >
              <GoogleIcon />
              {loading === "google" ? "Signing in…" : "Sign in with Google"}
            </button>
          </>
        )}
        {error ? <p className="onboarding-save-progress__error">{error}</p> : null}
      </div>

      {!signedInEmail ? (
        <button type="button" className="tap onboarding-save-progress__skip" onClick={onSkip}>
          Would you like to sign in later? <strong>Skip</strong>
        </button>
      ) : null}
    </div>
  );
}
