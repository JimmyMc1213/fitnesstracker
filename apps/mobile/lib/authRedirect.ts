import * as Linking from "expo-linking";

/** Must match `additional_redirect_urls` in supabase/config.toml. */
export const AUTH_CALLBACK_PATH = "auth/callback";

/** Redirect target for Supabase auth emails (signup confirm, email change). */
export function authEmailRedirectUrl(
  createUrl: (path: string) => string = Linking.createURL,
): string {
  return createUrl(AUTH_CALLBACK_PATH);
}
