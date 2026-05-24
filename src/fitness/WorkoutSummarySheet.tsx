import { useEffect, useState, type ReactNode } from "react";

import { fireConfetti } from "./confetti";
import { closeAfterMotion, FullScreenOverlay, MOTION_DURATIONS } from "./motion";
import { formatWorkoutDuration } from "./workoutSummary";
import { LBS_PER_KG } from "./unitPreferences";
import type { UnitPreferences, WorkoutSessionSummary } from "./types";

type Props = {
  open: boolean;
  summary: WorkoutSessionSummary;
  unitPreferences: UnitPreferences;
  onDone: () => void;
};

export function WorkoutSummarySheet({ open, summary, unitPreferences, onDone }: Props) {
  const [closing, setClosing] = useState(false);
  const visible = open && !closing;
  const volLabel = unitPreferences.weightUnit === "kg" ? "kg·reps" : "lb·reps";
  const displayVolume =
    summary.totalVolume > 0 && unitPreferences.weightUnit === "kg"
      ? Math.round(summary.totalVolume / LBS_PER_KG)
      : summary.totalVolume;

  useEffect(() => {
    if (!open) setClosing(false);
  }, [open]);

  useEffect(() => {
    const stop = fireConfetti();
    return stop;
  }, []);

  function handleDone() {
    setClosing(true);
    closeAfterMotion(onDone, MOTION_DURATIONS.panel);
  }

  return (
    <FullScreenOverlay open={visible} zIndex={250}>
      <div
        className="screen"
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: 24,
        }}
      >
        <div style={{ textAlign: "center", paddingTop: 28, paddingBottom: 8 }}>
          <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }} aria-hidden>
            🎉
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
            }}
          >
            Workout complete
          </div>
          <h1
            style={{
              margin: "10px 0 4px",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {summary.title}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 500 }}>
            Nice work, session saved
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 24,
          }}
        >
          <StatCard label="Duration" value={formatWorkoutDuration(summary.durationSec)} />
          <StatCard
            label="Sets"
            value={`${summary.doneSets}/${summary.totalSets}`}
            sub={summary.totalSets > 0 ? "done" : undefined}
          />
          <StatCard
            label="Volume"
            value={summary.totalVolume > 0 ? displayVolume.toLocaleString() : ", "}
            sub={summary.totalVolume > 0 ? volLabel : undefined}
          />
        </div>

        <SummarySection
          title="Personal records"
          empty="No PRs this session, keep stacking weight and reps."
          accent="var(--chart-stroke)"
          highlight={summary.prs.length > 0}
        >
          {summary.prs.map((pr) => (
            <SummaryRow
              key={`${pr.exerciseName}-${pr.detail}`}
              title={pr.exerciseName}
              detail={pr.detail}
              badge="PR"
              badgeColor="var(--chart-stroke)"
              highlighted
            />
          ))}
        </SummarySection>

        <SummarySection
          title="Needs work"
          empty="All logged sets hit target reps. Clean session."
          accent="#FF9F0A"
        >
          {summary.needsWork.map((row) => (
            <SummaryRow
              key={`${row.exerciseName}-${row.detail}`}
              title={row.exerciseName}
              detail={row.detail}
              badge="Below"
              badgeColor="#FF9F0A"
            />
          ))}
        </SummarySection>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
          borderTop: "0.5px solid var(--border)",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={handleDone}
          style={{
            width: "100%",
            background: "var(--primary)",
            color: "var(--primary-fg)",
            borderRadius: 12,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
          }}
        >
          Back to home
        </button>
      </div>
    </FullScreenOverlay>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="card"
      style={{
        padding: "14px 10px",
        textAlign: "center",
        border: "0.5px solid var(--border)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-ghost)" }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 20,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {sub ? <div style={{ marginTop: 2, fontSize: 10, color: "var(--text-ghost)", fontWeight: 500 }}>{sub}</div> : null}
    </div>
  );
}

function SummarySection({
  title,
  empty,
  accent,
  highlight,
  children,
}: {
  title: string;
  empty: string;
  accent: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  const childList = Array.isArray(children) ? children : children != null ? [children] : [];
  const hasItems = childList.length > 0;

  return (
    <section style={{ marginTop: 28 }}>
      <div className="between" style={{ marginBottom: 10, alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h2>
          {highlight && hasItems ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: accent,
                background: `${accent}22`,
                padding: "3px 7px",
                borderRadius: 6,
              }}
            >
              {childList.length} new
            </span>
          ) : null}
        </div>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} aria-hidden />
      </div>
      {hasItems ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-ghost)", fontWeight: 400 }}>{empty}</p>
      )}
    </section>
  );
}

function SummaryRow({
  title,
  detail,
  badge,
  badgeColor,
  highlighted,
}: {
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className="card between"
      style={{
        padding: "12px 14px",
        alignItems: "center",
        gap: 12,
        border: highlighted ? `1px solid ${badgeColor}55` : "0.5px solid var(--border)",
        background: highlighted ? `${badgeColor}0d` : undefined,
        boxShadow: highlighted ? `0 0 0 1px ${badgeColor}18` : undefined,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
        <div style={{ marginTop: 2, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500 }}>{detail}</div>
      </div>
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: badgeColor,
          background: `${badgeColor}22`,
          padding: "4px 8px",
          borderRadius: 6,
        }}
      >
        {badge}
      </span>
    </div>
  );
}
