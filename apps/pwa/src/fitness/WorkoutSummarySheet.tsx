import { useEffect, useMemo, useState } from "react";
import { IconBarbell, IconChecks, IconStopwatch, IconTrophy } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

import { firePlanOnlySuccessConfetti } from "./confetti";
import { closeAfterMotion, FullScreenOverlay, MOTION_DURATIONS } from "./motion";
import { formatWorkoutDuration } from "./workoutSummary";
import { LBS_PER_KG } from "./unitPreferences";
import type { CompletedWorkoutSession, UnitPreferences, WorkoutSessionSummary } from "./types";

const GOLD = "var(--ob-gold)";
const RING_SIZE = 116;
const RING_STROKE = 8;

type Props = {
  open: boolean;
  summary: WorkoutSessionSummary;
  unitPreferences: UnitPreferences;
  /** Just-finished session, used for the per-exercise breakdown. */
  session?: CompletedWorkoutSession;
  onDone: () => void;
};

type ExerciseLine = {
  key: string;
  name: string;
  label?: string;
  sets: number;
  volume: number;
};

export function WorkoutSummarySheet({ open, summary, unitPreferences, session, onDone }: Props) {
  const [closing, setClosing] = useState(false);
  const [sweep, setSweep] = useState(0);
  const visible = open && !closing;

  const isKg = unitPreferences.weightUnit === "kg";
  const volLabel = isKg ? "kg·reps" : "lb·reps";
  const toDisplayVolume = (raw: number) => (isKg ? Math.round(raw / LBS_PER_KG) : Math.round(raw));
  const displayVolume = summary.totalVolume > 0 ? toDisplayVolume(summary.totalVolume) : 0;

  const completion = summary.totalSets > 0 ? Math.min(1, summary.doneSets / summary.totalSets) : 0;
  const completionPct = Math.round(completion * 100);

  const exerciseLines = useMemo<ExerciseLine[]>(() => {
    if (!session) return [];
    return session.exercises.map((ex) => ({
      key: ex.id,
      name: ex.name,
      label: ex.label,
      sets: ex.sets.length,
      volume: ex.sets.reduce((total, st) => total + st.w * st.r, 0),
    }));
  }, [session]);

  const peakVolume = exerciseLines.reduce((max, line) => Math.max(max, line.volume), 0);

  useEffect(() => {
    if (!open) setClosing(false);
  }, [open]);

  useEffect(() => {
    const stop = firePlanOnlySuccessConfetti();
    return stop;
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSweep(completion));
    return () => cancelAnimationFrame(frame);
  }, [completion]);

  function handleDone() {
    setClosing(true);
    closeAfterMotion(onDone, MOTION_DURATIONS.panel);
  }

  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <FullScreenOverlay open={visible} zIndex={250} motionVariant="fade">
      <div className="screen page-transition" style={{ flex: 1, overflowY: "auto", paddingBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
          <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE }}>
            <svg width={RING_SIZE} height={RING_SIZE} aria-hidden>
              <defs>
                <linearGradient id="workoutSummaryRingGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--ob-gold-mid, #E5B769)" />
                  <stop offset="1" stopColor="var(--ob-gold)" />
                </linearGradient>
              </defs>
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke="var(--border)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke="url(#workoutSummaryRingGold)"
                strokeWidth={RING_STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - sweep)}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {completionPct}
                <span style={{ fontSize: 15, color: GOLD }}>%</span>
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                }}
              >
                {summary.doneSets} of {summary.totalSets} sets
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", paddingTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            Workout complete
          </div>
          <h1 style={{ margin: "10px 0 6px", fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {summary.title}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 500 }}>
            Nice work, session saved
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 28 }}>
          <StatTile
            icon={IconStopwatch}
            value={formatWorkoutDuration(summary.durationSec)}
            label="Duration"
          />
          <StatTile icon={IconChecks} value={`${summary.doneSets}`} label="Sets done" />
          <StatTile
            icon={IconBarbell}
            value={displayVolume > 0 ? displayVolume.toLocaleString() : "—"}
            label={displayVolume > 0 ? volLabel : "Volume"}
          />
        </div>

        {exerciseLines.length > 0 ? (
          <section style={{ marginTop: 30 }}>
            <SectionHeading icon={IconBarbell} title="Exercises" trailing={`${exerciseLines.length}`} />
            <div
              className="onboarding-gradient-card"
              style={{ display: "flex", flexDirection: "column", gap: 18, padding: 16 }}
            >
              {exerciseLines.map((line) => {
                const fill = peakVolume > 0 ? Math.max(0.06, line.volume / peakVolume) : 0;
                return (
                  <div key={line.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                          fontSize: 15,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {line.name}
                        {line.label ? (
                          <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: GOLD }}>
                            {line.label.toUpperCase()}
                          </span>
                        ) : null}
                      </div>
                      <div
                        style={{
                          flexShrink: 0,
                          fontSize: 13,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                          color: "var(--text-faint-soft)",
                        }}
                      >
                        {line.sets} × set{line.sets === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 999,
                          background: "var(--surface-2, rgba(255,255,255,0.07))",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${fill * 100}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: GOLD,
                            transition: "width 700ms cubic-bezier(0.22,1,0.36,1)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: 11,
                          fontWeight: 500,
                          fontVariantNumeric: "tabular-nums",
                          color: "var(--text-ghost)",
                        }}
                      >
                        {toDisplayVolume(line.volume).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section style={{ marginTop: 30 }}>
          <SectionHeading
            icon={IconTrophy}
            title="Personal records"
            trailing={summary.prs.length > 0 ? `${summary.prs.length} new` : undefined}
          />
          {summary.prs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {summary.prs.map((pr) => (
                <div
                  key={`${pr.exerciseName}-${pr.detail}`}
                  className="onboarding-gradient-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    borderLeft: `2px solid ${GOLD}`,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(212,175,110,0.12)",
                      color: GOLD,
                    }}
                  >
                    <IconTrophy size={17} stroke={1.9} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pr.exerciseName}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                        color: GOLD,
                      }}
                    >
                      {pr.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="onboarding-gradient-card">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-faint-soft)" }}>
                No PRs this session. Add a rep or a little weight next time and this fills up.
              </p>
            </div>
          )}
        </section>

        {summary.needsWork.length > 0 ? (
          <section style={{ marginTop: 30 }}>
            <SectionHeading icon={IconChecks} title="Needs work" tint="var(--text-ghost)" />
            <div
              className="onboarding-gradient-card"
              style={{ display: "flex", flexDirection: "column", gap: 14, padding: 16 }}
            >
              {summary.needsWork.map((row) => (
                <div key={`${row.exerciseName}-${row.detail}`}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{row.exerciseName}</div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-faint-soft)",
                    }}
                  >
                    {row.detail}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
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
            background: GOLD,
            color: "var(--ob-gold-on)",
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

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: TablerIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="onboarding-gradient-card" style={{ padding: 16 }}>
      <span style={{ color: GOLD, display: "block", lineHeight: 0 }}>
        <Icon size={16} stroke={1.9} />
      </span>
      <div
        style={{
          marginTop: 12,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 5, fontSize: 11, fontWeight: 500, color: "var(--text-ghost)" }}>
        {label}
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  trailing,
  tint = GOLD,
}: {
  icon: TablerIcon;
  title: string;
  trailing?: string;
  tint?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{ color: tint, lineHeight: 0 }}>
        <Icon size={16} stroke={1.9} />
      </span>
      <h2
        style={{
          margin: 0,
          flex: 1,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-faint-soft)",
        }}
      >
        {title}
      </h2>
      {trailing ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: tint }}>{trailing}</span>
      ) : null}
    </div>
  );
}