import { getRecentlyLoggedFoods } from "@newyouai/core";
import type { AppState, FoodSearchResult, NutritionLoggedItem } from "@newyouai/types";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { FoodSearchSkeletonList } from "@/components/nutrition/FoodSearchSkeletonList";
import {
  curatedDefaultServingMacros,
  curatedToSearchResult,
  filterCuratedFoods,
} from "@/lib/curatedFoodSearch";
import type { CuratedFood } from "@/lib/curatedFoods";
import { FOOD_SEARCH_MIN_QUERY_LEN } from "@/lib/foodSearchGuards";
import { FoodSearchError, searchFoods } from "@/lib/foodSearchService";
import { useAppTheme } from "@/hooks/useAppTheme";
const SEARCH_DEBOUNCE_MS = 300;

function formatServingLabel(label: string): string {
  return label.trim() || "1 serving";
}

type Props = {
  state: AppState;
  dayLogAtCapacity: boolean;
  onOpenPicker: (food: FoodSearchResult, curated?: CuratedFood) => void;
  onRelogItem: (item: NutritionLoggedItem) => void;
};

function FoodResultRow({
  name,
  subtitle,
  onPress,
  testID,
}: {
  name: string;
  subtitle: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      className="flex-row items-center gap-3 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
          {name}
        </Text>
        <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      </View>
      <Text className="text-lg" style={{ color: colors.textTertiary }}>
        ›
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return (
    <Text
      className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: colors.textTertiary }}
    >
      {title}
    </Text>
  );
}

function FoodListCard({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="mb-4 overflow-hidden rounded-[14px] border px-3.5 py-1"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      {children}
    </View>
  );
}

