import { useId, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { GRADIENT_CARD_ANGLE_DEG } from "@/lib/onboardingTheme";

type Props = {
  children: ReactNode;
  /** Inner padding. Defaults to 16 (PWA `.onboarding-gradient-card`). */
  padding?: number;
  /** Use the 20px padding variant (`--spacious`). */
  spacious?: boolean;
  /** Colored left-border accent (e.g. macro tones). Adds the 2px rule + 10px inset. */
  accentColor?: string;
  /** Corner radius. Defaults to 16 to match PWA. */
  radius?: number;
  /** Stretch the inner layers so children can fill the card height (use with a flex outer style). */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Maps a CSS gradient angle to SVG objectBoundingBox start/end coordinates.
 * CSS 0deg = upward; clockwise. 168deg ≈ near-vertical top→bottom, tilted slightly right.
 */
function angleToCoords(deg: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  return {
    x1: 0.5 - dx / 2,
    y1: 0.5 - dy / 2,
    x2: 0.5 + dx / 2,
    y2: 0.5 + dy / 2,
  };
}

/** RN SVG ignores alpha in `stopColor="rgba(...)"` — split into rgb + stopOpacity. */
function parseGradientStop(color: string): { stopColor: string; stopOpacity?: number } {
  const match = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return { stopColor: color };

  const [, r, g, b, a] = match;
  const opacity = a != null ? Number(a) : 1;
  if (opacity >= 1) return { stopColor: `rgb(${r}, ${g}, ${b})` };
  return { stopColor: `rgb(${r}, ${g}, ${b})`, stopOpacity: opacity };
}

/** Shared card with the PWA's subtle gradient depth, hairline border, and soft shadow. */
export function GradientCard({ children, padding, spacious, accentColor, radius = 16, fill = false, style, testID }: Props) {
  const { ob } = useOnboardingTheme();
  const pad = padding ?? (spacious ? 20 : 16);
  const stops = ob.gradientCardStops;
  const shadow = ob.gradientCardShadow;
  const coords = angleToCoords(GRADIENT_CARD_ANGLE_DEG);

  // SVG gradient ids must be unique per instance and url-safe.
  const gradientId = `gc-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View
      testID={testID}
      style={[
        {
          borderRadius: radius,
          backgroundColor: stops[1]?.color ?? stops[0]?.color,
          shadowColor: shadow.color,
          shadowOffset: shadow.offset,
          shadowOpacity: shadow.opacity,
          shadowRadius: shadow.radius,
          elevation: shadow.elevation,
        },
        style,
      ]}
    >
      <View style={[styles.clip, fill && styles.fill, { borderRadius: radius, borderColor: ob.cardBorder }]}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id={gradientId} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
              {stops.map((stop, index) => {
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
        <View style={[styles.topHighlight, { backgroundColor: ob.cardTopHighlight }]} pointerEvents="none" />
        <View
          style={[
            accentColor
              ? { padding: pad, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: accentColor }
              : { padding: pad },
            fill && styles.fill,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    borderWidth: 0.5,
  },
  fill: {
    flex: 1,
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
