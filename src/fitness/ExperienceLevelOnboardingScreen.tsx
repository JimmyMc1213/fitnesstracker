import { useState } from "react";

import { DEFAULT_EXPERIENCE_LEVEL } from "./experienceLevel";
import { ExperienceLevelPicker } from "./ExperienceLevelPicker";
import { workoutTemplatesForExperience } from "./workoutTemplatesForExperience";
import type { AppState, ExperienceLevel } from "./types";

export function ExperienceLevelOnboardingScreen({
  setState,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
  const [level, setLevel] = useState<ExperienceLevel>(DEFAULT_EXPERIENCE_LEVEL);

  function finish() {
    setState((s) => ({
      ...s,
      experienceLevel: level,
      experienceLevelChosen: true,
      workoutTemplates: workoutTemplatesForExperience(level),
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
        Your experience level
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
        We&apos;ll tailor rep ranges and starting weights in your workout templates.
      </p>
      <div className="card" style={{ padding: 20 }}>
        <ExperienceLevelPicker value={level} onChange={setLevel} />
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
