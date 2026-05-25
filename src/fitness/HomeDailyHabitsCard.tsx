import { useCallback, useMemo, useState } from "react";

import { AddHabitSheet } from "./AddHabitSheet";
import { buildHabitsForDateKey, planWeekIndex } from "./data";
import { habitIconComponent } from "./habitIcons";
import { isActionHabit, isWeighInActionHabit } from "./habits";
import { IconCheck, IconChevR, IconGrip, IconMinus, IconMobilityRunner } from "./icons";
import { isMobilityHabit } from "./mobilityHabit";
import { SortableExerciseList } from "./SortableExerciseList";
import { MOBILITY_ACCENT, MOBILITY_BG, MOBILITY_BORDER } from "./workoutUiTokens";
import type { Habit, HabitTemplate } from "./types";

type Props = {
  habits: Habit[];
  dailyHabitTemplates: HabitTemplate[];
  stepsTarget: number;
  planStartIso: string;
  dateKey: string;
  readOnly?: boolean;
  onToggle: (id: string) => void;
  onMobilityPress?: () => void;
  onOpenWeighIn?: () => void;
  onSaveHabitTemplates?: (templates: HabitTemplate[]) => void;
};

function MobilityRoutineCard({
  habit,
  readOnly,
  onPress,
}: {
  habit: Habit;
  readOnly: boolean;
  onPress?: () => void;
}) {
  const subtitle = habit.done
    ? "Routine complete for today"
    : habit.subtitle?.trim()
      ? habit.subtitle.trim()
      : "~15 min stretch · complete all moves";

  return (
    <button
      type="button"
      className="tap"
      onClick={() => onPress?.()}
      disabled={readOnly}
      aria-label={habit.done ? "Open mobility routine" : "Start mobility routine"}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 0,
        border: "none",
        background: "none",
        opacity: readOnly ? 0.72 : 1,
      }}
    >
      <div
        className="card"
        style={{
          padding: "15px 16px 14px",
          borderColor: habit.done ? "rgba(196,181,253,0.42)" : MOBILITY_BORDER,
          background: MOBILITY_BG,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: habit.done ? "rgba(196,181,253,0.18)" : "rgba(196,181,253,0.12)",
              border: "0.5px solid rgba(196,181,253,0.22)",
              display: "grid",
              placeItems: "center",
              color: MOBILITY_ACCENT,
              flexShrink: 0,
            }}
          >
            <IconMobilityRunner size={22} color={MOBILITY_ACCENT} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MOBILITY_ACCENT,
                }}
              >
                Guided routine
              </span>
              {habit.done ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid var(--border)",
                  }}
                >
                  Done
                </span>
              ) : null}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {habit.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.45, fontWeight: 400 }}>
              {subtitle}
            </div>

            {!readOnly ? (
              <div
                style={{
                  marginTop: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: MOBILITY_ACCENT,
                }}
              >
                {habit.done ? "Open routine" : "Start routine"}
                <IconChevR size={14} stroke={2.2} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function HabitSubtitle({
  habit,
  stepsTarget,
  progWeek,
}: {
  habit: Habit;
  stepsTarget: number;
  progWeek: number;
}) {
  if (habit.done) return <>Done</>;
  if (habit.subtitle?.trim()) return <>{habit.subtitle.trim()}</>;
  if (habit.icon === "run") return <>{`${stepsTarget.toLocaleString()} steps · Week ${progWeek}`}</>;
  return <>Not yet today</>;
}

function HabitToggle({
  habit,
  readOnly,
  onToggle,
}: {
  habit: Habit;
  readOnly: boolean;
  onToggle: (id: string) => void;
}) {
  if (readOnly) {
    return (
      <div
        aria-hidden
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: habit.done ? "var(--toggle-track-on)" : "var(--toggle-track-off)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(habit.id);
      }}
      className="tap"
      aria-label={habit.done ? "Mark incomplete" : "Mark complete"}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: habit.done ? "var(--toggle-track-on)" : "var(--toggle-track-off)",
        position: "relative",
        transition: "background .2s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: habit.done ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: habit.done ? "var(--toggle-thumb-on)" : "var(--toggle-thumb-off)",
          transition: "left .2s ease, background .2s ease",
        }}
      />
    </button>
  );
}

