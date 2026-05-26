import { IconCheck, IconChevR } from "./icons";
import { PrimaryButton } from "./shared";
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
const SUCCESS_GREEN = "#22c55e";
const SUCCESS_GREEN_SOLID = "#16a34a";

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
    <div
      className="card home-sunday-check-in-card"
      style={{
        marginTop: 18,
        padding: 14,
        borderRadius: 14,
        borderColor: "rgba(96,165,250,0.24)",
        background: "linear-gradient(180deg, rgba(96,165,250,0.06) 0%, var(--bg-secondary) 42%)",
      }}
    >
      <button
        type="button"
        className="tap"
        onClick={onReview}
        aria-label="Open Sunday check-in"
        style={{
          width: "100%",
          padding: 0,
          border: "none",
          background: "none",
          color: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--primary)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "var(--primary-fg)",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em" }}>SUN</span>
            <span style={{ fontSize: 14, fontWeight: 800, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>
              {sundayDom}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="between" style={{ alignItems: "center", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "rgba(96,165,250,0.85)",
                    marginBottom: 3,
                  }}
                >
                  Sunday check-in
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: "var(--text-primary)",
                  }}
                >
                  Week {data.weekNumber} in the books
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {completed ? <CompleteBadge /> : data.onTrack ? <OnTrackBadge /> : null}
                <IconChevR size={13} style={{ color: "var(--text-tertiary)" }} aria-hidden />
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
                      color: weightNegative ? SUCCESS_GREEN : weightPositive ? "#fbbf24" : "var(--text-secondary)",
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
      </button>

      <WeekDayTracker cells={data.dayCells} />

      <PrimaryButton
        block
        onClick={onReview}
        style={{
          marginTop: 12,
          borderRadius: 999,
          padding: "11px 14px",
          fontSize: 13,
          fontWeight: 600,
          minHeight: 40,
        }}
      >
        {completed ? "View recap" : "Review the week"}
      </PrimaryButton>
    </div>
  );
}

function CompleteBadge() {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "#fff",
        padding: "3px 7px",
        borderRadius: 999,
        background: SUCCESS_GREEN_SOLID,
        flexShrink: 0,
      }}
    >
      Done
    </span>
  );
}

function OnTrackBadge() {
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "#fff",
        padding: "3px 7px",
        borderRadius: 999,
        background: SUCCESS_GREEN_SOLID,
        flexShrink: 0,
      }}
    >
      On track
    </span>
  );
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
                maxWidth: 28,
                aspectRatio: "1",
                borderRadius: 7,
                display: "grid",
                placeItems: "center",
                background: completed ? "var(--primary)" : "var(--surface-1)",
                border: completed ? "none" : "0.5px solid var(--divider-subtle)",
                color: completed ? "var(--primary-fg)" : "var(--text-ghost)",
              }}
            >
              {completed ? <IconCheck size={11} stroke={2.5} /> : null}
            </div>
            <div
              style={{
                width: "65%",
                height: 2,
                borderRadius: 999,
                background: cell.proteinHit ? SUCCESS_GREEN : "transparent",
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
