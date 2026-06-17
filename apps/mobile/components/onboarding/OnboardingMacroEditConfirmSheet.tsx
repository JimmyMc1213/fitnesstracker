import { Pressable, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { useAppTheme } from "@/hooks/useAppTheme";

export function OnboardingMacroEditConfirmSheet({
  visible = true,
  onCancel,
  onConfirm,
}: {
  visible?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <CenterDialog open={visible} onClose={onCancel} panelStyle={{ padding: 0, maxWidth: 384 }}>
      <View className="w-full overflow-hidden rounded-2xl">
          <View className="px-7 py-7">
            <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              Update fuel targets?
            </Text>
            <Text className="mt-3 text-sm leading-5" style={{ color: colors.textSecondary }}>
              Changing your targets may affect how accurate your Future You looks. Continue?
            </Text>
          </View>
          <View className="flex-row border-t" style={{ borderColor: colors.border }}>
            <Pressable onPress={onCancel} className="flex-1 items-center py-3.5">
              <Text className="text-[15px] font-semibold" style={{ color: "#ff6b6b" }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="flex-1 items-center py-3.5">
              <Text className="text-[15px] font-semibold" style={{ color: colors.accent }}>
                Continue
              </Text>
            </Pressable>
          </View>
      </View>
    </CenterDialog>
  );
}
