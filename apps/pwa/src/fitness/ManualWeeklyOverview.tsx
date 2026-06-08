import { weekdayFullName } from "./trainingCalendar";
import type { WorkoutRoutineTemplate } from "./types";

type ManualWeeklyOverviewProps = {
  templates: WorkoutRoutineTemplate[];
  onEditDay: (index: number) => void;
};

function exerciseSummary(count: number): string {
  if (count === 0) return "No exercises yet";
  return `${count} exercise${count === 1 ? "" : "s"}`;
}

export function ManualWeeklyOverview({ templates, onEditDay }: ManualWeeklyOverviewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {templates.map((template, index) => (
        <button
          key={template.id}
          type="button"
          className="tap onboarding-gradient-card"
          onClick={() => onEditDay(index)}
          style={{
            width: "100%",
            textAlign: "left",
            padding: 16,
            border: "0.5px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {weekdayFullName(template.dayLabel)} · {template.name}
              </div>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: "var(--text-muted-soft)" }}>
                {exerciseSummary(template.exercises.length)}
              </div>
            </div>
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                fontSize: 18,
                lineHeight: 1,
                color: "var(--text-ghost)",
              }}
            >
              ›
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
