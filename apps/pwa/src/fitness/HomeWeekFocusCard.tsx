import { startOfWeekMonday } from "./weeklySummary";
import type { WeekFocusCommitment } from "./types";

type Props = {
  commitments: WeekFocusCommitment[];
  weekStartKey: string;
  dateKey: string;
  weekNumber: number;
};

export function activeWeekFocusCommitments(
  commitments: WeekFocusCommitment[],
  weekStartKey: string | null,
  dateKey: string,
): WeekFocusCommitment[] {
  if (!weekStartKey || commitments.length === 0) return [];
  const currentWeekStart = startOfWeekMonday(dateKey);
  if (currentWeekStart !== weekStartKey) return [];
  return commitments;
}

export function HomeWeekFocusCard({ commitments, weekNumber }: Props) {
  if (commitments.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        marginTop: 18,
        padding: 16,
        borderColor: "rgba(96,165,250,0.18)",
        background: "var(--bg-secondary)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-ghost)",
          marginBottom: 10,
        }}
      >
        Week {weekNumber} focus
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {commitments.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--surface-1)",
              border: "0.5px solid rgba(96,165,250,0.16)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              {item.title}
            </div>
            {item.subtitle ? (
              <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45, color: "var(--text-secondary)", fontWeight: 500 }}>
                {item.subtitle}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
