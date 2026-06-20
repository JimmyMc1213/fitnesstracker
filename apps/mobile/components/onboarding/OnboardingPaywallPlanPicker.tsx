import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE, type PaywallBillingPeriod } from "@/lib/paywallPlans";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";

type Props = {
  value: PaywallBillingPeriod;
  onChange: (period: PaywallBillingPeriod) => void;
};

function PlanCard({
  period,
  selected,
  onSelect,
}: {
  period: PaywallBillingPeriod;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors, ob } = useOnboardingTheme();
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
        flex: 1,
        borderRadius: 16,
        padding: 16,
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
        className="mt-1 text-[10px] leading-tight"
        style={{ color: colors.textSecondary }}
        numberOfLines={1}
      >
        {plan.trialNote}
      </Text>
      <Text className="mt-0.5 text-[11px] leading-tight" style={{ color: colors.textTertiary }}>
        {plan.billingNote}
      </Text>
    </PressableScale>
  );
}

export function OnboardingPaywallPlanPicker({ value, onChange }: Props) {
  return (
    <View testID="onboarding-paywall-plan-picker" className="flex-row gap-3">
      <PlanCard period="yearly" selected={value === "yearly"} onSelect={() => onChange("yearly")} />
      <PlanCard period="monthly" selected={value === "monthly"} onSelect={() => onChange("monthly")} />
    </View>
  );
}
