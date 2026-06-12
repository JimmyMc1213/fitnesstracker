import { Platform } from "react-native";

import type { PaywallBillingPeriod } from "@/lib/paywallPlans";

const IOS_KEY = String(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "").trim();
const ANDROID_KEY = String(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "").trim();

let configured = false;
let purchasesModuleUnavailable = false;

type PurchasesModule = typeof import("react-native-purchases");
type PurchasesPackage = import("react-native-purchases").PurchasesPackage;

function loadPurchasesModule(): PurchasesModule | null {
  if (Platform.OS === "web" || purchasesModuleUnavailable) return null;

  try {
    // Lazy require — older dev clients built before RN-4 may lack the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-purchases") as PurchasesModule;
  } catch {
    purchasesModuleUnavailable = true;
    return null;
  }
}

export function isRevenueCatConfigured(): boolean {
  if (Platform.OS === "ios") return IOS_KEY.length > 0;
  if (Platform.OS === "android") return ANDROID_KEY.length > 0;
  return false;
}

/** Configure RevenueCat once when entering onboarding (sandbox key from env). */
export async function configureRevenueCat(): Promise<void> {
  if (configured || !isRevenueCatConfigured()) return;

  const Purchases = loadPurchasesModule()?.default;
  if (!Purchases) return;

  const apiKey = Platform.OS === "ios" ? IOS_KEY : Platform.OS === "android" ? ANDROID_KEY : "";
  if (!apiKey) return;

  try {
    if (__DEV__) {
      const { LOG_LEVEL } = loadPurchasesModule()!;
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    configured = true;
  } catch {
    purchasesModuleUnavailable = true;
  }
}

/** Optional identity link after Supabase auth (RN-4 scope: configure only; logIn when user id available). */
export async function logInRevenueCat(appUserId: string): Promise<void> {
  if (!configured || !appUserId.trim()) return;

  const Purchases = loadPurchasesModule()?.default;
  if (!Purchases) return;

  try {
    await Purchases.logIn(appUserId);
  } catch {
    purchasesModuleUnavailable = true;
  }
}

export type PurchaseProResult = { ok: true; stub: boolean } | { ok: false; error: string };

function packageForBillingPeriod(
  packages: PurchasesPackage[],
  period: PaywallBillingPeriod,
): PurchasesPackage | undefined {
  const targetType = period === "yearly" ? "ANNUAL" : "MONTHLY";
  const match = packages.find((p) => p.packageType === targetType);
  if (match) return match;
  const fallbackType = period === "yearly" ? "MONTHLY" : "ANNUAL";
  return packages.find((p) => p.packageType === fallbackType) ?? packages[0];
}

/**
 * Attempt sandbox purchase. Without API key or native module, stub succeeds so dev/Maestro can finish onboarding.
 */
export async function purchaseProSubscription(period: PaywallBillingPeriod): Promise<PurchaseProResult> {
  if (!isRevenueCatConfigured() || purchasesModuleUnavailable) {
    return { ok: true, stub: true };
  }

  const module = loadPurchasesModule();
  const Purchases = module?.default;
  if (!Purchases) {
    return { ok: true, stub: true };
  }

  try {
    await configureRevenueCat();
    if (!configured) {
      return { ok: true, stub: true };
    }

    const offerings = await Purchases.getOfferings();
    const available = offerings.current?.availablePackages ?? [];
    const pkg = packageForBillingPeriod(available, period);

    if (!pkg) {
      return { ok: false, error: "No subscription packages available" };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro = Boolean(customerInfo.entitlements.active.pro);
    if (!hasPro) {
      return { ok: false, error: "Purchase did not grant pro entitlement" };
    }
    return { ok: true, stub: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    if (message.includes("not linked") || message.includes("Native module")) {
      purchasesModuleUnavailable = true;
      return { ok: true, stub: true };
    }
    return { ok: false, error: message };
  }
}

export async function restorePurchases(): Promise<PurchaseProResult> {
  if (!isRevenueCatConfigured() || purchasesModuleUnavailable) {
    return { ok: true, stub: true };
  }

  const Purchases = loadPurchasesModule()?.default;
  if (!Purchases) {
    return { ok: true, stub: true };
  }

  try {
    await configureRevenueCat();
    if (!configured) {
      return { ok: true, stub: true };
    }

    const customerInfo = await Purchases.restorePurchases();
    const hasPro = Boolean(customerInfo.entitlements.active.pro);
    return hasPro ? { ok: true, stub: false } : { ok: false, error: "No active subscription found" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed";
    if (message.includes("not linked") || message.includes("Native module")) {
      purchasesModuleUnavailable = true;
      return { ok: true, stub: true };
    }
    return { ok: false, error: message };
  }
}
