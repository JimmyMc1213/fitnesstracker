import { Image, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

const logoSource = require("@/assets/images/newyou-mark.png");

export type NewYouSplashMarkProps = {
  /** Icon-only mark without the wordmark. */
  iconOnly?: boolean;
  /** Logo width/height in px (default matches auth/onboarding splash). */
  size?: number;
};

export function NewYouSplashMark({ iconOnly = false, size = 56 }: NewYouSplashMarkProps = {}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.root} testID="splash-mark">
      <Image
        source={logoSource}
        style={[
          styles.logo,
          iconOnly ? styles.logoIconOnly : null,
          { width: size, height: size, backgroundColor: "transparent" },
        ]}
        accessibilityElementsHidden
        accessibilityIgnoresInvertColors
      />
      {iconOnly ? null : (
        <Text style={[styles.wordmark, { color: colors.textPrimary }]}>NewYou</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
  },
  logo: {
    marginBottom: 12,
    resizeMode: "contain",
  },
  logoIconOnly: {
    marginBottom: 0,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.5,
    paddingTop: 2,
  },
});
