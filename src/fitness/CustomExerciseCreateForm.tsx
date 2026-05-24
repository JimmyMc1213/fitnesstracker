import { EXERCISE_EQUIPMENT_LABELS, type ExerciseEquipmentLabel } from "./exerciseLabels";
import { PrimaryButton } from "./shared";
import { workoutFieldInputStyle } from "./workoutUiTokens";

const ACCENT_BLUE = "#3B82F6";

type CustomExerciseCreateFormProps = {
  name: string;
  selectedLabel: ExerciseEquipmentLabel | null;
  saveButtonLabel: string;
  onNameChange: (name: string) => void;
  onLabelChange: (label: ExerciseEquipmentLabel) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CustomExerciseCreateForm({
  name,
  selectedLabel,
  saveButtonLabel,
  onNameChange,
  onLabelChange,
  onSave,
  onCancel,
}: CustomExerciseCreateFormProps) {
  const canSave = name.trim().length > 0 && selectedLabel !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Exercise name"
        style={workoutFieldInputStyle}
      />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-ghost)", marginBottom: 6, letterSpacing: "0.04em" }}>
          Equipment type
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EXERCISE_EQUIPMENT_LABELS.map((label) => {
            const selected = selectedLabel === label;
            return (
              <button
                key={label}
                type="button"
                className="tap"
                aria-pressed={selected}
                onClick={() => onLabelChange(label)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: selected ? "none" : "0.5px solid var(--border)",
                  background: selected ? ACCENT_BLUE : "transparent",
                  color: selected ? "#fff" : "var(--text-soft)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <PrimaryButton
        block
        onClick={onSave}
        disabled={!canSave}
        style={{ borderRadius: 10, padding: 12, fontSize: 14 }}
      >
        {saveButtonLabel}
      </PrimaryButton>
      <button
        type="button"
        className="tap"
        onClick={onCancel}
        style={{
          width: "100%",
          color: "var(--text-ghost)",
          fontSize: 12,
          padding: 6,
          fontWeight: 500,
          background: "none",
          border: "none",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
