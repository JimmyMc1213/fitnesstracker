import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";

import { BottomSheet } from "@/components/motion";
import { AppTextField } from "@/components/ui/AppTextField";
import {
  ExerciseSearchResultRow,
  ExerciseSearchSectionHeader,
} from "@/components/workout/ExerciseSearchResultRow";
import { CustomExerciseCreateForm } from "@/components/workout/CustomExerciseCreateForm";
import type { ExerciseEquipmentLabel } from "@/lib/workout/exerciseLabels";
import {
  catalogExercisesForEquipment,
  filterCatalogExercises,
  muscleGroupDisplayName,
  muscleGroupsInCatalog,
} from "@/lib/workout/exerciseCatalogSearch";
import type { MuscleGroup } from "@/lib/workout/exerciseLibrary";
import { useExerciseSearchSheetSizing } from "@/lib/keyboard";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CustomExerciseTemplate, EquipmentSetup } from "@newyouai/types";

type Props = {
  open?: boolean;
  title: string;
  subtitle?: ReactNode;
  equipmentSetup: EquipmentSetup;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onSaveCustomAndAdd?: (name: string, label: string) => void;
  onClose: () => void;
  closeOnSelect?: boolean;
  confirmLabel?: string;
  testID?: string;
};

function selectionKey(name: string, label?: string): string {
  return `${name}__${label ?? ""}`;
}

export function ExerciseSearchPicker({
  open = true,
  title,
  subtitle,
  equipmentSetup,
  customExercises,
  onSelect,
  onSaveCustomAndAdd,
  onClose,
  closeOnSelect = true,
  confirmLabel = "Add",
  testID,
}: Props) {
  const { colors } = useAppTheme();
  const { panelStyle, bodyStyle, listStyle } = useExerciseSearchSheetSizing();
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [selected, setSelected] = useState<{ name: string; label?: string } | null>(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState<ExerciseEquipmentLabel | null>(null);

  function resetCreateDraft() {
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel(null);
  }

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setMuscleGroup(null);
    setSelected(null);
    resetCreateDraft();
  }, [open]);

  const catalog = useMemo(() => catalogExercisesForEquipment(equipmentSetup), [equipmentSetup]);
  const availableMuscleGroups = useMemo(() => muscleGroupsInCatalog(catalog), [catalog]);
  const filteredCatalog = useMemo(
    () => filterCatalogExercises(catalog, query, muscleGroup),
    [catalog, query, muscleGroup],
  );
  const filteredCustom = useMemo(
    () =>
      filterCatalogExercises(
        customExercises.map((c) => ({ name: c.name, label: c.label })),
        query,
      ),
    [customExercises, query],
  );

  const selectedKey = selected ? selectionKey(selected.name, selected.label) : null;

  function confirm() {
    if (!selected) return;
    onSelect(selected.name, selected.label?.trim() || undefined);
    if (closeOnSelect) {
      onClose();
      return;
    }
    setSelected(null);
  }

  function handleSaveCustomAndAdd() {
    const n = draftExName.trim();
    if (!n || !draftExLabel || !onSaveCustomAndAdd) return;
    onSaveCustomAndAdd(n, draftExLabel);
    resetCreateDraft();
    if (closeOnSelect) onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} keyboardAware panelStyle={panelStyle}>
      <View testID={testID} style={bodyStyle}>
        <View className="flex-row items-center justify-between px-3 pt-4 pb-1">
          <Pressable
            testID="exercise-search-close"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={12}
          >
            <Text className="text-[17px] font-bold leading-none" style={{ color: colors.textTertiary }}>
              {"\u00D7"}
            </Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            {onSaveCustomAndAdd && !showCreateCard ? (
              <Pressable
                testID="exercise-search-create-new"
                onPress={() => setShowCreateCard(true)}
                accessibilityRole="button"
                accessibilityLabel="New exercise"
                hitSlop={12}
              >
                <Text
                  className="text-[17px] font-bold leading-none tracking-tight"
                  style={{ color: colors.textPrimary }}
                >
                  New
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              testID="exercise-search-add"
              onPress={confirm}
              disabled={!selected || showCreateCard}
              haptic={!!selected && !showCreateCard}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: !selected || showCreateCard }}
              hitSlop={12}
            >
              <Text
                className="text-[17px] font-bold leading-none tracking-tight"
                style={{
                  color: selected && !showCreateCard ? colors.textPrimary : colors.textTertiary,
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="min-h-0 flex-1 px-5">
          {subtitle ? <View className="mb-1">{subtitle}</View> : null}

          <AppTextField
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises..."
            returnKeyType="search"
          />

          {onSaveCustomAndAdd && showCreateCard ? (
            <View
              className="mt-3 rounded-xl border p-3.5"
              style={{ borderColor: colors.border, backgroundColor: colors.backgroundSecondary }}
            >
              <CustomExerciseCreateForm
                name={draftExName}
                selectedLabel={draftExLabel}
                saveButtonLabel="Save to my list & add to workout"
                onNameChange={setDraftExName}
                onLabelChange={setDraftExLabel}
                onSave={handleSaveCustomAndAdd}
                onCancel={resetCreateDraft}
              />
            </View>
          ) : null}

          {availableMuscleGroups.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              style={{ flexGrow: 0, flexShrink: 0 }}
              contentContainerStyle={{ gap: 6, alignItems: "center" }}
              keyboardShouldPersistTaps="handled"
            >
              <MuscleGroupChip
                label="All"
                selected={muscleGroup == null}
                onPress={() => setMuscleGroup(null)}
              />
              {availableMuscleGroups.map((group) => (
                <MuscleGroupChip
                  key={group}
                  label={muscleGroupDisplayName(group)}
                  selected={muscleGroup === group}
                  onPress={() => setMuscleGroup(group)}
                />
              ))}
            </ScrollView>
          ) : null}

          <ScrollView
            style={listStyle}
            className="mt-3"
            contentContainerStyle={{ paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredCustom.length > 0 ? (
              <>
                <ExerciseSearchSectionHeader title="Your exercises" />
                {filteredCustom.map((c, i) => (
                  <ExerciseSearchResultRow
                    key={`custom-${c.name}-${c.label}`}
                    name={c.name}
                    label={c.label}
                    selected={selectedKey === selectionKey(c.name, c.label)}
                    divider={i < filteredCustom.length - 1}
                    onPick={() => setSelected({ name: c.name, label: c.label })}
                  />
                ))}
              </>
            ) : null}
            {filteredCatalog.length > 0 ? (
              <>
                <ExerciseSearchSectionHeader title="Catalog" />
                {filteredCatalog.map((c, i) => (
                  <ExerciseSearchResultRow
                    key={`${c.name}-${c.label}`}
                    name={c.name}
                    label={c.label}
                    selected={selectedKey === selectionKey(c.name, c.label)}
                    divider={i < filteredCatalog.length - 1}
                    onPick={() => setSelected({ name: c.name, label: c.label })}
                  />
                ))}
              </>
            ) : null}
            {filteredCustom.length === 0 && filteredCatalog.length === 0 ? (
              <Text className="py-4 text-center text-sm font-medium" style={{ color: colors.textTertiary }}>
                No matches
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </BottomSheet>
  );
}

function MuscleGroupChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="self-center rounded-full border px-3 py-1"
      style={{
        borderColor: selected ? colors.textPrimary : colors.border,
        backgroundColor: selected ? colors.textPrimary : "transparent",
      }}
    >
      <Text
        className="text-xs font-bold"
        style={{ color: selected ? colors.background : colors.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
