import { localDateKey } from "@newyouai/core";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

import { LogFoodScreen } from "@/components/nutrition/LogFoodScreen";
import { useFitnessState } from "@/context/FitnessContext";

export default function LogFoodPage() {
  const { editItemId, dateKey } = useLocalSearchParams<{
    editItemId?: string;
    dateKey?: string;
  }>();
  const { state } = useFitnessState();

  const activeDateKey = dateKey ?? localDateKey(new Date());
  const editItem = useMemo(() => {
    if (!editItemId || !state) return null;
    return (state.nutritionItemsByDay[activeDateKey] ?? []).find((row) => row.id === editItemId) ?? null;
  }, [editItemId, activeDateKey, state]);

  return <LogFoodScreen dateKey={activeDateKey} editItem={editItem} />;
}
