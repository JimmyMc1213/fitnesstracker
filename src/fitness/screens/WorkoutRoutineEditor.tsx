import { useEffect, useRef, useState, type CSSProperties } from "react";

import { defaultExerciseTarget, formatPrescriptionRepRange, usesSecFieldForExercise } from "../exercisePrescriptionDefaults";
import { newTemplateExerciseLine, resizeWorkoutSets } from "../data";
import { IconMinus, IconPencil, IconPlus, IconTrash } from "../icons";
import { FullScreenOverlay } from "../motion";
import { RoutineExerciseSearchSheet } from "../RoutineExerciseSearchSheet";
import { ExerciseDragHandle, SortableExerciseList } from "../SortableExerciseList";
import type { CustomExerciseTemplate, EquipmentSetup, WorkoutExercise, WorkoutRoutineTemplate } from "../types";
import { weekdayFullName } from "../trainingCalendar";
import {
  formatWorkoutTarget,
  parseRepRangeBounds,
  parseWorkoutTarget,
  syncTargetRepRange,
} from "../workoutTarget";
import { DeleteExerciseConfirmSheet } from "../workout/DeleteExerciseConfirmSheet";
import { SaveWorkoutConfirmSheet } from "../workout/SaveWorkoutConfirmSheet";
import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { CARD_PADDING, EDITOR_LIST_GAP, labelStyle, SECONDARY_ACTION_COLOR, workoutFieldInputStyle } from "../workoutUiTokens";

/** Pass as `editingRoutineId` to open the editor for a brand-new routine. */
export const NEW_ROUTINE_EDITOR_ID = "__new__";

const ACCENT_BLUE = "#3B82F6";
const BUTTON_RADIUS = 14;
const DAY_PRESETS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const workoutNameInputStyle: CSSProperties = {
  display: "block",
  minWidth: 0,
  padding: "8px 10px",
  border: "none",
  background: "transparent",
  color: "var(--text-primary)",
  fontFamily: "var(--ui)",
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  outline: "none",
  boxSizing: "border-box",
};

function defaultWorkoutName(day: string): string {
  const tagged = day.trim();
  if (!tagged) return "Workout";
  return `${weekdayFullName(tagged)} Workout`;
}

function resolvedWorkoutName(rawName: string, day: string): string {
  const trimmed = rawName.trim();
  if (trimmed) return trimmed;
  return defaultWorkoutName(day);
}

