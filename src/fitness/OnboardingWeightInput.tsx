import { useEffect, useState } from "react";

import { LBS_PER_KG, parseWeightToLbs } from "./unitPreferences";
import type { WeightUnit } from "./types";

function formatDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

function textFromWeightLbs(weightLbs: number, unit: WeightUnit): string {
  if (weightLbs <= 0) return "";
  const display = unit === "kg" ? weightLbs / LBS_PER_KG : weightLbs;
  return formatDecimal(display);
}

export function OnboardingWeightInput({
  unit,
  weightLbs,
  onWeightChange,
  onFieldCompleteChange,
  resetKey,
}: {
  unit: WeightUnit;
  weightLbs: number;
  onWeightChange: (weightLbs: number) => void;
  onFieldCompleteChange: (complete: boolean) => void;
  resetKey?: string | number;
}) {
  const [text, setText] = useState(() => textFromWeightLbs(weightLbs, unit));

  useEffect(() => {
    setText(textFromWeightLbs(weightLbs, unit));
    // Only reset displayed text when the unit (or other external key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const complete = text !== "" && text !== ".";
    onFieldCompleteChange(complete);
    if (!complete) {
      onWeightChange(0);
      return;
    }
    const n = parseFloat(text);
    if (!Number.isFinite(n)) {
      onWeightChange(0);
      return;
    }
    onWeightChange(parseWeightToLbs(n, unit));
  }, [text, unit, onWeightChange, onFieldCompleteChange]);

  return (
    <label className="onboarding-field-group">
      <span className="onboarding-field-label">Weight ({unit})</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label="Body weight"
        className="onboarding-input-pill"
        value={text}
        placeholder="0"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
          setText(raw);
        }}
      />
    </label>
  );
}
