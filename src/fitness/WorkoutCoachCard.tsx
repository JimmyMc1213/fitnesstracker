import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { WorkoutWarmupGroups } from "./workout/WorkoutWarmupGroups";
import type { WorkoutWarmupGroup } from "./workoutWarmup";
import {
  COACH_BLUE_MUTED,
  COACH_CARD_BG,
  COACH_CARD_BORDER,
  coachMajorTitleStyle,
  coachSubsectionLabelStyle,
} from "./workoutUiTokens";

const coachBodyStyle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  color: "var(--text-soft)",
} as const;

type WorkoutCoachCardProps = {
  overloadTip: string;
  sessionTip?: string;
  warmupGroups: readonly WorkoutWarmupGroup[];
  warmupTip?: string;
  /** When true, card mounts expanded (e.g. training days). Session-local collapse via header toggle. */
  defaultExpanded?: boolean;
};

export function WorkoutCoachCard({
  overloadTip,
  sessionTip,
  warmupGroups,
  warmupTip,
  defaultExpanded = false,
}: WorkoutCoachCardProps) {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <Collapsible
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      className="card"
      style={{
        marginTop: 12,
        padding: 0,
        overflow: "hidden",
        borderColor: COACH_CARD_BORDER,
        background: COACH_CARD_BG,
      }}
    >
      <CollapsibleTrigger
        className="tap"
        aria-label={open ? "Coach tips, tap to collapse" : "Coach tips, tap to expand"}
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
          <span style={coachMajorTitleStyle}>Coach</span>
          {!open ? (
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-faint-soft)", lineHeight: 1.35 }}>
              Tap for coach note and warm-up
            </span>
          ) : null}
        </span>
        <CollapsibleIndicator
          aria-hidden
          className="collapsible-indicator--rotate-180"
          style={{
            fontSize: 12,
            color: COACH_BLUE_MUTED,
          }}
        >
          ▼
        </CollapsibleIndicator>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <section>
            <div style={{ ...coachSubsectionLabelStyle, marginBottom: 6 }}>Coach note</div>
            <p style={{ ...coachBodyStyle, whiteSpace: "pre-line" }}>{overloadTip}</p>
          </section>

          {sessionTip ? (
            <section
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
              }}
            >
              <div style={{ ...coachSubsectionLabelStyle, marginBottom: 6 }}>After this session</div>
              <p style={{ ...coachBodyStyle, color: "var(--text-soft)" }}>{sessionTip}</p>
            </section>
          ) : null}

          {warmupGroups.length ? (
            <section
              style={{
                paddingTop: 12,
                borderTop: "0.5px solid var(--border)",
              }}
            >
              <div style={{ ...coachMajorTitleStyle, marginBottom: 10 }}>Warm-up</div>
              <WorkoutWarmupGroups groups={warmupGroups} footerTip={warmupTip} />
            </section>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
