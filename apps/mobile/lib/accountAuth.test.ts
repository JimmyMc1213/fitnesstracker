import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  completePasswordReset,
  requestPasswordChangeEmail,
  requestPasswordResetEmail,
} from "./accountAuth";

const resetPasswordForEmail = vi.fn();
const updateUser = vi.fn();

vi.mock("@/lib/supabaseClient", () => ({
  getSupabase: () => ({
    auth: { resetPasswordForEmail, updateUser },
  }),
}));

vi.mock("@/lib/authRedirect", () => ({
  authEmailRedirectUrl: () => "https://app.newyouai.app/auth/callback",
}));

describe("requestPasswordChangeEmail", () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
  });

  it("requires a signed-in email", async () => {
    const result = await requestPasswordChangeEmail(null);
    expect(result).toEqual({ error: "Sign in to change your password." });
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends a reset email with the app callback redirect", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordChangeEmail("user@example.com");

    expect(result).toEqual({});
    expect(resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://app.newyouai.app/auth/callback",
    });
  });

  it("surfaces Supabase errors", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { message: "Rate limit exceeded" } });

    const result = await requestPasswordChangeEmail("user@example.com");

    expect(result).toEqual({ error: "Rate limit exceeded" });
  });
});

describe("requestPasswordResetEmail", () => {
  beforeEach(() => {
    resetPasswordForEmail.mockReset();
  });

  it("requires a valid email address", async () => {
    const result = await requestPasswordResetEmail("not-an-email");
    expect(result).toEqual({ error: "Enter a valid email address." });
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("sends a reset email with the app callback redirect", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordResetEmail("user@example.com");

    expect(result).toEqual({});
    expect(resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://app.newyouai.app/auth/callback",
    });
  });
});

describe("completePasswordReset", () => {
  beforeEach(() => {
    updateUser.mockReset();
  });

  it("updates the password on the recovery session", async () => {
    updateUser.mockResolvedValue({ error: null });

    const result = await completePasswordReset("new-password-123");

    expect(result).toEqual({});
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
  });

  it("surfaces Supabase errors", async () => {
    updateUser.mockResolvedValue({ error: { message: "Password update requires reauthentication." } });

    const result = await completePasswordReset("new-password-123");

    expect(result).toEqual({ error: "Password update requires reauthentication." });
  });
});
