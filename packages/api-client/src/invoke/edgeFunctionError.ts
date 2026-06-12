import { FunctionsHttpError } from "@supabase/supabase-js";

/** Extract a user-facing message from an Edge Function invoke error. */
export async function edgeFunctionErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
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
