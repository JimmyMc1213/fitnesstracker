import { afterEach, describe, expect, it, vi } from "vitest";

import { updateUserEmail } from "./fitnessCloudSync";

const updateUser = vi.fn();
const getSupabase = vi.fn();

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => getSupabase(),
}));

describe("updateUserEmail", () => {
  afterEach(() => {
    updateUser.mockReset();
    getSupabase.mockReset();
    getSupabase.mockReturnValue({
      auth: { updateUser },
    });
  });

  it("requires Supabase to be configured", async () => {
    getSupabase.mockReturnValue(null);

    const result = await updateUserEmail("user@example.com", "new@example.com");

    expect(result).toEqual({ error: "Add Supabase keys to sync." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("requires a signed-in email", async () => {
    const result = await updateUserEmail(null, "new@example.com");
    expect(result).toEqual({ error: "Sign in to change your email." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects invalid email input", async () => {
    const result = await updateUserEmail("user@example.com", "not-an-email");
    expect(result).toEqual({ error: "Enter a valid email address." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects unchanged email", async () => {
    const result = await updateUserEmail("user@example.com", "  User@Example.com ");
    expect(result).toEqual({ error: "That's already your email." });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("calls Supabase updateUser with trimmed email", async () => {
    updateUser.mockResolvedValue({ error: null });

    const result = await updateUserEmail("user@example.com", "  new@example.com ");

    expect(result).toEqual({});
    expect(updateUser).toHaveBeenCalledWith({ email: "new@example.com" });
  });

  it("returns Supabase error messages", async () => {
    updateUser.mockResolvedValue({ error: { message: "Email rate limit exceeded" } });

    const result = await updateUserEmail("user@example.com", "new@example.com");

    expect(result).toEqual({ error: "Email rate limit exceeded" });
  });
});
