import { MacroBar } from "./shared";
import type { MacroTotals } from "./types";

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  label?: string;
  onLogClick?: () => void;
  /** Brief coached pace hint — shown only when user is behind protein pace. */
  paceHint?: string;
};

export function HomeFuelStrip({ totals, targets, label = "Fuel · Today", onLogClick, paceHint }: Props) {
  const kcalLeft = Math.max(0, targets.cal - totals.cal);

  return (
    <div className="card" style={{ padding: 16, marginTop: 18 }}>
      <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {kcalLeft} kcal left
          </div>
        </div>
        {onLogClick ? (
          <button
            type="button"
            className="tap"
            onClick={onLogClick}
            aria-label="Log fuel on Nutrition tab"
            style={{
              flexShrink: 0,
              padding: "8px 12px",
              borderRadius: 999,
              border: "0.5px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + Log
          </button>
        ) : null}
      </div>
      <MacroBar label="Protein" value={totals.p} target={targets.p} />
      {paceHint ? (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 12,
            lineHeight: 1.45,
            color: "rgba(255,200,120,0.95)",
            fontWeight: 500,
          }}
        >
          {paceHint}
        </p>
      ) : null}
    </div>
  );
}
