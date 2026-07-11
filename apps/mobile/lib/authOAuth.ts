/** Pure helpers for Supabase OAuth / email confirmation redirect handling (RN-2-03 / RN-2-05). */

export type OAuthRedirectTokens = {
  accessToken: string;
  refreshToken: string;
};

export type OAuthRedirectParseResult =
  | { ok: true; mode: "session"; tokens: OAuthRedirectTokens; recovery?: boolean }
  | { ok: true; mode: "code"; code: string; recovery?: boolean }
  | { ok: true; mode: "token_hash"; tokenHash: string; otpType: string; recovery?: boolean }
  | { ok: false; error: string; cancelled?: boolean };

/** Merge query + hash params — Supabase puts tokens in the hash and type in query. */
export function parseAuthRedirectParams(url: string): Record<string, string> {
  const parsed = new URL(url);
  const params = Object.fromEntries(parsed.searchParams.entries());
  const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
  if (hash) {
    for (const [key, value] of new URLSearchParams(hash).entries()) {
      params[key] = value;
    }
  }
  return params;
}

export function parseOAuthRedirectUrl(url: string): OAuthRedirectParseResult {
  const params = parseAuthRedirectParams(url);
  const error = params.error_description ?? params.error;
  if (error) {
    const message = decodeURIComponent(error.replace(/\+/g, " "));
    if (params.error === "access_denied") {
      return { ok: false, error: message, cancelled: true };
    }
    return { ok: false, error: message };
  }

  const recovery = params.type === "recovery";

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (accessToken && refreshToken) {
    return {
      ok: true,
      mode: "session",
      tokens: { accessToken, refreshToken },
      recovery,
    };
  }

  const code = params.code;
  if (code) {
    return { ok: true, mode: "code", code, recovery };
  }

  const tokenHash = params.token_hash;
  const otpType = params.type;
  if (tokenHash && otpType) {
    return { ok: true, mode: "token_hash", tokenHash, otpType, recovery };
  }

  return { ok: false, error: "Sign-in link did not include a session. Try again." };
}

export function mapOAuthSessionError(message: string, context?: "apple"): string {
  const lower = message.toLowerCase();
  if (lower.includes("redirect") || lower.includes("uri")) {
    return "OAuth redirect is misconfigured. Check Supabase redirect URLs and the app scheme.";
  }
  if (lower.includes("provider") && lower.includes("not enabled")) {
    return "Apple Sign-In isn't available right now. Please sign up with email instead.";
  }
  if (context === "apple") {
    return "Couldn't sign in with Apple. Try email sign-up instead.";
  }
  return message;
}

export const PASSWORD_RECOVERY_ROUTE = "/reset-password";

export function isPasswordRecoveryRoute(segments: string[]): boolean {
  return segments.includes("reset-password");
}
