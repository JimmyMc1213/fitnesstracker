export type PaywallBillingPeriod = "yearly" | "monthly";

export const PAYWALL_MONTHLY_PRICE = 14.99;
export const PAYWALL_YEARLY_PRICE = 69.99;

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function yearlySavingsPercent(monthlyPrice: number, yearlyPrice: number): number {
  const annualMonthlyCost = monthlyPrice * 12;
  return Math.round(((annualMonthlyCost - yearlyPrice) / annualMonthlyCost) * 100);
}

export const PAYWALL_YEARLY_BADGE = `${yearlySavingsPercent(PAYWALL_MONTHLY_PRICE, PAYWALL_YEARLY_PRICE)}% OFF`;

export const PAYWALL_PLANS = {
  yearly: {
    label: "Yearly",
    billedAmount: `${formatUsd(PAYWALL_YEARLY_PRICE)}/yr`,
    calculatedPrice: `Just ${formatUsd(PAYWALL_YEARLY_PRICE / 12)}/mo`,
    trialNote: "No trial, billed immediately",
  },
  monthly: {
    label: "Monthly",
    billedAmount: `${formatUsd(PAYWALL_MONTHLY_PRICE)}/mo`,
    calculatedPrice: null,
    trialNote: "No trial, billed immediately",
  },
} as const satisfies Record<
  PaywallBillingPeriod,
  {
    label: string;
    billedAmount: string;
    calculatedPrice: string | null;
    trialNote: string;
  }
>;
