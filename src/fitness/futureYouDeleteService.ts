import { FunctionsHttpError } from "@supabase/supabase-js";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export class FutureYouDeleteError extends Error {
  constructor(
    message: string,
    readonly code?: "auth_required" | "unavailable" | "invalid",
  ) {
    super(message);
    this.name = "FutureYouDeleteError";
  }
}

function parseDeleteResponse(data: unknown): { removedObjects: number } {
  if (!data || typeof data !== "object") {
    throw new FutureYouDeleteError("Could not delete NewYou. Try again.", "invalid");
  }

  const body = data as { error?: string; ok?: boolean; removedObjects?: number };
  if (typeof body.error === "string" && body.error.trim()) {
    throw new FutureYouDeleteError(body.error.trim(), "invalid");
  }
  if (body.ok !== true) {
    throw new FutureYouDeleteError("Could not delete NewYou. Try again.", "invalid");
  }

  return { removedObjects: typeof body.removedObjects === "number" ? body.removedObjects : 0 };
}

function logDevDeleteFallback(): { removedObjects: number } {
  console.warn("[future-you-delete] dev fallback — delete logged locally");
  return { removedObjects: 0 };
}

async function edgeFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string };
      if (typeof body.error === "string" && body.error.trim()) {
        return body.error.trim();
      }
    } catch {
      // Response body was not JSON — use fallback below.
    }
  }
  if (error instanceof Error && error.message && !/non-2xx/i.test(error.message)) {
    return error.message;
  }
  return fallback;
}

/** Permanently delete the user's Future You photos and generation jobs. */
export async function deleteFutureYou(options?: { previewMode?: boolean }): Promise<{ removedObjects: number }> {
  if (options?.previewMode) {
    return logDevDeleteFallback();
  }

  if (!isSupabaseConfigured()) {
    if (import.meta.env.DEV) {
      return logDevDeleteFallback();
    }
    throw new FutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (import.meta.env.DEV) {
      return logDevDeleteFallback();
    }
    throw new FutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new FutureYouDeleteError("Sign in to delete NewYou.", "auth_required");
  }

  const { data, error } = await sb.functions.invoke("future-you-delete", { body: {} });

  if (error) {
    throw new FutureYouDeleteError(
      await edgeFunctionErrorMessage(error, "Could not delete NewYou. Try again."),
      "unavailable",
    );
  }

  return parseDeleteResponse(data);
}
