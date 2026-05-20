import type { CSSProperties } from "react";

import {
  EXPERIENCE_LEVEL_DESCRIPTIONS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "./experienceLevel";
import type { ExperienceLevel } from "./types";

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

export function ExperienceLevelPicker({
  value,
  onChange,
}: {
  value: ExperienceLevel;
  onChange: (next: ExperienceLevel) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {EXPERIENCE_LEVEL_OPTIONS.map((level) => {
        const selected = value === level;
        return (
          <button
            key={level}
            type="button"
            className="tap"
            style={optionBtn(selected)}
            onClick={() => onChange(level)}
          >
            <span>{EXPERIENCE_LEVEL_LABELS[level]}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>
              {EXPERIENCE_LEVEL_DESCRIPTIONS[level]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
