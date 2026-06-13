import { Pressable, Text } from "react-native";

import { FUTURE_YOU_HOME_HEADER_ARIA, FUTURE_YOU_HOME_HEADER_LABEL } from "@/lib/futureYouHomeEntryModel";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  onPress: () => void;
};

export function HomeNewYouHeaderButton({ onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      testID="home-newyou-header-button"
      accessibilityLabel={FUTURE_YOU_HOME_HEADER_ARIA}
      className="rounded-full border px-3 py-1.5"
      style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
    >
      <Text className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
        {FUTURE_YOU_HOME_HEADER_LABEL}
      </Text>
    </Pressable>
  );
}
