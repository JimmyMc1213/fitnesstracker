import { BottomSheet, bottomSheetPanelTheme } from "../motion";
import type { WorkoutRoutineTemplate } from "../types";

type SaveHistoryWorkoutSheetProps = {
  open?: boolean;
  sessionTitle: string;
  templates: WorkoutRoutineTemplate[];
  onSaveAsNew: () => void;
  onReplaceTemplate: (templateId: string) => void;
  onClose: () => void;
};

function ActionRow({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        padding: "13px 14px",
        borderRadius: 12,
        border: "none",
        background: "transparent",
        color: "var(--text-primary)",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      {subtitle ? (
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-ghost)", lineHeight: 1.35 }}>{subtitle}</span>
      ) : null}
    </button>
  );
}

export function SaveHistoryWorkoutSheet({
  open = true,
  sessionTitle,
  templates,
  onSaveAsNew,
  onReplaceTemplate,
  onClose,
}: SaveHistoryWorkoutSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1300}
      ariaLabelledBy="save-history-workout-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 520px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "12px 12px 20px",
      }}
    >
      <div
        id="save-history-workout-title"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-ghost)",
          margin: "4px 8px 8px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Save workout
      </div>
      <p style={{ margin: "0 8px 10px", fontSize: 13, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
        Save <strong style={{ color: "var(--text-primary)" }}>{sessionTitle}</strong> as a reusable workout.
      </p>

      <ActionRow title="Save as new workout" subtitle="Add to your workouts list" onClick={onSaveAsNew} />

      {templates.length > 0 ? (
        <>
          <div
            style={{
              margin: "8px 8px 4px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
            }}
          >
            Replace existing workout
          </div>
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {templates.map((tpl) => (
              <ActionRow
                key={tpl.id}
                title={tpl.name}
                subtitle={tpl.dayLabel.trim() ? `${tpl.dayLabel} · ${tpl.exercises.length} exercises` : `${tpl.exercises.length} exercises`}
                onClick={() => onReplaceTemplate(tpl.id)}
              />
            ))}
          </div>
        </>
      ) : null}
    </BottomSheet>
  );
}
