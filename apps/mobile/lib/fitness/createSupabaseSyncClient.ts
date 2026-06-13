import type { FitnessSyncClient, FitnessUserRow } from "@newyouai/core";

import { getSupabase } from "@/lib/supabaseClient";

export function createSupabaseSyncClient(): FitnessSyncClient | null {
  const sb = getSupabase();
  if (!sb) return null;

  return {
    fetchRow: async (userId: string): Promise<FitnessUserRow | null> => {
      const { data, error } = await sb
        .from("fitness_user_data")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return data as FitnessUserRow;
    },
    insertRow: async (userId, payload, updatedAtMs) => {
      const { error } = await sb.from("fitness_user_data").insert({
        user_id: userId,
        payload,
        updated_at_ms: updatedAtMs,
      });
      return error ? { error: error.message } : {};
    },
    updateRow: async (userId, payload, updatedAtMs, expectedRemoteUpdatedAtMs) => {
      const { data: updated, error } = await sb
        .from("fitness_user_data")
        .update({ payload, updated_at_ms: updatedAtMs })
        .eq("user_id", userId)
        .eq("updated_at_ms", expectedRemoteUpdatedAtMs)
        .select("updated_at_ms");
      if (error) return { error: error.message };
      if (!updated?.length) return { conflict: true };
      return { updatedAtMs: updatedAtMs };
    },
  };
}
