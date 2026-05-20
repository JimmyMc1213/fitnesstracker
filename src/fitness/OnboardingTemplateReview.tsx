import { useState } from "react";

import { EXERCISE_DB, newTemplateExerciseLine, resizeWorkoutSets } from "./data";
import { ExerciseDragHandle, SortableExerciseList } from "./SortableExerciseList";
import type { WorkoutExercise, WorkoutRoutineTemplate } from "./types";

type Props = {
  templates: WorkoutRoutineTemplate[];
  onChange: (next: WorkoutRoutineTemplate[]) => void;
};

export function OnboardingTemplateReview({ templates, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(templates[0]?.id ?? null);
  const [swapTarget, setSwapTarget] = useState<{ routineId: string; exerciseId: string } | null>(null);

  function updateRoutine(routineId: string, patch: Partial<WorkoutRoutineTemplate>) {
    onChange(templates.map((t) => (t.id === routineId ? { ...t, ...patch } : t)));
  }

  function updateExercises(routineId: string, exercises: WorkoutExercise[]) {
    updateRoutine(routineId, { exercises });
  }

  function patchExercise(routineId: string, exerciseId: string, patch: Partial<WorkoutExercise> & { setCount?: number }) {
    const routine = templates.find((t) => t.id === routineId);
    if (!routine) return;
    const exercises = routine.exercises.map((row) => {
      if (row.id !== exerciseId) return row;
      let sets = row.sets;
      if (typeof patch.setCount === "number") sets = resizeWorkoutSets(row.sets, patch.setCount);
      return { ...row, ...patch, sets };
    });
    updateExercises(routineId, exercises);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {templates.map((routine) => {
        const open = expandedId === routine.id;
        return (
          <div key={routine.id} className="card" style={{ padding: 14 }}>
            <button
              type="button"
              className="tap between"
              style={{ width: "100%", background: "none", border: "none", color: "#fff", padding: 0 }}
              onClick={() => setExpandedId(open ? null : routine.id)}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{routine.dayLabel} · {routine.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{routine.focus}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>{open ? "−" : "+"}</span>
            </button>
            {open ? (
              <div style={{ marginTop: 14 }}>
                <SortableExerciseList
                  items={routine.exercises}
                  gap={8}
                  onReorder={(next) => updateExercises(routine.id, next)}
                  renderItem={(row, _ix, handle, ctx) => (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        padding: 10,
                        borderRadius: 10,
                        background: "#1A1A1A",
                        border: "0.5px solid var(--border)",
                      }}
                    >
                      <ExerciseDragHandle handle={handle} disabled={ctx.isListDragging && !handle.isDragging} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{row.name}</div>
                        <input
                          aria-label={`Target for ${row.name}`}
                          value={row.target}
                          onChange={(e) => patchExercise(routine.id, row.id, { target: e.target.value })}
                          style={{
                            width: "100%",
                            background: "#111",
                            border: "0.5px solid var(--border)",
                            borderRadius: 8,
                            padding: "8px 10px",
                            color: "#fff",
                            fontSize: 13,
                          }}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Sets</span>
                          <input
                            type="number"
                            min={1}
                            max={6}
                            aria-label={`Set count for ${row.name}`}
                            value={row.sets.length}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              if (Number.isFinite(n)) patchExercise(routine.id, row.id, { setCount: n });
                            }}
                            style={{
                              width: 56,
                              background: "#111",
                              border: "0.5px solid var(--border)",
                              borderRadius: 8,
                              padding: "6px 8px",
                              color: "#fff",
                              fontSize: 13,
                            }}
                          />
                          <button
                            type="button"
                            className="tap"
                            style={{
                              marginLeft: "auto",
                              fontSize: 12,
                              color: "rgba(255,255,255,0.5)",
                              background: "none",
                              border: "none",
                            }}
                            onClick={() => setSwapTarget({ routineId: routine.id, exerciseId: row.id })}
                          >
                            Swap
                          </button>
                          <button
                            type="button"
                            className="tap"
                            style={{ fontSize: 12, color: "#ff6b6b", background: "none", border: "none" }}
                            onClick={() =>
                              updateExercises(
                                routine.id,
                                routine.exercises.filter((e) => e.id !== row.id),
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                />
                {swapTarget?.routineId === routine.id ? (
                  <div style={{ marginTop: 12, maxHeight: 160, overflowY: "auto" }}>
                    <div className="label" style={{ marginBottom: 8 }}>Pick replacement exercise</div>
                    {EXERCISE_DB.slice(0, 24).map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="tap"
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          marginBottom: 4,
                          borderRadius: 8,
                          border: "0.5px solid var(--border)",
                          background: "#111",
                          color: "#fff",
                          fontSize: 13,
                        }}
                        onClick={() => {
                          const replacement = newTemplateExerciseLine(name);
                          updateExercises(
                            routine.id,
                            routine.exercises.map((e) =>
                              e.id === swapTarget.exerciseId ? { ...replacement, id: e.id } : e,
                            ),
                          );
                          setSwapTarget(null);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="tap"
                      style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.5)", background: "none", border: "none" }}
                      onClick={() => setSwapTarget(null)}
                    >
                      Cancel swap
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
