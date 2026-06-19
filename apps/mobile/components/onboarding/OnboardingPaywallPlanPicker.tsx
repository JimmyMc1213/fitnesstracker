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
        borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? ob.gold : "rgba(255, 255, 255, 0.14)",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
      }}
    >
      {isYearly ? (
        <View
          className="absolute -top-2.5 self-center rounded-full px-2 py-0.5"
          style={{ backgroundColor: ob.gold }}
        >
          <Text className="text-[10px] font-bold uppercase" style={{ color: ob.goldOn }}>
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
      <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
        {plan.label}
      </Text>
      <Text className="mt-1 text-lg font-bold" style={{ color: colors.textPrimary }}>
        {plan.displayPerMonth}
      </Text>
      {plan.trialNote ? (
        <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
          {plan.trialNote}
        </Text>
      ) : null}
      <Text className="mt-0.5 text-xs" style={{ color: colors.textTertiary }}>
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
