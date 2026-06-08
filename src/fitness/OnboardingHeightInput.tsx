import { useEffect, useRef, useState } from "react";

import { cmFromInches, inchesFromCm } from "./unitPreferences";
import type { HeightDisplayUnit } from "./types";

function textsFromHeightIn(heightIn: number): { feet: string; inches: string; cm: string } {
  if (heightIn <= 0) return { feet: "", inches: "", cm: "" };
  return {
    feet: String(Math.floor(heightIn / 12)),
    inches: String(Math.round(heightIn % 12)),
    cm: String(Math.round(cmFromInches(heightIn))),
  };
}

export function OnboardingHeightInput({
  unit,
  heightIn,
  onHeightChange,
  resetKey,
}: {
  unit: HeightDisplayUnit;
  heightIn: number;
  onHeightChange: (heightIn: number) => void;
  resetKey?: string | number;
}) {
  const initial = textsFromHeightIn(heightIn);
  const [feetText, setFeetText] = useState(initial.feet);
  const [inchesText, setInchesText] = useState(initial.inches);
  const [cmText, setCmText] = useState(initial.cm);
  const onHeightChangeRef = useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;

  useEffect(() => {
    const next = textsFromHeightIn(heightIn);
    setFeetText(next.feet);
    setInchesText(next.inches);
    setCmText(next.cm);
    // Only reset displayed text when the unit (or other external key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (unit === "cm") {
      if (cmText === "" || cmText === ".") {
        onHeightChangeRef.current(0);
        return;
      }
      const inches = inchesFromCm(parseFloat(cmText));
      onHeightChangeRef.current(inches ?? 0);
      return;
    }

    if (feetText === "" || inchesText === "") {
      onHeightChangeRef.current(0);
      return;
    }

    const ft = parseInt(feetText, 10);
    const inch = parseInt(inchesText, 10);
    if (!Number.isFinite(ft) || !Number.isFinite(inch)) {
      onHeightChangeRef.current(0);
      return;
    }
    onHeightChangeRef.current(ft * 12 + inch);
  }, [unit, feetText, inchesText, cmText]);

  if (unit === "cm") {
    return (
      <label className="onboarding-field-group">
        <span className="onboarding-field-label">Height (cm)</span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Height in centimeters"
          className="onboarding-input-pill"
          value={cmText}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
            setCmText(raw);
          }}
        />
      </label>
    );
  }

  return (
    <div className="onboarding-pill-row">
      <label className="onboarding-field-group">
        <span className="onboarding-field-label">Ft</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Height feet"
          className="onboarding-input-pill"
          value={feetText}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setFeetText(raw);
          }}
        />
      </label>
      <label className="onboarding-field-group">
        <span className="onboarding-field-label">In</span>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Height inches"
          className="onboarding-input-pill"
          value={inchesText}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value;
            if (raw !== "" && !/^\d+$/.test(raw)) return;
            setInchesText(raw);
          }}
        />
      </label>
    </div>
  );
}
