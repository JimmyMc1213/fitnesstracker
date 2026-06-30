/** Canonical staff dashboard origin — never the consumer app subdomain. */
export const ADMIN_SITE_URL = "https://admin.newyouai.app";

export function getAdminSiteUrl(): string {
  return process.env.NEXT_PUBLIC_ADMIN_SITE_URL?.trim() || ADMIN_SITE_URL;
}

export function adminAuthCallbackUrl(from?: string | null): string {
  const base = getAdminSiteUrl().replace(/\/$/, "");
  const path = from && from.startsWith("/") ? from : "/";
  return `${base}/auth/callback${path !== "/" ? `?from=${encodeURIComponent(path)}` : ""}`;
}
