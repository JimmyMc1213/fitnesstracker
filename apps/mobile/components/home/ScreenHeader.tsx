import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  titleTestID?: string;
};

export function ScreenHeader({ eyebrow, title, right, titleTestID = "home-title" }: Props) {
  const { colors } = useAppTheme();

  return (
    <View className="pb-1 pt-2">
      <View className="flex-row items-start justify-between">
        <View className="min-w-0 flex-1 pr-3">
          {eyebrow ? (
            <Text
              className="mb-1 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textTertiary }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text
            testID={titleTestID}
            className="text-[28px] font-bold tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            {title}
          </Text>
        </View>
        {right}
      </View>
    </View>
  );
}
