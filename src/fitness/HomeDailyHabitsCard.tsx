import { IconBolt, IconDroplet, IconMoon, IconRun } from "./icons";
import { planWeekIndex } from "./data";
import type { AppState, Habit } from "./types";

type Props = {
  habits: Habit[];
  stepsTarget: number;
  planStartIso: string;
  dateKey: string;
  readOnly?: boolean;
  onToggle: (id: string) => void;
};

export function HomeDailyHabitsCard({ habits, stepsTarget, planStartIso, dateKey, readOnly = false, onToggle }: Props) {
  if (habits.length === 0) return null;

  const doneCount = habits.filter((h) => h.done).length;
  const progressPct = habits.length > 0 ? doneCount / habits.length : 0;
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);

  return (
    <div className="card" style={{ padding: 16, marginTop: 18 }}>
      <div className="between" style={{ alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>Daily habits</div>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          {doneCount}/{habits.length}
        </span>
      </div>
      <div className="barTrack" style={{ height: 3, marginBottom: 12 }}>
        <div className="barFill" style={{ width: `${progressPct * 100}%` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {habits.map((habit) => {
          const IconComp =
            habit.icon === "drop" ? IconDroplet : habit.icon === "run" ? IconRun : habit.icon === "bolt" ? IconBolt : IconMoon;
          return (
            <div
              key={habit.id}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  display: "grid",
                  placeItems: "center",
                  color: habit.done ? "#fff" : "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              >
                <IconComp size={14} stroke={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>{habit.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, fontWeight: 400 }}>
                  {habit.done
                    ? "Done"
                    : habit.subtitle?.trim()
                      ? habit.subtitle.trim()
                      : habit.icon === "run"
                        ? `${stepsTarget.toLocaleString()} steps · Week ${progWeek}`
                        : "Not yet today"}
                </div>
              </div>
              {readOnly ? (
                <div
                  aria-hidden
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    background: habit.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onToggle(habit.id)}
                  className="tap"
                  aria-label={habit.done ? "Mark incomplete" : "Mark complete"}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    background: habit.done ? "#ffffff" : "rgba(255,255,255,0.1)",
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
                      background: habit.done ? "#0a0a0a" : "#fff",
                      transition: "left .2s ease, background .2s ease",
                    }}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function habitsForDateKey(state: AppState, dateKey: string, todayKey: string): Habit[] {
  const doneMap = state.habitsDoneByDay[dateKey] ?? {};
  return state.habits.map((h) => ({
    ...h,
    done: dateKey === todayKey ? (doneMap[h.id] ?? h.done) : (doneMap[h.id] ?? false),
  }));
}
