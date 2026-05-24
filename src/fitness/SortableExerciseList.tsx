import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type CSSProperties, type ReactNode } from "react";

import { IconGrip } from "./icons";

const LAYOUT_TRANSITION = "transform 220ms cubic-bezier(0.25, 1, 0.5, 1)";
const COMPACT_GAP = 4;
const HOLD_DELAY_MS = 280;

const dropAnimation = {
  ...defaultDropAnimation,
  duration: 240,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.35",
      },
    },
  }),
};

export type SortableListContext = {
  /** @deprecated Overlay uses built-in compact row; kept for API compatibility */
  isOverlay: boolean;
  /** True while any item is being dragged, list shows compact name rows (Strong-style). */
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
  /** Label on compact rows; defaults to `item.name`. */
  getDragLabel?: (item: T) => string;
  /** Drag handle touch target in compact mode (routine editor: 44). */
  dragHandleTapSize?: number;
  renderItem: (item: T, index: number, handle: ExerciseDragHandleProps, ctx: SortableListContext) => ReactNode;
};

function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [removed] = next.splice(from, 1);
  if (removed === undefined) return items;
  next.splice(to, 0, removed);
  return next;
}

/** Thin name row used for every exercise while reordering (Strong-style compact list). */
export function ReorderCompactRow({
  label,
  index,
  handle,
  isDragging,
  isOverlay = false,
  tapSize = 32,
}: {
  label: string;
  index: number;
  handle: ExerciseDragHandleProps;
  isDragging: boolean;
  isOverlay?: boolean;
  tapSize?: number;
}) {
  const display = label.trim() || "Exercise";
  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        minHeight: 36,
        maxWidth: isOverlay ? 320 : undefined,
        width: isOverlay ? "max-content" : undefined,
        opacity: isDragging && !isOverlay ? 0.22 : 1,
        boxShadow: isOverlay ? "0 12px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)" : undefined,
        borderRadius: 10,
        cursor: isOverlay ? "grabbing" : undefined,
        touchAction: "none",
        willChange: isOverlay ? "transform" : undefined,
        transition: "opacity 160ms ease, box-shadow 160ms ease",
      }}
    >
      <ExerciseDragHandle
        handle={handle}
        tapSize={tapSize}
        disabled={!isOverlay && isDragging}
      />
      <span
        style={{
          fontSize: 10,
          color: "var(--text-ghost)",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
          width: 20,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
          minWidth: 0,
        }}
      >
        {display}
      </span>
    </div>
  );
}

function SortableRow<T extends { id: string; name: string }>({
  item,
  index,
  gap,
  renderItem,
  isCompactReorder,
  getDragLabel,
  dragHandleTapSize,
}: {
  item: T;
  index: number;
  gap: number;
  renderItem: SortableExerciseListProps<T>["renderItem"];
  isCompactReorder: boolean;
  getDragLabel?: (item: T) => string;
  dragHandleTapSize: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, ${LAYOUT_TRANSITION}` : LAYOUT_TRANSITION,
    marginBottom: gap,
    zIndex: isDragging ? 0 : undefined,
  };

  const handleProps: ExerciseDragHandleProps = { isDragging, listeners, attributes };
  const ctx: SortableListContext = {
    isOverlay: false,
    isListDragging: isCompactReorder,
    isCompactReorder,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isCompactReorder ? (
        <ReorderCompactRow
          label={getDragLabel ? getDragLabel(item) : item.name}
          index={index}
          handle={handleProps}
          isDragging={isDragging}
          tapSize={dragHandleTapSize}
        />
      ) : (
        renderItem(item, index, handleProps, ctx)
      )}
    </div>
  );
}

export function ExerciseDragHandle({
  handle,
  disabled,
  tapSize = 32,
}: {
  handle: ExerciseDragHandleProps;
  disabled?: boolean;
  /** Minimum touch target (px). Routine editor uses 44 per FTI-17. */
  tapSize?: number;
}) {
  return (
    <button
      type="button"
      className="tap"
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
  dragHandleTapSize = 32,
  renderItem,
}: SortableExerciseListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isCompactReorder = activeId != null;
  const activeIndex = activeId != null ? items.findIndex((x) => x.id === activeId) : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const listGap = isCompactReorder ? COMPACT_GAP : gap;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: HOLD_DELAY_MS, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(ev: DragStartEvent) {
    setActiveId(String(ev.active.id));
  }

  function onDragEnd(ev: DragEndEvent) {
    setActiveId(null);
    const { active, over } = ev;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(reorder(items, oldIndex, newIndex));
  }

  function onDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableRow
            key={item.id}
            item={item}
            index={index}
            gap={index < items.length - 1 ? listGap : 0}
            renderItem={renderItem}
            isCompactReorder={isCompactReorder}
            getDragLabel={getDragLabel}
            dragHandleTapSize={dragHandleTapSize}
          />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation} style={{ cursor: "grabbing" }}>
        {activeItem && activeIndex >= 0 ? (
          <ReorderCompactRow
            label={getDragLabel ? getDragLabel(activeItem) : activeItem.name}
            index={activeIndex}
            handle={{ isDragging: true }}
            isDragging={false}
            isOverlay
            tapSize={dragHandleTapSize}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
