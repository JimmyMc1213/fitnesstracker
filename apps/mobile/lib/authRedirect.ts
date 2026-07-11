import * as Linking from "expo-linking";

/** Must match `additional_redirect_urls` in supabase/config.toml. */
export const AUTH_CALLBACK_PATH = "auth/callback";

/** HTTPS bridge for Supabase auth emails — browsers cannot render custom schemes. */
export const AUTH_EMAIL_REDIRECT_BRIDGE_URL = "https://app.newyouai.app/auth/callback";

function envAuthEmailRedirectUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_AUTH_EMAIL_REDIRECT_URL?.trim();
  return raw || null;
}

/**
 * Redirect target for Supabase auth emails (password reset, signup confirm, email change).
 * Uses the hosted HTTPS bridge so Mail/Safari do not land on about:blank for newyouai:// URLs.
 */
export function authEmailRedirectUrl(
  createUrl: (path: string) => string = Linking.createURL,
): string {
  return envAuthEmailRedirectUrl() ?? AUTH_EMAIL_REDIRECT_BRIDGE_URL;
}

/** In-app OAuth redirect (Google/Apple) — custom scheme via Expo Linking. */
export function authOAuthRedirectUrl(
  createUrl: (path: string) => string = Linking.createURL,
): string {
  return createUrl(AUTH_CALLBACK_PATH);
}
