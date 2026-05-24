import type { CompletedWorkoutSession } from "./types";

function formatSet(w: number, r: number): string {
  if (w > 0) return `${w} lb × ${r} rep${r === 1 ? "" : "s"}`;
  return `${r} rep${r === 1 ? "" : "s"}`;
}

export function WorkoutSessionBreakdown({ session }: { session: CompletedWorkoutSession }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {session.exercises.map((ex) => (
        <div key={ex.id}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {ex.name}
            {ex.label ? (
              <span style={{ fontWeight: 500, color: "var(--text-ghost)" }}> · {ex.label}</span>
            ) : null}
          </div>
          <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
            {ex.sets.map((st, i) => (
              <li
                key={`${ex.id}-${i}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-muted-soft)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                Set {i + 1}: {formatSet(st.w, st.r)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
