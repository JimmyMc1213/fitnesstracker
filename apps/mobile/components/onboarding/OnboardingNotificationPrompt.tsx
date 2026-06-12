import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  /** Faux Allow / Don't Allow taps. Caller advances to reminder picker. */
  onChoice: () => void | Promise<void>;
};

/** Cal-style pre-prompt; taps advance to notification preferences (OS permission deferred to RN-PUSH). */
export function OnboardingNotificationPrompt({ onChoice }: Props) {
  const { colors } = useAppTheme();
  const [pending, setPending] = useState(false);

  async function handleTap() {
    if (pending) return;
    setPending(true);
    try {
      await onChoice();
    } finally {
      setPending(false);
    }
  }

  return (
    <View testID="onboarding-notification-prompt" className="items-center">
      <Text className="mb-8 text-center text-2xl font-bold leading-tight" style={{ color: colors.textPrimary }}>
        Reach your goals with notifications
      </Text>

      <View
        className="w-full max-w-sm overflow-hidden rounded-2xl"
        style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
      >
        <View className="px-5 py-6">
          <Text className="text-center text-base" style={{ color: colors.textPrimary }}>
            Gymmy would like to send you Notifications
          </Text>
        </View>
        <View className="flex-row border-t" style={{ borderColor: colors.border }}>
          <Pressable
            onPress={() => void handleTap()}
            disabled={pending}
            className="flex-1 items-center py-3.5"
            style={{ opacity: pending ? 0.6 : 1 }}
            testID="onboarding-notification-decline"
          >
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Don&apos;t Allow
            </Text>
          </Pressable>
          <View className="w-px" style={{ backgroundColor: colors.border }} />
          <Pressable
            onPress={() => void handleTap()}
            disabled={pending}
            className="flex-1 items-center py-3.5"
            style={{ opacity: pending ? 0.6 : 1 }}
            testID="onboarding-notification-allow"
          >
            <Text className="text-base font-semibold" style={{ color: colors.accent }}>
              Allow
            </Text>
          </Pressable>
        </View>
      </View>

      <Text className="mt-3 text-center text-xs" style={{ color: colors.textTertiary }}>
        Tap Allow or Don&apos;t Allow to continue setup
      </Text>
    </View>
  );
}
