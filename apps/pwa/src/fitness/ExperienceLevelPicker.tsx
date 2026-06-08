import {
  EXPERIENCE_LEVEL_DESCRIPTIONS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "./experienceLevel";
import type { ExperienceLevel } from "./types";

export function ExperienceLevelPicker({
  value,
  onChange,
}: {
  value?: ExperienceLevel;
  onChange: (next: ExperienceLevel) => void;
}) {
  return (
    <div className="onboarding-pill-stack">
      {EXPERIENCE_LEVEL_OPTIONS.map((level) => {
        const selected = value === level;
        return (
          <button
            key={level}
            type="button"
            className={`tap onboarding-pill${selected ? " onboarding-pill--selected" : ""}`}
            onClick={() => onChange(level)}
            style={{ flexDirection: "column", alignItems: "flex-start", gap: 4, minHeight: 64 }}
          >
            <span>{EXPERIENCE_LEVEL_LABELS[level]}</span>
            <span className="onboarding-pill__subtext">{EXPERIENCE_LEVEL_DESCRIPTIONS[level]}</span>
          </button>
        );
      })}
    </div>
  );
}
