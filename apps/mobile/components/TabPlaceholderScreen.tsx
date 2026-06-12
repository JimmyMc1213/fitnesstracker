import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type TabPlaceholderScreenProps = {
  testID: string;
  title: string;
  subtitle: string;
};

export function TabPlaceholderScreen({ testID, title, subtitle }: TabPlaceholderScreenProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="px-screen-x"
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
      testID={testID}
    >
      <Text className="mb-2 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text className="text-center text-base" style={{ color: colors.textSecondary }}>
        {subtitle}
      </Text>
    </View>
  );
}