function buildDraftTemplate(
  template: WorkoutRoutineTemplate | null,
  name: string,
  dayLabel: string,
  focus: string,
  exercises: WorkoutExercise[],
): WorkoutRoutineTemplate {
  const id = template?.id ?? `tpl_${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const trimmedDay = dayLabel.trim();
  return {
    id,
    name: resolvedWorkoutName(name, trimmedDay),
    dayLabel: trimmedDay,
    focus: focus.trim(),
    exercises: exercises.map((e) => ({
      ...e,
      sets: e.sets.map((s) => ({ ...s })),
    })),
    ...(template?.warmupItems?.length ? { warmupItems: template.warmupItems.map((w) => ({ ...w })) } : {}),
    ...(template?.warmupTip ? { warmupTip: template.warmupTip } : {}),
    ...(template?.sessionTip ? { sessionTip: template.sessionTip } : {}),
  };
}

function routineEditorSnapshot(t: WorkoutRoutineTemplate): string {
  return JSON.stringify({
    name: t.name,
    dayLabel: t.dayLabel,
    focus: t.focus,
    exercises: t.exercises.map((e) => ({
      id: e.id,
      name: e.name,
      label: e.label ?? "",
      target: e.target,
      setCount: e.sets.length,
    })),
  });
}

function isRoutineEditorDirty(
  template: WorkoutRoutineTemplate | null,
  name: string,
  dayLabel: string,
  focus: string,
  exercises: WorkoutExercise[],
): boolean {
  if (!template) return false;
  const draft = buildDraftTemplate(template, name, dayLabel, focus, exercises);
  return routineEditorSnapshot(draft) !== routineEditorSnapshot(template);
}

const fieldLabelStyle: CSSProperties = {
  ...labelStyle,
  display: "block",
  color: "var(--text-ghost)",
  marginBottom: 6,
};

type SearchSheetMode = { kind: "add" } | { kind: "swap"; exerciseId: string };

type WorkoutRoutineEditorProps = {
  template: WorkoutRoutineTemplate | null;
  customExercises: CustomExerciseTemplate[];
  equipmentSetup: EquipmentSetup;
  onSave: (t: WorkoutRoutineTemplate) => void;
  onSaveCustomExercise: (name: string, label: string) => void;
  onDelete: ((id: string) => void) | null;
  onClose: () => void;
  embedded?: boolean;
  saveLabel?: string;
  title?: string;
  progressLabel?: string;
};

function CollapsibleNoteRow({
  value,
  placeholder,
  onChange,
  disabled,
}: {
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = value.trim();

  if (expanded) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setExpanded(false)}
        placeholder={placeholder}
        style={{ ...workoutFieldInputStyle, marginBottom: 0 }}
        readOnly={disabled}
      />
    );
  }

  return (
    <button
      type="button"
      className="tap"
      disabled={disabled}
      onClick={() => setExpanded(true)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 0",
        background: "transparent",
        border: "none",
        textAlign: "left",
        color: trimmed ? "var(--text-muted-soft)" : "var(--text-ghost)",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <IconPencil size={14} stroke={1.75} style={{ flexShrink: 0, color: "var(--text-ghost)" }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {trimmed || placeholder}
      </span>
    </button>
  );
}

function CollapsibleFocusField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = value.trim();

  if (expanded) {
    return (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setExpanded(false)}
        placeholder="Coach notes, session focus, reminders…"
        rows={4}
        style={{
          ...workoutFieldInputStyle,
          minHeight: 96,
          resize: "vertical",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      />
    );
  }

  const preview = trimmed
    ? trimmed.length > 48
      ? `${trimmed.slice(0, 48)}…`
      : trimmed
    : null;

  return (
    <button
      type="button"
      className="tap"
      onClick={() => setExpanded(true)}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "0.5px solid var(--border)",
        background: "var(--card-2)",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 500,
        color: preview ? "var(--text-muted-soft)" : "var(--text-ghost)",
      }}
    >
      {preview ? (
        <>
          <span style={{ color: "var(--text-soft)" }}>Session focus: </span>
          {preview}
        </>
      ) : (
        "Add session focus (optional)"
      )}
    </button>
  );
}

function SetCountStepper({
  count,
  onChange,
  disabled,
}: {
  count: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const n = Math.min(Math.max(count, 1), 12);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--card-2)",
        border: "0.5px solid var(--border)",
        borderRadius: 10,
        padding: "4px 6px",
        minHeight: 42,
      }}
    >
      <button
        type="button"
        className="tap"
        disabled={disabled || n <= 1}
        aria-label="Decrease sets"
        onClick={() => onChange(n - 1)}
        style={{
          width: 32,
          height: 32,
          display: "grid",
          placeItems: "center",
          border: "none",
          background: "transparent",
          color: n <= 1 ? "var(--text-whisper)" : "var(--text-primary)",
        }}
      >
        <IconMinus size={16} stroke={2} />
      </button>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
      <button
        type="button"
        className="tap"
        disabled={disabled || n >= 12}
        aria-label="Increase sets"
        onClick={() => onChange(n + 1)}
        style={{
          width: 32,
          height: 32,
          display: "grid",
          placeItems: "center",
          border: "none",
          background: "transparent",
          color: n >= 12 ? "var(--text-whisper)" : "var(--text-primary)",
        }}
      >
        <IconPlus size={16} stroke={2} />
      </button>
    </div>
  );
}

const repStepperShellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "var(--card-2)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  padding: "4px 6px",
  minHeight: 38,
};

function RepBoundStepper({
  boundLabel,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  boundLabel: "Min" | "Max" | "Hold";
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const n = Math.min(Math.max(value, min), max);

  return (
    <div style={repStepperShellStyle}>
      <span
        style={{
          width: 28,
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-ghost)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {boundLabel}
      </span>
      <button
        type="button"
        className="tap"
        disabled={disabled || n <= min}
        aria-label={`Decrease ${boundLabel.toLowerCase()} reps`}
        onClick={() => onChange(n - 1)}
        style={{
          width: 28,
          height: 28,
          display: "grid",
          placeItems: "center",
          border: "none",
          background: "transparent",
          color: n <= min ? "var(--text-whisper)" : "var(--text-primary)",
        }}
      >
        <IconMinus size={15} stroke={2} />
      </button>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{n}</span>
      <button
        type="button"
        className="tap"
        disabled={disabled || n >= max}
        aria-label={`Increase ${boundLabel.toLowerCase()} reps`}
        onClick={() => onChange(n + 1)}
        style={{
          width: 28,
          height: 28,
          display: "grid",
          placeItems: "center",
          border: "none",
          background: "transparent",
          color: n >= max ? "var(--text-whisper)" : "var(--text-primary)",
        }}
      >
        <IconPlus size={15} stroke={2} />
      </button>
    </div>
  );
}

function RepRangeStepper({
  low,
  high,
  onChange,
  disabled,
}: {
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  disabled?: boolean;
}) {
  const lo = Math.min(Math.max(low, 1), 99);
  const hi = Math.min(Math.max(high, lo), 99);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <RepBoundStepper
        boundLabel="Min"
        value={lo}
        min={1}
        max={hi}
        disabled={disabled}
        onChange={(nextLow) => onChange(nextLow, Math.max(hi, nextLow))}
      />
      <RepBoundStepper
        boundLabel="Max"
        value={hi}
        min={lo}
        max={99}
        disabled={disabled}
        onChange={(nextHigh) => onChange(lo, nextHigh)}
      />
    </div>
  );
}

export function WorkoutRoutineEditor({
  template,
  customExercises,
  equipmentSetup,
  onSave,
  onSaveCustomExercise,
  onDelete,
  onClose,
  embedded = false,
  saveLabel = "Save workout",
  title,
  progressLabel,
}: WorkoutRoutineEditorProps) {
  const [name, setName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [focus, setFocus] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [searchSheet, setSearchSheet] = useState<SearchSheetMode | null>(null);
  const [pendingExerciseDelete, setPendingExerciseDelete] = useState<{
    id: string;
    name: string;
    label?: string;
  } | null>(null);
  const [pendingRoutineDelete, setPendingRoutineDelete] = useState(false);
  const [pendingSaveConfirm, setPendingSaveConfirm] = useState(false);
  const exerciseListEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pendingScrollToNewExerciseRef = useRef(false);

  const templateId = template?.id ?? null;

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDayLabel(template.dayLabel);
      setFocus(template.focus);
      setExercises(template.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })));
    } else {
      setName("");
      setDayLabel("");
      setFocus("");
      setExercises([]);
    }
    setSearchSheet(null);
  }, [templateId]);

  useEffect(() => {
    if (!pendingScrollToNewExerciseRef.current) return;
    pendingScrollToNewExerciseRef.current = false;
    requestAnimationFrame(() => {
      exerciseListEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [exercises.length]);

  function patchExercise(id: string, patch: Partial<WorkoutExercise> & { setCount?: number; repLow?: number; repHigh?: number; target?: string }) {
    setExercises((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        let sets = row.sets;
        let target = row.target;

        if (typeof patch.setCount === "number") {
          sets = resizeWorkoutSets(row.sets, patch.setCount);
          target = formatWorkoutTarget(sets.length, parseWorkoutTarget(row.target).repRange);
        }

        if (typeof patch.repLow === "number" || typeof patch.repHigh === "number") {
          const { low, high } = parseRepRangeBounds(parseWorkoutTarget(row.target).repRange);
          const nextLow = typeof patch.repLow === "number" ? patch.repLow : low;
          const nextHigh = typeof patch.repHigh === "number" ? patch.repHigh : high;
          const repRange = formatPrescriptionRepRange(row, nextLow, nextHigh);
          target = syncTargetRepRange(row.target, repRange, sets.length);
        }

        if (typeof patch.target === "string") {
          target = patch.target;
        }

        const next: WorkoutExercise = { ...row, sets, target };
        if (patch.name !== undefined) next.name = patch.name;
        if ("label" in patch) {
          const trimmed = typeof patch.label === "string" ? patch.label.trim() : "";
          if (trimmed) next.label = trimmed;
          else delete next.label;
        }
        return next;
      }),
    );
  }

  function removeExercise(id: string) {
    setExercises((rows) => rows.filter((r) => r.id !== id));
  }

  function requestDeleteExercise(row: WorkoutExercise) {
    setPendingExerciseDelete({
      id: row.id,
      name: row.name.trim() || "Untitled exercise",
      label: row.label,
    });
  }

  function confirmDeleteExercise() {
    if (!pendingExerciseDelete) return;
    removeExercise(pendingExerciseDelete.id);
    setPendingExerciseDelete(null);
  }

  function handleExerciseSelect(exName: string, exLabel?: string) {
    if (searchSheet?.kind === "swap") {
      const row = exercises.find((e) => e.id === searchSheet.exerciseId);
      const setCount = row?.sets.length ?? 3;
      const fallback = row ? parseWorkoutTarget(row.target).repRange : "8-12";
      patchExercise(searchSheet.exerciseId, {
        name: exName,
        ...(exLabel ? { label: exLabel } : { label: "" }),
        target: defaultExerciseTarget(exName, exLabel, setCount, fallback),
      });
    } else {
      setExercises((rows) => [...rows, newTemplateExerciseLine(exName, { label: exLabel, setCount: 3 })]);
      pendingScrollToNewExerciseRef.current = true;
    }
    setSearchSheet(null);
  }

  function handleSaveCustomAndAdd(name: string, label: string) {
    onSaveCustomExercise(name, label);
    handleExerciseSelect(name, label.trim() || undefined);
  }

  function handleSave() {
    onSave(buildDraftTemplate(template, name, dayLabel, focus, exercises));
  }

  function handleSaveClick() {
    if (isRoutineEditorDirty(template, name, dayLabel, focus, exercises)) {
      setPendingSaveConfirm(true);
      return;
    }
    handleSave();
  }

  function confirmSave() {
    setPendingSaveConfirm(false);
    handleSave();
  }

  function handleDelete() {
    if (!template?.id || !onDelete) return;
    setPendingRoutineDelete(true);
  }

  function confirmDeleteRoutine() {
    if (!template?.id || !onDelete) return;
    onDelete(template.id);
    setPendingRoutineDelete(false);
    onClose();
  }

  const headerTitle = title ?? (template ? "Edit workout" : "New workout");
  const namePlaceholder = dayLabel.trim() ? defaultWorkoutName(dayLabel) : headerTitle;
  const nameFieldChars = Math.max((name || namePlaceholder).length, 6);

  const body = (
    <>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="screen page-transition" style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        <div className="between" style={{ alignItems: "center", marginBottom: 8 }}>
          <button
            type="button"
            className="tap"
            onClick={onClose}
            aria-label="Back to workouts"
            style={{ color: SECONDARY_ACTION_COLOR, fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
          >
            ← Back
          </button>
        </div>

        <div style={{ paddingTop: 4, paddingBottom: 8 }}>
          <div className="h-greeting">{progressLabel ? `WORKOUT ${progressLabel}` : "WORKOUTS"}</div>
          <div className="workout-name-field">
            <div className="workout-name-input-wrap">
              <input
                ref={nameInputRef}
                className="workout-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                style={{
                  ...workoutNameInputStyle,
                  width: `${nameFieldChars}ch`,
                  maxWidth: "100%",
                }}
                aria-label="Workout name"
              />
            </div>
            <button
              type="button"
              className="tap"
              aria-label="Edit workout name"
              onClick={() => {
                const input = nameInputRef.current;
                if (!input) return;
                input.focus();
                input.select();
              }}
              style={{
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                width: 28,
                height: 28,
                padding: 0,
                border: "none",
                background: "transparent",
                color: "var(--text-ghost)",
              }}
            >
              <IconPencil size={16} stroke={1.75} />
            </button>
          </div>
        </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <div>
              <div style={fieldLabelStyle}>DAY TAG</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DAY_PRESETS.map((d) => {
                  const selected = dayLabel === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      className="tap"
                      onClick={() => setDayLabel(d)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: selected ? "none" : "0.5px solid var(--border)",
                        background: selected ? ACCENT_BLUE : "transparent",
                        color: selected ? "#fff" : "var(--text-soft)",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <CollapsibleFocusField value={focus} onChange={setFocus} />
          </div>

          <div className="between" style={{ marginTop: 24, marginBottom: 10 }}>
            <span className="label">Exercises</span>
            <span style={{ fontSize: 12, color: "var(--text-ghost)" }}>
              {exercises.length} move{exercises.length === 1 ? "" : "s"} · hold grip to reorder
            </span>
          </div>

          <SortableExerciseList
            items={exercises}
            onReorder={setExercises}
            gap={EDITOR_LIST_GAP}
            dragHandleTapSize={44}
            renderItem={(row, ri, handle, ctx) => {
              const { repRange } = parseWorkoutTarget(row.target);
              const { low, high } = parseRepRangeBounds(repRange);
              const usesSec = usesSecFieldForExercise(row);

              return (
                <div
                  className="card"
                  style={{
                    padding: CARD_PADDING,
                    pointerEvents: ctx.isOverlay ? "none" : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                    <ExerciseDragHandle handle={handle} tapSize={44} disabled={ctx.isListDragging && !handle.isDragging} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span style={{ fontSize: 10, color: "var(--text-ghost)", fontWeight: 600, flexShrink: 0 }}>
                          #{ri + 1}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 15,
                            fontWeight: 600,
                            letterSpacing: "-0.01em",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: row.name.trim() ? "var(--text-primary)" : "var(--text-ghost)",
                          }}
                        >
                          {row.name.trim() || "Choose exercise"}
                        </span>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Swap ${row.name.trim() || "exercise"}`}
                          disabled={ctx.isOverlay || ctx.isListDragging}
                          onClick={() => setSearchSheet({ kind: "swap", exerciseId: row.id })}
                          style={{
                            flexShrink: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: SECONDARY_ACTION_COLOR,
                            background: "none",
                            border: "none",
                            padding: "4px 0",
                          }}
                        >
                          Swap
                        </button>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Remove ${row.name.trim() || "exercise"}`}
                          disabled={ctx.isListDragging}
                          onClick={() => requestDeleteExercise(row)}
                          style={{
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            width: 36,
                            height: 36,
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            color: "#FF6961",
                          }}
                        >
                          <IconTrash size={18} stroke={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={fieldLabelStyle}>Sets</span>
                      <SetCountStepper
                        count={row.sets.length}
                        disabled={ctx.isOverlay}
                        onChange={(setCount) => patchExercise(row.id, { setCount })}
                      />
                    </div>
                    <div>
                      <span style={fieldLabelStyle}>{usesSec ? "Sec" : "Reps"}</span>
                      {usesSec ? (
                        <RepBoundStepper
                          boundLabel="Hold"
                          value={low}
                          min={5}
                          max={300}
                          disabled={ctx.isOverlay}
                          onChange={(sec) => patchExercise(row.id, { repLow: sec, repHigh: sec })}
                        />
                      ) : (
                        <RepRangeStepper
                          low={low}
                          high={high}
                          disabled={ctx.isOverlay}
                          onChange={(repLow, repHigh) => patchExercise(row.id, { repLow, repHigh })}
                        />
                      )}
                    </div>
                  </div>

                  <CollapsibleNoteRow
                    value={row.label ?? ""}
                    placeholder="Add note (optional)"
                    disabled={ctx.isOverlay}
                    onChange={(label) => patchExercise(row.id, { label })}
                  />
                </div>
              );
            }}
          />
          <div ref={exerciseListEndRef} aria-hidden="true" style={{ height: 0 }} />
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: "12px 20px max(20px, calc(env(safe-area-inset-bottom, 0px) + 16px))",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--bg)",
            borderTop: "0.5px solid var(--border)",
          }}
        >
          <button
            type="button"
            className="tap"
            onClick={() => setSearchSheet({ kind: "add" })}
            style={{
              width: "100%",
              background: "var(--card)",
              border: "0.5px solid var(--border-strong, var(--border))",
              borderRadius: BUTTON_RADIUS,
              padding: 14,
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IconPlus size={16} stroke={2} /> Add exercise to workout
          </button>

          <button
            type="button"
            className="tap"
            onClick={handleSaveClick}
            style={{
              width: "100%",
              background: ACCENT_BLUE,
              border: "none",
              borderRadius: BUTTON_RADIUS,
              padding: 14,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {saveLabel}
          </button>

          {onDelete && template?.id ? (
            <button
              type="button"
              className="tap"
              onClick={handleDelete}
              style={{
                width: "100%",
                padding: 10,
                background: "transparent",
                border: "none",
                color: "var(--text-ghost)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              Delete workout
            </button>
          ) : null}
        </div>
      </div>

      {searchSheet ? (
        <RoutineExerciseSearchSheet
          open
          title={searchSheet.kind === "add" ? "Add exercise" : "Swap exercise"}
          equipmentSetup={equipmentSetup}
          customExercises={customExercises}
          onSelect={handleExerciseSelect}
          onSaveCustomAndAdd={handleSaveCustomAndAdd}
          onClose={() => setSearchSheet(null)}
        />
      ) : null}

      {pendingExerciseDelete ? (
        <DeleteExerciseConfirmSheet
          exerciseName={pendingExerciseDelete.name}
          exerciseLabel={pendingExerciseDelete.label}
          onCancel={() => setPendingExerciseDelete(null)}
          onConfirm={confirmDeleteExercise}
        />
      ) : null}

      {pendingSaveConfirm ? (
        <SaveWorkoutConfirmSheet
          workoutName={resolvedWorkoutName(name, dayLabel.trim())}
          onCancel={() => setPendingSaveConfirm(false)}
          onSave={confirmSave}
        />
      ) : null}

      {pendingRoutineDelete ? (
        <DeleteConfirmSheet
          title="Delete workout?"
          cancelLabel="Keep workout"
          confirmLabel="Delete workout"
          zIndex={1300}
          message={
            <>
              Delete <strong style={{ color: "var(--text-primary)" }}>{name.trim() || template?.name.trim() || "this workout"}</strong>?
              This can&apos;t be undone.
            </>
          }
          onCancel={() => setPendingRoutineDelete(false)}
          onConfirm={confirmDeleteRoutine}
        />
      ) : null}
    </>
  );

  if (embedded) {
    return body;
  }

  return (
    <FullScreenOverlay open zIndex={120} motionVariant="fade">
      {body}
    </FullScreenOverlay>
  );
}
