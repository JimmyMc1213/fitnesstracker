import { useEffect, useRef, useState } from "react";

import type { MacroTotals } from "./types";

type MacroKey = "cal" | "p" | "c" | "f";

const MACRO_ROWS: {
  key: MacroKey;
  label: string;
  unit: string;
  tag: string;
  tagTone: "protein" | "carbs" | "fat";
  priority?: boolean;
}[] = [
  { key: "p", label: "Protein", unit: "g", tag: "#1 priority", tagTone: "protein", priority: true },
  { key: "c", label: "Carbs", unit: "g", tag: "Your fuel", tagTone: "carbs" },
  { key: "f", label: "Fats", unit: "g", tag: "Hormone balance", tagTone: "fat" },
];

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MacroValueField({
  label,
  value,
  unit,
  onChange,
  large = false,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (next: number) => void;
  large?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commitDraft() {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 0) onChange(n);
    else setDraft(String(value));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={large ? "onboarding-fuel-hero__edit" : "onboarding-fuel-row__edit"}>
        <input
          ref={inputRef}
          type="number"
          className={large ? "onboarding-fuel-hero__input" : "onboarding-fuel-row__input"}
          aria-label={label}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitDraft();
            if (e.key === "Escape") {
              setDraft(String(value));
              setEditing(false);
            }
          }}
        />
      </div>
    );
  }

  const editClass = large ? "onboarding-fuel-hero__edit" : "onboarding-fuel-row__edit";
  const valueClass = large ? "onboarding-fuel-hero__value tap" : "onboarding-fuel-row__value tap";
  const unitClass = large ? "onboarding-fuel-hero__unit" : "onboarding-fuel-row__unit";
  const pencilClass = large ? "onboarding-fuel-hero__pencil tap" : "onboarding-fuel-row__pencil tap";

  return (
    <div className={editClass}>
      <button type="button" className={valueClass} aria-label={`Edit ${label}`} onClick={() => setEditing(true)}>
        {value}
        {unit ? <span className={unitClass}>{unit}</span> : null}
      </button>
      <button type="button" className={pencilClass} aria-label={`Edit ${label}`} onClick={() => setEditing(true)}>
        <PencilIcon />
      </button>
    </div>
  );
}

type Props = {
  macros: MacroTotals;
  computedMacros: MacroTotals;
  onChangeMacros: (next: MacroTotals) => void;
  onReset: () => void;
};

export function OnboardingDailyFuelPlan({ macros, computedMacros, onChangeMacros, onReset }: Props) {
  const macrosEdited =
    macros.cal !== computedMacros.cal ||
    macros.p !== computedMacros.p ||
    macros.c !== computedMacros.c ||
    macros.f !== computedMacros.f;

  return (
    <div className="onboarding-fuel">
      <div className="onboarding-gradient-card onboarding-fuel-hero">
        <p className="onboarding-fuel-hero__label">Daily calories</p>
        <MacroValueField
          label="Calories"
          value={macros.cal}
          unit="kcal"
          large
          onChange={(cal) => onChangeMacros({ ...macros, cal })}
        />
      </div>

      <div className="onboarding-gradient-card onboarding-fuel-macros">
        <p className="onboarding-fuel-macros__heading">Macro split</p>
        {MACRO_ROWS.map((row, index) => (
          <div
            key={row.key}
            className={`onboarding-fuel-row${row.priority ? " onboarding-fuel-row--priority" : ""}${index < MACRO_ROWS.length - 1 ? " onboarding-fuel-row--border" : ""}`}
          >
            <div className="onboarding-fuel-row__meta">
              <span className="onboarding-fuel-row__label">{row.label}</span>
              <span className={`onboarding-fuel-row__tag onboarding-fuel-row__tag--${row.tagTone}`}>{row.tag}</span>
            </div>
            <MacroValueField
              label={row.label}
              value={macros[row.key]}
              unit={row.unit}
              onChange={(next) => onChangeMacros({ ...macros, [row.key]: next })}
            />
          </div>
        ))}
      </div>

      {macrosEdited ? (
        <button type="button" className="onboarding-fuel__reset tap" onClick={onReset}>
          Reset to calculated values
        </button>
      ) : null}
    </div>
  );
}
