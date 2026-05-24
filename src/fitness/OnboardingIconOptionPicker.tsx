import type { ReactNode } from "react";

type Option<T extends string> = {
  id: T;
  label: string;
  icon: ReactNode;
};

export function OnboardingIconOptionPicker<T extends string>({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: Option<T>[];
  selected: T | T[] | undefined;
  onToggle: (id: T) => void;
  multi?: boolean;
}) {
  function isSelected(id: T): boolean {
    if (multi) {
      return Array.isArray(selected) && selected.includes(id);
    }
    return selected === id;
  }

  return (
    <div className="referral-source-list">
      {options.map(({ id, label, icon }) => {
        const on = isSelected(id);
        return (
          <button
            key={id}
            type="button"
            className={`tap referral-source-option${on ? " referral-source-option--selected" : ""}`}
            onClick={() => onToggle(id)}
            aria-pressed={on}
          >
            <span className="referral-source-option__icon">{icon}</span>
            <span className="referral-source-option__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
