import {
  FUTURE_YOU_COMPARE_AFTER_LABEL,
  FUTURE_YOU_COMPARE_BEFORE_LABEL,
} from "@newyouai/core";
import type { RefObject } from "react";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from "react-native";

const COMPARE_BG = "#121212";
const COMPARE_TITLE = "#f5f5f5";
const COMPARE_SUBTITLE = "#aaaaaa";
const PANEL_RADIUS = 10;
const PANEL_MIN_HEIGHT = 160;
const LABEL_BLOCK_HEIGHT = 56;
const PANEL_GAP = 12;

const panelCornerStyle: ViewStyle =
  Platform.OS === "ios" ? { borderCurve: "continuous" } : {};

function panelMaxHeight(windowHeight: number) {
  return Math.min(320, Math.max(200, windowHeight * 0.38));
}

type Props = {
  beforeUri: string;
  afterUri: string;
  beforeSubtitle?: string | null;
  afterSubtitle?: string | null;
  captureRef?: RefObject<View | null>;
};

function ComparePanel({
  uri,
  title,
  subtitle,
  maxHeight,
}: {
  uri: string;
  title: string;
  subtitle?: string | null;
  maxHeight: number;
}) {
  return (
    <View className="min-w-0 flex-1">
      <View style={{ minHeight: LABEL_BLOCK_HEIGHT, justifyContent: "flex-end", paddingBottom: 8 }}>
        <Text
          className="text-center text-[17px] font-bold"
          style={{ color: COMPARE_TITLE }}
        >
          {title}
        </Text>
        {subtitle ?
          <Text
            className="mt-0.5 text-center text-[13px]"
            style={{ color: COMPARE_SUBTITLE }}
          >
            {subtitle}
          </Text>
        : null}
      </View>
      <View
        style={{
          width: "100%",
          aspectRatio: 9 / 16,
          minHeight: PANEL_MIN_HEIGHT,
          maxHeight,
          borderRadius: PANEL_RADIUS,
          ...panelCornerStyle,
          overflow: "hidden",
          backgroundColor: "#1a1a1a",
        }}
      >
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

export function FutureYouComparePanels({
  beforeUri,
  afterUri,
  beforeSubtitle,
  afterSubtitle,
  captureRef,
}: Props) {
  const { height: windowHeight } = useWindowDimensions();
  const maxPanelHeight = panelMaxHeight(windowHeight);

  return (
    <View testID="future-you-compare-panels" className="min-h-0 flex-1 justify-center">
      <View
        ref={captureRef}
        collapsable={false}
        style={{
          backgroundColor: COMPARE_BG,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 12,
          ...(Platform.OS === "ios" ? { borderCurve: "continuous" } : {}),
        }}
      >
        <View className="flex-row items-end" style={{ gap: PANEL_GAP }}>
          <ComparePanel
            uri={beforeUri}
            title={FUTURE_YOU_COMPARE_BEFORE_LABEL}
            subtitle={beforeSubtitle}
            maxHeight={maxPanelHeight}
          />
          <ComparePanel
            uri={afterUri}
            title={FUTURE_YOU_COMPARE_AFTER_LABEL}
            subtitle={afterSubtitle}
            maxHeight={maxPanelHeight}
          />
        </View>
      </View>
    </View>
  );
}
