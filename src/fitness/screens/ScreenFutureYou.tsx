import { futureYouDraftAfterUserDelete, mergeFutureYouDraft } from "../futureYouDraft";
import { FutureYouPageContent } from "../FutureYouPageContent";
import { ageFromDateOfBirth } from "../onboardingProfile";
import { savePersistedSlice, sliceFromAppState } from "../persistFitnessSlice";
import type { ScreenProps } from "../types";

export function ScreenFutureYou({
  state,
  setState,
  futureYouUploadRequest,
  onFutureYouUploadRequestHandled,
}: ScreenProps) {
  const profile = state.onboardingProfile ?? {
    goal: "cut" as const,
    heightIn: 70,
    weightLbs: 180,
    age: 30,
  };
  const age =
    profile.dateOfBirth ? ageFromDateOfBirth(profile.dateOfBirth) : (profile.age ?? null);

  function onFutureYouChange(patch: Parameters<typeof mergeFutureYouDraft>[1]) {
    setState((s) => ({
      ...s,
      futureYou: mergeFutureYouDraft(s.futureYou, patch),
    }));
  }

  function onFutureYouDeleted() {
    setState((s) => {
      const next = futureYouDraftAfterUserDelete(s.futureYou);
      const nextState = {
        ...s,
        futureYou: Object.keys(next).length > 0 ? next : undefined,
      };
      savePersistedSlice(sliceFromAppState(nextState));
      return nextState;
    });
  }

  return (
    <div className="screen screen-future-you page-transition">
      <FutureYouPageContent
        active
        futureYou={state.futureYou}
        profile={profile}
        age={age}
        gender={profile.gender}
        subscriptionTier={state.subscriptionTier}
        onboardingComplete={state.onboardingComplete}
        onFutureYouChange={onFutureYouChange}
        onFutureYouDeleted={onFutureYouDeleted}
        futureYouUploadRequest={futureYouUploadRequest}
        onFutureYouUploadRequestHandled={onFutureYouUploadRequestHandled}
      />
    </div>
  );
}
