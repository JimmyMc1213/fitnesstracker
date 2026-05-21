import { useEffect, useState, type CSSProperties } from "react";

import { EXERCISE_DB, newTemplateExerciseLine, resizeWorkoutSets } from "../data";
import { IconPlus, IconSearch, IconTrash } from "../icons";
import { ExerciseDragHandle, SortableExerciseList } from "../SortableExerciseList";
import { ScreenHeader } from "../shared";
import type { CustomExerciseTemplate, WorkoutExercise, WorkoutRoutineTemplate } from "../types";
import { ACCENT_GREEN, CARD_PADDING, EDITOR_LIST_GAP, labelStyle } from "../workoutUiTokens";

/** Pass as `editingRoutineId` to open the editor for a brand-new routine. */
export const NEW_ROUTINE_EDITOR_ID = "__new__";

const ACCENT_BLUE = "#0A84FF";
const DAY_PRESETS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const fieldLabelStyle: CSSProperties = {
  ...labelStyle,
  display: "block",
  color: "rgba(255,255,255,0.35)",
  marginBottom: 6,
};

type WorkoutRoutineEditorProps = {
  template: WorkoutRoutineTemplate | null;
  customExercises: CustomExerciseTemplate[];
  onSave: (t: WorkoutRoutineTemplate) => void;
  onDelete: ((id: string) => void) | null;
  onClose: () => void;
};

