import { Platform } from "react-native";

import type { PaywallBillingPeriod } from "@/lib/paywallPlans";
import {
  PAYWALL_STORE_SETUP_MESSAGE,
  PAYWALL_STORE_UNAVAILABLE_MESSAGE,
  REVENUECAT_ENTITLEMENT_ID,
  REVENUECAT_PRODUCT_IDS,
  sanitizeRevenueCatError,
} from "@/lib/revenueCatMessages";

const IOS_KEY = String(
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ??
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ??
    "",
).trim();
const ANDROID_KEY = String(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "").trim();

let configured = false;
let purchasesModuleUnavailable = false;

type PurchasesModule = typeof import("react-native-purchases");
type PurchasesPackage = import("react-native-purchases").PurchasesPackage;
type PurchasesOffering = import("react-native-purchases").PurchasesOffering;
type PurchasesOfferings = import("react-native-purchases").PurchasesOfferings;
type PurchasesStoreProduct = import("react-native-purchases").PurchasesStoreProduct;

function loadPurchasesModule(): PurchasesModule | null {
  if (Platform.OS === "web" || purchasesModuleUnavailable) return null;

  try {
    // Lazy require, older dev clients built before RN-4 may lack the native module.
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

export type PaywallOfferingsResult =
  | { ok: true; packages: PurchasesPackage[]; stub: boolean }
  | { ok: false; error: string; stub: boolean };

function productIdForBillingPeriod(period: PaywallBillingPeriod): string {
  return period === "yearly" ? REVENUECAT_PRODUCT_IDS.yearly : REVENUECAT_PRODUCT_IDS.monthly;
}

function packagesFromOfferings(offerings: PurchasesOfferings): PurchasesPackage[] {
  const current = offerings.current?.availablePackages ?? [];
  if (current.length > 0) return current;

  for (const offering of Object.values(offerings.all ?? {}) as PurchasesOffering[]) {
    if (offering.availablePackages?.length) return offering.availablePackages;
  }

  return [];
}

function packageForBillingPeriod(
  packages: PurchasesPackage[],
  period: PaywallBillingPeriod,
): PurchasesPackage | undefined {
  const productId = productIdForBillingPeriod(period);
  const byProductId = packages.find((pkg) => pkg.product.identifier === productId);
  if (byProductId) return byProductId;

  const targetType = period === "yearly" ? "ANNUAL" : "MONTHLY";
  const match = packages.find((p) => p.packageType === targetType);
  if (match) return match;

  const fallbackType = period === "yearly" ? "MONTHLY" : "ANNUAL";
  return packages.find((p) => p.packageType === fallbackType) ?? packages[0];
}

function storeProductForBillingPeriod(
  products: PurchasesStoreProduct[],
  period: PaywallBillingPeriod,
): PurchasesStoreProduct | undefined {
  const productId = productIdForBillingPeriod(period);
  return products.find((product) => product.identifier === productId);
}

function hasProEntitlement(
  customerInfo: import("react-native-purchases").CustomerInfo,
): boolean {
  return Boolean(customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID]);
}

function isNativeModuleError(message: string): boolean {
  return message.includes("not linked") || message.includes("Native module");
}

/** Prefetch offerings when the paywall mounts so purchase errors surface early. */
export async function loadPaywallOfferings(): Promise<PaywallOfferingsResult> {
  if (!isRevenueCatConfigured() || purchasesModuleUnavailable) {
    return { ok: true, packages: [], stub: true };
  }

  const Purchases = loadPurchasesModule()?.default;
  if (!Purchases) {
    return { ok: true, packages: [], stub: true };
  }

  try {
    await configureRevenueCat();
    if (!configured) {
      return { ok: true, packages: [], stub: true };
    }

    const offerings = await Purchases.getOfferings();
    const packages = packagesFromOfferings(offerings);
    if (packages.length > 0) {
      return { ok: true, packages, stub: false };
    }

    const products = await Purchases.getProducts(Object.values(REVENUECAT_PRODUCT_IDS));
    if (products.length > 0) {
      return { ok: true, packages: [], stub: false };
    }

    return {
      ok: false,
      error: PAYWALL_STORE_SETUP_MESSAGE,
      stub: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load subscriptions";
    if (isNativeModuleError(message)) {
      purchasesModuleUnavailable = true;
      return { ok: true, packages: [], stub: true };
    }

    return {
      ok: false,
      error: sanitizeRevenueCatError(message) ?? PAYWALL_STORE_UNAVAILABLE_MESSAGE,
      stub: false,
    };
  }
}

export type PurchaseProResult = { ok: true; stub: boolean } | { ok: false; error: string };

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
    const available = packagesFromOfferings(offerings);
    const pkg = packageForBillingPeriod(available, period);

    if (pkg) {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (!hasProEntitlement(customerInfo)) {
        return { ok: false, error: "Purchase did not grant pro entitlement" };
      }
      return { ok: true, stub: false };
    }

    const products = await Purchases.getProducts(Object.values(REVENUECAT_PRODUCT_IDS));
    const product = storeProductForBillingPeriod(products, period) ?? products[0];
    if (!product) {
      return { ok: false, error: PAYWALL_STORE_SETUP_MESSAGE };
    }

    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    if (!hasProEntitlement(customerInfo)) {
      return { ok: false, error: "Purchase did not grant pro entitlement" };
    }
    return { ok: true, stub: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    if (isNativeModuleError(message)) {
      purchasesModuleUnavailable = true;
      return { ok: true, stub: true };
    }
    const sanitized = sanitizeRevenueCatError(message);
    if (!sanitized) {
      return { ok: false, error: "Purchase cancelled" };
    }
    return { ok: false, error: sanitized };
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
    const hasPro = hasProEntitlement(customerInfo);
    return hasPro ? { ok: true, stub: false } : { ok: false, error: "No active subscription found" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Restore failed";
    if (isNativeModuleError(message)) {
      purchasesModuleUnavailable = true;
      return { ok: true, stub: true };
    }
    const sanitized = sanitizeRevenueCatError(message);
    return { ok: false, error: sanitized ?? message };
  }
}
