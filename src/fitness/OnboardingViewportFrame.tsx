import { useEffect, type ReactNode } from "react";

const LOCK_CLASS = "onboarding-viewport-lock";

/** Full-screen onboarding frame; root shell is fixed so iOS keyboard does not shift the page. */
export function OnboardingViewportFrame({ active, children }: { active: boolean; children: ReactNode }) {
  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add(LOCK_CLASS);
    return () => document.documentElement.classList.remove(LOCK_CLASS);
  }, [active]);

  return <div className="onboarding-flow">{children}</div>;
}
