import {
  FUTURE_YOU_COMPARE_AFTER_LABEL,
  FUTURE_YOU_COMPARE_BEFORE_LABEL,
} from "@newyouai/core";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_GOLD } from "@/lib/futureYouTokens";

type Props = {
  beforeUri: string;
  afterUri: string;
};

const PANEL_RADIUS = 14;
const PANEL_MIN_HEIGHT = 160;

const panelCornerStyle: ViewStyle =
  Platform.OS === "ios" ? { borderCurve: "continuous" } : {};

function panelMaxHeight(windowHeight: number) {
  return Math.min(320, Math.max(200, windowHeight * 0.38));
}

function ComparePanel({
  uri,
  label,
  variant,
  maxHeight,
}: {
  uri: string;
  label: string;
  variant: "before" | "after";
  maxHeight: number;
}) {
  const { colors } = useAppTheme();
  const isAfter = variant === "after";

  return (
    <View className="min-w-0 flex-1 gap-1.5">
      <View
        style={{
          width: "100%",
          aspectRatio: 9 / 16,
          minHeight: PANEL_MIN_HEIGHT,
          maxHeight,
          borderRadius: PANEL_RADIUS,
          ...panelCornerStyle,
          overflow: "hidden",
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: isAfter ? FUTURE_YOU_GOLD : colors.border,
          ...(isAfter ?
            {
              shadowColor: FUTURE_YOU_GOLD,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 3,
            }
          : {}),
        }}
      >
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text
        className="text-center text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: isAfter ? FUTURE_YOU_GOLD : colors.textTertiary }}
      >
        {label}
      </Text>
    </View>
  );
}

export function FutureYouComparePanels({ beforeUri, afterUri }: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const maxPanelHeight = panelMaxHeight(windowHeight);

  return (
    <View testID="future-you-compare-panels" className="min-h-0 flex-1 justify-center">
      <View className="flex-row items-center gap-2.5">
        <ComparePanel
          uri={beforeUri}
          label={FUTURE_YOU_COMPARE_BEFORE_LABEL}
          variant="before"
          maxHeight={maxPanelHeight}
        />
        <Text className="text-lg font-medium" style={{ color: FUTURE_YOU_GOLD }}>
          →
        </Text>
        <ComparePanel
          uri={afterUri}
          label={FUTURE_YOU_COMPARE_AFTER_LABEL}
          variant="after"
          maxHeight={maxPanelHeight}
        />
      </View>
    </View>
  );
}
