import { useEffect, useRef, type ReactNode } from "react";

const LOCK_CLASS = "onboarding-viewport-lock";

/** Pin onboarding to the visible viewport so iOS keyboard resize does not shift the whole page. */
export function OnboardingViewportFrame({ active, children }: { active: boolean; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    document.documentElement.classList.add(LOCK_CLASS);
    return () => document.documentElement.classList.remove(LOCK_CLASS);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const frame = frameRef.current;
    if (!frame) return;

    const vv = window.visualViewport;

    const syncFrame = () => {
      const top = vv?.offsetTop ?? 0;
      const left = vv?.offsetLeft ?? 0;
      const width = vv?.width ?? window.innerWidth;
      const height = vv?.height ?? window.innerHeight;
      frame.style.transform = top > 0 ? `translateY(${top}px)` : "";
      frame.style.left = `${left}px`;
      frame.style.width = `${width}px`;
      frame.style.height = `${height}px`;
    };

    const preventWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    syncFrame();
    vv?.addEventListener("resize", syncFrame);
    vv?.addEventListener("scroll", syncFrame);
    window.addEventListener("scroll", preventWindowScroll, { passive: true });
    window.addEventListener("orientationchange", syncFrame);

    return () => {
      vv?.removeEventListener("resize", syncFrame);
      vv?.removeEventListener("scroll", syncFrame);
      window.removeEventListener("scroll", preventWindowScroll);
      window.removeEventListener("orientationchange", syncFrame);
      frame.style.transform = "";
      frame.style.left = "";
      frame.style.width = "";
      frame.style.height = "";
    };
  }, [active]);

  return (
    <div className="onboarding-flow" ref={frameRef}>
      {children}
    </div>
  );
}
