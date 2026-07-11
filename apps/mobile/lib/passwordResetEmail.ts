/** Password reset email UX — keep subject stable in Supabase for inbox threading. */

export const PASSWORD_RESET_EMAIL_SUBJECT = "New You AI password reset";

/** Matches Supabase [auth.email] max_frequency in supabase/config.toml. */
export const PASSWORD_RESET_COOLDOWN_MS = 60_000;

export const PASSWORD_RESET_SENT_MESSAGE =
  "Check your email for a password reset link. Another request will continue the same email thread.";

export const PASSWORD_RESET_RESENT_MESSAGE =
  "Sent another reset link in the same email thread. Use the latest message.";

export const PASSWORD_RESET_COOLDOWN_MESSAGE =
  "We just sent a reset link. Check your inbox — you can request another in about a minute.";

export function passwordResetRateLimitMessage(): string {
  return PASSWORD_RESET_COOLDOWN_MESSAGE;
}

export function isPasswordResetRateLimited(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("only request") || lower.includes("rate limit") || lower.includes("too many");
}
