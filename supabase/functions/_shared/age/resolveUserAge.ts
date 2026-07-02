import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type UserAgeResolution =
  | { ok: true; age: number }
  | { ok: false; reason: "missing" | "underage" | "unparseable" };

/** Age in whole years on `asOf` (calendar). */
export function ageFromDateOfBirth(dateOfBirth: string, asOf: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;
  const [y, m, d] = dateOfBirth.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  let age = asOf.getFullYear() - y;
  const monthDiff = asOf.getMonth() + 1 - m;
  const dayDiff = asOf.getDate() - d;
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1;
  return age;
}

function readProfileDateOfBirth(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const profile = root.onboardingProfile;
  if (!profile || typeof profile !== "object") return undefined;
  const fields = profile as Record<string, unknown>;
  if (typeof fields.dateOfBirth !== "string" || !fields.dateOfBirth.trim()) return undefined;
  return fields.dateOfBirth.trim();
}

/** Age gate: only a valid stored dateOfBirth satisfies 18+. Stored age integers are ignored. */
export function resolveAgeFromFitnessPayload(payload: unknown): UserAgeResolution {
  const dateOfBirth = readProfileDateOfBirth(payload);
  if (!dateOfBirth) return { ok: false, reason: "missing" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return { ok: false, reason: "unparseable" };

  const age = ageFromDateOfBirth(dateOfBirth);
  if (age == null) return { ok: false, reason: "unparseable" };
  if (age < 18) return { ok: false, reason: "underage" };
  return { ok: true, age };
}

export async function loadUserAgeFromFitnessData(
  adminClient: SupabaseClient,
  userId: string,
): Promise<UserAgeResolution> {
  const { data, error } = await adminClient
    .from("fitness_user_data")
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("resolveUserAge: fitness_user_data lookup failed", { userId, error });
    return { ok: false, reason: "missing" };
  }

  if (!data?.payload) {
    return { ok: false, reason: "missing" };
  }

  return resolveAgeFromFitnessPayload(data.payload);
}

export function ageRestrictedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: "age_restricted" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Returns a 403 response when the user is under 18 or age cannot be verified. */
export async function enforceMinimumAge(
  adminClient: SupabaseClient,
  userId: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const resolution = await loadUserAgeFromFitnessData(adminClient, userId);
  if (!resolution.ok) {
    return ageRestrictedResponse(corsHeaders);
  }
  return null;
}
