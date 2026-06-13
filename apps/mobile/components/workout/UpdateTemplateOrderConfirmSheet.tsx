import { Text } from "react-native";

import { WorkoutConfirmSheet } from "@/components/workout/WorkoutConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";

export function UpdateTemplateOrderConfirmSheet({
  open = true,
  templateName,
  onUpdate,
  onDismiss,
}: {
  open?: boolean;
  templateName: string;
  onUpdate: () => void;
  onDismiss: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <WorkoutConfirmSheet
      open={open}
      sheetTestID="update-template-order-sheet"
      title="Update routine order?"
      message={
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          You changed the exercise order during this workout. Save this order to{" "}
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{templateName}</Text>?
        </Text>
      }
      cancelLabel="Not now"
      confirmLabel="Update template"
      confirmPrimary
      cancelTestID="update-template-order-dismiss"
      confirmTestID="update-template-order-confirm"
      onCancel={onDismiss}
      onConfirm={onUpdate}
    />
  );
}
