export type AuthUserLike = {
  identities?: { provider: string }[];
  app_metadata?: { provider?: string; providers?: string[] };
};

export type AuthSessionLike = { user: AuthUserLike } | null | undefined;

function providersFromUser(user: AuthUserLike | null | undefined): string[] {
  if (!user) return [];

  const identityProviders = (user.identities ?? []).map((id) => id.provider);
  if (identityProviders.length > 0) {
    return [...new Set(identityProviders)];
  }

  const metaProviders = user.app_metadata?.providers;
  if (Array.isArray(metaProviders) && metaProviders.length > 0) {
    return [...new Set(metaProviders.filter((provider): provider is string => typeof provider === "string"))];
  }

  const singleProvider = user.app_metadata?.provider;
  if (typeof singleProvider === "string" && singleProvider.length > 0) {
    return [singleProvider];
  }

  return [];
}

export function connectedAuthProviders(session: AuthSessionLike): string[] {
  return providersFromUser(session?.user);
}

/** True when the user signed in with Apple and has no email/password identity. */
export function isAppleSignInOnly(session: AuthSessionLike): boolean {
  const providers = connectedAuthProviders(session);
  return providers.includes("apple") && !providers.includes("email");
}
