import { useState } from "react";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

type Props = {
  /** Faux Allow / Don't Allow taps. Caller advances to reminder picker. */
  onChoice: () => void | Promise<void>;
};

const DIALOG_HAIRLINE = "rgba(0, 0, 0, 0.12)";

/** Cal-style pre-prompt mimicking the iOS system permission dialog; taps advance to notification preferences. */
export function OnboardingNotificationPrompt({ onChoice }: Props) {
  const { ob } = useOnboardingTheme();
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
    <View testID="onboarding-notification-prompt" style={{ flex: 1, width: "100%" }}>
      <View style={{ position: "absolute", top: 56, left: 0, right: 0, alignItems: "center" }}>
        <Text
          className="text-center font-bold"
          style={{
            maxWidth: 320,
            fontSize: 32,
            lineHeight: 36,
            letterSpacing: -0.6,
            color: ob.headline,
          }}
        >
          Reach your goals with notifications
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: "100%",
            maxWidth: 300,
            marginBottom: 96,
            borderRadius: 14,
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            overflow: "hidden",
            opacity: pending ? 0.92 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.3,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <Text
            style={{
              paddingTop: 22,
              paddingHorizontal: 20,
              paddingBottom: 18,
              fontSize: 16,
              fontWeight: "600",
              lineHeight: 22,
              textAlign: "center",
              color: "#111",
            }}
          >
            NewYou would like to send you Notifications
          </Text>

          <View style={{ flexDirection: "row", borderTopWidth: 0.5, borderTopColor: DIALOG_HAIRLINE }}>
            <PressableScale
              onPress={() => void handleTap()}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel="Don't Allow"
              testID="onboarding-notification-decline"
              style={{
                flex: 1,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                backgroundColor: "rgba(0, 0, 0, 0.06)",
                borderRightWidth: 0.5,
                borderRightColor: DIALOG_HAIRLINE,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111" }}>Don&apos;t Allow</Text>
            </PressableScale>
            <PressableScale
              onPress={() => void handleTap()}
              disabled={pending}
              accessibilityRole="button"
              accessibilityLabel="Allow"
              testID="onboarding-notification-allow"
              style={{
                flex: 1,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                backgroundColor: "#111",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Allow</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </View>
  );
}
