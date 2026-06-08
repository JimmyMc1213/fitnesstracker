import type { ReactNode } from "react";

export function OnboardingGoalWeightReinforcement({
  headline,
  subtext,
}: {
  headline: ReactNode;
  subtext: string;
}) {
  return (
    <div className="onboarding-goal-weight-reinforcement">
      <h2 className="onboarding-goal-weight-reinforcement__headline">{headline}</h2>
      <p className="onboarding-goal-weight-reinforcement__subtext">{subtext}</p>
    </div>
  );
}
