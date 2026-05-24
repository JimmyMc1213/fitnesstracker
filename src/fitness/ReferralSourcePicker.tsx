import type { ReferralSource } from "./referralSource";
import { REFERRAL_SOURCES, referralSourceLabel } from "./referralSource";

function ReferralIcon({ source }: { source: ReferralSource }) {
  switch (source) {
    case "app_store":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#007AFF" />
          <path
            d="M12 6.5c-.8 0-1.4.6-1.4 1.4v.2c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4v-.2c0-.8-.6-1.4-1.4-1.4zm-2.8 3.2v7.6c0 .6.5 1.1 1.1 1.1h3.4c.6 0 1.1-.5 1.1-1.1v-7.6H9.2z"
            fill="#fff"
          />
        </svg>
      );
    case "tiktok":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#000" />
          <path
            d="M15.5 8.2a3.4 3.4 0 0 0 2.2-.8v2.6a5.8 5.8 0 0 1-2.2-.5v4.8a4.2 4.2 0 1 1-4.2-4.2c.2 0 .5 0 .7.1v2.4a1.8 1.8 0 1 0 1.3 1.7V8.2h1.2z"
            fill="#25F4EE"
          />
          <path
            d="M16.7 7.4a3.4 3.4 0 0 0 1-2.4h-1.8v8.3a1.8 1.8 0 1 1-1.8-1.8c.3 0 .6.1.8.2V11a4.2 4.2 0 1 0 4.2 4.2V9.1a5.8 5.8 0 0 0 2.2.5V7.4h-1.6z"
            fill="#FE2C55"
          />
        </svg>
      );
    case "youtube":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#FF0000" />
          <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff" />
        </svg>
      );
    case "tv":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect width="24" height="24" rx="5" fill="rgba(255,255,255,0.12)" />
          <rect x="5" y="8" width="14" height="9" rx="1.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
          <path d="M9 8l3-3 3 3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "x":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#000" />
          <path d="M7 7l10 10M17 7L7 17" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "instagram":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FD5949" />
              <stop offset="50%" stopColor="#D6249F" />
              <stop offset="100%" stopColor="#285AEB" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="5" fill="url(#ig)" />
          <rect x="7.5" y="7.5" width="9" height="9" rx="2.5" stroke="#fff" strokeWidth="1.5" fill="none" />
          <circle cx="17" cy="7" r="1.2" fill="#fff" />
        </svg>
      );
    case "google":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#fff" />
          <path
            d="M12 11.2v2.4h3.3c-.1.8-.6 1.5-1.3 2l2 1.5c.8-.7 1.2-1.8 1.2-3 0-2.8-2.3-5.1-5.2-5.1-3 0-5.2 2.3-5.2 5.1s2.3 5.1 5.2 5.1c2.2 0 4.1-1.4 4.8-3.4H12z"
            fill="#4285F4"
          />
        </svg>
      );
    case "facebook":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#1877F2" />
          <path
            d="M14.5 8.5h-1.8c-.8 0-1.2.4-1.2 1.2v1.3H14l-.3 2.2h-1.8V18h-2.3v-4.8H8.5v-2.2h1.4V9.8c0-1.8 1-2.8 2.8-2.8h2.8v1.5z"
            fill="#fff"
          />
        </svg>
      );
    case "friend":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect width="24" height="24" rx="5" fill="rgba(255,255,255,0.12)" />
          <circle cx="9" cy="10" r="2.2" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
          <path
            d="M5.5 16.5c.6-1.8 1.9-2.8 3.5-2.8s2.9 1 3.5 2.8"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="10.5" r="1.8" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
          <path d="M13.5 16.5c.4-1.2 1.3-2 2.5-2s2.1.8 2.5 2" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "reddit":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <rect width="24" height="24" rx="5" fill="#FF4500" />
          <circle cx="12" cy="13" r="4.5" fill="#fff" />
          <circle cx="10.5" cy="12.5" r=".8" fill="#FF4500" />
          <circle cx="13.5" cy="12.5" r=".8" fill="#FF4500" />
        </svg>
      );
    case "podcast":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect width="24" height="24" rx="5" fill="rgba(255,255,255,0.12)" />
          <rect x="9" y="6" width="6" height="9" rx="3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
          <path d="M7 12a5 5 0 0 0 10 0M12 17v2" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "other":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect width="24" height="24" rx="5" fill="rgba(255,255,255,0.12)" />
          <circle cx="8" cy="12" r="1.4" fill="rgba(255,255,255,0.85)" />
          <circle cx="12" cy="12" r="1.4" fill="rgba(255,255,255,0.85)" />
          <circle cx="16" cy="12" r="1.4" fill="rgba(255,255,255,0.85)" />
        </svg>
      );
  }
}

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
            <span className="referral-source-option__icon">
              <ReferralIcon source={source} />
            </span>
            <span className="referral-source-option__label">{referralSourceLabel(source)}</span>
          </button>
        );
      })}
    </div>
  );
}
