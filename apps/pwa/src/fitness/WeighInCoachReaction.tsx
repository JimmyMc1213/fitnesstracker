import type { CoachAdjustment } from "./coachEngine";
import { greetingFirstName } from "./homeGreeting";
import { COACH_BLUE_LABEL } from "./workoutUiTokens";

type Props = {
  adjustment: CoachAdjustment;
  displayName?: string;
};

/** Inline coach copy after a logged weigh-in, engine message only (FTI-36). */
export function WeighInCoachReaction({ adjustment, displayName = "" }: Props) {
  const nudge = adjustment.macroNudge;
  const firstName = greetingFirstName(displayName);
  const greeting = firstName ? `Hey ${firstName}, Just Checking in.` : "Hey there, Just Checking in.";

  return (
    <div
      className="card"
      style={{
        padding: 14,
        marginTop: 10,
        borderColor: "var(--border-strong)",
        background: "var(--surface-1)",
      }}
      aria-live="polite"
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.5,
          marginBottom: 6,
        }}
      >
        <span style={{ color: COACH_BLUE_LABEL, fontWeight: 600 }}>Coach:</span>{" "}
        <span style={{ color: "var(--text-soft)" }}>{greeting}</span>
      </div>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--text-soft)", fontWeight: 500 }}>
        {adjustment.message}
      </p>
      {nudge?.deltaCal != null ? (
        <p style={{ margin: "8px 0 0", fontSize: 11, lineHeight: 1.45, color: "var(--text-faint-soft)", fontWeight: 500 }}>
          +{nudge.deltaCal} cal suggested, {nudge.reason}
        </p>
      ) : null}
    </div>
  );
}
