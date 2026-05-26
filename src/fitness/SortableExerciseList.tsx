import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimation,
  MeasuringStrategy,
  useSensor,
  type DragEndEvent,
  type DragPendingEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers";
import { CSS, getEventCoordinates, isTouchEvent } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { IconGrip } from "./icons";

const SLIDE_TRANSITION = "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const LIFT_TRANSITION = "all 150ms ease";
const COLLAPSE_TRANSITION = "opacity 150ms ease, max-height 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const DROP_DURATION_MS = 150;
const DROP_EASING = "ease-out";
const COMPACT_GAP = 4;

/** Press-and-hold on grip before drag engages (values/inputs stay unchanged). */
const HOLD_DELAY_MS = 150;
/** Allow finger settle after scroll; strict tolerance cancels activation too easily on touch. */
const HOLD_TOLERANCE_PX = 12;

const COMPACT_ROW_HEIGHT = 56;

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

function isTouchLikeActivator(event: Event | null): boolean {
  if (!event) return false;
  if (isTouchEvent(event)) return true;
  return (
    typeof PointerEvent !== "undefined" &&
    event instanceof PointerEvent &&
    event.pointerType === "touch"
  );
}

/** Mouse keeps center snap; touch aligns the grip under the finger on the compact row. */
function createOverlayPositionModifier(gripTapSize: number): Modifier {
  const gripCenterX = gripTapSize / 2;

  return (args) => {
    const { activatorEvent, activeNodeRect, overlayNodeRect, transform } = args;
    if (!isTouchLikeActivator(activatorEvent)) {
      return snapCenterToCursor(args);
    }
    if (!activeNodeRect) return transform;

    if (!activatorEvent) return transform;

    const coords = getEventCoordinates(activatorEvent);
    if (!coords) return transform;

    const overlayHeight = overlayNodeRect?.height ?? COMPACT_ROW_HEIGHT;
    const grabOffsetX = coords.x - activeNodeRect.left;
    const grabOffsetY = coords.y - activeNodeRect.top;

    return {
      ...transform,
      x: transform.x + grabOffsetX - gripCenterX,
      y: transform.y + grabOffsetY - overlayHeight / 2,
    };
  };
}

function findScrollableParent(node: Element | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return null;
}

