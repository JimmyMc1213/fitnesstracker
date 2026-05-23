import { IconBolt, IconDroplet, IconMoon, IconRun } from "../icons";
import { localDateKey } from "../dailyPlan";
import { planWeekIndex } from "../data";
import { ScreenHeader, SectionLabel } from "../shared";
import type { ScreenProps } from "../types";

export function ScreenHabits({ state, setState }: ScreenProps) {
  const habitsDone = state.habits.filter((h) => h.done).length;
  const progWeek = planWeekIndex(new Date(), state.planStartIso);
  const stepsGoal = state.stepsTarget;

  function toggleHabit(id: string) {
    const key = localDateKey(new Date());
    setState((s) => {
      const hRow = s.habits.find((h) => h.id === id);
      const nextDone = !hRow?.done;
      const todayMap = { ...(s.habitsDoneByDay[key] ?? {}), [id]: nextDone };
      return {
        ...s,
        habits: s.habits.map((h) => (h.id === id ? { ...h, done: nextDone } : h)),
        habitsDoneByDay: { ...s.habitsDoneByDay, [key]: todayMap },
      };
    });
  }

  const todayEyebrow = new Date()
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .replace(",", "")
    .toUpperCase();

  return (
    <div className="screen page-transition">
      <ScreenHeader eyebrow={todayEyebrow} title="Habits" />

      <SectionLabel
        right={
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            {habitsDone}/{state.habits.length}
          </span>
        }
      >
        Daily habits
      </SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {state.habits.map((habit) => {
          const IconComp =
            habit.icon === "drop"
              ? IconDroplet
              : habit.icon === "run"
                ? IconRun
                : habit.icon === "bolt"
                  ? IconBolt
                  : IconMoon;
          return (
            <div
              key={habit.id}
              className="card"
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  display: "grid",
                  placeItems: "center",
                  color: habit.done ? "#fff" : "rgba(255,255,255,0.4)",
                }}
              >
                <IconComp size={16} stroke={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em" }}>{habit.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, fontWeight: 400 }}>
                  {habit.done
                    ? "Done today"
                    : habit.subtitle?.trim()
                      ? habit.subtitle.trim()
                      : habit.icon === "run"
                        ? `Target ${stepsGoal.toLocaleString()} steps · Week ${progWeek}`
                        : "Not yet today"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleHabit(habit.id)}
                className="tap"
                aria-label={habit.done ? "Done" : "Toggle"}
                style={{
                  width: 44,
                  height: 24,
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
                    left: habit.done ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: habit.done ? "#000" : "#ffffff",
                    transition: "left .2s ease, background .2s ease",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