function HabitTrailing({
  habit,
  readOnly,
  onToggle,
}: {
  habit: Habit;
  readOnly: boolean;
  onToggle: (id: string) => void;
}) {
  if (isActionHabit(habit)) {
    if (habit.done) {
      return <IconCheck size={18} stroke={2.4} style={{ color: "var(--primary)", flexShrink: 0 }} aria-hidden />;
    }
    return <IconChevR size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} aria-hidden />;
  }
  return <HabitToggle habit={habit} readOnly={readOnly} onToggle={onToggle} />;
}

function HabitRowContent({
  habit,
  stepsTarget,
  progWeek,
  readOnly,
  onToggle,
  onActionPress,
  editMode,
  onRemove,
  removing,
}: {
  habit: Habit;
  stepsTarget: number;
  progWeek: number;
  readOnly: boolean;
  onToggle: (id: string) => void;
  onActionPress?: (habit: Habit) => void;
  editMode?: boolean;
  onRemove?: (id: string) => void;
  removing?: boolean;
}) {
  const IconComp = habitIconComponent(habit.icon);
  const actionHabit = isActionHabit(habit);
  const interactive = !readOnly && !editMode && (actionHabit || !actionHabit);

  const inner = (
    <>
      {editMode ? (
        <button
          type="button"
          className="tap"
          onClick={() => onRemove?.(habit.id)}
          aria-label={`Remove ${habit.name}`}
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "none",
            background: "rgba(248,113,113,0.15)",
            color: "rgba(248,113,113,0.95)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <IconMinus size={14} stroke={2.2} />
        </button>
      ) : null}

      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: habit.done ? "rgba(255,255,255,0.08)" : "var(--surface-2)",
          display: "grid",
          placeItems: "center",
          color: habit.done ? "var(--text-primary)" : "var(--text-ghost)",
          flexShrink: 0,
        }}
      >
        <IconComp size={18} stroke={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            marginBottom: 3,
          }}
        >
          {habit.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-ghost)", lineHeight: 1.35, fontWeight: 400 }}>
          <HabitSubtitle habit={habit} stepsTarget={stepsTarget} progWeek={progWeek} />
        </div>
      </div>

      {!editMode ? <HabitTrailing habit={habit} readOnly={readOnly} onToggle={onToggle} /> : null}
    </>
  );

  const cardStyle = {
    padding: "14px 15px",
    minHeight: 64,
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderColor: "var(--border)",
    overflow: "hidden",
    transition: "opacity 250ms ease, transform 250ms ease, max-height 250ms ease, margin 250ms ease, padding 250ms ease",
    opacity: removing ? 0 : 1,
    transform: removing ? "translateX(-12px)" : "translateX(0)",
    maxHeight: removing ? 0 : 120,
    marginTop: removing ? -8 : undefined,
    paddingTop: removing ? 0 : undefined,
    paddingBottom: removing ? 0 : undefined,
  } as const;

  if (actionHabit && interactive) {
    return (
      <button
        type="button"
        className="tap card"
        onClick={() => onActionPress?.(habit)}
        aria-label={habit.done ? habit.name : `Open ${habit.name}`}
        style={{ ...cardStyle, width: "100%", textAlign: "left" }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="card" style={cardStyle}>
      {inner}
    </div>
  );
}

export function HomeDailyHabitsCard({
  habits,
  dailyHabitTemplates,
  stepsTarget,
  planStartIso,
  dateKey,
  readOnly = false,
  onToggle,
  onMobilityPress,
  onOpenWeighIn,
  onSaveHabitTemplates,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<HabitTemplate[]>([]);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const mobilityHabit = habits.find((h) => isMobilityHabit(h.id));
  const displayHabits = habits.filter((h) => !isMobilityHabit(h.id));
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);

  const editHabits = useMemo(() => {
    if (!editMode) return displayHabits;
    const doneMap = Object.fromEntries(displayHabits.map((h) => [h.id, h.done]));
    return editDraft.map((t) => ({ ...t, done: Boolean(doneMap[t.id]) }));
  }, [displayHabits, editDraft, editMode]);

  const doneCount = displayHabits.filter((h) => h.done).length;

  const enterEditMode = useCallback(() => {
    setEditDraft(dailyHabitTemplates);
    setRemovingIds(new Set());
    setEditMode(true);
  }, [dailyHabitTemplates]);

  const exitEditMode = useCallback(
    (save: boolean) => {
      if (save && onSaveHabitTemplates) {
        onSaveHabitTemplates(editDraft);
      }
      setEditMode(false);
      setEditDraft([]);
      setRemovingIds(new Set());
      setAddSheetOpen(false);
    },
    [editDraft, onSaveHabitTemplates],
  );

  const removeHabit = useCallback((id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      setEditDraft((draft) => draft.filter((h) => h.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  }, []);

  function handleActionPress(habit: Habit) {
    if (isWeighInActionHabit(habit)) onOpenWeighIn?.();
  }

  if (habits.length === 0 && dailyHabitTemplates.length === 0) return null;

  const canEdit = !readOnly && Boolean(onSaveHabitTemplates);
  const listHabits = editMode ? editHabits : displayHabits;

  return (
    <>
      {mobilityHabit ? (
        <section style={{ marginTop: 28 }}>
          <div className="between" style={{ alignItems: "baseline", marginBottom: 12 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-ghost)",
              }}
            >
              Mobility
            </h2>
          </div>
          <MobilityRoutineCard habit={mobilityHabit} readOnly={readOnly} onPress={onMobilityPress} />
        </section>
      ) : null}

      {listHabits.length > 0 || editMode ? (
        <section style={{ marginTop: mobilityHabit ? 22 : 28 }}>
          <div className="between" style={{ alignItems: "baseline", marginBottom: 12, gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-ghost)",
              }}
            >
              Daily habits
            </h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              {canEdit ? (
                <button
                  type="button"
                  className="tap"
                  onClick={() => (editMode ? exitEditMode(true) : enterEditMode())}
                  style={{
                    padding: 0,
                    border: "none",
                    background: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {editMode ? "Done" : "Edit"}
                </button>
              ) : null}
              <span
                style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
              >
                {doneCount}/{displayHabits.length}
              </span>
            </div>
          </div>

          {editMode ? (
            <>
              <SortableExerciseList
                items={editDraft}
                gap={8}
                dragHandleTapSize={36}
                onReorder={setEditDraft}
                renderItem={(item, _index, handle) => {
                  const habit = editHabits.find((h) => h.id === item.id) ?? {
                    ...item,
                    done: false,
                  };
                  const removing = removingIds.has(item.id);
                  return (
                    <div data-slot="sortable-item-content" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      <HabitRowContent
                        habit={habit}
                        stepsTarget={stepsTarget}
                        progWeek={progWeek}
                        readOnly={readOnly}
                        onToggle={onToggle}
                        editMode
                        onRemove={removeHabit}
                        removing={removing}
                      />
                      {!removing ? (
                        <button
                          type="button"
                          className="tap exercise-drag-handle"
                          data-slot="sortable-item-handle"
                          data-no-swipe
                          aria-label={`Reorder ${item.name}`}
                          style={{
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            width: 36,
                            height: 36,
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            color: "var(--text-ghost)",
                            cursor: handle.isDragging ? "grabbing" : "grab",
                            touchAction: "none",
                          }}
                          {...(handle.attributes ?? {})}
                          {...(handle.listeners ?? {})}
                        >
                          <IconGrip size={18} />
                        </button>
                      ) : null}
                    </div>
                  );
                }}
              />
              <button
                type="button"
                className="tap"
                onClick={() => setAddSheetOpen(true)}
                style={{
                  marginTop: 8,
                  border: "0.5px dashed var(--border)",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                + Add habit
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {displayHabits.map((habit) => (
                <HabitRowContent
                  key={habit.id}
                  habit={habit}
                  stepsTarget={stepsTarget}
                  progWeek={progWeek}
                  readOnly={readOnly}
                  onToggle={onToggle}
                  onActionPress={handleActionPress}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {editMode ? (
        <AddHabitSheet
          open={addSheetOpen}
          currentTemplates={editDraft}
          onClose={() => setAddSheetOpen(false)}
          onAdd={(template) => setEditDraft((draft) => [...draft, template])}
        />
      ) : null}
    </>
  );
}

export function habitsForDateKey(
  state: { habitTemplates: HabitTemplate[]; habitsDoneByDay: Record<string, Record<string, boolean>>; weightLog: { dateKey: string }[] },
  dateKey: string,
  _todayKey: string,
): Habit[] {
  const weightLogged = state.weightLog.some((e) => e.dateKey === dateKey);
  return buildHabitsForDateKey(state.habitTemplates, state.habitsDoneByDay, dateKey, { weightLogged });
}

export function dailyHabitTemplatesFromState(templates: HabitTemplate[]): HabitTemplate[] {
  return templates.filter((t) => !isMobilityHabit(t.id));
}
