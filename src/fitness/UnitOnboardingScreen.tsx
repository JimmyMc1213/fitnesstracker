import { useState } from "react";

import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { DEFAULT_UNIT_PREFERENCES } from "./unitPreferences";
import type { AppState, UnitPreferences } from "./types";

export function UnitOnboardingScreen({
  setState,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [prefs, setPrefs] = useState<UnitPreferences>({ ...DEFAULT_UNIT_PREFERENCES });

  function finish() {
    setState((s) => ({
      ...s,
      unitPreferences: prefs,
      unitPreferencesChosen: true,
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
        Choose your units
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
        We&apos;ll show weight and height in the units you prefer. You can change this anytime in Settings.
      </p>
      <div className="card" style={{ padding: 20 }}>
        <UnitPreferencePicker value={prefs} onChange={setPrefs} />
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
