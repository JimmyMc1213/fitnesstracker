import { getRecentlyLoggedFoods } from "@newyouai/core";
import type { AppState, FoodSearchResult, NutritionLoggedItem } from "@newyouai/types";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { GradientCard } from "@/components/ui/GradientCard";
import { FoodSearchSkeletonList } from "@/components/nutrition/FoodSearchSkeletonList";
import { AppTextField } from "@/components/ui/AppTextField";
import {
  curatedDefaultServingMacros,
  curatedToSearchResult,
  filterCuratedFoods,
} from "@/lib/curatedFoodSearch";
import type { CuratedFood } from "@/lib/curatedFoods";
import { FOOD_SEARCH_MIN_QUERY_LEN } from "@/lib/foodSearchGuards";
import { FoodSearchError, searchFoods } from "@/lib/foodSearchService";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLogFoodAccent } from "@/hooks/useLogFoodAccent";
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

function FoodItemCard({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View
      className="mb-2 overflow-hidden rounded-[14px] border px-3.5"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      {children}
    </View>
  );
}

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

export function LogFoodAllTab({ state, dayLogAtCapacity, onOpenPicker, onRelogItem }: Props) {
  const { colors } = useAppTheme();
  const { accent, accentText } = useLogFoodAccent();
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

  const searchTrimmed = search.trim();
  const searchActive = searchTrimmed.length >= FOOD_SEARCH_MIN_QUERY_LEN;
  const searchTypingHint = searchTrimmed.length > 0 && !searchActive;

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
    <View>
      <View className="mb-6">
        <Text
          className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          Search foods
        </Text>
        <AppTextField
          value={search}
          onChangeText={setSearch}
          testID="log-food-search-input"
          accessibilityLabel="Search foods"
          placeholder="Chicken breast, Greek yogurt…"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          backgroundColor={colors.card}
          style={{ lineHeight: 20 }}
        />
        {searchTypingHint ? (
          <Text className="mt-2.5 text-xs leading-5" style={{ color: colors.textTertiary }}>
            Keep typing to search the food database.
          </Text>
        ) : !searchActive ? (
          <Text className="mt-2.5 text-xs leading-5" style={{ color: colors.textTertiary }}>
            Or pick from your recent foods below.
          </Text>
        ) : null}
      </View>

      {searchActive ? (
        <>
          {searchLoading ? <FoodSearchSkeletonList /> : null}
          {!searchLoading && searchError ? (
            <View>
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
            <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
              No results found. Try another search or use Manual Add.
            </Text>
          ) : null}
          {!searchLoading && !searchError && filteredCurated.length > 0 ? (
            <>
              <SectionHeader title="Common Foods" />
              {filteredCurated.map((curated) => {
                const macros = curatedDefaultServingMacros(curated);
                return (
                  <FoodItemCard key={curated.id}>
                    <FoodResultRow
                      name={curated.name}
                      subtitle={`${macros.cal} cal · ${formatServingLabel(curated.defaultServing.label)}`}
                      onPress={() => onOpenPicker(curatedToSearchResult(curated), curated)}
                    />
                  </FoodItemCard>
                );
              })}
            </>
          ) : null}
          {!searchLoading && !searchError && apiResults.length > 0 ? (
            <>
              <SectionHeader title="More Results" />
              {apiResults.map((food) => (
                <FoodItemCard key={food.id}>
                  <FoodResultRow
                    testID={`log-food-search-result-${food.id}`}
                    name={food.name}
                    subtitle={`${Math.round(Number(food.cal) || 0)} cal · ${formatServingLabel(food.defaultServing)}${food.brand ? ` · ${food.brand}` : ""}`}
                    onPress={() => onOpenPicker(food)}
                  />
                </FoodItemCard>
              ))}
            </>
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader title="Recently logged" />
          {recentlyLogged.length === 0 ? (
            <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
              No recent foods yet.
            </Text>
          ) : (
            recentlyLogged.map((item) => (
              <GradientCard key={`${item.id}-${item.name}`} padding={0} style={{ marginBottom: 8 }}>
                <View className="flex-row items-center gap-2 px-3.5">
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
                    haptic={false}
                    onPress={() => onRelogItem(item)}
                    disabled={dayLogAtCapacity}
                    className="h-9 w-9 items-center justify-center rounded-full border"
                    style={{
                      borderColor: accent,
                      backgroundColor: dayLogAtCapacity ? colors.border : accent,
                      opacity: dayLogAtCapacity ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-lg font-bold leading-none" style={{ color: accentText }}>
                      +
                    </Text>
                  </Pressable>
                </View>
              </GradientCard>
            ))
          )}
        </>
      )}
    </View>
  );
}
