import {
  deleteFutureYou as deleteFutureYouApi,
  FutureYouDeleteError as ApiFutureYouDeleteError,
} from "@newyouai/api-client";
import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export { ApiFutureYouDeleteError as FutureYouDeleteError };

function logDevDeleteFallback(): { removedObjects: number } {
  console.warn("[future-you-delete] dev fallback — delete logged locally");
  return { removedObjects: 0 };
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
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (import.meta.env.DEV) {
      return logDevDeleteFallback();
    }
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "auth_required");
  }

  return deleteFutureYouApi(sb);
}