export function LogFoodAllTab({ state, dayLogAtCapacity, onOpenPicker, onRelogItem }: Props) {
  const { colors } = useAppTheme();
  const [search, setSearch] = useState("");
  const [apiResults, setApiResults] = useState<FoodSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const searchSeq = useRef(0);

  const recentlyLogged = useMemo(
    () => getRecentlyLoggedFoods(state.nutritionItemsByDay),
    [state.nutritionItemsByDay],
  );

  const filteredCurated = useMemo(() => filterCuratedFoods(search), [search]);

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length >= FOOD_SEARCH_MIN_QUERY_LEN) return recentlyLogged;
    return recentlyLogged.filter((it) => (it.name || "").toLowerCase().includes(q));
  }, [recentlyLogged, search]);

  const searchActive = search.trim().length >= FOOD_SEARCH_MIN_QUERY_LEN;

  useEffect(() => {
    const q = search.trim();
    if (q.length < FOOD_SEARCH_MIN_QUERY_LEN) {
      setApiResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const seq = ++searchSeq.current;
    setSearchLoading(true);
    setSearchError(null);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const results = await searchFoods(q);
          if (seq !== searchSeq.current) return;
          setApiResults(results);
          setSearchError(null);
        } catch (e) {
          if (seq !== searchSeq.current) return;
          setApiResults([]);
          setSearchError(e instanceof FoodSearchError ? e.message : "Search failed. Try again.");
        } finally {
          if (seq === searchSeq.current) setSearchLoading(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, retryKey]);

  function retrySearch() {
    setRetryKey((k) => k + 1);
  }

  function openRecentItem(item: NutritionLoggedItem) {
    onOpenPicker({
      id: item.id,
      name: item.name.trim() || "Food",
      cal: Number(item.cal) || 0,
      p: Number(item.p) || 0,
      c: Number(item.c) || 0,
      f: Number(item.f) || 0,
      defaultServing: item.servingLabel?.trim() || "1 serving",
      source: item.source ?? "manual",
      externalId: item.id,
      servings: [],
    });
  }

  return (
    <>
      <TextInput
        value={search}
        onChangeText={setSearch}
        testID="log-food-search-input"
        accessibilityLabel="Search foods"
        placeholder="Search foods (e.g. chicken breast)"
        placeholderTextColor={colors.textTertiary}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        className="rounded-xl border px-3 py-3 text-[15px]"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.textPrimary,
        }}
      />

      {searchActive ? (
        <>
          {searchLoading ? <FoodSearchSkeletonList /> : null}
          {!searchLoading && searchError ? (
            <View className="mt-1">
              <Text className="text-sm leading-5" style={{ color: "#ffb4b4" }}>
                {searchError}
              </Text>
              <Pressable onPress={retrySearch} accessibilityRole="button" className="mt-3">
                <Text className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                  Retry search
                </Text>
              </Pressable>
            </View>
          ) : null}
          {!searchLoading && !searchError && filteredCurated.length === 0 && apiResults.length === 0 ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: colors.textSecondary }}>
              No results. Try a different search or use Manual Add.
            </Text>
          ) : null}
          {!searchLoading && !searchError && filteredCurated.length > 0 ? (
            <>
              <SectionHeader title="Common Foods" />
              <FoodListCard>
                {filteredCurated.map((curated, idx) => {
                  const macros = curatedDefaultServingMacros(curated);
                  const isLast = idx === filteredCurated.length - 1 && apiResults.length === 0;
                  return (
                    <View key={curated.id} style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: colors.border }}>
                      <FoodResultRow
                        name={curated.name}
                        subtitle={`${macros.cal} cal · ${formatServingLabel(curated.defaultServing.label)}`}
                        onPress={() => onOpenPicker(curatedToSearchResult(curated), curated)}
                      />
                    </View>
                  );
                })}
              </FoodListCard>
            </>
          ) : null}
          {!searchLoading && !searchError && apiResults.length > 0 ? (
            <>
              <SectionHeader title="More Results" />
              <FoodListCard>
                {apiResults.map((food, idx) => (
                  <View key={food.id} style={{ borderBottomWidth: idx === apiResults.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
                    <FoodResultRow
                      testID={`log-food-search-result-${food.id}`}
                      name={food.name}
                      subtitle={`${Math.round(Number(food.cal) || 0)} cal · ${formatServingLabel(food.defaultServing)}${food.brand ? ` · ${food.brand}` : ""}`}
                      onPress={() => onOpenPicker(food)}
                    />
                  </View>
                ))}
              </FoodListCard>
            </>
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader title="Recently logged" />
          {filteredRecent.length === 0 ? (
            <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>
              Nothing logged recently. Search above or use Manual Add.
            </Text>
          ) : (
            <FoodListCard>
              {filteredRecent.map((item, idx) => (
                <View
                  key={`${item.id}-${item.name}`}
                  className="flex-row items-center gap-2"
                  style={{ borderBottomWidth: idx === filteredRecent.length - 1 ? 0 : 1, borderBottomColor: colors.border }}
                >
                  <Pressable
                    onPress={() => openRecentItem(item)}
                    accessibilityLabel={`Edit and log ${item.name.trim() || "food"}`}
                    className="min-w-0 flex-1 flex-row items-center gap-3 py-3"
                  >
                    <View className="min-w-0 flex-1">
                      <Text className="text-[15px] font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
                        {item.name.trim() || "Food"}
                      </Text>
                      <Text className="mt-1 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                        {Math.round(Number(item.cal) || 0)} cal · {formatServingLabel(item.servingLabel ?? "1 serving")}
                      </Text>
                    </View>
                    <Text className="text-lg" style={{ color: colors.textTertiary }}>
                      ›
                    </Text>
                  </Pressable>
                  <Pressable
                    testID={`log-food-relog-${item.id}`}
                    accessibilityLabel={`Log again ${item.name.trim() || "food"}`}
                    onPress={() => onRelogItem(item)}
                    disabled={dayLogAtCapacity}
                    className="h-9 w-9 items-center justify-center rounded-full border"
                    style={{
                      borderColor: colors.accent,
                      backgroundColor: dayLogAtCapacity ? colors.border : colors.accent,
                      opacity: dayLogAtCapacity ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-lg font-bold leading-none" style={{ color: colors.accentText }}>
                      +
                    </Text>
                  </Pressable>
                </View>
              ))}
            </FoodListCard>
          )}
        </>
      )}
    </>
  );
}
