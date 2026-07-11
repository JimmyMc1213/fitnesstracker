/** Pure helpers for Supabase OAuth redirect handling (RN-2-03 / RN-2-05). */

export type OAuthRedirectTokens = {
  accessToken: string;
  refreshToken: string;
  type?: string;
};

export type OAuthRedirectParseResult =
  | { ok: true; tokens: OAuthRedirectTokens }
  | { ok: false; error: string; cancelled?: boolean };

function parseParamsFromUrl(url: string): Record<string, string> {
  const parsed = new URL(url);
  const fromQuery = Object.fromEntries(parsed.searchParams.entries());
  if (Object.keys(fromQuery).length > 0) return fromQuery;

  const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
  if (!hash) return {};
  return Object.fromEntries(new URLSearchParams(hash).entries());
}

export function mapAuthLinkError(params: Record<string, string>): string | null {
  const description = (params.error_description ?? "").replace(/\+/g, " ");
  const code = params.error_code ?? params.error ?? "";

  if (code === "otp_expired" || description.toLowerCase().includes("expired")) {
    return "This reset link expired. Request a new one from the sign-in screen.";
  }

  if (params.error === "access_denied" && description) {
    return decodeURIComponent(description);
  }

  if (params.error) {
    return decodeURIComponent((params.error_description ?? params.error).replace(/\+/g, " "));
  }

  return null;
}

export function parseOAuthRedirectUrl(url: string): OAuthRedirectParseResult {
  const params = parseParamsFromUrl(url);
  const linkError = mapAuthLinkError(params);
  if (linkError) {
    return { ok: false, error: linkError };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (!accessToken || !refreshToken) {
    return { ok: false, error: "Sign-in link did not include a session. Try again." };
  }

  return {
    ok: true,
    tokens: {
      accessToken,
      refreshToken,
      type: params.type,
    },
  };
}

export function mapOAuthSessionError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("redirect") || lower.includes("uri")) {
    return "OAuth redirect is misconfigured. Check Supabase redirect URLs and the app scheme.";
  }
  if (lower.includes("provider") && lower.includes("not enabled")) {
    return "This sign-in provider is not enabled for the project.";
  }
  return message;
}
