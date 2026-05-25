import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
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
import { useState, type CSSProperties, type ReactNode } from "react";

import { IconGrip } from "./icons";

const SLIDE_TRANSITION = "transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const COLLAPSE_TRANSITION = "opacity 150ms ease, max-height 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const COMPACT_GAP = 4;

/** Press-and-hold on grip before drag engages (values/inputs stay unchanged). */
const HOLD_DELAY_MS = 150;
const HOLD_TOLERANCE_PX = 5;

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

function lightHaptic() {
  try {
    navigator.vibrate?.(10);
  } catch {
    // Haptics unavailable
  }
}

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

/** Compact row shown in the list while reordering. */
function CompactDragCard({
  label,
  subtitle,
  handle,
  tapSize = 44,
  dimmed = false,
  selected = false,
}: {
  label: string;
  subtitle?: string;
  handle: ExerciseDragHandleProps;
  tapSize?: number;
  dimmed?: boolean;
  selected?: boolean;
}) {
  const display = label.trim() || "Exercise";
  return (
    <div
      className={`card exercise-reorder-compact-drag${selected ? " exercise-reorder-compact-drag--selected" : ""}`}
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
    zIndex: isDragging ? 10 : undefined,
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
        <CompactDragCard
          label={label}
          subtitle={subtitle}
          handle={handleProps}
          tapSize={dragHandleTapSize}
          dimmed={isListDragging && !isDragging}
          selected={isDragging}
        />
      </div>
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

  const isListDragging = activeId != null;
  const listGap = isListDragging ? COMPACT_GAP : gap;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: HOLD_DELAY_MS, tolerance: HOLD_TOLERANCE_PX },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(ev: DragStartEvent) {
    setActiveId(String(ev.active.id));
    lightHaptic();
  }

  function onDragEnd(ev: DragEndEvent) {
    setActiveId(null);
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
  }

  return (
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
    </DndContext>
  );
}
