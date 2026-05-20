import { useState } from "react";

import { DEFAULT_EQUIPMENT_SETUP } from "./equipmentSetup";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import { buildWorkoutTemplates } from "./workoutTemplateBuilder";
import type { AppState, EquipmentSetup } from "./types";

export function EquipmentOnboardingScreen({
  setState,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [setup, setSetup] = useState<EquipmentSetup>(DEFAULT_EQUIPMENT_SETUP);

  function finish() {
    setState((s) => ({
      ...s,
      equipmentSetup: setup,
      equipmentSetupChosen: true,
      workoutTemplates: buildWorkoutTemplates(s.experienceLevel, setup),
    }));
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px 20px 32px",
        background: "var(--bg)",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 8px" }}>
        Your equipment
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
        We&apos;ll tailor your workout templates to exercises you can actually perform.
      </p>
      <div className="card" style={{ padding: 20 }}>
        <EquipmentSetupPicker value={setup} onChange={setSetup} />
      </div>
      <button
        type="button"
        className="tap"
        onClick={finish}
        style={{
          marginTop: 28,
          width: "100%",
          padding: 14,
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          background: "#fff",
          color: "#000",
        }}
      >
        Continue
      </button>
    </div>
  );
}
