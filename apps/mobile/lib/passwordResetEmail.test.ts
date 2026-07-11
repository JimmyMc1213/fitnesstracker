import { describe, expect, it } from "vitest";

import {
  isPasswordResetRateLimited,
  PASSWORD_RESET_EMAIL_SUBJECT,
} from "./passwordResetEmail";

describe("passwordResetEmail", () => {
  it("uses a stable subject for inbox threading", () => {
    expect(PASSWORD_RESET_EMAIL_SUBJECT).toBe("New You AI password reset");
    expect(PASSWORD_RESET_EMAIL_SUBJECT).not.toMatch(/\{\{/);
  });

  it("detects Supabase rate-limit errors", () => {
    expect(isPasswordResetRateLimited("For security purposes, you can only request this once every 60 seconds")).toBe(
      true,
    );
    expect(isPasswordResetRateLimited("Email rate limit exceeded")).toBe(true);
    expect(isPasswordResetRateLimited("User not found")).toBe(false);
  });
});
