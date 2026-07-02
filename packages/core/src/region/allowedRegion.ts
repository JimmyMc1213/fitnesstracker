import type { OnboardingProfile, ResidencyCountry } from "@newyouai/types";

export type { ResidencyCountry };

export const FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE =
  "New You AI isn't available in your region yet";

export const RESIDENCY_COUNTRIES: { code: ResidencyCountry; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
];

export const US_REGIONS: { code: string; label: string }[] = [
  { code: "AL", label: "Alabama" },
  { code: "AK", label: "Alaska" },
  { code: "AZ", label: "Arizona" },
  { code: "AR", label: "Arkansas" },
  { code: "CA", label: "California" },
  { code: "CO", label: "Colorado" },
  { code: "CT", label: "Connecticut" },
  { code: "DE", label: "Delaware" },
  { code: "DC", label: "District of Columbia" },
  { code: "FL", label: "Florida" },
  { code: "GA", label: "Georgia" },
  { code: "HI", label: "Hawaii" },
  { code: "ID", label: "Idaho" },
  { code: "IL", label: "Illinois" },
  { code: "IN", label: "Indiana" },
  { code: "IA", label: "Iowa" },
  { code: "KS", label: "Kansas" },
  { code: "KY", label: "Kentucky" },
  { code: "LA", label: "Louisiana" },
  { code: "ME", label: "Maine" },
  { code: "MD", label: "Maryland" },
  { code: "MA", label: "Massachusetts" },
  { code: "MI", label: "Michigan" },
  { code: "MN", label: "Minnesota" },
  { code: "MS", label: "Mississippi" },
  { code: "MO", label: "Missouri" },
  { code: "MT", label: "Montana" },
  { code: "NE", label: "Nebraska" },
  { code: "NV", label: "Nevada" },
  { code: "NH", label: "New Hampshire" },
  { code: "NJ", label: "New Jersey" },
  { code: "NM", label: "New Mexico" },
  { code: "NY", label: "New York" },
  { code: "NC", label: "North Carolina" },
  { code: "ND", label: "North Dakota" },
  { code: "OH", label: "Ohio" },
  { code: "OK", label: "Oklahoma" },
  { code: "OR", label: "Oregon" },
  { code: "PA", label: "Pennsylvania" },
  { code: "RI", label: "Rhode Island" },
  { code: "SC", label: "South Carolina" },
  { code: "SD", label: "South Dakota" },
  { code: "TN", label: "Tennessee" },
  { code: "TX", label: "Texas" },
  { code: "UT", label: "Utah" },
  { code: "VT", label: "Vermont" },
  { code: "VA", label: "Virginia" },
  { code: "WA", label: "Washington" },
  { code: "WV", label: "West Virginia" },
  { code: "WI", label: "Wisconsin" },
  { code: "WY", label: "Wyoming" },
];

export const CA_REGIONS: { code: string; label: string }[] = [
  { code: "AB", label: "Alberta" },
  { code: "BC", label: "British Columbia" },
  { code: "MB", label: "Manitoba" },
  { code: "NB", label: "New Brunswick" },
  { code: "NL", label: "Newfoundland and Labrador" },
  { code: "NS", label: "Nova Scotia" },
  { code: "NT", label: "Northwest Territories" },
  { code: "NU", label: "Nunavut" },
  { code: "ON", label: "Ontario" },
  { code: "PE", label: "Prince Edward Island" },
  { code: "QC", label: "Quebec" },
  { code: "SK", label: "Saskatchewan" },
  { code: "YT", label: "Yukon" },
];

const US_REGION_CODES = new Set(US_REGIONS.map((region) => region.code));
const CA_REGION_CODES = new Set(CA_REGIONS.map((region) => region.code));

export function regionsForCountry(country: ResidencyCountry): { code: string; label: string }[] {
  return country === "US" ? US_REGIONS : CA_REGIONS;
}

/** Future You is available in the US and Canada excluding Quebec. */
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

/** True when stored residency is missing or outside the allowed Future You regions. */
export function isFutureYouRegionBlocked(
  profile: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion"> | null | undefined,
): boolean {
  if (!profile?.residencyCountry || !profile.residencyRegion?.trim()) return true;
  return !isRegionAllowed(profile.residencyCountry, profile.residencyRegion);
}
