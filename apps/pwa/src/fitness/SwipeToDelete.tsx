import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

const REVEAL_WIDTH = 72;
const SWIPE_START_PX = 10;
const DELETE_THRESHOLD = REVEAL_WIDTH * 0.85;
const SNAP_OPEN_THRESHOLD = REVEAL_WIDTH * 0.35;
const RELEASE_DELETE_THRESHOLD = 56;

type SwipeToDeleteProps = {
  deleteLabel: string;
  onDelete: () => void;
  children: ReactNode;
  disabled?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  /** When set, a short tap (no swipe) triggers this instead of doing nothing. */
  onTap?: () => void;
  /** Allow horizontal swipe to start on buttons/fields inside the row. */
  allowInteractiveStart?: boolean;
  /** Slide the row off-screen before calling onDelete (e.g. workout set rows). */
  animateCommitDelete?: boolean;
  /**
   * Swipe freely with no distance cap; delete on release if past threshold.
   * No snap-open stop — row springs back or commits delete.
   */
  releaseToDelete?: boolean;
  borderRadius?: number;
  /** When this value changes, swipe offset resets (e.g. after list re-index). */
  resetKey?: string | number;
};

export function SwipeToDelete({
  deleteLabel,
  onDelete,
  children,
  disabled = false,
  isOpen = false,
  onOpen,
  onClose,
  onTap,
  allowInteractiveStart = false,
  animateCommitDelete = false,
  releaseToDelete = true,
  borderRadius = 14,
  resetKey,
}: SwipeToDeleteProps) {
  const [revealed, setRevealed] = useState(false);
  const [pressing, setPressing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const swipingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  function clampOffset(value: number): number {
    if (releaseToDelete) return Math.min(0, value);
    return Math.min(0, Math.max(-REVEAL_WIDTH, value));
  }

  function applyOffset(value: number, animate: boolean) {
    const next = clampOffset(value);
    offsetRef.current = next;
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    el.style.transform = `translate3d(${next}px, 0, 0)`;
    setRevealed(next < -4);
  }

  useEffect(() => {
    if (releaseToDelete) return;
    applyOffset(isOpen ? -REVEAL_WIDTH : 0, true);
  }, [isOpen, releaseToDelete]);

  useEffect(() => {
    if (resetKey == null) return;
    offsetRef.current = 0;
    applyOffset(0, false);
    setRevealed(false);
  }, [resetKey]);

  function commitDelete() {
    const shouldAnimate = animateCommitDelete || releaseToDelete;
    if (shouldAnimate) {
      const width = contentRef.current?.offsetWidth ?? REVEAL_WIDTH * 2;
      applyOffset(-width, true);
      onClose?.();
      onDelete();
      return;
    }
    onClose?.();
    onDelete();
  }

  function settleOffset(current: number) {
    if (releaseToDelete) {
      if (current <= -RELEASE_DELETE_THRESHOLD) {
        commitDelete();
        return;
      }
      applyOffset(0, true);
      onClose?.();
      return;
    }

    if (current <= -DELETE_THRESHOLD) {
      commitDelete();
      return;
    }
    if (current <= -SNAP_OPEN_THRESHOLD) {
      applyOffset(-REVEAL_WIDTH, true);
      onOpen?.();
      return;
    }
    applyOffset(0, true);
    onClose?.();
  }

  function shouldIgnoreSwipeStart(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest("[data-no-swipe]")) return true;
    if (allowInteractiveStart) return false;
    return Boolean(target.closest("input, textarea, select, button, a"));
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (shouldIgnoreSwipeStart(e.target)) return;

    swipingRef.current = false;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startOffsetRef.current = releaseToDelete ? offsetRef.current : isOpen ? -REVEAL_WIDTH : offsetRef.current;
    setPressing(true);
    applyOffset(startOffsetRef.current, false);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (disabled || pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!swipingRef.current) {
      if (Math.abs(dx) < SWIPE_START_PX) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.15) return;
      swipingRef.current = true;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    applyOffset(startOffsetRef.current + dx, false);
  }

  function finishPointer(e: PointerEvent<HTMLDivElement>) {
    if (disabled || pointerIdRef.current !== e.pointerId) return;
    setPressing(false);
    pointerIdRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!swipingRef.current) {
      if (!releaseToDelete && (isOpen || offsetRef.current < -4)) {
        applyOffset(0, true);
        onClose?.();
        return;
      }
      if (releaseToDelete && offsetRef.current < -4) {
        applyOffset(0, true);
        onClose?.();
        return;
      }
      onTap?.();
      return;
    }

    swipingRef.current = false;
    settleOffset(offsetRef.current);
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius,
        touchAction: "pan-y",
      }}
    >
      <div
        aria-label={deleteLabel}
        aria-hidden={!revealed}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          background: "rgba(255, 85, 85, 0.18)",
          opacity: revealed ? 1 : 0,
          transition: "opacity 0.18s ease",
          pointerEvents: "none",
        }}
      />

      <div
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        style={{
          position: "relative",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          opacity: pressing ? 0.92 : 1,
          transition: "opacity 0.12s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
