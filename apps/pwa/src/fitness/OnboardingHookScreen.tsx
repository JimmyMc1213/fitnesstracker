import type { ReactNode } from "react";

type HookLine = {
  text: ReactNode;
  variant?: "headline" | "body";
  className?: string;
};

export function OnboardingHookScreen({
  lines,
  onContinue,
  ctaLabel = "Tap to continue",
}: {
  lines: HookLine[];
  onContinue: () => void;
  ctaLabel?: string;
}) {
  return (
    <button
      type="button"
      className="onboarding-hook-screen tap"
      onClick={onContinue}
      aria-label="Continue onboarding"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: lines[0]?.variant === "body" ? 28 : 40 }}>
        {lines.map((line, i) => (
          <span
            key={i}
            className={`onboarding-hook-line${line.variant === "body" ? " onboarding-hook-line--body" : ""}${line.className ? ` ${line.className}` : ""}`}
            style={i > 0 && line.variant !== "body" ? { marginTop: 0 } : undefined}
          >
            {line.text}
          </span>
        ))}
      </div>
      <div className="onboarding-hook-cta">
        <span>{ctaLabel}</span>
        <span aria-hidden>→</span>
      </div>
    </button>
  );
}
