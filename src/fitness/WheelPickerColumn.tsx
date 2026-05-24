import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_VISIBLE_ROWS = 5;
export const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

export type WheelItem = {
  value: number;
  label: string;
};

function itemOpacity(index: number, selectedIndex: number, dragOffsetPx: number): number {
  const visualIndex = selectedIndex - dragOffsetPx / WHEEL_ITEM_HEIGHT;
  const dist = Math.abs(index - visualIndex);
  return Math.max(0.15, 1 - dist * 0.38);
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
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; startY: number; startOffset: number } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const baseTranslate = WHEEL_HEIGHT / 2 - WHEEL_ITEM_HEIGHT / 2;
  const translateY = baseTranslate - selectedIndex * WHEEL_ITEM_HEIGHT + dragOffset;

  function commitOffset(offset: number) {
    if (items.length === 0) return;
    const deltaIndex = Math.round(-offset / WHEEL_ITEM_HEIGHT);
    const nextIndex = Math.min(items.length - 1, Math.max(0, selectedIndex + deltaIndex));
    setDragOffset(0);
    const next = items[nextIndex]?.value;
    if (next != null && next !== value) onChange(next);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    dragRef.current = { pointerId: e.pointerId, startY: e.clientY, startOffset: dragOffset };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setDragOffset(drag.startOffset + (e.clientY - drag.startY));
  }

  function finishPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setDragging(false);
    commitOffset(drag.startOffset + (e.clientY - drag.startY));
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaIndex = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (deltaIndex === 0) return;
    const nextIndex = Math.min(items.length - 1, Math.max(0, selectedIndex + deltaIndex));
    const next = items[nextIndex]?.value;
    if (next != null && next !== value) onChange(next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (items.length === 0) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = items[Math.max(0, selectedIndex - 1)]?.value;
      if (next != null) onChange(next);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[Math.min(items.length - 1, selectedIndex + 1)]?.value;
      if (next != null) onChange(next);
    }
  }

  const selectedLabel = items[selectedIndex]?.label ?? "";

  return (
    <div
      ref={wheelRef}
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
          transition: dragging ? "none" : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
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
              fontWeight: Math.abs(index - (selectedIndex - dragOffset / WHEEL_ITEM_HEIGHT)) < 0.5 ? 600 : 400,
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
