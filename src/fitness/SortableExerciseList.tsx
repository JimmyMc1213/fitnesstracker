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

const LIFT_SCALE = 1.03;
const LAYOUT_TRANSITION = "transform 220ms cubic-bezier(0.25, 1, 0.5, 1)";

const dropAnimation = {
  ...defaultDropAnimation,
  duration: 240,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

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

function DragLiftShell({ children, isOverlay }: { children: ReactNode; isOverlay: boolean }) {
  if (!isOverlay) return <>{children}</>;
  return (
    <div
      style={{
        transform: `scale(${LIFT_SCALE})`,
        transformOrigin: "center top",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        borderRadius: 14,
        cursor: "grabbing",
        touchAction: "none",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, ${LAYOUT_TRANSITION}` : LAYOUT_TRANSITION,
    marginBottom: gap,
    opacity: isDragging ? 0.28 : 1,
    zIndex: isDragging ? 0 : undefined,
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

export function SortableExerciseList<T extends { id: string }>({ items, gap = 12, onReorder, renderItem }: SortableExerciseListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIndex = activeId != null ? items.findIndex((x) => x.id === activeId) : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
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
            gap={index < items.length - 1 ? gap : 0}
            renderItem={renderItem}
            isListDragging={activeId != null}
          />
        ))}
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimation} style={{ cursor: "grabbing" }}>
        {activeItem && activeIndex >= 0 ? (
          <DragLiftShell isOverlay>
            {renderItem(
              activeItem,
              activeIndex,
              { isDragging: true },
              { isOverlay: true, isListDragging: true },
            )}
          </DragLiftShell>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
