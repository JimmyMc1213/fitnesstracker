import {
  deleteFutureYou as deleteFutureYouApi,
  FutureYouDeleteError as ApiFutureYouDeleteError,
} from "@newyouai/api-client";

import { getSupabase, isSupabaseConfigured } from "./supabaseClient";

export { ApiFutureYouDeleteError as FutureYouDeleteError };

/** Permanently delete the user's Future You photos and generation jobs. */
export async function deleteFutureYou(): Promise<{ removedObjects: number }> {
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

  return deleteFutureYouApi(sb);
}
