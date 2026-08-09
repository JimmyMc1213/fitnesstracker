import { Linking, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { NUTRITION_SOURCES, nutritionSourceById } from "@/lib/nutritionSources";

type Props = {
  /** Compact single-line style for dense screens; full list for fuel editor. */
  compact?: boolean;
  testID?: string;
};

async function openSourceUrl(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) return;
    await Linking.openURL(url);
  } catch {
    // Best-effort; device may block the scheme or browser.
  }
}

/**
 * Easy-to-find citations for calorie/macro recommendations (Apple Guideline 1.4.1).
 */
export function NutritionSourcesNote({ compact = false, testID = "nutrition-sources-note" }: Props) {
  const { colors } = useAppTheme();
  const mifflin = nutritionSourceById("mifflin-st-jeor");
  const activity = nutritionSourceById("activity-multipliers");
  const protein = nutritionSourceById("protein-issn");

  if (compact) {
    return (
      <View testID={testID}>
        <Text className="text-[11px] leading-4" style={{ color: colors.textTertiary }}>
          Targets use the{" "}
          {mifflin ? (
            <Text
              style={{ color: colors.textSecondary, textDecorationLine: "underline" }}
              onPress={() => void openSourceUrl(mifflin.url)}
              accessibilityRole="link"
              accessibilityLabel={`${mifflin.label}. Opens in browser.`}
            >
              Mifflin–St Jeor
            </Text>
          ) : (
            "Mifflin–St Jeor"
          )}{" "}
          equation and{" "}
          {activity ? (
            <Text
              style={{ color: colors.textSecondary, textDecorationLine: "underline" }}
              onPress={() => void openSourceUrl(activity.url)}
              accessibilityRole="link"
              accessibilityLabel={`${activity.label}. Opens in browser.`}
            >
              activity multipliers
            </Text>
          ) : (
            "activity multipliers"
          )}
          .{" "}
          {protein ? (
            <Text
              style={{ color: colors.textSecondary, textDecorationLine: "underline" }}
              onPress={() => void openSourceUrl(protein.url)}
              accessibilityRole="link"
              accessibilityLabel={`${protein.label}. Opens in browser.`}
            >
              Protein guidance
            </Text>
          ) : (
            "Protein guidance"
          )}
          .
        </Text>
      </View>
    );
  }

  return (
    <View testID={testID} className="gap-2">
      <Text
        className="text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: colors.textTertiary }}
      >
        How we calculate this
      </Text>
      <Text className="text-[12px] leading-[17px]" style={{ color: colors.textSecondary }}>
        Calorie and macro targets are estimates for fitness coaching — not medical advice. Sources:
      </Text>
      {NUTRITION_SOURCES.map((source) => (
        <View key={source.id} className="gap-0.5">
          <Text
            className="text-[12px] font-semibold leading-[16px]"
            style={{ color: colors.textSecondary, textDecorationLine: "underline" }}
            onPress={() => void openSourceUrl(source.url)}
            accessibilityRole="link"
            accessibilityLabel={`${source.label}. Opens in browser.`}
          >
            {source.label}
          </Text>
          <Text className="text-[11px] leading-[15px]" style={{ color: colors.textTertiary }}>
            {source.detail}
          </Text>
        </View>
      ))}
    </View>
  );
}
