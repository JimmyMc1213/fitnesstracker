import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

type SettingsScreenChromeProps = {
  title: string;
  onBack: () => void;
  backLabel?: string;
  backTestID?: string;
  titleTestID?: string;
  trailing?: ReactNode;
  children: ReactNode;
  testID?: string;
};

export function SettingsScreenChrome({
  title,
  onBack,
  backLabel = "Back",
  backTestID = "settings-panel-back",
  titleTestID = "settings-title",
  trailing,
  children,
  testID,
}: SettingsScreenChromeProps) {
  const { colors } = useAppTheme();
  const { paddingTop } = useTabScreenInsets();

  return (
    <View
      testID={testID}
      style={{ flex: 1, backgroundColor: "transparent", paddingTop }}
    >
      <View
        className="px-2 pb-3"
        style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            testID={backTestID}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <SymbolView
              name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
              tintColor={colors.textSecondary}
              size={20}
            />
          </Pressable>

          <Text
            testID={titleTestID}
            className="min-w-0 flex-1 text-center text-[17px] font-semibold tracking-tight"
            style={{ color: colors.textPrimary }}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View className="min-h-10 min-w-10 items-center justify-center">{trailing ?? null}</View>
        </View>
      </View>

      {children}
    </View>
  );
}
