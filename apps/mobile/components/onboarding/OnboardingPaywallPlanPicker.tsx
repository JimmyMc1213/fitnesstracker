import { PAYWALL_PLANS, PAYWALL_YEARLY_BADGE, type PaywallBillingPeriod } from "@/lib/paywallPlans";
import { Pressable, Text, View } from "react-native";

import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { onboardingPillColors } from "@/lib/onboardingTheme";

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
  const pill = onboardingPillColors(ob, selected);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      testID={`paywall-plan-${period}`}
      className="relative flex-1 rounded-2xl border p-4"
      style={{
        borderColor: pill.borderColor,
        backgroundColor: pill.backgroundColor,
        borderWidth: selected ? 2 : 1,
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
      <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
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
    </Pressable>
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
