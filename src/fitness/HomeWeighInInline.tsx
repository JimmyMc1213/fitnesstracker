import { IconCheck, IconChevR } from "./icons";
import { formatWeightFromLbs, weightUnitLabel } from "./unitPreferences";
import type { WeightEntry, WeightUnit } from "./types";

type Props = {
  entry: WeightEntry;
  weightUnit: WeightUnit;
  onPress: () => void;
};

export function HomeWeighInInline({ entry, weightUnit, onPress }: Props) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onPress}
      aria-label="View weigh-in on Progress"
      style={{
        marginTop: 18,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        border: "0.5px solid var(--border-strong)",
        background: "var(--surface-3)",
        textAlign: "left",
      }}
    >
      <IconCheck size={16} stroke={2.4} style={{ color: "var(--text-soft)", flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
        {formatWeightFromLbs(entry.weightLbs, weightUnit)} {weightUnitLabel(weightUnit)}
      </span>
      <span style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500 }}>Weigh-in logged</span>
      <IconChevR size={12} style={{ color: "var(--text-ghost)", flexShrink: 0 }} />
    </button>
  );
}
