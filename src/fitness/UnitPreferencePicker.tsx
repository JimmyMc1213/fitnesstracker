import type { CSSProperties } from "react";

import { heightUnitLabel, weightUnitLabel } from "./unitPreferences";
import type { HeightDisplayUnit, UnitPreferences, WeightUnit } from "./types";

const segmentBtn = (selected: boolean): CSSProperties => ({
  flex: 1,
  padding: "12px 14px",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  border: selected ? "1px solid rgba(255,255,255,0.45)" : "0.5px solid var(--border)",
  background: selected ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
  color: selected ? "#fff" : "rgba(255,255,255,0.55)",
});

export function UnitPreferencePicker({
  value,
  onChange,
}: {
  value: UnitPreferences;
  onChange: (next: UnitPreferences) => void;
}) {
  const setWeight = (weightUnit: WeightUnit) => onChange({ ...value, weightUnit });
  const setHeight = (heightUnit: HeightDisplayUnit) => onChange({ ...value, heightUnit });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Weight
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {(["lbs", "kg"] as const).map((u) => (
            <button key={u} type="button" className="tap" style={segmentBtn(value.weightUnit === u)} onClick={() => setWeight(u)}>
              {weightUnitLabel(u)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Height
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {(["ft_in", "cm"] as const).map((u) => (
            <button key={u} type="button" className="tap" style={segmentBtn(value.heightUnit === u)} onClick={() => setHeight(u)}>
              {heightUnitLabel(u)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
