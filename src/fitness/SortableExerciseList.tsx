import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type CSSProperties, type ReactNode } from "react";

import { IconGrip } from "./icons";

export type SortableListContext = {
  isOverlay: boolean;
  isListDragging: boolean;
};

export type ExerciseDragHandleProps = {
  isDragging: boolean;
  listeners?: ReturnType<typeof useSortable>["listeners"];
  attributes?: ReturnType<typeof useSortable>["attributes"];
};

type SortableExerciseListProps<T extends { id: string }> = {
  items: T[];
  gap?: number;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number, handle: ExerciseDragHandleProps, ctx: SortableListContext) => ReactNode;
};

function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [removed] = next.splice(from, 1);
  if (removed === undefined) return items;
  next.splice(to, 0, removed);
  return next;
}

function SortableRow<T extends { id: string }>({
  item,
  index,
  gap,
  renderItem,
  isListDragging,
}: {
  item: T;
  index: number;
  gap: number;
  renderItem: SortableExerciseListProps<T>["renderItem"];
  isListDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: gap,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, index, { isDragging, listeners, attributes }, { isOverlay: false, isListDragging })}
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
        color: disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.35)",
        cursor: disabled ? "default" : "grab",
        touchAction: "none",
      }}
      {...(handle.attributes ?? {})}
      {...(handle.listeners ?? {})}
    >
      <IconGrip size={18} />
    </button>
  );
}

export function SortableExerciseList<T extends { id: string }>({ items, gap = 12, onReorder, renderItem }: SortableExerciseListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIndex = activeId != null ? items.findIndex((x) => x.id === activeId) : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

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
      sensors={[
        { sensor: PointerSensor, options: { activationConstraint: { distance: 6 } } },
        { sensor: KeyboardSensor, options: { coordinateGetter: sortableKeyboardCoordinates } },
      ]}
      collisionDetection={closestCenter}
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
            gap={index < items.length - 1 ? gap : 0}
            renderItem={renderItem}
            isListDragging={activeId != null}
          />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeItem && activeIndex >= 0
          ? renderItem(
              activeItem,
              activeIndex,
              { isDragging: true },
              { isOverlay: true, isListDragging: true },
            )
          : null}
      </DragOverlay>
    </DndContext>
  );
}
