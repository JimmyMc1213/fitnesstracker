import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_VISIBLE_ROWS = 5;
export const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

const FRICTION = 0.94;
const DRIFT_RATE = 0.1;
const DRIFT_SPEED = 0.06;
const SETTLE_VELOCITY = 0.008;
const SETTLE_DISTANCE = 0.25;
const WHEEL_IDLE_MS = 90;

export type WheelItem = {
  value: number;
  label: string;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function itemOpacity(index: number, selectedIndex: number, dragOffsetPx: number): number {
  const visualIndex = selectedIndex - dragOffsetPx / WHEEL_ITEM_HEIGHT;
  const dist = Math.abs(index - visualIndex);
  return Math.max(0.35, 1 - dist * 0.22);
}

export function WheelPickerColumn({
  items,
  value,
  onChange,
  ariaLabel,
  align = "center",
}: {
  items: WheelItem[];
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  align?: "start" | "center" | "end";
}) {
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === value));
  const [dragOffset, setDragOffset] = useState(0);

  const dragRef = useRef<{ pointerId: number; startY: number; startOffset: number } | null>(null);
  const dragOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const glideVelocityRef = useRef(0);
  const lastMoveRef = useRef({ y: 0, time: 0 });
  const animFrameRef = useRef<number | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const itemsRef = useRef(items);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  selectedIndexRef.current = selectedIndex;
  itemsRef.current = items;
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  const cancelAnimation = useCallback(() => {
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimation();
      if (wheelIdleTimerRef.current != null) window.clearTimeout(wheelIdleTimerRef.current);
    };
  }, [cancelAnimation]);

  const boundsFor = useCallback((index: number, count: number) => {
    if (count === 0) return { min: 0, max: 0 };
    return {
      max: index * WHEEL_ITEM_HEIGHT,
      min: -(count - 1 - index) * WHEEL_ITEM_HEIGHT,
    };
  }, []);

  const clampOffset = useCallback((offset: number, index: number, count: number) => {
    const { min, max } = boundsFor(index, count);
    return Math.min(max, Math.max(min, offset));
  }, [boundsFor]);

  const commitNearest = useCallback((offset: number) => {
    const list = itemsRef.current;
    const index = selectedIndexRef.current;
    if (list.length === 0) return;

    const visualIndex = index - offset / WHEEL_ITEM_HEIGHT;
    const targetIndex = Math.min(list.length - 1, Math.max(0, Math.round(visualIndex)));
    setDragOffset(0);
    dragOffsetRef.current = 0;
    glideVelocityRef.current = 0;
    const next = list[targetIndex]?.value;
    if (next != null && next !== valueRef.current) onChangeRef.current(next);
  }, []);

  const startGlide = useCallback(
    (initialOffset: number, initialVelocity: number) => {
      const list = itemsRef.current;
      if (list.length === 0) return;

      cancelAnimation();
      if (wheelIdleTimerRef.current != null) {
        window.clearTimeout(wheelIdleTimerRef.current);
        wheelIdleTimerRef.current = null;
      }

      if (prefersReducedMotion()) {
        commitNearest(initialOffset);
        return;
      }

      let offset = clampOffset(initialOffset, selectedIndexRef.current, list.length);
      let velocity = initialVelocity;
      let lastTime = performance.now();

      const frame = (now: number) => {
        const dt = Math.min(24, now - lastTime);
        lastTime = now;
        const step = dt / 16.667;
        const currentIndex = selectedIndexRef.current;
        const count = itemsRef.current.length;
        if (count === 0) {
          return;
        }

        const { min, max } = boundsFor(currentIndex, count);
        velocity *= Math.pow(FRICTION, step);

        const visualIndex = currentIndex - offset / WHEEL_ITEM_HEIGHT;
        const targetIndex = Math.min(count - 1, Math.max(0, Math.round(visualIndex)));
        const targetOffset = (currentIndex - targetIndex) * WHEEL_ITEM_HEIGHT;
        const displacement = targetOffset - offset;
        const speed = Math.abs(velocity);

        if (speed < DRIFT_SPEED) {
          offset += displacement * DRIFT_RATE;
          velocity *= 0.88;
        } else {
          offset += velocity * dt;
        }

        if (offset > max) {
          offset = max;
          if (velocity > 0) velocity = 0;
        } else if (offset < min) {
          offset = min;
          if (velocity < 0) velocity = 0;
        }

        dragOffsetRef.current = offset;
        glideVelocityRef.current = velocity;
        setDragOffset(offset);

        if (Math.abs(velocity) < SETTLE_VELOCITY && Math.abs(displacement) < SETTLE_DISTANCE) {
          animFrameRef.current = null;
          commitNearest(offset);
          return;
        }

        animFrameRef.current = requestAnimationFrame(frame);
      };

      animFrameRef.current = requestAnimationFrame(frame);
    },
    [boundsFor, cancelAnimation, clampOffset, commitNearest],
  );

  const scheduleWheelGlide = useCallback(() => {
    if (wheelIdleTimerRef.current != null) window.clearTimeout(wheelIdleTimerRef.current);
    wheelIdleTimerRef.current = window.setTimeout(() => {
      wheelIdleTimerRef.current = null;
      startGlide(dragOffsetRef.current, glideVelocityRef.current);
    }, WHEEL_IDLE_MS);
  }, [startGlide]);

  const baseTranslate = WHEEL_HEIGHT / 2 - WHEEL_ITEM_HEIGHT / 2;
  const translateY = baseTranslate - selectedIndex * WHEEL_ITEM_HEIGHT + dragOffset;
  const visualCenter = selectedIndex - dragOffset / WHEEL_ITEM_HEIGHT;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    cancelAnimation();
    if (wheelIdleTimerRef.current != null) {
      window.clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = null;
    }
    velocityRef.current = 0;
    glideVelocityRef.current = 0;
    lastMoveRef.current = { y: e.clientY, time: performance.now() };
    dragRef.current = { pointerId: e.pointerId, startY: e.clientY, startOffset: dragOffsetRef.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const now = performance.now();
    const dt = now - lastMoveRef.current.time;
    if (dt > 0 && dt < 80) {
      const instant = (e.clientY - lastMoveRef.current.y) / dt;
      velocityRef.current = velocityRef.current * 0.65 + instant * 0.35;
    }
    lastMoveRef.current = { y: e.clientY, time: now };

    const nextOffset = clampOffset(
      drag.startOffset + (e.clientY - drag.startY),
      selectedIndexRef.current,
      itemsRef.current.length,
    );
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function finishPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;

    const rawOffset = drag.startOffset + (e.clientY - drag.startY);
    const clamped = clampOffset(rawOffset, selectedIndexRef.current, itemsRef.current.length);
    startGlide(clamped, velocityRef.current * 0.85);
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    e.preventDefault();
    e.stopPropagation();

    cancelAnimation();
    dragRef.current = null;

    const scaledDelta =
      Math.abs(e.deltaY) < 48 ? e.deltaY * 0.85 : Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.4, 48);
    const nextOffset = clampOffset(
      dragOffsetRef.current + scaledDelta,
      selectedIndexRef.current,
      itemsRef.current.length,
    );
    dragOffsetRef.current = nextOffset;
    glideVelocityRef.current = glideVelocityRef.current * 0.5 + scaledDelta * 0.04;
    setDragOffset(nextOffset);
    scheduleWheelGlide();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      cancelAnimation();
      setDragOffset(0);
      const next = items[Math.max(0, selectedIndex - 1)]?.value;
      if (next != null) onChange(next);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cancelAnimation();
      setDragOffset(0);
      const next = items[Math.min(items.length - 1, selectedIndex + 1)]?.value;
      if (next != null) onChange(next);
    }
  }

  const selectedLabel = items[selectedIndex]?.label ?? "";

  return (
    <div
      className={`dob-wheel-column dob-wheel-column--${align}`}
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
    >
      <ul
        className="dob-wheel-column__list"
        style={{
          transform: `translate3d(0, ${translateY}px, 0)`,
        }}
      >
        {items.map((item, index) => (
          <li
            key={item.value}
            className="dob-wheel-column__item"
            aria-hidden={item.value !== value}
            style={{
              height: WHEEL_ITEM_HEIGHT,
              opacity: itemOpacity(index, selectedIndex, dragOffset),
              fontWeight: Math.abs(index - visualCenter) < 0.5 ? 600 : 400,
            }}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <span className="sr-only" aria-live="polite">
        {selectedLabel}
      </span>
    </div>
  );
}
