import { useEffect, useState } from "react";

import { CenterDialog, bottomSheetPanelTheme } from "../motion";
import { PrimaryButton } from "../shared";
import { SaveWorkoutConfirmSheet } from "./SaveWorkoutConfirmSheet";
import { workoutFieldInputStyle } from "../workoutUiTokens";
import type { WorkoutRoutineTemplate } from "../types";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 360,
  padding: 24,
} as const;

type RenameRoutineSheetProps = {
  open?: boolean;
  template: WorkoutRoutineTemplate;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function RenameRoutineSheet({ open = true, template, onSave, onClose }: RenameRoutineSheetProps) {
  const [name, setName] = useState(template.name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setName(template.name);
    setConfirmOpen(false);
  }, [template.id, template.name]);

  function handleSaveClick() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed === template.name.trim()) {
      onClose();
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <CenterDialog open={open && !confirmOpen} onClose={onClose} zIndex={1300} ariaLabelledBy="rename-routine-title" panelStyle={panelStyle}>
        <div
          id="rename-routine-title"
          style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 8 }}
        >
          Rename workout
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
          Update the name shown on your workouts list.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name"
          autoFocus
          aria-label="Workout name"
          style={{ ...workoutFieldInputStyle, width: "100%", marginBottom: 16 }}
        />
        <PrimaryButton block onClick={handleSaveClick} disabled={!name.trim()} style={{ fontWeight: 700 }}>
          Save name
        </PrimaryButton>
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
      </CenterDialog>
      {confirmOpen ? (
        <SaveWorkoutConfirmSheet
          title="Rename workout?"
          workoutName={name.trim()}
          cancelLabel="Keep name"
          confirmLabel="Rename"
          message={
            <>
              Rename this workout to{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{name.trim()}</span>?
            </>
          }
          onCancel={() => setConfirmOpen(false)}
          onSave={confirmSave}
        />
      ) : null}
    </>
  );
}
