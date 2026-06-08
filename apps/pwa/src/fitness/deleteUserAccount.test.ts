import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteUserAccount } from "./deleteUserAccount";

describe("deleteUserAccount", () => {
  const invokeDeleteUser = vi.fn();
  const signOut = vi.fn();
  const onDeleted = vi.fn();

  afterEach(() => {
    invokeDeleteUser.mockReset();
    signOut.mockReset();
    onDeleted.mockReset();
  });

  function run(overrides: Partial<Parameters<typeof deleteUserAccount>[0]> = {}) {
    return deleteUserAccount({
      confirmed: true,
      userId: "user-123",
      invokeDeleteUser,
      signOut,
      onDeleted,
      ...overrides,
    });
  }

  it("requires confirmation before calling the edge function", async () => {
    const result = await run({ confirmed: false });

    expect(result).toEqual({ error: "Account deletion must be confirmed in Settings." });
    expect(invokeDeleteUser).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    const result = await run({ userId: undefined });

    expect(result).toEqual({ error: "Sign in to delete your account." });
    expect(invokeDeleteUser).not.toHaveBeenCalled();
  });

  it("returns invoke errors without signing out", async () => {
    invokeDeleteUser.mockResolvedValue({ data: null, error: { message: "Network down" } });

    const result = await run();

    expect(result).toEqual({ error: "Network down" });
    expect(signOut).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("returns API error payloads without signing out", async () => {
    invokeDeleteUser.mockResolvedValue({
      data: { error: "Could not delete your account. Try again." },
      error: null,
    });

    const result = await run();

    expect(result).toEqual({ error: "Could not delete your account. Try again." });
    expect(signOut).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("calls delete-user then signs out and resets local state on success", async () => {
    invokeDeleteUser.mockResolvedValue({ data: { ok: true }, error: null });

    const result = await run();

    expect(result).toEqual({});
    expect(invokeDeleteUser).toHaveBeenCalledWith({});
    expect(signOut).toHaveBeenCalledOnce();
    expect(onDeleted).toHaveBeenCalledOnce();
  });

  it("dry run verifies the edge function without signing out or resetting", async () => {
    invokeDeleteUser.mockResolvedValue({ data: { ok: true, dryRun: true }, error: null });

    const result = await run({ dryRun: true });

    expect(result).toEqual({ dryRun: true });
    expect(invokeDeleteUser).toHaveBeenCalledWith({ dryRun: true });
    expect(signOut).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("treats dryRun in the response as a no-op even without the client flag", async () => {
    invokeDeleteUser.mockResolvedValue({ data: { ok: true, dryRun: true }, error: null });

    const result = await run();

    expect(result).toEqual({ dryRun: true });
    expect(signOut).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
