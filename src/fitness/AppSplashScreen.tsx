import { useEffect, useRef, useState } from "react";

import { GymmySplashMark } from "./GymmySplashMark";

const SPLASH_FADE_OUT_MS = 600;

type AppSplashScreenProps = {
  /** When true, plays the exit fade-out before unmounting. */
  dismiss?: boolean;
  onExitComplete?: () => void;
};

export function AppSplashScreen({ dismiss = false, onExitComplete }: AppSplashScreenProps) {
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!dismiss || exiting) return;
    const frame = window.requestAnimationFrame(() => {
      const el = divRef.current;
      if (!el) return;
      // Stop the fill-mode animation so it no longer controls opacity.
      el.style.animation = "none";
      // Force a reflow — browser now resolves opacity: 1 from the base class.
      void el.offsetHeight;
      // Apply the fade transition then set the target opacity.
      el.style.transition = `opacity ${SPLASH_FADE_OUT_MS}ms ease-out`;
      el.style.opacity = "0";
      setExiting(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [dismiss, exiting]);

  useEffect(() => {
    if (!exiting) return;

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setMounted(false);
      onExitCompleteRef.current?.();
    };

    const id = window.setTimeout(finish, SPLASH_FADE_OUT_MS);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "opacity" || !exiting || finishedRef.current) return;
    finishedRef.current = true;
    setMounted(false);
    onExitCompleteRef.current?.();
  };

  if (!mounted) return null;

  return (
    <div
      ref={divRef}
      className={`app-splash-screen${exiting ? " app-splash-screen--out" : ""}`}
      role="status"
      aria-label="Loading Gymmy"
      aria-hidden={exiting}
      onTransitionEnd={handleTransitionEnd}
    >
      <GymmySplashMark />
    </div>
  );
}
