import { useFitnessSync } from "./FitnessSyncContext";

type Props = {
  onContinue: () => void;
};

export function OnboardingSaveProgress({ onContinue }: Props) {
  const sync = useFitnessSync();
  const signedInEmail = sync.sessionEmail?.trim() ?? "";

  return (
    <div className="onboarding-save-progress">
      <div className="onboarding-save-progress__actions">
        {signedInEmail ? (
          <>
            <p className="onboarding-save-progress__signed-in">
              Signed in as <strong>{signedInEmail}</strong>
            </p>
            <button type="button" className="tap onboarding-oauth-btn onboarding-oauth-btn--apple" onClick={onContinue}>
              Continue
            </button>
          </>
        ) : (
          <p className="onboarding-save-progress__error">Sign in is required to continue.</p>
        )}
      </div>
    </div>
  );
}
