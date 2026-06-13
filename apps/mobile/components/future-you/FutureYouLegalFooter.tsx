import { Linking, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";

type Props = {
  className?: string;
};

export function FutureYouLegalFooter({ className }: Props) {
  const { colors } = useAppTheme();

  return (
    <View className={className}>
      <Text className="text-center text-xs leading-5" style={{ color: colors.textTertiary }}>
        Illustrative preview — not medical advice. Delete anytime in Settings.{" "}
        <Text style={{ color: colors.accent }} onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}>
          Privacy Policy
        </Text>
        {" · "}
        <Text style={{ color: colors.accent }} onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
          Terms
        </Text>
      </Text>
    </View>
  );
}
