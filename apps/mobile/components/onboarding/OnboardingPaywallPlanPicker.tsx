import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE, type PaywallBillingPeriod } from "@/lib/paywallPlans";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { useLargeTextEnabled } from "@/lib/fontScale";

type Props = {
  value: PaywallBillingPeriod;
  onChange: (period: PaywallBillingPeriod) => void;
};

function PlanCard({
  period,
  selected,
  onSelect,
  stacked = false,
}: {
  period: PaywallBillingPeriod;
  selected: boolean;
  onSelect: () => void;
  stacked?: boolean;
}) {
  const { colors, ob } = useOnboardingTheme();
  const largeText = useLargeTextEnabled();
  const plan = PAYWALL_PLANS[period];
  const isYearly = period === "yearly";

  return (
    <PressableScale
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      testID={`paywall-plan-${period}`}
      activeScale={0.97}
      style={{
        position: "relative",
        flex: stacked ? undefined : 1,
        width: stacked ? "100%" : undefined,
        borderRadius: 16,
        padding: 16,
        paddingRight: 36,
        borderWidth: 2,
        borderColor: selected ? ob.gold : colors.border,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
      }}
    >
      {isYearly ? (
        <View
          className="absolute rounded-full px-2.5 py-0.5"
          style={{ top: -10, left: 8, backgroundColor: ob.gold }}
        >
          <Text className="text-[11px] font-bold uppercase" style={{ color: ob.goldOn }}>
            {PAYWALL_YEARLY_BADGE}
          </Text>
        </View>
      ) : null}
      <View
        className="absolute right-2 top-2 h-5 w-5 items-center justify-center rounded-full"
        style={{
          borderWidth: 2,
          borderColor: selected ? ob.gold : "rgba(255, 255, 255, 0.28)",
          backgroundColor: selected ? ob.gold : "transparent",
        }}
      >
        {selected ? (
          <Text className="text-[10px] font-bold" style={{ color: ob.goldOn }}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text className="text-lg font-bold leading-tight" style={{ color: colors.textPrimary }}>
        {plan.label}
      </Text>
      <Text className="mt-1 text-xl font-bold leading-tight" style={{ color: colors.textPrimary }}>
        {plan.displayPerMonth}
      </Text>
      <Text
        className="mt-1 text-[10px] leading-snug"
        style={{ color: colors.textSecondary }}
        numberOfLines={largeText ? undefined : 2}
      >
        {plan.trialNote}
      </Text>
      <Text
        className="mt-0.5 text-[11px] leading-snug"
        style={{ color: colors.textTertiary }}
        numberOfLines={largeText ? undefined : 2}
      >
        {plan.billingNote}
      </Text>
    </PressableScale>
  );
}

export function OnboardingPaywallPlanPicker({ value, onChange }: Props) {
  const largeText = useLargeTextEnabled();

  return (
    <View
      testID="onboarding-paywall-plan-picker"
      className={largeText ? "gap-3" : "flex-row gap-3"}
      accessibilityRole="radiogroup"
      accessibilityLabel="Subscription plan"
    >
      <PlanCard
        period="yearly"
        selected={value === "yearly"}
        onSelect={() => onChange("yearly")}
        stacked={largeText}
      />
      <PlanCard
        period="monthly"
        selected={value === "monthly"}
        onSelect={() => onChange("monthly")}
        stacked={largeText}
      />
    </View>
  );
}
