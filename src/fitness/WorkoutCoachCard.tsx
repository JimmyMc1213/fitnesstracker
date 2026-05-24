import { useState } from "react";

import type { WorkoutRoutineTemplate } from "./types";
import { COACH_BLUE_LABEL, COACH_BLUE_MUTED, COACH_CARD_BG, COACH_CARD_BORDER, labelStyle } from "./workoutUiTokens";

const coachBodyStyle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  color: "var(--text-soft)",
} as const;

const coachSectionLabel = {
  ...labelStyle,
  color: COACH_BLUE_LABEL,
  marginBottom: 8,
} as const;

type WorkoutCoachCardProps = {
  overloadTip: string;
  sessionTip?: string;
  activeRoutine?: WorkoutRoutineTemplate;
  mobilityItems: readonly string[];
  warmupItems: readonly string[];
  /** When true, card mounts expanded (e.g. training days). Session-local collapse via header toggle. */
  defaultExpanded?: boolean;
};

export function WorkoutCoachCard({
  overloadTip,
  sessionTip,
  activeRoutine,
  mobilityItems,
  warmupItems,
  defaultExpanded = false,
}: WorkoutCoachCardProps) {
  const [collapsed, setCollapsed] = useState(!defaultExpanded);

  return (
    <div
      className="card"
      style={{
        marginTop: 12,
        padding: 0,
        overflow: "hidden",
        borderColor: COACH_CARD_BORDER,
        background: COACH_CARD_BG,
      }}
    >
      <button
        type="button"
        className="tap"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Coach tips, tap to expand" : "Coach tips, tap to collapse"}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          border: "none",
          background: "transparent",
          color: "var(--text-primary)",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span style={{ ...labelStyle, color: COACH_BLUE_LABEL }}>Coach</span>
          {collapsed ? (
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-faint-soft)", lineHeight: 1.35 }}>
              Tap for coach note, warm-up & mobility
            </span>
          ) : null}
        </span>
        <span
          aria-hidden
          style={{
            fontSize: 12,
            color: COACH_BLUE_MUTED,
            flexShrink: 0,
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.15s ease",
          }}
        >
          ▼
        </span>
      </button>

      {!collapsed ? (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <section>
            <div style={coachSectionLabel}>Coach note</div>
            <p style={{ ...coachBodyStyle, whiteSpace: "pre-line" }}>{overloadTip}</p>
          </section>

          {sessionTip ? (
            <section
              style={{
                padding: 12,
                borderRadius: 10,
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
              }}
            >
              <div style={{ ...labelStyle, color: "var(--text-ghost)", marginBottom: 8 }}>After this session</div>
              <p style={{ ...coachBodyStyle, color: "var(--text-soft)" }}>{sessionTip}</p>
            </section>
          ) : null}

          {activeRoutine?.warmupItems?.length ? (
            <section>
              <div style={coachSectionLabel}>Session warm-up</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {activeRoutine.warmupItems.map((item) => (
                  <li key={item.description} style={coachBodyStyle}>
                    {item.description}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {activeRoutine?.warmupTip ? (
            <section>
              <div style={{ ...coachSectionLabel, color: COACH_BLUE_MUTED }}>Coach callout</div>
              <p style={{ ...coachBodyStyle, color: "var(--text-soft)" }}>{activeRoutine.warmupTip}</p>
            </section>
          ) : null}

          <section>
            <div style={{ ...labelStyle, color: COACH_BLUE_MUTED, marginBottom: 8 }}>Mobility</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {mobilityItems.map((line) => (
                <li key={line} style={coachBodyStyle}>
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div style={{ ...labelStyle, color: COACH_BLUE_MUTED, marginBottom: 8 }}>Warm-up</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {warmupItems.map((line) => (
                <li key={line} style={coachBodyStyle}>
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
