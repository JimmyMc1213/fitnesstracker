import {
  EQUIPMENT_SETUP_DESCRIPTIONS,
  EQUIPMENT_SETUP_LABELS,
  EQUIPMENT_SETUP_OPTIONS,
} from "./equipmentSetup";
import type { EquipmentSetup } from "./types";

export function EquipmentSetupPicker({
  value,
  onChange,
}: {
  value?: EquipmentSetup;
  onChange: (next: EquipmentSetup) => void;
}) {
  return (
    <div className="onboarding-pill-stack">
      {EQUIPMENT_SETUP_OPTIONS.map((setup) => {
        const selected = value === setup;
        return (
          <button
            key={setup}
            type="button"
            className={`tap onboarding-pill${selected ? " onboarding-pill--selected" : ""}`}
            onClick={() => onChange(setup)}
            style={{ flexDirection: "column", alignItems: "flex-start", gap: 4, minHeight: 64 }}
          >
            <span>{EQUIPMENT_SETUP_LABELS[setup]}</span>
            <span className="onboarding-pill__subtext">{EQUIPMENT_SETUP_DESCRIPTIONS[setup]}</span>
          </button>
        );
      })}
    </div>
  );
}
