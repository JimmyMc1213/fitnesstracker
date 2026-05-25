import { IconBolt, IconChevR, IconDroplet, IconMoon, IconRun } from "./icons";
import { isMobilityHabit } from "./mobilityHabit";
import { buildHabitsForDateKey, planWeekIndex } from "./data";
import type { AppState, Habit } from "./types";

const MOBILITY_ACCENT = "rgba(196,181,253,0.95)";
const MOBILITY_BORDER = "rgba(196,181,253,0.32)";
const MOBILITY_BG = "rgba(196,181,253,0.07)";

type Props = {
  habits: Habit[];
  stepsTarget: number;
  planStartIso: string;
  dateKey: string;
  readOnly?: boolean;
  onToggle: (id: string) => void;
  onMobilityPress?: () => void;
};

function MobilityRoutineCard({
  habit,
  readOnly,
  onPress,
}: {
  habit: Habit;
  readOnly: boolean;
  onPress?: () => void;
}) {
  const subtitle = habit.done
    ? "Routine complete for today"
    : habit.subtitle?.trim()
      ? habit.subtitle.trim()
      : "~15 min stretch · complete all moves";

  return (
    <button
      type="button"
      className="tap"
      onClick={() => onPress?.()}
      disabled={readOnly}
      aria-label={habit.done ? "Open mobility routine" : "Start mobility routine"}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 0,
        border: "none",
        background: "none",
        opacity: readOnly ? 0.72 : 1,
      }}
    >
      <div
        className="card"
        style={{
          padding: "15px 16px 14px",
          borderColor: habit.done ? "rgba(196,181,253,0.42)" : MOBILITY_BORDER,
          background: MOBILITY_BG,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: habit.done ? MOBILITY_ACCENT : "rgba(196,181,253,0.55)",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingLeft: 4 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: habit.done ? "rgba(196,181,253,0.18)" : "rgba(196,181,253,0.12)",
              border: "0.5px solid rgba(196,181,253,0.22)",
              display: "grid",
              placeItems: "center",
              color: MOBILITY_ACCENT,
              flexShrink: 0,
            }}
          >
            <IconBolt size={18} stroke={1.7} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MOBILITY_ACCENT,
                }}
              >
                Guided routine
              </span>
              {habit.done ? (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid var(--border)",
                  }}
                >
                  Done
                </span>
              ) : null}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {habit.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.45, fontWeight: 400 }}>
              {subtitle}
            </div>

            {!readOnly ? (
              <div
                style={{
                  marginTop: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: MOBILITY_ACCENT,
                }}
              >
                {habit.done ? "Open routine" : "Start routine"}
                <IconChevR size={14} stroke={2.2} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export function HomeDailyHabitsCard({
  habits,
  stepsTarget,
  planStartIso,
  dateKey,
  readOnly = false,
  onToggle,
  onMobilityPress,
}: Props) {
  if (habits.length === 0) return null;

  const mobilityHabit = habits.find((h) => isMobilityHabit(h.id));
  const toggleHabits = habits.filter((h) => !isMobilityHabit(h.id));
  const toggleDoneCount = toggleHabits.filter((h) => h.done).length;
  const progWeek = planWeekIndex(new Date(`${dateKey}T12:00:00`), planStartIso);

  return (
    <>
      {mobilityHabit ? (
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
              Mobility
            </h2>
          </div>
          <MobilityRoutineCard habit={mobilityHabit} readOnly={readOnly} onPress={onMobilityPress} />
        </section>
      ) : null}

      {toggleHabits.length > 0 ? (
        <section style={{ marginTop: mobilityHabit ? 22 : 28 }}>
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
            <span
              style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
            >
              {toggleDoneCount}/{toggleHabits.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {toggleHabits.map((habit) => {
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
      ) : null}
    </>
  );
}

export function habitsForDateKey(state: AppState, dateKey: string, _todayKey: string): Habit[] {
  return buildHabitsForDateKey(state.habitTemplates, state.habitsDoneByDay, dateKey);
}
