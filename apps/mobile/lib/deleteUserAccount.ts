export type DeleteUserAccountResult = { error?: string; dryRun?: boolean };

export type DeleteUserInvokeResult = {
  data: unknown;
  error: { message?: string } | null;
};

type DeleteUserResponseBody = {
  error?: string;
  ok?: boolean;
  dryRun?: boolean;
  step?: string;
  debug?: Record<string, unknown>;
};

/** Dev-only: set `EXPO_PUBLIC_DELETE_ACCOUNT_DRY_RUN=true` to exercise the flow without deleting data. */
export function isDeleteAccountDryRunEnabled(): boolean {
  return process.env.EXPO_PUBLIC_DELETE_ACCOUNT_DRY_RUN === "true";
}

function parseResponseBody(data: unknown): DeleteUserResponseBody | null {
  if (!data || typeof data !== "object") return null;
  return data as DeleteUserResponseBody;
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
  const body = parseResponseBody(data);

  // #region agent log
  fetch("http://127.0.0.1:7401/ingest/96bd12f9-a986-4043-9eda-31103bf3dfe5", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6d39c7" },
    body: JSON.stringify({
      sessionId: "6d39c7",
      runId: "delete-account",
      hypothesisId: "A-E",
      location: "apps/mobile/lib/deleteUserAccount.ts:invoke",
      message: "delete-user invoke result",
      data: {
        hasInvokeError: Boolean(error),
        invokeErrorMessage: error?.message ?? null,
        responseStep: body?.step ?? null,
        responseError: body?.error ?? null,
        responseOk: body?.ok ?? null,
        debug: body?.debug ?? null,
        userIdPrefix: opts.userId.slice(0, 8),
        dryRun: Boolean(opts.dryRun),
        usesAnonJwtApiKey: Boolean(
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim().startsWith("eyJ"),
        ),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (error) {
    const serverError = body?.error?.trim();
    return { error: serverError || error.message || "Account deletion failed. Try again." };
  }

  if (body?.error?.trim()) {
    return { error: body.error.trim() };
  }

  if (opts.dryRun || body?.dryRun === true) {
    return { dryRun: true };
  }

  // #region agent log
  fetch("http://127.0.0.1:7401/ingest/96bd12f9-a986-4043-9eda-31103bf3dfe5", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6d39c7" },
    body: JSON.stringify({
      sessionId: "6d39c7",
      runId: "delete-account",
      hypothesisId: "A",
      location: "apps/mobile/lib/deleteUserAccount.ts:success",
      message: "delete-user succeeded, signing out",
      data: {
        userIdPrefix: opts.userId.slice(0, 8),
        debug: body?.debug ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  await opts.signOut();
  await opts.onDeleted();
  return {};
}
