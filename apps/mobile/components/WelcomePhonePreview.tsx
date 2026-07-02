import { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { onboardingThemeFor } from "@/lib/onboardingTheme";

type WelcomePhonePreviewProps = {
  /** Large centered hero for welcome landing screens. */
  size?: "default" | "hero";
  /** Brand gold accent instead of theme blue. */
  useBrandGold?: boolean;
};

function usePreviewSize(size: "default" | "hero") {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  return useMemo(() => {
    const fallbackHeight = size === "hero" ? 220 : 140;
    if (screenWidth <= 0 || screenHeight <= 0) {
      const height = fallbackHeight;
      return { width: height * (9 / 16), height };
    }

    if (size === "hero") {
      // Reserve space for logo, copy, CTA, and safe-area padding so the button stays on screen.
      const reservedVertical = 340;
      const maxHeight = Math.max(fallbackHeight, screenHeight - reservedVertical);
      const height = Math.max(fallbackHeight, Math.min(Math.round(screenHeight * 0.36), maxHeight));
      const width = height * (9 / 16);
      return { width, height };
    }

    const widthCap = Math.min(176, Math.round(screenWidth * 0.46));
    const heightCap = Math.round(screenHeight * 0.18);
    const height = Math.max(fallbackHeight, Math.min(widthCap * (16 / 9), heightCap));
    const width = height * (9 / 16);

    return { width, height };
  }, [screenHeight, screenWidth, size]);
}

export function WelcomePhonePreview({ size = "default", useBrandGold = false }: WelcomePhonePreviewProps) {
  const { colors, scheme } = useAppTheme();
  const ob = onboardingThemeFor(scheme);
  const accent = useBrandGold ? ob.gold : colors.accent;
  const accentOn = useBrandGold ? ob.goldOn : colors.accentText;
  const { width, height } = usePreviewSize(size);

  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.frame,
        size === "hero" ? styles.frameHero : null,
        {
          width,
          height,
          borderColor: colors.border,
          backgroundColor: colors.card,
        },
      ]}
      testID="welcome-phone-preview"
    >
      <View style={[styles.statusBar, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.statusDot, { backgroundColor: accent }]} />
        <View style={[styles.statusPill, { backgroundColor: colors.backgroundTertiary }]} />
      </View>

      <View style={styles.content}>
        <View style={[styles.heroCard, size === "hero" ? styles.heroCardLarge : null, { backgroundColor: accent }]}>
          <View style={[styles.heroLineWide, { backgroundColor: accentOn, opacity: 0.9 }]} />
          <View style={[styles.heroLineMid, { backgroundColor: accentOn, opacity: 0.65 }]} />
        </View>

        <View style={styles.metricRow}>
          {[0.72, 0.48, 0.86].map((fill, index) => (
            <View
              key={index}
              style={[styles.metricCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            >
              <View style={[styles.metricTrack, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.metricFill,
                    { width: `${fill * 100}%`, backgroundColor: index === 2 ? accent : colors.textSecondary },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.workoutCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={[styles.workoutLine, { backgroundColor: colors.textPrimary, opacity: 0.85 }]} />
          <View style={[styles.workoutLineShort, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.workoutCta, { backgroundColor: colors.textPrimary }]}>
            <View style={[styles.workoutCtaInner, { backgroundColor: colors.background }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  frameHero: {
    borderRadius: 28,
    borderWidth: 1.5,
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  statusPill: {
    height: 5,
    width: 28,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  heroCard: {
    borderRadius: 10,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  heroCardLarge: {
    borderRadius: 12,
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  heroLineWide: {
    height: 5,
    width: "72%",
    borderRadius: 3,
  },
  heroLineMid: {
    height: 4,
    width: "48%",
    borderRadius: 2,
  },
  metricRow: {
    flexDirection: "row",
    gap: 6,
  },
  metricCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  metricTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    borderRadius: 2,
  },
  workoutCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  workoutLine: {
    height: 5,
    width: "58%",
    borderRadius: 3,
  },
  workoutLineShort: {
    height: 4,
    width: "42%",
    borderRadius: 2,
  },
  workoutCta: {
    alignSelf: "flex-start",
    marginTop: "auto",
    borderRadius: 999,
    padding: 2,
  },
  workoutCtaInner: {
    height: 6,
    width: 34,
    borderRadius: 999,
  },
});
