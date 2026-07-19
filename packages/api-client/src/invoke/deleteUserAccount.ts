import type { SupabaseClient } from "@supabase/supabase-js";

import { edgeFunctionApiKey, type SupabaseEnv } from "../supabase/createSupabaseClient";

export type DeleteUserAccountInvokeBody = {
  dryRun?: boolean;
};

export type DeleteUserAccountInvokeResult = {
  data: unknown;
  error: { message?: string } | null;
};

function envTrim(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim().replace(/^["']|["']$/g, "");
}

function errorMessageFromBody(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const body = data as { error?: string; message?: string; code?: string };
    if (typeof body.error === "string" && body.error.trim()) {
      return body.error.trim();
    }
    if (typeof body.message === "string" && body.message.trim()) {
      return body.message.trim();
    }
  }
  return `Account deletion failed (${status}). Try again.`;
}

/** Invoke delete-user with session JWT + edge-safe apikey (anon JWT when available). */
export async function invokeDeleteUserAccount(
  client: SupabaseClient,
  env: SupabaseEnv,
  body: DeleteUserAccountInvokeBody = {},
): Promise<DeleteUserAccountInvokeResult> {
  await client.auth.refreshSession?.().catch(() => undefined);

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.access_token) {
    return { data: null, error: { message: "Sign in to delete your account." } };
  }

  const baseUrl = envTrim(env.url).replace(/\/+$/, "");
  const url = `${baseUrl}/functions/v1/delete-user`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: edgeFunctionApiKey(env),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      data: null,
      error: { message: "Account deletion failed. Check your connection and try again." },
    };
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    return {
      data,
      error: { message: errorMessageFromBody(data, response.status) },
    };
  }

  return { data, error: null };
}
