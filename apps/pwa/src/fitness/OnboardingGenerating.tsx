import { useEffect, useState } from "react";

const ROTATING_LINES = [
  "Calculating your targets…",
  "Building your split…",
  "Setting up your coach…",
  "Almost ready…",
];

export function OnboardingGenerating({ onComplete }: { onComplete?: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!onComplete) return;
    const id = window.setTimeout(onComplete, 3500);
    return () => window.clearTimeout(id);
  }, [onComplete]);

  return (
    <div
      className="onboarding-shell"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
        paddingLeft: 23,
        paddingRight: 23,
      }}
    >
      <div className="onboarding-generating">
        <div className="onboarding-generating-spinner" aria-hidden />
        <p className="onboarding-generating-line">Building your coaching plan…</p>
        <p key={lineIndex} className="onboarding-generating-sub">
          {ROTATING_LINES[lineIndex]}
        </p>
      </div>
    </div>
  );
}
