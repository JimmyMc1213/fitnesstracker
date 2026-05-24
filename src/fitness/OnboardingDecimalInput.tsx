import { useEffect, useState } from "react";

function formatDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

export function OnboardingDecimalInput({
  value,
  onChange,
  ariaLabel,
  resetKey,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  resetKey?: string | number;
}) {
  const [text, setText] = useState(() =>
    value != null && Number.isFinite(value) ? formatDecimal(value) : "",
  );

  useEffect(() => {
    setText(value != null && Number.isFinite(value) ? formatDecimal(value) : "");
    // Only reset displayed text when the unit (or other external key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      className="onboarding-input-pill"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
        setText(raw);
        if (raw === "" || raw === ".") {
          onChange(null);
          return;
        }
        const n = parseFloat(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}
