import type { CoachAdjustment } from "./coachEngine";

type Props = {
  adjustment: CoachAdjustment;
};

/** Inline coach copy after a logged weigh-in, engine message only (FTI-36). */
export function WeighInCoachReaction({ adjustment }: Props) {
  const nudge = adjustment.macroNudge;

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
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-faint-soft)",
          marginBottom: 6,
        }}
      >
        Coach check-in
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
