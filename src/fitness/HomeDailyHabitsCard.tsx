import { IconBolt, IconDroplet, IconMoon, IconRun } from "./icons";
import { buildHabitsForDateKey, planWeekIndex } from "./data";
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
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);

  return (
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
          Daily habits
        </h2>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          {doneCount}/{habits.length}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {habits.map((habit) => {
          const IconComp =
            habit.icon === "drop" ? IconDroplet : habit.icon === "run" ? IconRun : habit.icon === "bolt" ? IconBolt : IconMoon;
          return (
            <div
              key={habit.id}
              className="card"
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderColor: "var(--border)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: habit.done ? "rgba(255,255,255,0.08)" : "var(--surface-2)",
                  display: "grid",
                  placeItems: "center",
                  color: habit.done ? "var(--text-primary)" : "var(--text-ghost)",
                  flexShrink: 0,
                }}
              >
                <IconComp size={16} stroke={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
                  {habit.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 400 }}>
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
                    background: habit.done ? "var(--toggle-track-on)" : "var(--toggle-track-off)",
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
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function habitsForDateKey(state: AppState, dateKey: string, _todayKey: string): Habit[] {
  return buildHabitsForDateKey(state.habitTemplates, state.habitsDoneByDay, dateKey);
}
