/** Keep in sync with packages/core/src/region/allowedRegion.ts */

export type ResidencyCountry = "US" | "CA";

const US_REGION_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
  "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY",
]);

const CA_REGION_CODES = new Set([
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
]);

export function isRegionAllowed(
  country: ResidencyCountry | string | undefined,
  region: string | undefined,
): boolean {
  if (country !== "US" && country !== "CA") return false;
  const code = region?.trim().toUpperCase();
  if (!code) return false;
  if (country === "US") return US_REGION_CODES.has(code);
  if (code === "QC") return false;
  return CA_REGION_CODES.has(code);
}

function readProfileResidencyFields(payload: unknown): {
  residencyCountry?: string;
  residencyRegion?: string;
} {
  if (!payload || typeof payload !== "object") return {};
  const root = payload as Record<string, unknown>;
  const profile = root.onboardingProfile;
  if (!profile || typeof profile !== "object") return {};
  const fields = profile as Record<string, unknown>;
  const residencyCountry =
    fields.residencyCountry === "US" || fields.residencyCountry === "CA"
      ? fields.residencyCountry
      : undefined;
  const residencyRegion =
    typeof fields.residencyRegion === "string" && fields.residencyRegion.trim()
      ? fields.residencyRegion.trim().toUpperCase()
      : undefined;
  return { residencyCountry, residencyRegion };
}

export function resolveRegionFromFitnessPayload(payload: unknown): boolean {
  const { residencyCountry, residencyRegion } = readProfileResidencyFields(payload);
  return isRegionAllowed(residencyCountry, residencyRegion);
}

export async function enforceAllowedRegion(
  adminClient: import("jsr:@supabase/supabase-js@2").SupabaseClient,
  userId: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const { data, error } = await adminClient
    .from("fitness_user_data")
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("resolveUserRegion: fitness_user_data lookup failed", { userId, error });
    return regionRestrictedResponse(corsHeaders);
  }

  if (!data?.payload || !resolveRegionFromFitnessPayload(data.payload)) {
    return regionRestrictedResponse(corsHeaders);
  }

  return null;
}

export function regionRestrictedResponse(corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: "region_restricted" }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
