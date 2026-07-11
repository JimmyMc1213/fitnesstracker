export const PASSWORD_CHANGE_HELPER =
  "For security, we'll email you a confirmation link before your password changes.";

export const PASSWORD_CHANGE_BUTTON_LABEL = "Change password";

export const PASSWORD_CHANGE_CONFIRM_TITLE = "Change password?";
export const PASSWORD_CHANGE_CONFIRM_MESSAGE =
  "We'll send a confirmation link to your email. Your password won't change until you open it and choose a new one.";
export const PASSWORD_CHANGE_CONFIRM_LABEL = "Yes, send email";
export const PASSWORD_CHANGE_CANCEL_LABEL = "Cancel";

export const PASSWORD_CHANGE_SENT_PREFIX = "Confirmation sent to";

export function formatPasswordChangeSentMessage(email: string): string {
  return `${PASSWORD_CHANGE_SENT_PREFIX} ${email.trim()}. Tap the link in that email to choose a new password.`;
}

export const PASSWORD_CHANGE_DONE_LABEL = "Done";

export const PASSWORD_FORGOT_LABEL = "Forgot password?";
export const PASSWORD_FORGOT_EMAIL_REQUIRED = "Enter your email address first.";

export const PASSWORD_RESET_HELPER = "Choose a new password for your account.";
export const PASSWORD_RESET_NEW_LABEL = "New password";
export const PASSWORD_RESET_CONFIRM_LABEL = "Confirm new password";
export const PASSWORD_RESET_SUBMIT_LABEL = "Update password";
export const PASSWORD_RESET_SUCCESS_MESSAGE = "Password updated. You're all set.";
