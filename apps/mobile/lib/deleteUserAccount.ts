export type DeleteUserAccountResult = { error?: string; dryRun?: boolean };

export type DeleteUserInvokeResult = {
  data: unknown;
  error: { message?: string } | null;
};

/** Dev-only: set `EXPO_PUBLIC_DELETE_ACCOUNT_DRY_RUN=true` to exercise the flow without deleting data. */
export function isDeleteAccountDryRunEnabled(): boolean {
  return process.env.EXPO_PUBLIC_DELETE_ACCOUNT_DRY_RUN === "true";
}

export async function deleteUserAccount(opts: {
  confirmed: boolean;
  userId: string | undefined;
  dryRun?: boolean;
  invokeDeleteUser: (body: { dryRun?: boolean }) => Promise<DeleteUserInvokeResult>;
  signOut: () => Promise<void>;
  onDeleted: () => void | Promise<void>;
}): Promise<DeleteUserAccountResult> {
  if (!opts.confirmed) {
    return { error: "Account deletion must be confirmed in Settings." };
  }
  if (!opts.userId) {
    return { error: "Sign in to delete your account." };
  }

  const { data, error } = await opts.invokeDeleteUser(opts.dryRun ? { dryRun: true } : {});
  if (error) {
    return { error: error.message || "Account deletion failed. Try again." };
  }

  const body = data as { error?: string; ok?: boolean; dryRun?: boolean } | null;
  if (body && typeof body.error === "string" && body.error.trim()) {
    return { error: body.error.trim() };
  }

  if (opts.dryRun || body?.dryRun === true) {
    return { dryRun: true };
  }

  await opts.signOut();
  await opts.onDeleted();
  return {};
}
