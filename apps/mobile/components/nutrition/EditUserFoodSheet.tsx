import { clampMacroInputString, parseBoundedMacro } from "@newyouai/core";
import type { NutritionUserFood } from "@newyouai/types";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FullScreenOverlay } from "@/components/motion";
import { AppTextField } from "@/components/ui/AppTextField";

import { useBottomActionPadding } from "@/lib/screenInsets";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";

type UserFoodPatch = Partial<Omit<NutritionUserFood, "id" | "savedAtMs">>;

type Props = {
  food: NutritionUserFood | null;
  onClose: () => void;
  onSave: (foodId: string, patch: UserFoodPatch) => void;
};

export function EditUserFoodSheet({ food, onClose, onSave }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomActionPadding = useBottomActionPadding();
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [p, setP] = useState("");
  const [c, setC] = useState("");
  const [f, setF] = useState("");
  const [serving, setServing] = useState("");

  useEffect(() => {
    if (!food) return;
    setName(food.name);
    setCal(String(food.cal));
    setP(String(food.p));
    setC(String(food.c));
    setF(String(food.f));
    setServing(food.servingLabel ?? "");
  }, [food]);

  if (!food) return null;

  function save() {
    if (!food) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave(food.id, {
      name: trimmedName,
      cal: parseBoundedMacro(cal, "cal"),
      p: parseBoundedMacro(p, "p"),
      c: parseBoundedMacro(c, "c"),
      f: parseBoundedMacro(f, "f"),
      ...(serving.trim() ? { servingLabel: serving.trim() } : { servingLabel: undefined }),
    });
    onClose();
  }

  const canSave = name.trim().length > 0;

  return (
    <FullScreenOverlay open={food != null} motionVariant="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        testID="edit-user-food-sheet"
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="flex-row items-center justify-between border-b px-screen-x py-3"
          style={{ borderBottomColor: colors.border, paddingTop: insets.top + 8 }}
        >
          <Pressable onPress={onClose} accessibilityRole="button" className="py-2">
            <Text className="text-[15px] font-semibold" style={{ color: colors.textSecondary }}>
              Cancel
            </Text>
          </Pressable>
          <Text className="text-[17px] font-bold" style={{ color: colors.textPrimary }}>
            Edit food
          </Text>
          <View className="w-14" />
        </View>

        <ScrollView
          className="flex-1 px-screen-x"
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <FieldLabel label="Food name" colors={colors} />
          <AppTextField
            value={name}
            onChangeText={setName}
            accessibilityLabel="Food name"
            placeholder="e.g. Greek yogurt"
            backgroundColor={colors.card}
          />

          <FieldLabel label="Calories (cal)" colors={colors} />
          <AppTextField
            value={cal}
            onChangeText={(raw) => setCal(clampMacroInputString(raw, "cal"))}
            onBlur={() => setCal(String(parseBoundedMacro(cal, "cal")))}
            accessibilityLabel="Calories"
            keyboardType="decimal-pad"
            backgroundColor={colors.card}
            style={{ fontVariant: ["tabular-nums"] }}
          />

          <View className="mt-4 flex-row gap-2">
            <MacroField label="Protein (g)" value={p} setValue={setP} macro="p" colors={colors} />
            <MacroField label="Carbs (g)" value={c} setValue={setC} macro="c" colors={colors} />
            <MacroField label="Fat (g)" value={f} setValue={setF} macro="f" colors={colors} />
          </View>

          <FieldLabel label="Serving label" colors={colors} />
          <AppTextField
            value={serving}
            onChangeText={setServing}
            accessibilityLabel="Serving label"
            placeholder="e.g. 1 cup"
            backgroundColor={colors.card}
          />
        </ScrollView>

        <View
          className="border-t px-screen-x pt-3"
          style={{ borderTopColor: colors.border, paddingBottom: bottomActionPadding }}
        >
          <PrimaryButton block testID="edit-user-food-save" onPress={save} disabled={!canSave}>
            Save changes
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </FullScreenOverlay>
  );
}

function FieldLabel({ label, colors }: { label: string; colors: ReturnType<typeof useAppTheme>["colors"] }) {
  return (
    <Text
      className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {label}
    </Text>
  );
}

function MacroField({
  label,
  value,
  setValue,
  macro,
  colors,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  macro: "p" | "c" | "f";
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View className="min-w-0 flex-1">
      <FieldLabel label={label} colors={colors} />
      <AppTextField
        value={value}
        onChangeText={(raw) => setValue(clampMacroInputString(raw, macro))}
        onBlur={() => setValue(String(parseBoundedMacro(value, macro)))}
        accessibilityLabel={label}
        keyboardType="decimal-pad"
        backgroundColor={colors.card}
        style={{ fontVariant: ["tabular-nums"] }}
      />
    </View>
  );
}
