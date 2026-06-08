import { goalWeightDirectionLabel } from "./onboardingReinforcementCopy";
import { OnboardingPillStack, OnboardingSegment } from "./OnboardingSegment";
import {
  GOAL_PACE_OPTIONS,
  NUTRITION_GOALS,
  clampGoalWeightLbs,
  isGoalWeightValid,
  nutritionGoalSettingsLabel,
} from "./goalSettings";
import { defaultGoalWeightLbs, goalWeightRangeLbs, WeightRulerPicker } from "./WeightRulerPicker";
import type { OnboardingProfile, WeightUnit } from "./types";

export function GoalSettingsPicker({
  profile,
  currentWeightLbs,
  weightUnit,
  onChange,
}: {
  profile: OnboardingProfile;
  currentWeightLbs: number;
  weightUnit: WeightUnit;
  onChange: (patch: Partial<Pick<OnboardingProfile, "goal" | "goalWeightLbs" | "pace">>) => void;
}) {
  const goal = profile.goal ?? "maintain";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 className="settings-inline-label">Primary goal</h2>
        <OnboardingPillStack>
          {NUTRITION_GOALS.map((g) => (
            <OnboardingSegment key={g} selected={goal === g} onClick={() => onChange({ goal: g })}>
              {nutritionGoalSettingsLabel(g)}
            </OnboardingSegment>
          ))}
        </OnboardingPillStack>
      </div>

      {goal !== "maintain" ? (
        <>
          <div>
            <h2 className="settings-inline-label">Desired weight</h2>
            <div className="card settings-detail-card" style={{ padding: "12px 0 4px" }}>
              {(() => {
                const typedGoal = goal as "cut" | "bulk";
                const { minLbs, maxLbs } = goalWeightRangeLbs(typedGoal, currentWeightLbs);
                const valueLbs = clampGoalWeightLbs(
                  profile.goalWeightLbs ?? defaultGoalWeightLbs(typedGoal, currentWeightLbs),
                  minLbs,
                  maxLbs,
                );
                return (
                  <WeightRulerPicker
                    valueLbs={valueLbs}
                    minLbs={minLbs}
                    maxLbs={maxLbs}
                    unit={weightUnit}
                    directionLabel={goalWeightDirectionLabel(goal)}
                    onChange={(goalWeightLbs) => onChange({ goalWeightLbs })}
                  />
                );
              })()}
            </div>
            {!isGoalWeightValid(profile, currentWeightLbs) ? (
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(248,113,113,0.9)" }}>
                Pick a target at least 3 lb from your current weight.
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="settings-inline-label">Pace</h2>
            <OnboardingPillStack>
              {GOAL_PACE_OPTIONS.map(({ value, label, hint }) => (
                <div key={value}>
                  <OnboardingSegment selected={profile.pace === value} onClick={() => onChange({ pace: value })}>
                    {label}
                  </OnboardingSegment>
                  {hint && profile.pace === value ? (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-secondary)", paddingLeft: 16 }}>
                      {hint}
                    </p>
                  ) : null}
                </div>
              ))}
            </OnboardingPillStack>
          </div>
        </>
      ) : null}
    </div>
  );
}
