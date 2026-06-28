import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

/** Read the persisted upload path for a Future You job (client RLS — no status API). */
export async function fetchFutureYouJobSourcePhotoPath(jobId: string): Promise<string | null> {
  const id = jobId.trim();
  if (!id || !isSupabaseConfigured()) return null;

  const sb = getSupabase();
  if (!sb) return null;

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return null;

  const { data, error } = await sb
    .from("future_you_jobs")
    .select("source_photo_path")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;

  const path =
    typeof data?.source_photo_path === "string" ? data.source_photo_path.trim() : "";
  return path || null;
}
