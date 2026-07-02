import type { OnboardingProfile, ResidencyCountry } from "@newyouai/types";
import {
  FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE,
  isRegionAllowed,
  regionsForCountry,
  RESIDENCY_COUNTRIES,
} from "@newyouai/core";

import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";

type Props = {
  profile: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion">;
  onChange: (patch: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion">) => void;
};

export function OnboardingResidencyPicker({ profile, onChange }: Props) {
  const country = profile.residencyCountry;
  const regionOptions = country ? regionsForCountry(country) : [];
  const regionBlocked =
    Boolean(country && profile.residencyRegion) &&
    !isRegionAllowed(country, profile.residencyRegion);

  return (
    <div className="onboarding-residency-picker">
      <p className="onboarding-residency-picker__label" style={{ margin: "0 0 12px", fontSize: 14, opacity: 0.72 }}>
        Country
      </p>
      <OnboardingPillStack>
        {RESIDENCY_COUNTRIES.map((entry) => (
          <OnboardingSegment
            key={entry.code}
            selected={country === entry.code}
            onClick={() =>
              onChange({
                residencyCountry: entry.code,
                residencyRegion: undefined,
              })
            }
          >
            {entry.label}
          </OnboardingSegment>
        ))}
      </OnboardingPillStack>

      {country ? (
        <>
          <p
            className="onboarding-residency-picker__label"
            style={{ margin: "20px 0 12px", fontSize: 14, opacity: 0.72 }}
          >
            {country === "US" ? "State" : "Province or territory"}
          </p>
          <div className="onboarding-residency-picker__regions" style={{ maxHeight: 280, overflowY: "auto" }}>
            <OnboardingPillStack>
              {regionOptions.map((entry) => (
                <OnboardingSegment
                  key={entry.code}
                  selected={profile.residencyRegion === entry.code}
                  onClick={() =>
                    onChange({
                      residencyCountry: country as ResidencyCountry,
                      residencyRegion: entry.code,
                    })
                  }
                >
                  {entry.label}
                </OnboardingSegment>
              ))}
            </OnboardingPillStack>
          </div>
        </>
      ) : null}

      {regionBlocked ? (
        <p
          className="onboarding-residency-picker__blocked"
          style={{ marginTop: 20, textAlign: "center", fontSize: 16, fontWeight: 600 }}
        >
          {FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE}
        </p>
      ) : null}
    </div>
  );
}

export function isOnboardingResidencyComplete(
  profile: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion">,
): boolean {
  return Boolean(
    profile.residencyCountry &&
      profile.residencyRegion &&
      isRegionAllowed(profile.residencyCountry, profile.residencyRegion),
  );
}
