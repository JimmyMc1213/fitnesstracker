import { PrimaryButton } from "./shared";
import type { WorkoutRoutineTemplate } from "./types";
import {
  COACH_BLUE_LABEL,
  COACH_CARD_BG,
  COACH_CARD_BORDER,
  labelStyle,
  SECONDARY_ACTION_COLOR,
} from "./workoutUiTokens";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";

export type CoachBriefContent = {
  headline: string;
  rationale?: string;
};

type RoutinePreviewSheetProps = {
  open?: boolean;
  template: WorkoutRoutineTemplate;
  coachBrief?: CoachBriefContent;
  onClose: () => void;
  onEdit: () => void;
  onStart: () => void;
};

export function RoutinePreviewSheet({
  open = true,
  template,
  coachBrief,
  onClose,
  onEdit,
  onStart,
}: RoutinePreviewSheetProps) {
  const totalSets = template.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1000}
      ariaLabelledBy="routine-preview-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 520px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
        <div style={{ padding: "16px 16px 0", flexShrink: 0 }}>
          <div className="between" style={{ alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  marginBottom: 4,
                }}
              >
                {template.dayLabel.trim() || "Routine"}
              </div>
              <div id="routine-preview-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "var(--text-primary)" }}>
                {template.name}
              </div>
            </div>
            <button type="button" className="tap" onClick={onEdit} style={{ fontSize: 14, fontWeight: 600, color: SECONDARY_ACTION_COLOR, padding: 4, flexShrink: 0 }}>
              Edit
            </button>
          </div>

          {template.focus.trim() ? (
            <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.45, color: "var(--text-muted-soft)", fontWeight: 400 }}>
              {template.focus}
            </p>
          ) : null}

          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-ghost)", fontVariantNumeric: "tabular-nums", marginBottom: coachBrief ? 10 : 12 }}>
            {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"} · {totalSets} set{totalSets === 1 ? "" : "s"}
          </div>

          {coachBrief ? (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                border: `0.5px solid ${COACH_CARD_BORDER}`,
                background: COACH_CARD_BG,
              }}
            >
              <div style={{ ...labelStyle, color: COACH_BLUE_LABEL, marginBottom: 6 }}>Coach</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.45, color: "var(--text-soft)" }}>
                {coachBrief.headline}
              </p>
              {coachBrief.rationale ? (
                <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 500, lineHeight: 1.45, color: "var(--text-muted-soft)" }}>
                  {coachBrief.rationale}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {template.exercises.map((ex, i) => (
              <div
                key={ex.id}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "var(--surface-1)",
                  border: "0.5px solid var(--border)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-ghost)",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 18,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{ex.name}</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500 }}>
                    {ex.target.trim() || `${ex.sets.length} sets`}
                    {ex.target.trim() ? ` · ${ex.sets.length} set${ex.sets.length === 1 ? "" : "s"}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {template.warmupItems?.length ? (
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  marginBottom: 6,
                }}
              >
                Warm-up
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {template.warmupItems.map((item) => (
                  <li key={item.description} style={{ fontSize: 11, lineHeight: 1.4, color: "var(--text-muted-soft)", fontWeight: 500 }}>
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div style={{ padding: "12px 16px 16px", flexShrink: 0, borderTop: "0.5px solid var(--border)" }}>
          <PrimaryButton
            block
            onClick={onStart}
            disabled={template.exercises.length === 0}
            style={{ fontWeight: 700 }}
          >
            Start workout
          </PrimaryButton>
          {template.exercises.length === 0 ? (
            <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 11, color: "var(--text-ghost)" }}>
              Add exercises in Edit before starting.
            </p>
          ) : (
            <button
              type="button"
              className="tap"
              onClick={onClose}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-ghost)",
                background: "transparent",
                border: "none",
              }}
            >
              Cancel
            </button>
          )}
        </div>
    </BottomSheet>
  );
}
