import { estimatedSessionLabel } from "./estimateSessionDuration";
import type { WorkoutRoutineTemplate } from "./types";

export function OnboardingSplitReveal({ templates }: { templates: WorkoutRoutineTemplate[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {templates.map((routine) => {
        const sessionEstimate = routine.exercises.length > 0 ? estimatedSessionLabel(routine) : null;
        return (
          <div key={routine.id} className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              {routine.dayLabel} · {routine.name}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{routine.focus}</div>
            {sessionEstimate ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{sessionEstimate}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
