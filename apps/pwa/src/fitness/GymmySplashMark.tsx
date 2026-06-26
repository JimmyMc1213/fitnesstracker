import newYouLogoSrc from "../assets/newyou-logo.png";

type GymmySplashMarkProps = {
  /** Skip enter animation when handing off from the HTML boot splash. */
  instant?: boolean;
  className?: string;
};

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
      <img className="gymmy-splash-mark__logo" src={newYouLogoSrc} alt="" aria-hidden />
      <span className="gymmy-splash-mark__wordmark">NewYou</span>
    </div>
  );
}
