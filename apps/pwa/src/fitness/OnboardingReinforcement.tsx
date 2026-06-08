export function OnboardingReinforcement({
  label = "You said",
  body,
  note,
}: {
  label?: string;
  body: string;
  note?: string;
}) {
  return (
    <div className="onboarding-reinforcement">
      {label ? <p className="onboarding-reinforcement-label">{label}</p> : null}
      <p className="onboarding-reinforcement-body">{body}</p>
      {note ? <p className="onboarding-reinforcement-note">{note}</p> : null}
    </div>
  );
}
