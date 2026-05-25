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
  useSensors,
  type DragEndEvent,
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
import { CSS } from "@dnd-kit/utilities";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { IconGrip } from "./icons";

const SLIDE_TRANSITION = "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const LIFT_TRANSITION = "all 150ms ease";
const COLLAPSE_TRANSITION = "opacity 150ms ease, max-height 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const DROP_DURATION_MS = 150;
const DROP_EASING = "ease-out";
const COMPACT_GAP = 4;
const COMPACT_OVERLAY_HEIGHT = 56;

/** Press-and-hold on grip before drag engages (values/inputs stay unchanged). */
const HOLD_DELAY_MS = 150;
const HOLD_TOLERANCE_PX = 5;

type ReorderHoldContextValue = {
  onHoldStart: () => void;
  onHoldEnd: () => void;
};

const ReorderHoldContext = createContext<ReorderHoldContextValue | null>(null);

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

function activatorClientY(event: Event): number | null {
  if ("clientY" in event && typeof event.clientY === "number") return event.clientY;
  const touch = (event as TouchEvent).touches?.[0] ?? (event as TouchEvent).changedTouches?.[0];
  return touch?.clientY ?? null;
}

/** Keeps the floating compact card anchored under the grip when overlay size differs from the measured node. */
function createSnapOverlayToGripModifier(tapSize: number): Modifier {
  const gripAnchorY = tapSize / 2;
  return ({ transform, activeNodeRect, activatorEvent, overlayNodeRect }) => {
    if (!activatorEvent || !activeNodeRect) return transform;
    const clientY = activatorClientY(activatorEvent);
    if (clientY == null) return transform;

    const activatorOffsetY = clientY - activeNodeRect.top;
    const overlayHeight = overlayNodeRect?.height ?? COMPACT_OVERLAY_HEIGHT;
    const anchorY = Math.min(gripAnchorY, overlayHeight / 2);

    return {
      ...transform,
      y: transform.y + (activatorOffsetY - anchorY),
    };
  };
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
  isCompactLayout,
  getDragLabel,
  getDragSubtitle,
  dragHandleTapSize,
}: {
  item: T;
  index: number;
  gap: number;
  renderItem: SortableExerciseListProps<T>["renderItem"];
  isListDragging: boolean;
  isCompactLayout: boolean;
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
    isCompactReorder: isCompactLayout,
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
        aria-hidden={isCompactLayout}
      >
        {renderItem(item, index, handleProps, ctx)}
      </div>
      <div
        className="exercise-reorder-slot__layer exercise-reorder-slot__layer--compact"
        aria-hidden={!isCompactLayout}
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
  getDragLabel,
  getDragSubtitle,
  dragHandleTapSize = 44,
}: {
  item: T;
  getDragLabel?: (item: T) => string;
  getDragSubtitle?: (item: T) => string | undefined;
  dragHandleTapSize?: number;
}) {
  const label = itemLabel(item, getDragLabel);
  const subtitle = dragSubtitleForItem(item, getDragSubtitle);

  return (
    <div data-slot="sortable-overlay" data-dragging className="exercise-reorder-overlay-lift">
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
  const hold = useContext(ReorderHoldContext);
  const listeners = handle.listeners;

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    hold?.onHoldStart();
    listeners?.onPointerDown?.(e);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    listeners?.onPointerUp?.(e);
    hold?.onHoldEnd();
  }

  function onPointerCancel(e: ReactPointerEvent<HTMLButtonElement>) {
    listeners?.onPointerCancel?.(e);
    hold?.onHoldEnd();
  }

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
      {...(listeners ?? {})}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
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
  const [compactMode, setCompactMode] = useState(false);
  const [overlayWidth, setOverlayWidth] = useState<number | undefined>();
  const overlayWidthRef = useRef<number | undefined>();
  const activeIdRef = useRef<string | null>(null);

  const isListDragging = activeId != null;
  const isCompactLayout = compactMode || isListDragging;
  activeIdRef.current = activeId;
  const activeIndex = activeId != null ? items.findIndex((x) => x.id === activeId) : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const listGap = isCompactLayout ? COMPACT_GAP : gap;
  const overlayGripModifier = useRef(createSnapOverlayToGripModifier(dragHandleTapSize)).current;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function measureOverlayWidth(id: string) {
    const slot = document.querySelector(`[data-slot="sortable-item"][data-value="${id}"]`);
    const compact = document.querySelector(
      `[data-slot="sortable-item"][data-value="${id}"] [data-slot="sortable-compact-row"]`,
    );
    const target = compact ?? slot;
    if (!target) return undefined;
    return target.getBoundingClientRect().width;
  }

  function exitCompactLayout() {
    setCompactMode(false);
  }

  function onDragStart(ev: DragStartEvent) {
    const id = String(ev.active.id);
    const width = measureOverlayWidth(id);
    overlayWidthRef.current = width;
    setOverlayWidth(width);
    setCompactMode(true);
    setActiveId(id);
    lightHaptic();
  }

  function onDragEnd(ev: DragEndEvent) {
    setActiveId(null);
    setOverlayWidth(undefined);
    overlayWidthRef.current = undefined;
    exitCompactLayout();
    lightHaptic();
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  function onDragCancel() {
    setActiveId(null);
    setOverlayWidth(undefined);
    overlayWidthRef.current = undefined;
    exitCompactLayout();
  }

  const holdContext: ReorderHoldContextValue = {
    onHoldStart: () => setCompactMode(true),
    onHoldEnd: () => {
      if (activeIdRef.current == null) exitCompactLayout();
    },
  };

  return (
    <ReorderHoldContext.Provider value={holdContext}>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      autoScroll={{
        threshold: { x: 0, y: 0.12 },
        acceleration: 12,
        interval: 8,
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <div
          data-slot="sortable"
          {...(isCompactLayout ? { "data-compact": true } : {})}
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
              isCompactLayout={isCompactLayout}
              getDragLabel={getDragLabel}
              getDragSubtitle={getDragSubtitle}
              dragHandleTapSize={dragHandleTapSize}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay
        adjustScale
        dropAnimation={dropAnimation}
        modifiers={[overlayGripModifier]}
        style={{
          height: COMPACT_OVERLAY_HEIGHT,
          width: overlayWidth ?? overlayWidthRef.current,
          boxSizing: "border-box",
          transition: prefersReducedMotion() ? undefined : LIFT_TRANSITION,
        }}
      >
        {activeItem && activeId ? (
          <DragOverlayCard
            item={activeItem}
            getDragLabel={getDragLabel}
            getDragSubtitle={getDragSubtitle}
            dragHandleTapSize={dragHandleTapSize}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
    </ReorderHoldContext.Provider>
  );
}
