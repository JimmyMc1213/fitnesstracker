import type { WorkoutWarmupDrill, WorkoutWarmupGroup } from "../workoutWarmup";
import { coachSubsectionLabelStyle } from "../workoutUiTokens";

const drillNameStyle = {
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.35,
  color: "var(--text-primary)",
  letterSpacing: "-0.01em",
} as const;

const drillRxStyle = {
  marginTop: 2,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
  color: "var(--text-faint-soft)",
  fontVariantNumeric: "tabular-nums" as const,
} as const;

const drillNoteStyle = {
  marginTop: 3,
  fontSize: 11,
  fontWeight: 500,
  lineHeight: 1.35,
  color: "var(--text-muted-soft)",
} as const;

const groupCardStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "var(--surface-1)",
  border: "0.5px solid var(--border)",
} as const;

const compactGroupCardStyle = {
  ...groupCardStyle,
  padding: "8px 10px",
  borderRadius: 8,
} as const;

type WorkoutWarmupGroupsProps = {
  groups: readonly WorkoutWarmupGroup[];
  compact?: boolean;
  footerTip?: string;
};

function drillKey(groupLabel: string, drill: WorkoutWarmupDrill): string {
  return `${groupLabel}-${drill.name}-${drill.prescription ?? ""}-${drill.note ?? ""}`;
}

export function WorkoutWarmupGroups({ groups, compact = false, footerTip }: WorkoutWarmupGroupsProps) {
  if (groups.length === 0) return null;

  const groupLabelStyle = {
    ...coachSubsectionLabelStyle,
    marginBottom: compact ? 6 : 8,
    ...(compact ? { fontSize: 10, letterSpacing: "0.06em" } : {}),
  };

  const nameStyle = compact ? { ...drillNameStyle, fontSize: 12 } : drillNameStyle;
  const rxStyle = compact ? { ...drillRxStyle, fontSize: 11 } : drillRxStyle;
  const noteStyle = compact ? { ...drillNoteStyle, fontSize: 10, marginTop: 2 } : drillNoteStyle;
  const cardStyle = compact ? compactGroupCardStyle : groupCardStyle;
  const groupGap = compact ? 8 : 10;
  const drillGap = compact ? 7 : 9;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: groupGap }}>
      {groups.map((group) => (
        <section key={group.label} style={cardStyle}>
          <div style={groupLabelStyle}>{group.label}</div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: drillGap,
            }}
          >
            {group.drills.map((drill, index) => (
              <li
                key={drillKey(group.label, drill)}
                style={
                  index > 0
                    ? {
                        paddingTop: drillGap,
                        borderTop: "0.5px solid var(--border)",
                      }
                    : undefined
                }
              >
                <div style={nameStyle}>{drill.name}</div>
                {drill.prescription ? <div style={rxStyle}>{drill.prescription}</div> : null}
                {drill.note ? <div style={noteStyle}>{drill.note}</div> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {footerTip ? (
        <p
          style={{
            margin: 0,
            fontSize: compact ? 10 : 11,
            fontWeight: 500,
            lineHeight: 1.4,
            color: "var(--text-muted-soft)",
          }}
        >
          {footerTip}
        </p>
      ) : null}
    </div>
  );
}
