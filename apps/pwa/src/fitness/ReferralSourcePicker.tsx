import type { ReferralSource } from "./referralSource";
import { REFERRAL_SOURCES, referralSourceLabel } from "./referralSource";
import { referralSourceIcon } from "./referralSourceIcons";

export function ReferralSourcePicker({
  value,
  onChange,
}: {
  value?: ReferralSource;
  onChange: (source: ReferralSource) => void;
}) {
  return (
    <div className="referral-source-list">
      {REFERRAL_SOURCES.map((source) => {
        const selected = value === source;
        return (
          <button
            key={source}
            type="button"
            className={`tap referral-source-option${selected ? " referral-source-option--selected" : ""}`}
            onClick={() => onChange(source)}
            aria-pressed={selected}
          >
            <span className="referral-source-option__icon">{referralSourceIcon(source)}</span>
            <span className="referral-source-option__label">{referralSourceLabel(source)}</span>
          </button>
        );
      })}
    </div>
  );
}
