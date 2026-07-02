import type { OnboardingProfile, ResidencyCountry } from "@newyouai/types";
import {
  FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE,
  isRegionAllowed,
  regionsForCountry,
  RESIDENCY_COUNTRIES,
} from "@newyouai/core";
import { ScrollView, Text, View } from "react-native";

import { OnboardingPillStack, OnboardingSegment } from "@/components/onboarding/OnboardingSegment";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  profile: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion">;
  onChange: (patch: Pick<OnboardingProfile, "residencyCountry" | "residencyRegion">) => void;
};

export function OnboardingResidencyPicker({ profile, onChange }: Props) {
  const { colors } = useAppTheme();
  const country = profile.residencyCountry;
  const regionOptions = country ? regionsForCountry(country) : [];
  const regionBlocked =
    Boolean(country && profile.residencyRegion) &&
    !isRegionAllowed(country, profile.residencyRegion);

  return (
    <View className="flex-1 gap-5">
      <View>
        <Text className="mb-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
          Country
        </Text>
        <OnboardingPillStack>
          {RESIDENCY_COUNTRIES.map((entry) => (
            <OnboardingSegment
              key={entry.code}
              testID={`onboarding-residency-country-${entry.code}`}
              selected={country === entry.code}
              onPress={() =>
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
      </View>

      {country ? (
        <View className="min-h-0 flex-1">
          <Text className="mb-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
            {country === "US" ? "State" : "Province or territory"}
          </Text>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <OnboardingPillStack>
              {regionOptions.map((entry) => (
                <OnboardingSegment
                  key={entry.code}
                  testID={`onboarding-residency-region-${entry.code}`}
                  selected={profile.residencyRegion === entry.code}
                  onPress={() =>
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
          </ScrollView>
        </View>
      ) : null}

      {regionBlocked ? (
        <View
          className="rounded-xl px-4 py-4"
          style={{ backgroundColor: `${colors.background}ee`, borderWidth: 1, borderColor: colors.border }}
        >
          <Text className="text-center text-base font-semibold" style={{ color: colors.textPrimary }}>
            {FUTURE_YOU_REGION_UNAVAILABLE_MESSAGE}
          </Text>
        </View>
      ) : null}
    </View>
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
