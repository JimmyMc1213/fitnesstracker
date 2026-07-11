import { getSupabase } from "@/lib/supabaseClient";
import { authEmailRedirectUrl } from "@/lib/authRedirect";
import { connectedAuthProviders, isAppleSignInOnly } from "@newyouai/core";

export { connectedAuthProviders, isAppleSignInOnly };

export async function updateUserEmail(
  currentEmail: string | null | undefined,
  newEmail: string,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sync." };
  if (!currentEmail) return { error: "Sign in to change your email." };

  const trimmed = newEmail.trim();
  if (!trimmed.includes("@")) return { error: "Enter a valid email address." };
  if (trimmed.toLowerCase() === currentEmail.toLowerCase()) {
    return { error: "That's already your email." };
  }

  const { error } = await sb.auth.updateUser(
    { email: trimmed },
    { emailRedirectTo: authEmailRedirectUrl() },
  );
  if (error) return { error: error.message };
  return {};
}

/** Sends a password-reset email to any account (sign-in "Forgot password?" flow). */
export async function requestPasswordResetEmail(
  email: string,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sync." };

  const trimmed = email.trim();
  if (!trimmed.includes("@")) return { error: "Enter a valid email address." };

  const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
    redirectTo: authEmailRedirectUrl(),
  });
  if (error) return { error: error.message };
  return {};
}

/** Sends a password-reset email. Password only changes after the user opens the link. */
export async function requestPasswordChangeEmail(
  email: string | null | undefined,
): Promise<{ error?: string }> {
  if (!email) return { error: "Sign in to change your password." };
  return requestPasswordResetEmail(email);
}

/** Sets a new password after the user confirms via the email recovery link. */
export async function completePasswordReset(newPassword: string): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sync." };

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}
