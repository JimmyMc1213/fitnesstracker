import { useMemo } from "react";

import { localDateKey } from "./dailyPlan";
import { FullScreenOverlay } from "./motion";
import { workoutDaysInYear } from "./workoutHistory";
import type { AppState } from "./types";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthCells(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MiniMonthGrid({
  year,
  monthIndex,
  workoutDays,
  todayKey,
  onSelectMonth,
}: {
  year: number;
  monthIndex: number;
  workoutDays: Set<string>;
  todayKey: string;
  onSelectMonth: (monthIndex: number) => void;
}) {
  const cells = useMemo(() => buildMonthCells(year, monthIndex), [year, monthIndex]);

  return (
    <button
      type="button"
      className="tap"
      onClick={() => onSelectMonth(monthIndex)}
      style={{
        border: "none",
        padding: 0,
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: 6,
          letterSpacing: "0.02em",
        }}
      >
        {MONTH_SHORT[monthIndex]}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((dayKey, i) => {
          if (!dayKey) {
            return <div key={`pad-${i}`} style={{ aspectRatio: "1", borderRadius: 2 }} />;
          }
          const hasWorkout = workoutDays.has(dayKey);
          const isFuture = dayKey > todayKey;
          return (
            <div
              key={dayKey}
              style={{
                aspectRatio: "1",
                borderRadius: 2,
                background: hasWorkout ? "var(--accent)" : "var(--surface-2)",
                opacity: isFuture && !hasWorkout ? 0.45 : 1,
              }}
            />
          );
        })}
      </div>
    </button>
  );
}

type Props = {
  open: boolean;
  state: AppState;
  initialYear: number;
  onClose: () => void;
  onSelectMonth: (year: number, monthIndex: number) => void;
};

export function WorkoutYearView({ open, state, initialYear, onClose, onSelectMonth }: Props) {
  const todayKey = localDateKey(new Date());
  const workoutDays = useMemo(
    () => workoutDaysInYear(state.workoutHistory, initialYear),
    [state.workoutHistory, initialYear],
  );
  const workoutCount = workoutDays.size;

  return (
    <FullScreenOverlay open={open} zIndex={120}>
      <div className="screen" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div className="between" style={{ alignItems: "center", marginBottom: 8, marginTop: 4 }}>
          <button
            type="button"
            className="tap"
            onClick={onClose}
            aria-label="Back to month view"
            style={{ color: "var(--accent)", fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
          >
            ← Back
          </button>
        </div>

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>{initialYear}</div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
            {workoutCount > 0
              ? `${workoutCount} workout day${workoutCount === 1 ? "" : "s"} · tap a month to zoom in`
              : "Tap a month to zoom in"}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "18px 14px",
            marginTop: 20,
            paddingBottom: 16,
          }}
        >
          {MONTH_SHORT.map((_, monthIndex) => (
            <MiniMonthGrid
              key={monthIndex}
              year={initialYear}
              monthIndex={monthIndex}
              workoutDays={workoutDays}
              todayKey={todayKey}
              onSelectMonth={(m) => {
                onSelectMonth(initialYear, m);
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </FullScreenOverlay>
  );
}
