import {
  CenterDialog,
  ConfirmSheetActions,
  confirmCenterDialogPanelStyle,
  confirmSheetMessageStyle,
  confirmSheetTitleStyle,
} from "./motion";
import { nutritionGoalSettingsLabel } from "./goalSettings";
import type { NutritionGoal } from "./types";

export function ChangeGoalConfirmSheet({
  open = true,
  currentGoal,
  nextGoal,
  onCancel,
  onConfirm,
}: {
  open?: boolean;
  currentGoal: NutritionGoal;
  nextGoal: NutritionGoal;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const fromLabel = nutritionGoalSettingsLabel(currentGoal);
  const toLabel = nutritionGoalSettingsLabel(nextGoal);

  return (
    <CenterDialog
      open={open}
      onClose={onCancel}
      zIndex={1300}
      ariaLabelledBy="change-goal-confirm-title"
      panelStyle={confirmCenterDialogPanelStyle}
    >
      <div id="change-goal-confirm-title" style={confirmSheetTitleStyle}>
        Change goal?
      </div>
      <p style={confirmSheetMessageStyle}>
        Switch from{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{fromLabel}</span> to{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{toLabel}</span>? Your fuel targets and goal
        weight range will update to match.
      </p>
      <ConfirmSheetActions
        cancelLabel="Keep current goal"
        confirmLabel="Change goal"
        confirmTone="primary"
        contentPadding={28}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </CenterDialog>
  );
}
