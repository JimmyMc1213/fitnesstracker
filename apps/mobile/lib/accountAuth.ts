import { getSupabase } from "@/lib/supabaseClient";
import { MOBILE_AUTH_CALLBACK_URL } from "@/lib/authRedirect";
import {
  isPasswordResetRateLimited,
  passwordResetRateLimitMessage,
} from "@/lib/passwordResetEmail";

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

  const { error } = await sb.auth.updateUser({ email: trimmed });
  if (error) return { error: error.message };
  return {};
}

export async function changeUserPassword(
  email: string | null | undefined,
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sync." };
  if (!email) return { error: "Sign in to change your password." };

  const { error: verifyError } = await sb.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) return { error: "Current password is incorrect." };

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}

export async function requestPasswordReset(email: string): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sign in." };

  const trimmed = email.trim();
  if (!trimmed.includes("@")) return { error: "Enter a valid email address." };

  const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
    redirectTo: MOBILE_AUTH_CALLBACK_URL,
  });
  if (error) {
    if (isPasswordResetRateLimited(error.message)) {
      return { error: passwordResetRateLimitMessage() };
    }
    return { error: error.message };
  }
  return {};
}

export async function setPasswordFromRecovery(newPassword: string): Promise<{ error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Add Supabase keys to sign in." };

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}

export function connectedAuthProviders(session: { user: { identities?: { provider: string }[] } } | null): string[] {
  const identities = session?.user.identities ?? [];
  const providers = identities.map((id) => id.provider);
  return [...new Set(providers)];
}
