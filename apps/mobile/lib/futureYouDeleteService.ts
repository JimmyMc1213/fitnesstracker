import {
  deleteFutureYou as deleteFutureYouApi,
  FutureYouDeleteError as ApiFutureYouDeleteError,
} from "@newyouai/api-client";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export { ApiFutureYouDeleteError as FutureYouDeleteError };

/**
 * Delete the user's Future You data. Pass a `jobId` to remove a single kept preview; omit it
 * to permanently delete all Future You photos and generation jobs.
 */
export async function deleteFutureYou(jobId?: string): Promise<{ removedObjects: number }> {
  if (!isSupabaseConfigured()) {
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const sb = getSupabase();
  if (!sb) {
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "unavailable");
  }

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    throw new ApiFutureYouDeleteError("Sign in to delete NewYou.", "auth_required");
  }

  return deleteFutureYouApi(sb, jobId);
}
