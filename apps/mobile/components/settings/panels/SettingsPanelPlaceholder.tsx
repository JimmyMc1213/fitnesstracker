import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  panelId: string;
  title: string;
};

export function SettingsPanelPlaceholder({ panelId, title }: Props) {
  const { colors } = useAppTheme();

  return (
    <View className="mt-2">
      <Text className="mb-2 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text style={{ color: colors.textSecondary }}>
        Settings panel content is not available yet.
      </Text>
    </View>
  );
}
