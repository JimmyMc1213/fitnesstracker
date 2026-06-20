import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FutureYouDraft, FutureYouJobStatus } from "@newyouai/types";

import { OnboardingContentReveal } from "@/components/motion";
import { OnboardingPaywallFutureYouHero } from "@/components/onboarding/OnboardingPaywallFutureYouHero";
import { OnboardingPaywallPlanPicker } from "@/components/onboarding/OnboardingPaywallPlanPicker";
import { OnboardingPaywallPlanSummary } from "@/components/onboarding/OnboardingPaywallPlanSummary";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";
import {
  futureYouPaywallCtaLabel,
  isFutureYouPaywallCtaEnabled,
  isFutureYouPaywallHeroVisible,
} from "@/lib/futureYouPaywallModel";
import {
  paywallFooterStartStep,
  paywallRevealDelayMs,
} from "@/lib/onboardingPaywallReveal";
import type { OnboardingPlanSnapshot } from "@/lib/onboardingPlanSnapshot";
import type { PaywallBillingPeriod } from "@/lib/paywallPlans";
import { purchaseProSubscription, restorePurchases } from "@/lib/revenueCat";

type Props = {
  onSelectTier: (tier: "pro") => void;
  onBack: () => void;
  planSnapshot: OnboardingPlanSnapshot;
  futureYou: FutureYouDraft | undefined;
  generationStatus: FutureYouJobStatus | "idle";
  photoBlocked: boolean;
};

export function OnboardingPaywall({
  onSelectTier,
  onBack,
  planSnapshot,
  futureYou,
  generationStatus,
  photoBlocked,
}: Props) {
  const { colors, ob } = useOnboardingTheme();
  const insets = useSafeAreaInsets();
  const [billingPeriod, setBillingPeriod] = useState<PaywallBillingPeriod>("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroVisible = isFutureYouPaywallHeroVisible(futureYou, photoBlocked);
  const ctaEnabled = isFutureYouPaywallCtaEnabled(futureYou, generationStatus, photoBlocked) && !purchasing;
  const ctaLabel = futureYouPaywallCtaLabel(futureYou, generationStatus, photoBlocked, billingPeriod);
  const footerStartStep = paywallFooterStartStep(heroVisible);

  async function handlePurchase() {
    if (!ctaEnabled) return;
    setPurchasing(true);
    setError(null);
    const result = await purchaseProSubscription(billingPeriod);
    setPurchasing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSelectTier("pro");
  }

  async function handleRestore() {
    if (!ctaEnabled) return;
    setPurchasing(true);
    setError(null);
    const result = await restorePurchases();
    setPurchasing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSelectTier("pro");
  }

  return (
    <View
      testID="onboarding-paywall"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 8,
        paddingHorizontal: 23,
      }}
    >
      <PressableScale
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        testID="onboarding-back"
        style={{ marginBottom: 16, height: 40, width: 40, alignItems: "center", justifyContent: "center" }}
      >
        <Text className="text-3xl" style={{ color: colors.textPrimary }}>
          ‹
        </Text>
      </PressableScale>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ gap: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OnboardingContentReveal delay={paywallRevealDelayMs(0)}>
          <Text className="text-center text-[28px] font-bold leading-tight" style={{ color: colors.textPrimary }}>
            {heroVisible ? (
              <>
                Unlock <Text style={{ color: ob.gold }}>NewYouAI</Text> to see what you can look like.
              </>
            ) : (
              <>
                Unlock <Text style={{ color: ob.gold }}>NewYouAI</Text> to reach your goals faster.
              </>
            )}
          </Text>
        </OnboardingContentReveal>

        {heroVisible ? (
          <OnboardingPaywallFutureYouHero
            timeline={planSnapshot.timeline}
            jobId={futureYou?.generationJobId}
            status={generationStatus}
            gender={planSnapshot.profile.gender}
          />
        ) : (
          <OnboardingContentReveal delay={paywallRevealDelayMs(1)}>
            <OnboardingPaywallPlanSummary planSnapshot={planSnapshot} />
          </OnboardingContentReveal>
        )}
      </ScrollView>

      <View style={{ marginTop: "auto", flexShrink: 0, width: "100%" }}>
        <View className="gap-3">
          <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep)}>
            <OnboardingPaywallPlanPicker value={billingPeriod} onChange={setBillingPeriod} />
          </OnboardingContentReveal>
          <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep + 1)}>
            <PressableScale
              onPress={() => void handlePurchase()}
              disabled={!ctaEnabled}
              testID="onboarding-paywall-cta"
              style={{
                alignItems: "center",
                borderRadius: 9999,
                paddingVertical: 16,
                backgroundColor: ctaEnabled ? ob.gold : colors.border,
                opacity: ctaEnabled ? 1 : 0.6,
              }}
            >
              <Text
                className="text-[17px] font-bold leading-5 tracking-tight"
                style={{ color: ctaEnabled ? ob.goldOn : colors.textSecondary }}
              >
                {purchasing ? "Processing…" : ctaLabel}
              </Text>
            </PressableScale>
          </OnboardingContentReveal>
          {error ? (
            <Text className="text-center text-sm" style={{ color: "#f87171" }}>
              {error}
            </Text>
          ) : null}
        </View>

        <OnboardingContentReveal delay={paywallRevealDelayMs(footerStartStep + 2)}>
          <View
            className="flex-row flex-wrap justify-center gap-x-4 gap-y-1"
            style={{ paddingTop: 12, paddingBottom: Math.max(insets.bottom, 8) }}
          >
            <PressableScale onPress={() => void handleRestore()} testID="onboarding-paywall-restore">
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Restore Purchases
              </Text>
            </PressableScale>
            <PressableScale onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Terms
              </Text>
            </PressableScale>
            <PressableScale onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}>
              <Text className="text-sm underline" style={{ color: colors.textSecondary }}>
                Privacy
              </Text>
            </PressableScale>
          </View>
        </OnboardingContentReveal>
      </View>
    </View>
  );
}
