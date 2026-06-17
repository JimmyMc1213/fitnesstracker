/** Pure deep link path resolution for `newyouai://` URLs (RN-3-06). */

export type DeepLinkNavigateAction = {
  type: "navigate";
  href:
    | "/(tabs)/home"
    | "/(tabs)/settings"
    | "/(tabs)/settings/account"
    | "/(tabs)/settings/notifications"
    | { pathname: "/(tabs)/home"; params: { mobility: string } };
};

export type DeepLinkAction =
  | { type: "oauth"; url: string }
  | DeepLinkNavigateAction
  | { type: "fallback" };

function isOAuthUrl(url: string): boolean {
  if (url.includes("access_token=") || url.includes("refresh_token=")) return true;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, "");
    return path === "auth/callback" || path.startsWith("auth/callback/");
  } catch {
    return url.includes("auth/callback");
  }
}

function normalizePath(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const pathPart = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    if (host) {
      return pathPart ? `${host}/${pathPart}` : host;
    }
    return pathPart;
  } catch {
    const withoutScheme = url.replace(/^newyouai:\/\//, "");
    return withoutScheme.split("?")[0]?.split("#")[0]?.replace(/^\/+/, "").replace(/\/+$/, "") ?? "";
  }
}

const isDevEnvironment = typeof __DEV__ !== "undefined" && __DEV__;

export function resolveDeepLink(url: string): DeepLinkAction {
  if (isOAuthUrl(url)) {
    return { type: "oauth", url };
  }

  const path = normalizePath(url);

  if (!path || path === "home") {
    return { type: "navigate", href: "/(tabs)/home" };
  }

  if (path === "stretch") {
    return { type: "navigate", href: { pathname: "/(tabs)/home", params: { mobility: "1" } } };
  }

  if (path === "settings/account") {
    return { type: "navigate", href: "/(tabs)/settings/account" };
  }

  if (path === "settings") {
    return { type: "navigate", href: "/(tabs)/settings" };
  }

  if (path === "settings/notifications") {
    return { type: "navigate", href: "/(tabs)/settings/notifications" };
  }

  if (path.startsWith("settings/")) {
    const panel = path.slice("settings/".length);
    if (panel) {
      return {
        type: "navigate",
        href: `/(tabs)/settings/${panel}` as "/(tabs)/settings/account",
      };
    }
  }

  if (isDevEnvironment) {
    console.warn(`[deepLinkRouter] Unknown path "${path}", falling back to home`);
  }

  return { type: "fallback" };
}
