import { useEffect, useRef, useState } from "react";

import { LBS_PER_KG, lbsFromWeightInputText } from "./unitPreferences";
import type { WeightUnit } from "./types";

function formatDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

function textFromWeightLbs(weightLbs: number, unit: WeightUnit): string {
  if (weightLbs <= 0) return "";
  const display = unit === "kg" ? weightLbs / LBS_PER_KG : weightLbs;
  return formatDecimal(display);
}

function acceptsOnboardingWeightText(raw: string): boolean {
  if (raw === "") return true;
  if (!/^\d*\.?\d*$/.test(raw)) return false;
  return raw.replace(/\D/g, "").length <= 3;
}

export function OnboardingWeightInput({
  unit,
  weightLbs,
  onWeightChange,
  resetKey,
}: {
  unit: WeightUnit;
  weightLbs: number;
  onWeightChange: (weightLbs: number) => void;
  resetKey?: string | number;
}) {
  const [text, setText] = useState(() => textFromWeightLbs(weightLbs, unit));
  const onWeightChangeRef = useRef(onWeightChange);
  onWeightChangeRef.current = onWeightChange;

  useEffect(() => {
    setText(textFromWeightLbs(weightLbs, unit));
    // Only reset displayed text when the unit (or other external key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function commitText(raw: string) {
    setText(raw);
    onWeightChangeRef.current(lbsFromWeightInputText(raw, unit));
  }

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
          if (!acceptsOnboardingWeightText(raw)) return;
          commitText(raw);
        }}
      />
    </label>
  );
}