function isCoarsePointerDevice(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function lightHaptic() {
  try {
    navigator.vibrate?.(10);
  } catch {
    // Haptics unavailable
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const dropAnimation = {
  ...defaultDropAnimation,
  duration: DROP_DURATION_MS,
  easing: DROP_EASING,
};

export type SortableListContext = {
  isOverlay: boolean;
  isListDragging: boolean;
  isCompactReorder: boolean;
};

export type ExerciseDragHandleProps = {
  isDragging: boolean;
  listeners?: ReturnType<typeof useSortable>["listeners"];
  attributes?: ReturnType<typeof useSortable>["attributes"];
};

type SortableExerciseListProps<T extends { id: string; name: string }> = {
  items: T[];
  gap?: number;
  onReorder: (next: T[]) => void;
  getDragLabel?: (item: T) => string;
  getDragSubtitle?: (item: T) => string | undefined;
  dragHandleTapSize?: number;
  renderItem: (item: T, index: number, handle: ExerciseDragHandleProps, ctx: SortableListContext) => ReactNode;
};

function dragSubtitleForItem<T extends { id: string; name: string }>(
  item: T,
  getDragSubtitle?: (item: T) => string | undefined,
): string | undefined {
  if (getDragSubtitle) return getDragSubtitle(item);
  const sets = (item as { sets?: unknown[] }).sets;
  if (Array.isArray(sets)) {
    const count = sets.length;
    return `${count} set${count === 1 ? "" : "s"}`;
  }
  return undefined;
}

function itemLabel<T extends { id: string; name: string }>(item: T, getDragLabel?: (item: T) => string): string {
  return getDragLabel ? getDragLabel(item) : item.name;
}

/** Compact row used in the list and DragOverlay while reordering. */
function CompactDragCard({
  label,
  subtitle,
  handle,
  tapSize = 44,
  dimmed = false,
}: {
  label: string;
  subtitle?: string;
  handle: ExerciseDragHandleProps;
  tapSize?: number;
  dimmed?: boolean;
}) {
  const display = label.trim() || "Exercise";
  return (
    <div
      className="card exercise-reorder-compact-drag"
      data-slot="sortable-compact-row"
      style={{ opacity: dimmed ? 0.6 : 1, transition: "opacity 150ms ease" }}
    >
      <ExerciseDragHandle handle={handle} tapSize={tapSize} disabled={dimmed} />
      <span className="exercise-reorder-compact-drag__name">{display}</span>
      {subtitle ? <span className="exercise-reorder-compact-drag__sets">{subtitle}</span> : null}
    </div>
  );
}

function SortableRow<T extends { id: string; name: string }>({
  item,
  index,
  gap,
  renderItem,
  isListDragging,
  getDragLabel,
  getDragSubtitle,
  dragHandleTapSize,
}: {
  item: T;
  index: number;
  gap: number;
  renderItem: SortableExerciseListProps<T>["renderItem"];
  isListDragging: boolean;
  getDragLabel?: (item: T) => string;
  getDragSubtitle?: (item: T) => string | undefined;
  dragHandleTapSize: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: [transition ?? SLIDE_TRANSITION, COLLAPSE_TRANSITION].join(", "),
    marginBottom: gap,
    position: "relative",
    zIndex: isDragging ? 1 : undefined,
  };

  const handleProps: ExerciseDragHandleProps = { isDragging, listeners, attributes };
  const ctx: SortableListContext = {
    isOverlay: false,
    isListDragging,
    isCompactReorder: isListDragging,
  };
  const label = itemLabel(item, getDragLabel);
  const subtitle = dragSubtitleForItem(item, getDragSubtitle);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="exercise-reorder-slot"
      data-slot="sortable-item"
      data-value={item.id}
      {...(isDragging ? { "data-dragging": true } : {})}
    >
      <div
        data-slot="sortable-item-content"
        className="exercise-reorder-slot__layer exercise-reorder-slot__layer--full"
        aria-hidden={isListDragging}
      >
        {renderItem(item, index, handleProps, ctx)}
      </div>
      <div
        className="exercise-reorder-slot__layer exercise-reorder-slot__layer--compact"
        aria-hidden={!isListDragging}
      >
        {isDragging ? (
          <div className="exercise-reorder-placeholder" aria-hidden />
        ) : (
          <CompactDragCard
            label={label}
            subtitle={subtitle}
            handle={handleProps}
            tapSize={dragHandleTapSize}
            dimmed={isListDragging}
          />
        )}
      </div>
    </div>
  );
}

function DragOverlayCard<T extends { id: string; name: string }>({
  item,
  width,
  getDragLabel,
  getDragSubtitle,
  dragHandleTapSize = 44,
}: {
  item: T;
  width?: number;
  getDragLabel?: (item: T) => string;
  getDragSubtitle?: (item: T) => string | undefined;
  dragHandleTapSize?: number;
}) {
  const label = itemLabel(item, getDragLabel);
  const subtitle = dragSubtitleForItem(item, getDragSubtitle);

  return (
    <div
      data-slot="sortable-overlay"
      data-dragging
      className="exercise-reorder-overlay-lift"
      style={{ width, transition: prefersReducedMotion() ? undefined : LIFT_TRANSITION }}
    >
      <CompactDragCard
        label={label}
        subtitle={subtitle}
        handle={{ isDragging: true }}
        tapSize={dragHandleTapSize}
      />
    </div>
  );
}

export function ExerciseDragHandle({
  handle,
  disabled,
  tapSize = 44,
}: {
  handle: ExerciseDragHandleProps;
  disabled?: boolean;
  tapSize?: number;
}) {
  return (
    <button
      type="button"
      className="tap exercise-drag-handle"
      data-slot="sortable-item-handle"
      data-no-swipe
      aria-label="Reorder exercise"
      disabled={disabled}
      style={{
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        width: tapSize,
        height: tapSize,
        padding: 0,
        border: "none",
        background: "transparent",
        color: disabled ? "var(--text-whisper)" : "var(--text-ghost)",
        cursor: disabled ? "default" : handle.isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      {...(handle.attributes ?? {})}
      {...(handle.listeners ?? {})}
    >
      <IconGrip size={18} />
    </button>
  );
}

export function SortableExerciseList<T extends { id: string; name: string }>({
  items,
  gap = 12,
  onReorder,
  getDragLabel,
  getDragSubtitle,
  dragHandleTapSize = 44,
  renderItem,
}: SortableExerciseListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number | undefined>();
  const [dndKey, setDndKey] = useState(0);
  const overlayWidthRef = useRef<number | undefined>();
  const scrollLockRef = useRef<HTMLElement | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const isListDragging = activeId != null;
  const activeIndex = activeId != null ? items.findIndex((x) => x.id === activeId) : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const listGap = isListDragging ? COMPACT_GAP : gap;

  const overlayModifiers = useMemo(
    () => [createOverlayPositionModifier(dragHandleTapSize), restrictToVerticalAxis, restrictToWindowEdges],
    [dragHandleTapSize],
  );

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
  });
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
  });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });

  const sensors = useMemo(
    () => (isCoarsePointerDevice() ? [touchSensor, keyboardSensor] : [pointerSensor, keyboardSensor]),
    [touchSensor, pointerSensor, keyboardSensor],
  );

  const unlockScrollParent = useCallback(() => {
    const locked = scrollLockRef.current;
    if (!locked) return;
    locked.removeAttribute("data-exercise-reorder-scroll-lock");
    scrollLockRef.current = null;
  }, []);

  const resetDragUi = useCallback(
    (options?: { remountDnd?: boolean }) => {
      activeIdRef.current = null;
      setActiveId(null);
      setOverlayWidth(undefined);
      overlayWidthRef.current = undefined;
      unlockScrollParent();
      if (options?.remountDnd) {
        setDndKey((k) => k + 1);
      }
    },
    [unlockScrollParent],
  );

  const forceRecoverDrag = useCallback(() => {
    if (!activeIdRef.current) return;
    resetDragUi({ remountDnd: true });
  }, [resetDragUi]);

  const lockScrollParent = useCallback(
    (id: string) => {
      unlockScrollParent();
      const item = document.querySelector(`[data-slot="sortable-item"][data-value="${id}"]`);
      const scrollParent = findScrollableParent(item);
      if (!scrollParent) return;
      scrollParent.setAttribute("data-exercise-reorder-scroll-lock", "true");
      scrollLockRef.current = scrollParent;
    },
    [unlockScrollParent],
  );

  function measureOverlayWidth(id: string) {
    const content = document.querySelector(
      `[data-slot="sortable-item"][data-value="${id}"] [data-slot="sortable-item-content"]`,
    );
    if (!content) return undefined;
    return content.getBoundingClientRect().width;
  }

  function onDragStart(ev: DragStartEvent) {
    const id = String(ev.active.id);
    const width = measureOverlayWidth(id);
    overlayWidthRef.current = width;
    setOverlayWidth(width);
    activeIdRef.current = id;
    setActiveId(id);
    lockScrollParent(id);
    lightHaptic();
  }

  function onDragEnd(ev: DragEndEvent) {
    resetDragUi();
    lightHaptic();
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function onDragCancel() {
    resetDragUi();
  }

  function onDragPending(ev: DragPendingEvent) {
    lockScrollParent(String(ev.id));
  }

  function onDragAbort() {
    resetDragUi();
  }

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => () => unlockScrollParent(), [unlockScrollParent]);

  useEffect(() => {
    if (!activeId) return;

    function scheduleRecoveryCheck() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (activeIdRef.current) forceRecoverDrag();
        });
      });
    }

    function onImmediateInterrupt() {
      forceRecoverDrag();
    }

    function onHidden() {
      if (document.hidden) onImmediateInterrupt();
    }

    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointercancel", onImmediateInterrupt, opts);
    document.addEventListener("touchcancel", onImmediateInterrupt, opts);
    document.addEventListener("touchend", scheduleRecoveryCheck, opts);
    document.addEventListener("pointerup", scheduleRecoveryCheck, opts);
    window.addEventListener("blur", onImmediateInterrupt, opts);
    document.addEventListener("visibilitychange", onHidden, opts);

    return () => {
      document.removeEventListener("pointercancel", onImmediateInterrupt, opts);
      document.removeEventListener("touchcancel", onImmediateInterrupt, opts);
      document.removeEventListener("touchend", scheduleRecoveryCheck, opts);
      document.removeEventListener("pointerup", scheduleRecoveryCheck, opts);
      window.removeEventListener("blur", onImmediateInterrupt, opts);
      document.removeEventListener("visibilitychange", onHidden, opts);
    };
  }, [activeId, forceRecoverDrag]);

  const autoScroll = useMemo(
    () =>
      isCoarsePointerDevice()
        ? false
        : {
            threshold: { x: 0, y: 0.12 },
            acceleration: 12,
            interval: 8,
          },
    [],
  );

  return (
    <DndContext
      key={dndKey}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      autoScroll={autoScroll}
      onDragStart={onDragStart}
      onDragPending={onDragPending}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      onDragAbort={onDragAbort}
    >
      <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <div
          data-slot="sortable"
          {...(isListDragging ? { "data-dragging": true } : {})}
          className="exercise-reorder-list"
        >
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              gap={index < items.length - 1 ? listGap : 0}
              renderItem={renderItem}
              isListDragging={isListDragging}
              getDragLabel={getDragLabel}
              getDragSubtitle={getDragSubtitle}
              dragHandleTapSize={dragHandleTapSize}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay
        dropAnimation={dropAnimation}
        modifiers={overlayModifiers}
        style={{ height: COMPACT_ROW_HEIGHT }}
      >
        {activeItem && activeId ? (
          <DragOverlayCard
            item={activeItem}
            width={overlayWidth ?? overlayWidthRef.current}
            getDragLabel={getDragLabel}
            getDragSubtitle={getDragSubtitle}
            dragHandleTapSize={dragHandleTapSize}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
