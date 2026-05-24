import { CenterDialog, bottomSheetPanelTheme } from "./motion";
import { PrimaryButton } from "./shared";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  maxHeight: "min(82vh, 560px)",
  overflowY: "auto",
  padding: 20,
} as const;

type CreateWeeklyRoutineSheetProps = {
  open?: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onManual: () => void;
};

function OptionCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 16,
        borderRadius: 14,
        border: "0.5px solid var(--border)",
        background: "var(--surface-2)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted-soft)", lineHeight: 1.45, fontWeight: 500 }}>{description}</div>
    </button>
  );
}

export function CreateWeeklyRoutineSheet({
  open = true,
  onClose,
  onGenerate,
  onManual,
}: CreateWeeklyRoutineSheetProps) {
  return (
    <CenterDialog open={open} onClose={onClose} zIndex={1100} ariaLabelledBy="create-weekly-routine-title" panelStyle={panelStyle}>
      <div
        id="create-weekly-routine-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 8 }}
      >
        New weekly routine
      </div>
      <p style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
        Set up a full week of workouts. This replaces your current program.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <OptionCard
          title="Generate for me"
          description="Answer a few training questions and Gymmy will build your split, exercises, and schedule."
          onClick={onGenerate}
        />
        <OptionCard
          title="Build it myself"
          description="Pick your training days and add exercises to each workout on your own."
          onClick={onManual}
        />
      </div>
      <PrimaryButton block onClick={onClose} style={{ fontWeight: 700 }}>
        Cancel
      </PrimaryButton>
    </CenterDialog>
  );
}
