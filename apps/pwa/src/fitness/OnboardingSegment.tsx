import type { ReactNode } from "react";

export function OnboardingSegment({
  selected,
  onClick,
  children,
  layout = "stack",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  layout?: "stack" | "inline";
}) {
  return (
    <button
      type="button"
      className={`tap onboarding-pill${selected ? " onboarding-pill--selected" : ""}${layout === "inline" ? " onboarding-pill--inline" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function OnboardingPillStack({ children }: { children: ReactNode }) {
  return <div className="onboarding-pill-stack">{children}</div>;
}

export function OnboardingPillRow({ children }: { children: ReactNode }) {
  return <div className="onboarding-pill-row">{children}</div>;
}
