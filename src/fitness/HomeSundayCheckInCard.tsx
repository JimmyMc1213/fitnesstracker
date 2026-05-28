import { IconCheck, IconChevR } from "./icons";
import { formatWeightFromLbs, weightUnitLabel } from "./unitPreferences";
import type { SundayCheckInData } from "./sundayCheckIn";
import type { UnitPreferences } from "./types";

type Props = {
  data: SundayCheckInData;
  completed?: boolean;
  unitPreferences: UnitPreferences;
  onReview: () => void;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const SUCCESS_GREEN = "#16a34a";

export function HomeSundayCheckInCard({ data, completed = false, unitPreferences, onReview }: Props) {
  const wUnit = unitPreferences.weightUnit;
  const sundayDom = new Date(`${data.sundayKey}T12:00:00`).getDate();

  const weightPositive = data.weightDeltaLbs != null && data.weightDeltaLbs > 0;
  const weightNegative = data.weightDeltaLbs != null && data.weightDeltaLbs < 0;
  const weightText =
    data.weightDeltaLbs != null
      ? `${data.weightDeltaLbs > 0 ? "+" : ""}${formatWeightFromLbs(data.weightDeltaLbs, wUnit)} ${weightUnitLabel(wUnit)}`
      : null;

  return (
    <button
      type="button"
      className="tap card home-sunday-check-in-card"
      onClick={onReview}
      aria-label={completed ? "View Sunday check-in recap" : "Open Sunday check-in"}
      style={{
        marginTop: 18,
        padding: 16,
        width: "100%",
        textAlign: "left",
        borderColor: "var(--border)",
        background: "var(--bg-secondary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "var(--surface-1)",
            border: "0.5px solid var(--divider-subtle)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--text-secondary)",
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.06em" }}>SUN</span>
          <span style={{ fontSize: 14, fontWeight: 700, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>
            {sundayDom}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="between" style={{ alignItems: "center", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  marginBottom: 4,
                }}
              >
                Sunday check-in
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.25,
                  color: "var(--text-primary)",
                }}
              >
                Week {data.weekNumber} in the books
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {completed ? <CompleteBadge /> : data.onTrack ? <OnTrackBadge /> : null}
              <IconChevR size={14} style={{ color: "var(--text-tertiary)" }} aria-hidden />
            </div>
          </div>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 11,
              fontWeight: 500,
              lineHeight: 1.4,
              color: "var(--text-secondary)",
            }}
          >
            {data.workoutsCompleted}/{data.workoutsPlanned} workouts · {data.proteinDaysHit}/7 protein
            {weightText ? (
              <>
                {" · "}
                <span
                  style={{
                    color: weightNegative ? SUCCESS_GREEN : weightPositive ? "#d97706" : "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  {weightText}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <WeekDayTracker cells={data.dayCells} />

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-tertiary)",
        }}
      >
        {completed ? "View recap" : "Review the week"}
      </div>
    </button>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: SUCCESS_GREEN,
        padding: "3px 7px",
        borderRadius: 999,
        background: "rgba(22, 163, 74, 0.1)",
        border: "0.5px solid rgba(22, 163, 74, 0.18)",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function CompleteBadge() {
  return <StatusBadge label="Done" />;
}

function OnTrackBadge() {
  return <StatusBadge label="On track" />;
}

function WeekDayTracker({ cells }: { cells: SundayCheckInData["dayCells"] }) {
  return (
    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 3 }}>
      {cells.map((cell, i) => {
        const completed = cell.workoutDone;
        return (
          <div
            key={cell.dateKey}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 26,
                aspectRatio: "1",
                borderRadius: 7,
                display: "grid",
                placeItems: "center",
                background: completed ? "rgba(22, 163, 74, 0.1)" : "var(--surface-1)",
                border: completed ? "0.5px solid rgba(22, 163, 74, 0.18)" : "0.5px solid var(--divider-subtle)",
                color: completed ? SUCCESS_GREEN : "var(--text-ghost)",
              }}
            >
              {completed ? <IconCheck size={10} stroke={2.5} /> : null}
            </div>
            <div
              style={{
                width: "65%",
                height: 2,
                borderRadius: 999,
                background: cell.proteinHit ? "rgba(22, 163, 74, 0.45)" : "transparent",
              }}
            />
            <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-ghost)" }}>
              {DAY_LABELS[i] ?? cell.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