export function WorkoutRoutineEditor({
  template,
  customExercises,
  onSave,
  onDelete,
  onClose,
}: WorkoutRoutineEditorProps) {
  const [name, setName] = useState("");
  const [dayLabel, setDayLabel] = useState("");
  const [focus, setFocus] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [exQuery, setExQuery] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
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
    setShowPicker(false);
    setExQuery("");
    setDraftName("");
    setDraftLabel("");
  }, [template]);

  const qLow = exQuery.trim().toLowerCase();
  const filteredBuiltin = EXERCISE_DB.filter((n) => !qLow || n.toLowerCase().includes(qLow));
  const filteredCustom = customExercises.filter(
    (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
  );

  const inputStyle: CSSProperties = {
    background: "#1A1A1A",
    border: "0.5px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#fff",
    fontFamily: "var(--ui)",
    fontSize: 14,
    fontWeight: 500,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  function patchExercise(id: string, patch: Partial<WorkoutExercise> & { setCount?: number }) {
    setExercises((rows) =>
      rows.map((row) => {
        if (row.id !== id) return row;
        let sets = row.sets;
        if (typeof patch.setCount === "number") {
          sets = resizeWorkoutSets(row.sets, patch.setCount);
        }
        const next: WorkoutExercise = { ...row, sets };
        if (patch.name !== undefined) next.name = patch.name;
        if (patch.target !== undefined) next.target = patch.target;
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

  function appendFromCatalog(exName: string, exLabel?: string) {
    setExercises((rows) => [...rows, newTemplateExerciseLine(exName, { label: exLabel })]);
    setShowPicker(false);
    setExQuery("");
  }

  function appendDraftCustom() {
    const n = draftName.trim();
    if (!n) return;
    setExercises((rows) => [...rows, newTemplateExerciseLine(n, { label: draftLabel.trim() || undefined })]);
    setDraftName("");
    setDraftLabel("");
  }

  function handleSave() {
    const id = template?.id ?? `tpl_${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    onSave({
      id,
      name: name.trim() || "Untitled",
      dayLabel: dayLabel.trim(),
      focus: focus.trim(),
      exercises: exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      })),
      ...(template?.warmupItems?.length ? { warmupItems: template.warmupItems.map((w) => ({ ...w })) } : {}),
      ...(template?.warmupTip ? { warmupTip: template.warmupTip } : {}),
      ...(template?.sessionTip ? { sessionTip: template.sessionTip } : {}),
    });
  }

  function handleDelete() {
    if (!template?.id || !onDelete) return;
    const routineName = name.trim() || template.name.trim() || "this routine";
    if (typeof window !== "undefined" && !window.confirm(`Delete "${routineName}"? This cannot be undone.`)) return;
    onDelete(template.id);
    onClose();
  }

  return (
    <div className="screen page-transition">
      <div className="between" style={{ alignItems: "center", marginBottom: 8, marginTop: 4 }}>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{ color: ACCENT_BLUE, fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
        >
          ← Back
        </button>
      </div>
      <ScreenHeader eyebrow="ROUTINES" title={template ? "Edit routine" : "New routine"} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Routine name" style={inputStyle} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
            DAY TAG
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {DAY_PRESETS.map((d) => (
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
                  border: dayLabel === d ? `0.5px solid ${ACCENT_BLUE}` : "0.5px solid var(--border)",
                  background: dayLabel === d ? "rgba(10,132,255,0.2)" : "rgba(255,255,255,0.05)",
                  color: dayLabel === d ? "#6EB7FF" : "rgba(255,255,255,0.7)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
          <input
            value={dayLabel}
            onChange={(e) => setDayLabel(e.target.value)}
            placeholder="Or custom tag (e.g. Push)"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="routine-focus-notes" style={fieldLabelStyle}>
            Notes / focus
          </label>
          <textarea
            id="routine-focus-notes"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Coach notes, session focus, reminders…"
            rows={4}
            style={{
              ...inputStyle,
              minHeight: 96,
              resize: "vertical",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>

      <div className="between" style={{ marginTop: 24, marginBottom: 10 }}>
        <span className="label">Exercises</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{exercises.length} move{exercises.length === 1 ? "" : "s"}</span>
      </div>

      <SortableExerciseList
        items={exercises}
        onReorder={setExercises}
        gap={EDITOR_LIST_GAP}
        dragHandleTapSize={44}
        renderItem={(row, ri, handle, ctx) => (
          <div
            className="card"
            style={{
              padding: CARD_PADDING,
              pointerEvents: ctx.isOverlay ? "none" : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <ExerciseDragHandle handle={handle} tapSize={44} disabled={ctx.isListDragging && !handle.isDragging} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, flexShrink: 0, width: 20 }}>
                #{ri + 1}
              </span>
              <input
                value={row.name}
                onChange={(e) => patchExercise(row.id, { name: e.target.value })}
                placeholder="Exercise name"
                style={{ ...inputStyle, flex: 1, minWidth: 0, marginBottom: 0 }}
                readOnly={ctx.isOverlay}
              />
              <button
                type="button"
                className="tap"
                aria-label={`Remove ${row.name.trim() || "exercise"}`}
                disabled={ctx.isListDragging}
                onClick={() => removeExercise(row.id)}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: 8 }}>
              <div>
                <span style={fieldLabelStyle}>Target</span>
                <input
                  value={row.target}
                  onChange={(e) => patchExercise(row.id, { target: e.target.value })}
                  placeholder="e.g. 4 × 8–10"
                  style={inputStyle}
                  readOnly={ctx.isOverlay}
                />
              </div>
              <div>
                <span style={fieldLabelStyle}>Sets</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={row.sets.length}
                  onChange={(e) => patchExercise(row.id, { setCount: +e.target.value || 1 })}
                  aria-label="Number of sets"
                  style={{ ...inputStyle, textAlign: "center" }}
                  readOnly={ctx.isOverlay}
                />
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={fieldLabelStyle}>Label</span>
              <input
                value={row.label ?? ""}
                onChange={(e) => patchExercise(row.id, { label: e.target.value })}
                placeholder="Optional (e.g. machine setting)"
                style={inputStyle}
                readOnly={ctx.isOverlay}
              />
            </div>
          </div>
        )}
      />

      {showPicker ? (
        <div className="card" style={{ padding: CARD_PADDING, marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 10,
            }}
          >
            Add exercise
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="New name" style={inputStyle} />
            <input value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} placeholder="Label (optional)" style={inputStyle} />
            <button
              type="button"
              className="tap"
              onClick={appendDraftCustom}
              disabled={!draftName.trim()}
              style={{
                width: "100%",
                background: draftName.trim() ? ACCENT_BLUE : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 10,
                padding: 12,
                color: draftName.trim() ? "#fff" : "rgba(255,255,255,0.35)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Add with this name
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "rgba(255,255,255,0.4)" }} />
            <input
              className="input"
              style={{ paddingLeft: 36, background: "#1A1A1A" }}
              placeholder="Search catalog…"
              value={exQuery}
              onChange={(e) => setExQuery(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {filteredCustom.length > 0 ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", padding: "6px 4px" }}>Your exercises</div>
                {filteredCustom.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="tap"
                    onClick={() => appendFromCatalog(c.name, c.label || undefined)}
                    style={{
                      padding: "10px 6px",
                      textAlign: "left",
                      borderBottom: "0.5px solid var(--border)",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>
                      {c.name}
                      {c.label ? <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{c.label}</span> : null}
                    </span>
                    <IconPlus size={14} stroke={2} style={{ color: "#fff", flexShrink: 0 }} />
                  </button>
                ))}
              </>
            ) : null}
            {filteredBuiltin.length > 0 ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", padding: "6px 4px" }}>Catalog</div>
                {filteredBuiltin.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="tap"
                    onClick={() => appendFromCatalog(n)}
                    style={{
                      padding: "10px 6px",
                      textAlign: "left",
                      borderBottom: "0.5px solid var(--border)",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{n}</span>
                    <IconPlus size={14} stroke={2} style={{ color: "#fff" }} />
                  </button>
                ))}
              </>
            ) : null}
          </div>
          <button
            type="button"
            className="tap"
            onClick={() => {
              setShowPicker(false);
              setExQuery("");
              setDraftName("");
              setDraftLabel("");
            }}
            style={{ marginTop: 8, width: "100%", color: "rgba(255,255,255,0.4)", fontSize: 12, padding: 6, fontWeight: 500 }}
          >
            Close picker
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="tap"
          onClick={() => setShowPicker(true)}
          style={{
            marginTop: 12,
            width: "100%",
            background: "rgba(10,132,255,0.15)",
            border: "0.5px solid rgba(10,132,255,0.4)",
            borderRadius: 12,
            padding: 14,
            color: "#6EB7FF",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <IconPlus size={16} stroke={2} /> Add exercise to routine
        </button>
      )}

      <button
        type="button"
        className="tap"
        onClick={handleSave}
        style={{
          marginTop: 20,
          width: "100%",
          background: ACCENT_GREEN,
          color: "#0a0a0a",
          borderRadius: 12,
          padding: 16,
          fontSize: 15,
          fontWeight: 700,
          border: "none",
        }}
      >
        Save routine
      </button>

      {onDelete && template?.id ? (
        <button
          type="button"
          className="tap"
          onClick={handleDelete}
          style={{
            marginTop: 16,
            width: "100%",
            padding: 10,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "underline",
          }}
        >
          Delete routine
        </button>
      ) : null}

      <div style={{ height: 16 }} />
    </div>
  );
}
