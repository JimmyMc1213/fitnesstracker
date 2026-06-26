/** Dev-only flags for testing Future You without production guardrails. */
export function isFutureYouSkipCooldownEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_FUTURE_YOU_SKIP_COOLDOWN === "true";
}

/** Matches server FUTURE_YOU_ENTITLEMENT_STUB — reveal full image without IAP in dev. */
export function isFutureYouDevEntitlementEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_FUTURE_YOU_ENTITLEMENT_STUB === "true";
}
