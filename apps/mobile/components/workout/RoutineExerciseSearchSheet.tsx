import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  ExerciseSearchResultRow,
  ExerciseSearchSectionHeader,
} from "@/components/workout/ExerciseSearchResultRow";
import {
  catalogExercisesForEquipment,
  filterCatalogExercises,
} from "@/lib/workout/exerciseCatalogSearch";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { CustomExerciseTemplate, EquipmentSetup } from "@newyouai/types";

type Props = {
  open?: boolean;
  title?: string;
  equipmentSetup: EquipmentSetup;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onSaveCustomAndAdd?: (name: string, label: string) => void;
  onClose: () => void;
  closeOnSelect?: boolean;
  closeLabel?: string;
};

export function RoutineExerciseSearchSheet({
  open = true,
  title = "Choose exercise",
  equipmentSetup,
  customExercises,
  onSelect,
  onSaveCustomAndAdd: _onSaveCustomAndAdd,
  onClose,
  closeOnSelect = true,
  closeLabel = "Cancel",
}: Props) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");

  const catalog = useMemo(() => catalogExercisesForEquipment(equipmentSetup), [equipmentSetup]);
  const filteredCatalog = useMemo(() => filterCatalogExercises(catalog, query), [catalog, query]);
  const filteredCustom = useMemo(
    () =>
      filterCatalogExercises(
        customExercises.map((c) => ({ name: c.name, label: c.label })),
        query,
      ),
    [customExercises, query],
  );

  function pick(name: string, label?: string) {
    onSelect(name, label?.trim() || undefined);
    setQuery("");
    if (closeOnSelect) onClose();
  }

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose}>
        <Pressable
          testID="routine-exercise-search-sheet"
          className="max-h-[82%] rounded-t-2xl px-5 pb-8 pt-5"
          style={{ backgroundColor: colors.card }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {title}
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textTertiary}
            className="mt-3 rounded-xl border px-3 py-3 text-[15px]"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
              color: colors.textPrimary,
            }}
          />

          <ScrollView className="mt-3 max-h-[420px]" keyboardShouldPersistTaps="handled">
            {filteredCustom.length > 0 ? (
              <>
                <ExerciseSearchSectionHeader title="Your exercises" />
                {filteredCustom.map((c) => (
                  <ExerciseSearchResultRow
                    key={`custom-${c.name}-${c.label}`}
                    name={c.name}
                    label={c.label}
                    onPick={() => pick(c.name, c.label)}
                  />
                ))}
              </>
            ) : null}
            {filteredCatalog.length > 0 ? (
              <>
                <ExerciseSearchSectionHeader title="Catalog" />
                {filteredCatalog.map((c) => (
                  <ExerciseSearchResultRow
                    key={`${c.name}-${c.label}`}
                    name={c.name}
                    label={c.label}
                    onPick={() => pick(c.name, c.label)}
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

          <Pressable testID="routine-exercise-search-close" onPress={onClose} className="mt-4 items-center py-2">
            <Text className="text-sm font-semibold" style={{ color: colors.textTertiary }}>
              {closeLabel}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
