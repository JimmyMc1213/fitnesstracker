import { useEffect, useRef, useState } from "react";

export const RING_DURATION_MS = 500;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Animates macro ring fill and center calories from prior values over ~500ms ease-out. */
export function useAnimatedMacroProgress(value: number, target: number, enabled = true) {
  const ringTarget = target > 0 ? Math.min(1, Math.max(0, value / target)) : 0;
  const motionOk = enabled && !prefersReducedMotion();

  const frameRef = useRef({ ring: motionOk ? 0 : ringTarget, calories: motionOk ? 0 : value });
  const [ringPct, setRingPct] = useState(frameRef.current.ring);
  const [displayCalories, setDisplayCalories] = useState(frameRef.current.calories);

  useEffect(() => {
    if (!motionOk) {
      setRingPct(ringTarget);
      setDisplayCalories(value);
      frameRef.current = { ring: ringTarget, calories: value };
      return;
    }

    const fromRing = frameRef.current.ring;
    const fromCal = frameRef.current.calories;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / RING_DURATION_MS);
      const e = easeOutCubic(t);
      const nextRing = fromRing + (ringTarget - fromRing) * e;
      const nextCal = fromCal + (value - fromCal) * e;
      frameRef.current = { ring: nextRing, calories: nextCal };
      setRingPct(nextRing);
      setDisplayCalories(nextCal);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, target, ringTarget, motionOk]);

  return { ringPct, displayCalories };
}
