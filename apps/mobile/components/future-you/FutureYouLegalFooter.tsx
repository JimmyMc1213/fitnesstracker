import { Linking, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";

type Props = {
  className?: string;
  /** PWA onboarding legal line (9px). */
  compact?: boolean;
  /** Override the link color (defaults to the theme accent). */
  accentColor?: string;
};

export function FutureYouLegalFooter({ className, compact = false, accentColor }: Props) {
  const { colors } = useAppTheme();
  const linkColor = accentColor ?? colors.accent;

  const textSizeClass = compact ? "text-[9px] leading-[1.35]" : "text-xs leading-5";

  return (
    <View className={className}>
      <Text
        className={`text-center px-1 ${textSizeClass}`}
        style={{ color: colors.textTertiary }}
      >
        Illustrative preview, not medical advice. Delete anytime in Settings.
      </Text>
      <Text className={`text-center px-1 ${textSizeClass}`} style={{ color: colors.textTertiary }}>
        <Text style={{ color: linkColor }} onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}>
          Privacy Policy
        </Text>
        {" · "}
        <Text style={{ color: linkColor }} onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
          Terms
        </Text>
      </Text>
    </View>
  );
}
