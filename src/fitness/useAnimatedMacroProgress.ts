import { useEffect, useRef, useState } from "react";

export const RING_DURATION_MS = 500;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function macroRingTarget(value: number, target: number): number {
  return target > 0 ? Math.min(1, Math.max(0, value / target)) : 0;
}

/** Animates macro ring arc from prior fill over ~500ms ease-out; center value stays in sync instantly. */
export function useAnimatedMacroProgress(value: number, target: number, enabled = true) {
  const ringTarget = macroRingTarget(value, target);
  const motionOk = enabled && !prefersReducedMotion();

  const frameRef = useRef(ringTarget);
  const [ringPct, setRingPct] = useState(ringTarget);

  useEffect(() => {
    if (!motionOk) {
      setRingPct(ringTarget);
      frameRef.current = ringTarget;
      return;
    }

    const fromRing = frameRef.current;
    if (fromRing === ringTarget) return;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / RING_DURATION_MS);
      const e = easeOutCubic(t);
      const nextRing = fromRing + (ringTarget - fromRing) * e;
      frameRef.current = nextRing;
      setRingPct(nextRing);
      if (t < 1) raf = requestAnimationFrame(tick);
      else frameRef.current = ringTarget;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, target, ringTarget, motionOk]);

  return { ringPct };
}
