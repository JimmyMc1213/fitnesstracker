import type { WeightUnit } from "./types";
import { weightUnitLabel } from "./unitPreferences";
import { LABEL_SIZE, METADATA_SIZE, TITLE_SIZE, labelStyle } from "./workoutUiTokens";

type WorkoutSessionStickyHeaderProps = {
  doneSets: number;
  totalSets: number;
  totalVolume: number;
  weightUnit: WeightUnit;
};

export function WorkoutSessionStickyHeader({ doneSets, totalSets, totalVolume, weightUnit }: WorkoutSessionStickyHeaderProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 2,
        marginTop: 12,
        marginBottom: 4,
        padding: "14px 16px",
        display: "flex",
        gap: 18,
        alignItems: "center",
        background: "var(--bg)",
        borderBottom: "0.5px solid var(--divider-subtle)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ ...labelStyle, color: "var(--text-ghost)" }}>Session</div>
        <div
          style={{
            fontSize: METADATA_SIZE,
            color: "var(--text-ghost)",
            marginTop: 4,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {doneSets}/{totalSets} sets logged
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: TITLE_SIZE,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            color: "var(--text-primary)",
          }}
        >
          {totalVolume.toLocaleString()}
        </div>
        <div
          style={{
            ...labelStyle,
            fontSize: LABEL_SIZE,
            color: "var(--text-ghost)",
            marginTop: 2,
          }}
        >
          {weightUnitLabel(weightUnit).toUpperCase()} · Volume
        </div>
      </div>
    </div>
  );
}
