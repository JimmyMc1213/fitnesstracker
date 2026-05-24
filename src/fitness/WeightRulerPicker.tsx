import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { formatWeightFromLbs, parseWeightToLbs, weightUnitLabel } from "./unitPreferences";
import type { WeightUnit } from "./types";

const TICK_WIDTH_PX = 10;

function displayStep(unit: WeightUnit): number {
  return unit === "kg" ? 0.1 : 0.5;
}

function stepLbs(unit: WeightUnit): number {
  return parseWeightToLbs(displayStep(unit), unit);
}

function clampLbs(value: number, minLbs: number, maxLbs: number): number {
  return Math.min(maxLbs, Math.max(minLbs, value));
}

function indexForLbs(valueLbs: number, minLbs: number, unit: WeightUnit): number {
  const step = stepLbs(unit);
  return Math.round((valueLbs - minLbs) / step);
}

function lbsForIndex(index: number, minLbs: number, unit: WeightUnit): number {
  return minLbs + index * stepLbs(unit);
}

function tickHeight(index: number, majorEvery: number): number {
  if (index % majorEvery === 0) return 36;
  if (index % (majorEvery / 2) === 0) return 24;
  return 14;
}

export function WeightRulerPicker({
  valueLbs,
  onChange,
  minLbs,
  maxLbs,
  unit,
  directionLabel,
}: {
  valueLbs: number;
  onChange: (lbs: number) => void;
  minLbs: number;
  maxLbs: number;
  unit: WeightUnit;
  directionLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const syncingRef = useRef(false);

  const majorEvery = unit === "kg" ? 10 : 2;
  const tickCount = useMemo(() => {
    const count = Math.round((maxLbs - minLbs) / stepLbs(unit)) + 1;
    return Math.max(2, count);
  }, [maxLbs, minLbs, unit]);

  const trackWidth = tickCount * TICK_WIDTH_PX;
  const sidePad = Math.max(0, viewportWidth / 2);

  const displayValue = formatWeightFromLbs(valueLbs, unit, 1);
  const unitLabel = weightUnitLabel(unit);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "auto") => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.min(tickCount - 1, Math.max(0, index));
      const target = sidePad + clamped * TICK_WIDTH_PX - el.clientWidth / 2;
      syncingRef.current = true;
      el.scrollTo({ left: target, behavior });
      window.requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    },
    [sidePad, tickCount],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewportWidth(el.clientWidth));
    ro.observe(el);
    setViewportWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || viewportWidth <= 0) return;
    const idx = indexForLbs(valueLbs, minLbs, unit);
    const currentIdx = Math.round((el.scrollLeft + el.clientWidth / 2 - sidePad) / TICK_WIDTH_PX);
    if (currentIdx !== idx) scrollToIndex(idx);
  }, [valueLbs, minLbs, maxLbs, unit, viewportWidth, sidePad, scrollToIndex]);

  function updateFromScroll() {
    const el = scrollRef.current;
    if (!el || syncingRef.current) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const rawIndex = Math.round((center - sidePad) / TICK_WIDTH_PX);
    const nextLbs = clampLbs(lbsForIndex(rawIndex, minLbs, unit), minLbs, maxLbs);
    if (Math.abs(nextLbs - valueLbs) > 0.01) onChange(nextLbs);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    const drag = dragRef.current;
    if (!el || !drag) return;
    el.scrollLeft = drag.startScrollLeft - (e.clientX - drag.startX);
    updateFromScroll();
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = null;
    el.releasePointerCapture(e.pointerId);
    const center = el.scrollLeft + el.clientWidth / 2;
    const index = Math.round((center - sidePad) / TICK_WIDTH_PX);
    scrollToIndex(index, "smooth");
    updateFromScroll();
  }

  return (
    <div className="weight-ruler-picker">
      <p className="weight-ruler-picker__direction">{directionLabel}</p>
      <p className="weight-ruler-picker__value" aria-live="polite">
        {displayValue} {unitLabel}
      </p>

      <div className="weight-ruler-picker__stage">
        <div className="weight-ruler-picker__indicator" aria-hidden />
        <div
          ref={scrollRef}
          className="weight-ruler-picker__scroll"
          onScroll={updateFromScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="slider"
          aria-valuemin={minLbs}
          aria-valuemax={maxLbs}
          aria-valuenow={valueLbs}
          aria-label="Goal weight"
          tabIndex={0}
          onKeyDown={(e) => {
            const idx = indexForLbs(valueLbs, minLbs, unit);
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              const next = clampLbs(lbsForIndex(idx + 1, minLbs, unit), minLbs, maxLbs);
              onChange(next);
              scrollToIndex(idx + 1, "smooth");
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              const next = clampLbs(lbsForIndex(idx - 1, minLbs, unit), minLbs, maxLbs);
              onChange(next);
              scrollToIndex(idx - 1, "smooth");
            }
          }}
        >
          <div className="weight-ruler-picker__track" style={{ width: trackWidth + sidePad * 2, paddingLeft: sidePad, paddingRight: sidePad }}>
            {Array.from({ length: tickCount }, (_, i) => (
              <div key={i} className="weight-ruler-picker__tick-wrap" style={{ width: TICK_WIDTH_PX }}>
                <div className="weight-ruler-picker__tick" style={{ height: tickHeight(i, majorEvery) }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function goalWeightRangeLbs(goal: "cut" | "bulk", currentLbs: number): { minLbs: number; maxLbs: number } {
  if (goal === "cut") {
    return { minLbs: currentLbs - 80, maxLbs: currentLbs - 5 };
  }
  return { minLbs: currentLbs + 3, maxLbs: currentLbs + 50 };
}

export function defaultGoalWeightLbs(goal: "cut" | "bulk", currentLbs: number): number {
  if (goal === "cut") return Math.max(currentLbs - 80, Math.min(currentLbs - 5, currentLbs - 15));
  return Math.min(currentLbs + 50, Math.max(currentLbs + 3, currentLbs + 15));
}
