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

/** Local dev without Supabase logs the delete. Unit tests still expect a rejection. */
function allowUnsignedDevFallback(): boolean {
  return import.meta.env.DEV && import.meta.env.MODE !== "test";
}

/**
 * Delete the user's Future You data. Pass `jobId` to remove a single kept preview; omit it to
 * permanently delete all Future You photos and generation jobs.
 */
export async function deleteFutureYou(options?: {
  previewMode?: boolean;
  jobId?: string;
}): Promise<{ removedObjects: number }> {
  if (options?.previewMode) {
    return logDevDeleteFallback();
  }

  if (!isSupabaseConfigured()) {
    if (allowUnsignedDevFallback()) {
      return logDevDeleteFallback();
    }
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    if (allowUnsignedDevFallback()) {
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

  return deleteFutureYouApi(sb, options?.jobId);
}
