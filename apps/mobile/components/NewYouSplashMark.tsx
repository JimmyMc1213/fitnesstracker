import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

function BrandIcon({ color }: { color: string }) {
  return (
    <View style={styles.brandIcon} accessibilityElementsHidden>
      <View style={[styles.brandBarTall, { backgroundColor: color }]} />
      <View style={[styles.brandBarMid, { backgroundColor: color }]} />
      <View style={[styles.brandBarWide, { backgroundColor: color }]} />
      <View style={[styles.brandBarMid, { backgroundColor: color }]} />
      <View style={[styles.brandBarTall, { backgroundColor: color }]} />
    </View>
  );
}

export function NewYouSplashMark() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.root} testID="splash-mark">
      <View style={[styles.logoBox, { backgroundColor: colors.accent }]}>
        <BrandIcon color={colors.accentText} />
      </View>
      <Text style={[styles.wordmark, { color: colors.textPrimary }]}>NewYou</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
  },
  logoBox: {
    marginBottom: 12,
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.5,
    paddingTop: 2,
  },
  brandIcon: {
    height: 22,
    width: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  brandBarTall: {
    height: 14,
    width: 3,
    borderRadius: 1.5,
  },
  brandBarMid: {
    marginHorizontal: 1.5,
    height: 10,
    width: 2.5,
    borderRadius: 1.25,
  },
  brandBarWide: {
    height: 2,
    width: 12,
    borderRadius: 1,
  },
});
