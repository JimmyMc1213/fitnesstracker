import { MacroBar } from "./shared";
import type { MacroTotals } from "./types";

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  label?: string;
};

/** Read-only fuel progress on Home (logging lives on Nutrition tab → Log Food). */
export function HomeFuelStrip({ totals, targets, label = "Fuel · Today" }: Props) {
  const kcalLeft = Math.max(0, targets.cal - totals.cal);

  return (
    <div className="card" style={{ padding: 16, marginTop: 18 }}>
      <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-whisper)",
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
              color: "var(--text-muted-soft)",
              fontWeight: 500,
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {kcalLeft} kcal left
          </div>
        </div>
      </div>
      <MacroBar label="Protein" value={totals.p} target={targets.p} />
    </div>
  );
}
