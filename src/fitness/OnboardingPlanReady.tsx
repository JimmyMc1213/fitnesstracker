import { weekdayShort } from "./trainingCalendar";
import type { MacroTotals, OnboardingProfile, WorkoutRoutineTemplate } from "./types";

type Props = {
  displayName: string;
  macros: MacroTotals;
  profile: OnboardingProfile;
  templates: WorkoutRoutineTemplate[];
};

export function OnboardingPlanReady({ displayName, macros, profile, templates }: Props) {
  const todayLabel = weekdayShort(new Date());
  const todayTemplate = templates.find((t) => t.dayLabel === todayLabel);
  const weekdays = profile.trainingWeekdays ?? templates.map((t) => t.dayLabel);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Today
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginTop: 6 }}>
          {todayTemplate ? `${todayTemplate.name}` : "Rest day"}
        </div>
        {todayTemplate ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{todayTemplate.focus}</div>
        ) : (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Recovery — focus on fuel and sleep.</div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Daily fuel
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10, fontSize: 14, color: "#fff" }}>
          <span>{macros.cal} kcal</span>
          <span>{macros.p}g protein</span>
          <span>{macros.c}g carbs</span>
          <span>{macros.f}g fat</span>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Your week
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {weekdays.map((day) => {
            const routine = templates.find((t) => t.dayLabel === day);
            return (
              <span
                key={day}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: routine ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  color: routine ? "#fff" : "rgba(255,255,255,0.4)",
                }}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {displayName.trim() ? null : (
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Your personalized Gymmy plan is ready.</p>
      )}
    </div>
  );
}
