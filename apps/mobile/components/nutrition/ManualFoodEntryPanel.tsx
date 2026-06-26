import {
  buildNutritionLoggedItem,
  clampMacroInputString,
  parseBoundedMacro,
} from "@newyouai/core";
import type { NutritionLoggedItem } from "@newyouai/types";
import { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBottomActionPadding } from "@/lib/screenInsets";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { AppTextField } from "@/components/ui/AppTextField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLogFoodAccent } from "@/hooks/useLogFoodAccent";

type Props = {
  dayLogAtCapacity: boolean;
  onLog: (row: NutritionLoggedItem, saveToMyFoods: boolean) => void;
};

function FieldLabel({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <Text
      className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {label}
    </Text>
  );
}

export function ManualFoodEntryPanel({ dayLogAtCapacity, onLog }: Props) {
  const { colors } = useAppTheme();
  const { accent } = useLogFoodAccent();
  const insets = useSafeAreaInsets();
  const bottomActionPadding = useBottomActionPadding();
  const [draftName, setDraftName] = useState("");
  const [draftCal, setDraftCal] = useState("");
  const [draftP, setDraftP] = useState("");
  const [draftC, setDraftC] = useState("");
  const [draftF, setDraftF] = useState("");
  const [draftServing, setDraftServing] = useState("");
  const [saveToMyFoods, setSaveToMyFoods] = useState(false);

  function logManualFood() {
    const macros = {
      cal: parseBoundedMacro(draftCal, "cal"),
      p: parseBoundedMacro(draftP, "p"),
      c: parseBoundedMacro(draftC, "c"),
      f: parseBoundedMacro(draftF, "f"),
    };
    const name = draftName.trim() || "Food";
    const servingLabel = draftServing.trim() ? draftServing.trim() : undefined;
    const row = buildNutritionLoggedItem(macros, name, {
      loggedAtMs: Date.now(),
      source: "manual",
      ...(servingLabel ? { servingLabel } : {}),
    });
    onLog(row, saveToMyFoods);
  }

  return (
    <View testID="manual-food-entry" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="rounded-[14px] border p-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text
            className="mb-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Manual food
          </Text>

          <FieldLabel label="Name" />
          <AppTextField
            value={draftName}
            onChangeText={setDraftName}
            testID="manual-food-name"
            accessibilityLabel="Food name"
            placeholder="e.g. Greek yogurt"
            backgroundColor={colors.background}
          />

          <FieldLabel label="Calories (cal)" />
          <AppTextField
            value={draftCal}
            onChangeText={(raw) => setDraftCal(clampMacroInputString(raw, "cal"))}
            onBlur={() => setDraftCal(String(parseBoundedMacro(draftCal, "cal")))}
            testID="manual-food-calories"
            accessibilityLabel="Calories"
            keyboardType="decimal-pad"
            backgroundColor={colors.background}
            style={{ fontVariant: ["tabular-nums"] }}
          />

          <View className="mt-1 flex-row gap-2">
            {(
              [
                { label: "Protein (g)", value: draftP, set: setDraftP, macro: "p" as const, testID: "manual-food-protein" },
                { label: "Carbs (g)", value: draftC, set: setDraftC, macro: "c" as const, testID: "manual-food-carbs" },
                { label: "Fat (g)", value: draftF, set: setDraftF, macro: "f" as const, testID: "manual-food-fat" },
              ] as const
            ).map((field) => (
              <View key={field.macro} className="min-w-0 flex-1">
                <FieldLabel label={field.label} />
                <AppTextField
                  value={field.value}
                  onChangeText={(raw) => field.set(clampMacroInputString(raw, field.macro))}
                  onBlur={() => field.set(String(parseBoundedMacro(field.value, field.macro)))}
                  testID={field.testID}
                  accessibilityLabel={field.label}
                  keyboardType="decimal-pad"
                  backgroundColor={colors.background}
                  style={{ fontVariant: ["tabular-nums"] }}
                />
              </View>
            ))}
          </View>

          <FieldLabel label="Serving (optional)" />
          <AppTextField
            value={draftServing}
            onChangeText={setDraftServing}
            testID="manual-food-serving"
            accessibilityLabel="Serving label"
            placeholder="e.g. 1 cup"
            backgroundColor={colors.background}
          />

          <View
            className="mt-4 flex-row items-center justify-between rounded-xl border px-3 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            <Text className="text-[14px] font-medium" style={{ color: colors.textPrimary }}>
              Save to My foods
            </Text>
            <Switch
              value={saveToMyFoods}
              onValueChange={setSaveToMyFoods}
              accessibilityLabel="Save to My foods"
              trackColor={{ false: colors.border, true: accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t px-screen-x pt-3"
        style={{
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomActionPadding,
        }}
      >
        <PrimaryButton
          block
          testID="manual-food-log"
          onPress={logManualFood}
          disabled={dayLogAtCapacity}
        >
          Log food
        </PrimaryButton>
      </View>
    </View>
  );
}
