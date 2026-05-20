import type { CSSProperties } from "react";

import {
  EQUIPMENT_SETUP_DESCRIPTIONS,
  EQUIPMENT_SETUP_LABELS,
  EQUIPMENT_SETUP_OPTIONS,
} from "./equipmentSetup";
import type { EquipmentSetup } from "./types";

const optionBtn = (selected: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 15,
  border: selected ? "1px solid rgba(255,255,255,0.45)" : "0.5px solid var(--border)",
  background: selected ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
  color: selected ? "#fff" : "rgba(255,255,255,0.85)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
});

export function EquipmentSetupPicker({
  value,
  onChange,
}: {
  value: EquipmentSetup;
  onChange: (next: EquipmentSetup) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {EQUIPMENT_SETUP_OPTIONS.map((setup) => {
        const selected = value === setup;
        return (
          <button
            key={setup}
            type="button"
            className="tap"
            style={optionBtn(selected)}
            onClick={() => onChange(setup)}
          >
            <span>{EQUIPMENT_SETUP_LABELS[setup]}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>
              {EQUIPMENT_SETUP_DESCRIPTIONS[setup]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
