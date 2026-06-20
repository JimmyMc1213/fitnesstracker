export type PaywallBillingPeriod = "yearly" | "monthly";

/** NewYou tier matrix pricing (sandbox / display until StoreKit offerings wired in RN-STORE). */
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
    displayPerMonth: `${formatUsd(PAYWALL_YEARLY_PRICE / 12)}/mo`,
    trialNote: "No trial, billed immediately",
    billingNote: `Billed at ${formatUsd(PAYWALL_YEARLY_PRICE)}/yr.`,
  },
  monthly: {
    label: "Monthly",
    displayPerMonth: `${formatUsd(PAYWALL_MONTHLY_PRICE)}/mo`,
    trialNote: "No trial, billed immediately",
    billingNote: `Billed at ${formatUsd(PAYWALL_MONTHLY_PRICE)}/mo.`,
  },
} as const satisfies Record<
  PaywallBillingPeriod,
  { label: string; displayPerMonth: string; trialNote: string; billingNote: string }
>;
