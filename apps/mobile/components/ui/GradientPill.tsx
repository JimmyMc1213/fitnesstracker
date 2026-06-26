import { useId, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { PressableScale } from "@/components/ui/PressableScale";
import { useAppTheme } from "@/hooks/useAppTheme";
import { equipmentTypePillStyle } from "@/lib/workoutUiTokens";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

function parseGradientStop(color: string): { stopColor: string; stopOpacity?: number } {
  const match = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return { stopColor: color };

  const [, r, g, b, a] = match;
  const opacity = a != null ? Number(a) : 1;
  if (opacity >= 1) return { stopColor: `rgb(${r}, ${g}, ${b})` };
  return { stopColor: `rgb(${r}, ${g}, ${b})`, stopOpacity: opacity };
}

export function GradientPill({
  children,
  onPress,
  disabled,
  style,
  testID,
  accessibilityLabel,
}: Props) {
  const { theme } = useAppTheme();
  const pill = equipmentTypePillStyle(theme);
  const gradientId = `gp-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const body = (
    <View
      style={[
        styles.shell,
        {
          borderColor: pill.border,
          backgroundColor: pill.gradientStops[1]?.color ?? pill.gradientStops[0]?.color,
        },
        style,
      ]}
    >
      <View style={styles.clip}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              {pill.gradientStops.map((stop, index) => {
                const { stopColor, stopOpacity } = parseGradientStop(stop.color);
                return (
                  <Stop
                    key={index}
                    offset={stop.offset}
                    stopColor={stopColor}
                    stopOpacity={stopOpacity}
                  />
                );
              })}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
        <View style={[styles.topHighlight, { backgroundColor: pill.topHighlight }]} pointerEvents="none" />
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeScale={0.97}
      style={{ opacity: disabled ? 0.45 : 1, alignSelf: "flex-start" }}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 9999,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  clip: {
    borderRadius: 9999,
    overflow: "hidden",
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
