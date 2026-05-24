import { useEffect, useState, type CSSProperties } from "react";

export function OnboardingIntegerInput({
  value,
  onChange,
  ariaLabel,
  resetKey,
  className = "onboarding-input-pill",
  style,
  readOnly,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  resetKey?: string | number;
  className?: string;
  style?: CSSProperties;
  readOnly?: boolean;
}) {
  const [text, setText] = useState(() =>
    value != null && Number.isFinite(value) ? String(value) : "",
  );

  useEffect(() => {
    setText(value != null && Number.isFinite(value) ? String(value) : "");
    // Only reset displayed text when the unit (or other external key) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      className={className}
      style={style}
      readOnly={readOnly}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw !== "" && !/^\d+$/.test(raw)) return;
        setText(raw);
        if (raw === "") {
          onChange(null);
          return;
        }
        const n = parseInt(raw, 10);
        if (Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        if (text === "") {
          setText(value != null && Number.isFinite(value) ? String(value) : "");
        }
      }}
    />
  );
}
