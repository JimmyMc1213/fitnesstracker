type GymmySplashMarkProps = {
  /** Skip enter animation when handing off from the HTML boot splash. */
  instant?: boolean;
  className?: string;
};

function LogoPlaceholder() {
  return (
    <div className="gymmy-splash-mark__logo" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
        <rect x="6.5" y="9.5" width="2.5" height="5" rx="1.25" fill="currentColor" />
        <rect x="9" y="11" width="6" height="2" rx="1" fill="currentColor" />
        <rect x="15" y="9.5" width="2.5" height="5" rx="1.25" fill="currentColor" />
        <rect x="18" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function GymmySplashMark({ instant = false, className }: GymmySplashMarkProps) {
  return (
    <div
      className={[
        "gymmy-splash-mark",
        instant ? "gymmy-splash-mark--instant" : "motion-splash-mark",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <LogoPlaceholder />
      <span className="gymmy-splash-mark__wordmark">Gymmy</span>
    </div>
  );
}
