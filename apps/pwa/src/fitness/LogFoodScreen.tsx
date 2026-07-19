import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { AnimatedNumberFlip } from "./AnimatedNumberFlip";
import { BarcodeScanner } from "./BarcodeScanner";
import { CURATED_FOODS, type CuratedFood } from "./curatedFoods";
import { scaleMacros } from "./foodSearchMacros";
import {
  buildMeasurements,
  computeServingMultiplier,
  formatServingLabel,
  getBaseGrams,
  inferMeasurementFromServing,
  inferLoggedServingQuantity,
  loggedItemToPickerEdit,
  resolvePickerMeasurementFromServing,
  OZ_TO_G,
  parseQuantityInput,
  parseServingLabel,
} from "./foodMeasurements";
import { submitCommunityFoodFromBarcodeScan } from "./communityFoods";
import { FoodSearchError, lookupFoodByBarcode, searchFoods } from "./foodSearchService";
import type { FoodMeasurement, FoodSearchResult } from "./foodSearchTypes";
import { FoodAddedToast, useFoodAddedToast } from "./FoodAddedToast";
import {
  appendNutritionLoggedItem,
  appendNutritionUserFoodToState,
  buildNutritionLoggedItem,
  canAppendNutritionItem,
  getRecentlyLoggedFoods,
  newNutritionItemId,
  nutritionUserFoodFromLoggedItem,
  removeNutritionLoggedItem,
  removeNutritionUserFoodFromState,
  toggleNutritionFavoriteInState,
  updateNutritionLoggedItem,
  updateNutritionUserFoodInState,
} from "./nutritionLog";
import { isNutritionFavorite, touchNutritionPresetById } from "./nutritionTotals";
import {
  appendNutritionMeal,
  buildLoggedItemFromMeal,
  formatMealServingLabel,
  mealItemFromPreset,
  mealItemFromUserFood,
  removeNutritionMeal,
  sumMealMacros,
  updateNutritionMeal,
} from "./nutritionMeals";
import { getServingDefault } from "./servingDefaults";
import { formatMacroGrams, formatServing, toTitleCase } from "./utils/foodDisplay";
import { PrimaryButton } from "./shared";
import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import { FoodSearchSkeletonList } from "./FoodSearchSkeletonList";
import { IconScan } from "./icons";
import { clampMacroInputString, parseBoundedMacro } from "./macroLimits";
import { closeAfterMotion, FullScreenOverlay, MOTION_DURATIONS, ScreenTransition, useKeyboardViewport } from "./motion";
import type { AppState, MacroTotals, NutritionLoggedItem, NutritionMeal, NutritionMealItem, NutritionPreset, NutritionUserFood } from "./types";

type PickerContext = "log" | "mealIngredient";

function blurMacroInput(key: keyof MacroTotals, raw: string, setRaw: (value: string) => void) {
  setRaw(clampMacroInputString(raw, key));
}

type LogFoodTab = "all" | "myFoods" | "myMeals" | "saved";

type PendingFoodDelete =
  | { kind: "userFood"; food: NutritionUserFood }
  | { kind: "meal"; meal: NutritionMeal }
  | { kind: "mealDraftItem"; itemId: string; name: string };

const DEFAULT_SERVING = "1 serving";
const MIN_SEARCH_LEN = 2;
const SEARCH_DEBOUNCE_MS = 300;

const searchInputStyle = {
  width: "100%",
  marginBottom: 16,
  fontSize: 15,
  borderRadius: 14,
  padding: "12px 14px",
  background: "var(--surface-3)",
  border: "0.5px solid var(--divider-subtle)",
  color: "var(--text-primary)",
} as const;

const foodListCardStyle = {
  padding: "4px 14px",
  marginBottom: 16,
  overflow: "hidden" as const,
};

const foodItemCardStyle = {
  padding: "4px 14px",
  marginBottom: 8,
  overflow: "hidden" as const,
};

const PICKER_MACRO_COLORS = {
  Protein: "var(--macro-protein)",
  Carbs: "var(--macro-carbs)",
  Fat: "var(--macro-fat)",
} as const;

const MAX_SERVING_DIGITS = 5;

function clampServingQuantityInput(raw: string): string {
  let cleaned = "";
  let hasDot = false;
  let digitCount = 0;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      if (digitCount >= MAX_SERVING_DIGITS) continue;
      cleaned += ch;
      digitCount += 1;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      cleaned += ch;
    }
  }
  return cleaned;
}

function moveInputCursorToEnd(el: HTMLInputElement) {
  requestAnimationFrame(() => {
    const len = el.value.length;
    el.setSelectionRange(len, len);
  });
}

function FitText({
  children,
  maxFontSize,
  minFontSize = 10,
  className,
  style,
}: {
  children: ReactNode;
  maxFontSize: number;
  minFontSize?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el) return;
    let size = maxFontSize;
    el.style.fontSize = `${size}px`;
    while (size > minFontSize && el.scrollWidth > wrap.clientWidth) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
  }, [children, maxFontSize, minFontSize]);

  useLayoutEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fit());
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [fit]);

  return (
    <div ref={wrapRef} style={{ minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
      <span
        ref={textRef}
        className={className}
        style={{ ...style, display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.1 }}
      >
        {children}
      </span>
    </div>
  );
}

const addButtonStyle = {
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "none",
  background: "var(--pos, #4ade80)",
  color: "#07080c",
  fontSize: 20,
  fontWeight: 700,
  lineHeight: 1,
  display: "grid",
  placeItems: "center",
} as const;

function shortenPickerLabel(label: string, max = 22): string {
  const trimmed = label.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function isCatalogFoodSource(source?: string): boolean {
  const s = source?.trim().toLowerCase();
  return s === "usda" || s === "off" || s === "curated";
}

function displayFoodName(name: string, source?: string): string {
  const trimmed = name.trim() || "Food";
  return isCatalogFoodSource(source) ? toTitleCase(trimmed) : trimmed;
}

function formatGramsInLabel(label: string): string {
  return label.replace(/([\d.]+)\s*g\b/gi, (_, numStr) => {
    const grams = parseFloat(numStr);
    return Number.isFinite(grams) ? formatServing(grams) : `${numStr}g`;
  });
}

function filterCuratedFoods(query: string): CuratedFood[] {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_SEARCH_LEN) return [];
  return CURATED_FOODS.filter((food) => food.keywords.some((kw) => kw.toLowerCase().includes(q)));
}

function curatedToSearchResult(food: CuratedFood): FoodSearchResult {
  return {
    id: food.id,
    name: food.name,
    defaultServing: food.defaultServing.label,
    baseGrams: 100,
    cal: food.per100g.cal,
    p: food.per100g.p,
    c: food.per100g.c,
    f: food.per100g.f,
    source: "curated",
    externalId: food.id,
    servings: [],
  };
}

function curatedDefaultServingMacros(food: CuratedFood) {
  const factor = food.defaultServing.grams / 100;
  return {
    cal: Math.round(food.per100g.cal * factor),
    p: Math.round(food.per100g.p * factor * 10) / 10,
    c: Math.round(food.per100g.c * factor * 10) / 10,
    f: Math.round(food.per100g.f * factor * 10) / 10,
  };
}

function buildPickerMeasurements(
  food: FoodSearchResult,
  curated?: CuratedFood,
): {
  measurements: FoodMeasurement[];
  fixedLabels: Record<string, string>;
} {
  const fixedLabels: Record<string, string> = {};
  const list: FoodMeasurement[] = [];
  const seen = new Set<string>();
  const baseGrams = getBaseGrams(food);

  const add = (m: FoodMeasurement) => {
    if (seen.has(m.id)) return;
    seen.add(m.id);
    list.push(m);
  };

  const smart = curated
    ? { label: curated.defaultServing.label, grams: curated.defaultServing.grams }
    : getServingDefault(food.name);

  if (smart) {
    fixedLabels["smart-default"] = smart.label;
    add(
      inferMeasurementFromServing(
        "smart-default",
        shortenPickerLabel(smart.label),
        smart.grams,
        smart.label,
      ),
    );
  } else {
    const parsed = parseServingLabel(food.defaultServing);
    const grams = parsed?.grams && parsed.grams > 0 ? parsed.grams : baseGrams;
    const displayLabel = food.defaultServing.trim()
      ? formatGramsInLabel(food.defaultServing.trim())
      : formatServing(grams);
    fixedLabels["primary-serving"] = displayLabel;
    add(
      inferMeasurementFromServing(
        "primary-serving",
        shortenPickerLabel(displayLabel),
        grams,
        displayLabel,
      ),
    );
  }

  const hideHundredGramPreset =
    food.source === "off" && baseGrams > 0 && Math.round(baseGrams) !== 100;
  if (!hideHundredGramPreset) {
    add({
      id: "100g",
      label: "100g",
      unitSuffix: "g",
      gramsPerUnit: 1,
      defaultQuantity: 100,
    });
  }

  add({
    id: "oz",
    label: "Oz",
    unitSuffix: "oz",
    gramsPerUnit: OZ_TO_G,
    defaultQuantity: Math.round((baseGrams / OZ_TO_G) * 10) / 10,
  });

  if (!curated) {
    for (const m of buildMeasurements(food)) {
      if (m.id === "g") continue;
      add(m);
    }
  }

  return { measurements: list, fixedLabels };
}

function pickerServingLabel(
  measurement: FoodMeasurement,
  quantity: number,
  fixedLabels: Record<string, string>,
): string {
  const fixed = fixedLabels[measurement.id];
  if (fixed) {
    const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    if (q === 1) return fixed;
    const qStr = Number.isInteger(q) ? String(q) : String(Math.round(q * 10) / 10);
    return `${qStr} × ${fixed}`;
  }
  return formatServingLabel(measurement, quantity);
}

function logFoodSearchResultWithDefaultServing(
  food: FoodSearchResult,
  dateKey: string,
  setState: Dispatch<SetStateAction<AppState>>,
  curated?: CuratedFood,
  onLogged?: (itemId: string) => void,
): boolean {
  const { measurements, fixedLabels } = buildPickerMeasurements(food, curated);
  const measurement = measurements[0];
  if (!measurement) return false;

  const baseGrams = getBaseGrams(food);
  const quantity = measurement.defaultQuantity;
  const multiplier = computeServingMultiplier(measurement, quantity, baseGrams);
  const macros = scaleMacros(food, multiplier);
  const servingLabel = pickerServingLabel(measurement, quantity, fixedLabels);
  const row = buildNutritionLoggedItem(macros, food.name, {
    loggedAtMs: Date.now(),
    servingLabel,
    source: food.source,
    externalId: food.externalId,
  });
  setState((s) => appendNutritionLoggedItem(s, dateKey, row));
  onLogged?.(row.id);
  return true;
}

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  /** When set, opens directly into serving picker or manual edit for this logged row. */
  editItem?: NutritionLoggedItem | null;
};

function tabLabel(t: LogFoodTab): string {
  switch (t) {
    case "all":
      return "All";
    case "myFoods":
      return "My foods";
    case "myMeals":
      return "My meals";
    case "saved":
      return "Favorite foods";
    default:
      return t;
  }
}

export function LogFoodScreen({ open, onClose, dateKey, state, setState, editItem }: Props) {
  const [closing, setClosing] = useState(false);
  const visible = open && !closing;
  const foodAddedToast = useFoodAddedToast();
  const hideFoodAddedToast = foodAddedToast.hide;
  const { keyboardBottom } = useKeyboardViewport();
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setClosing(false);
  }, [open]);

  useEffect(() => {
    if (!open) hideFoodAddedToast();
  }, [open, hideFoodAddedToast]);

  useEffect(() => {
    if (!highlightItemId) return;
    const id = window.setTimeout(() => setHighlightItemId(null), 2400);
    return () => window.clearTimeout(id);
  }, [highlightItemId]);

  function resetLogSubview() {
    setManualOpen(false);
    resetManualDraft();
    setPickerFood(null);
    setPickerCurated(null);
    setPickerMeasurementId("g");
    setPickerQuantity("");
    setMealAddSearchOpen(false);
    setMealAddMyFoodsOpen(false);
    setMealAddFavoritesOpen(false);
    setSearch("");
    setApiResults([]);
  }

  function afterFoodLogged(itemId: string) {
    resetLogSubview();
    foodAddedToast.show(itemId);
  }

  function handleViewLoggedFood() {
    const itemId = foodAddedToast.itemId;
    if (!itemId) return;
    setTab("all");
    setHighlightItemId(itemId);
    foodAddedToast.hide();
    window.requestAnimationFrame(() => {
      const row = scrollContainerRef.current?.querySelector(`[data-recent-item-id="${itemId}"]`);
      row?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function handleUndoLoggedFood() {
    const itemId = foodAddedToast.itemId;
    if (!itemId) return;
    setState((s) => removeNutritionLoggedItem(s, dateKey, itemId));
    if (highlightItemId === itemId) setHighlightItemId(null);
    foodAddedToast.hide();
  }

  function requestClose() {
    if (closing) return;
    setClosing(true);
    closeAfterMotion(onClose, MOTION_DURATIONS.panel);
  }

  const [tab, setTab] = useState<LogFoodTab>("all");
  const [search, setSearch] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [pickerFood, setPickerFood] = useState<FoodSearchResult | null>(null);
  const [pickerCurated, setPickerCurated] = useState<CuratedFood | null>(null);
  const [pickerMeasurementId, setPickerMeasurementId] = useState<string>("g");
  const [pickerQuantity, setPickerQuantity] = useState("");

  const [apiResults, setApiResults] = useState<FoodSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchSeq = useRef(0);

  const [draftName, setDraftName] = useState("");
  const [draftCal, setDraftCal] = useState("");
  const [draftP, setDraftP] = useState("");
  const [draftC, setDraftC] = useState("");
  const [draftF, setDraftF] = useState("");
  const [draftServing, setDraftServing] = useState("");
  const [editingUserFoodId, setEditingUserFoodId] = useState<string | null>(null);
  const [editingLoggedItemId, setEditingLoggedItemId] = useState<string | null>(null);

  const [mealEditorOpen, setMealEditorOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealDraftName, setMealDraftName] = useState("");
  const [mealDraftItems, setMealDraftItems] = useState<NutritionMealItem[]>([]);
  const [pickerContext, setPickerContext] = useState<PickerContext>("log");
  const [mealAddSearchOpen, setMealAddSearchOpen] = useState(false);
  const [mealAddMyFoodsOpen, setMealAddMyFoodsOpen] = useState(false);
  const [mealAddFavoritesOpen, setMealAddFavoritesOpen] = useState(false);
  const [mealIngredientManualOpen, setMealIngredientManualOpen] = useState(false);
  const [mealIngredientName, setMealIngredientName] = useState("");
  const [mealIngredientCal, setMealIngredientCal] = useState("");
  const [mealIngredientP, setMealIngredientP] = useState("");
  const [mealIngredientC, setMealIngredientC] = useState("");
  const [mealIngredientF, setMealIngredientF] = useState("");
  const [mealIngredientServing, setMealIngredientServing] = useState("");

  const [pendingDelete, setPendingDelete] = useState<PendingFoodDelete | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLookupLoading, setBarcodeLookupLoading] = useState(false);
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pickerQuantityInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const userFoods = state.nutritionUserFoods ?? [];
  const savedMeals = state.nutritionMeals ?? [];
  const favoritePresets = useMemo(
    () =>
      (state.nutritionPresets ?? [])
        .filter((p) => p.favoritedAtMs != null)
        .sort((a, b) => (b.favoritedAtMs ?? 0) - (a.favoritedAtMs ?? 0)),
    [state.nutritionPresets],
  );

  const recentlyLogged = useMemo(() => getRecentlyLoggedFoods(state.nutritionItemsByDay), [state.nutritionItemsByDay]);

  const dayLogAtCapacity = useMemo(
    () => !canAppendNutritionItem(state, dateKey),
    [state, dateKey],
  );

  const mealDraftMacros = useMemo(() => sumMealMacros(mealDraftItems), [mealDraftItems]);

  const pickerMeasurementBundle = useMemo(
    () =>
      pickerFood
        ? buildPickerMeasurements(pickerFood, pickerCurated ?? undefined)
        : { measurements: [], fixedLabels: {} },
    [pickerFood, pickerCurated],
  );
  const pickerMeasurements = pickerMeasurementBundle.measurements;
  const pickerFixedLabels = pickerMeasurementBundle.fixedLabels;

  const pickerMeasurement = useMemo(
    () => pickerMeasurements.find((m) => m.id === pickerMeasurementId) ?? pickerMeasurements[0] ?? null,
    [pickerMeasurements, pickerMeasurementId],
  );

  const pickerBaseGrams = pickerFood ? getBaseGrams(pickerFood) : 100;

  const pickerQuantityNum = parseQuantityInput(pickerQuantity) ?? pickerMeasurement?.defaultQuantity ?? 1;

  const pickerMultiplier = pickerMeasurement
    ? computeServingMultiplier(pickerMeasurement, pickerQuantityNum, pickerBaseGrams)
    : 1;

  const pickerMacros = pickerFood ? scaleMacros(pickerFood, pickerMultiplier) : null;

  useEffect(() => {
    const el = pickerQuantityInputRef.current;
    if (!el || document.activeElement !== el) return;
    moveInputCursorToEnd(el);
  }, [pickerMeasurementId]);

  const filteredCurated = useMemo(() => filterCuratedFoods(search), [search]);

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length >= MIN_SEARCH_LEN) return recentlyLogged;
    return recentlyLogged.filter((it) => (it.name || "").toLowerCase().includes(q));
  }, [recentlyLogged, search]);

  const searchActive =
    (tab === "all" || (mealEditorOpen && mealAddSearchOpen)) && search.trim().length >= MIN_SEARCH_LEN;

  useEffect(() => {
    if (!open) return;
    const mealSearch = mealEditorOpen && mealAddSearchOpen;
    if (!mealSearch && tab !== "all") return;
    const q = search.trim();
    if (q.length < MIN_SEARCH_LEN) {
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
  }, [open, tab, search, mealEditorOpen, mealAddSearchOpen]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setManualOpen(false);
      setPickerFood(null);
      setPickerCurated(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      setApiResults([]);
      setSearchLoading(false);
      setSearchError(null);
      setEditingUserFoodId(null);
      setEditingLoggedItemId(null);
      resetMealEditor();
      setScannerOpen(false);
      setBarcodeLookupLoading(false);
      setBarcodeFeedback(null);
    }
  }, [open]);

  function resetMealEditor() {
    setMealEditorOpen(false);
    setEditingMealId(null);
    setMealDraftName("");
    setMealDraftItems([]);
    setPickerContext("log");
    setMealAddSearchOpen(false);
    setMealAddMyFoodsOpen(false);
    setMealAddFavoritesOpen(false);
    setMealIngredientManualOpen(false);
    resetMealIngredientDraft();
  }

  function resetMealIngredientDraft() {
    setMealIngredientName("");
    setMealIngredientCal("");
    setMealIngredientP("");
    setMealIngredientC("");
    setMealIngredientF("");
    setMealIngredientServing("");
  }

  useEffect(() => {
    if (!open || !editItem) return;
    openEditLoggedItem(editItem);
  }, [open, editItem]);

  useEffect(() => {
    if (!open || tab !== "all" || manualOpen || mealEditorOpen || pickerFood) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open, tab, manualOpen, mealEditorOpen, pickerFood]);

  function focusSearchInput() {
    searchInputRef.current?.focus({ preventScroll: true });
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openLoggedItemEditor(item: NutritionLoggedItem, mode: "edit" | "relog") {
    setEditingLoggedItemId(mode === "edit" ? item.id : null);
    setTab("all");
    setSearch("");
    setEditingUserFoodId(null);
    setPickerContext("log");

    const pickerEdit = loggedItemToPickerEdit(item);
    if (pickerEdit) {
      const curated =
        pickerEdit.food.source === "curated"
          ? (CURATED_FOODS.find((f) => f.id === pickerEdit.food.externalId) ?? null)
          : null;
      let food = curated ? curatedToSearchResult(curated) : pickerEdit.food;
      const { measurements, fixedLabels } = buildPickerMeasurements(food, curated ?? undefined);
      const resolved = resolvePickerMeasurementFromServing(
        measurements,
        fixedLabels,
        item.servingLabel?.trim() ?? "",
      );
      const measurement =
        measurements.find((m) => m.id === resolved.measurementId) ?? measurements[0] ?? null;
      const baseGrams = getBaseGrams(food);
      let quantityNum =
        parseQuantityInput(resolved.quantity) ?? measurement?.defaultQuantity ?? 1;
      if (measurement) {
        quantityNum = inferLoggedServingQuantity(item, food, measurement, quantityNum, baseGrams);
        if (!curated) {
          const mult = computeServingMultiplier(measurement, quantityNum, baseGrams);
          const baseMacros = scaleMacros(item, mult > 0 ? 1 / mult : 1);
          food = { ...food, ...baseMacros };
        }
      }
      setPickerFood(food);
      setPickerCurated(curated);
      setPickerMeasurementId(measurement?.id ?? resolved.measurementId);
      setPickerQuantity(String(quantityNum));
      setManualOpen(false);
      resetManualDraft();
      return;
    }

    setPickerFood(null);
    setPickerCurated(null);
    setPickerMeasurementId("g");
    setPickerQuantity("");
    setDraftName(item.name.trim() || "Food");
    setDraftCal(String(Math.round(Number(item.cal) || 0)));
    setDraftP(String(Number(item.p) || 0));
    setDraftC(String(Number(item.c) || 0));
    setDraftF(String(Number(item.f) || 0));
    setDraftServing(item.servingLabel?.trim() ?? "");
    setManualOpen(true);
  }

  function openEditLoggedItem(item: NutritionLoggedItem) {
    openLoggedItemEditor(item, "edit");
  }

  function openRecentItemForLog(item: NutritionLoggedItem) {
    openLoggedItemEditor(item, "relog");
  }

  function handleBack() {
    if (editingLoggedItemId) {
      requestClose();
      return;
    }
    if (mealEditorOpen) {
      if (pickerFood && pickerContext === "mealIngredient") {
        setPickerFood(null);
        setPickerCurated(null);
        setPickerMeasurementId("g");
        setPickerQuantity("");
        return;
      }
      if (mealIngredientManualOpen) {
        setMealIngredientManualOpen(false);
        resetMealIngredientDraft();
        return;
      }
      if (mealAddSearchOpen || mealAddMyFoodsOpen || mealAddFavoritesOpen) {
        setMealAddSearchOpen(false);
        setMealAddMyFoodsOpen(false);
        setMealAddFavoritesOpen(false);
        setSearch("");
        setApiResults([]);
        return;
      }
      resetMealEditor();
      return;
    }
    if (manualOpen) {
      setManualOpen(false);
      setEditingUserFoodId(null);
      resetManualDraft();
      return;
    }
    if (pickerFood) {
      setPickerFood(null);
      setPickerCurated(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      return;
    }
    requestClose();
  }

  function logManualAndClose() {
    const macros = {
      cal: parseBoundedMacro(draftCal, "cal"),
      p: parseBoundedMacro(draftP, "p"),
      c: parseBoundedMacro(draftC, "c"),
      f: parseBoundedMacro(draftF, "f"),
    };
    const name = draftName.trim() || "Food";
    const servingLabel = draftServing.trim() ? draftServing.trim() : undefined;

    if (editingUserFoodId) {
      setState((s) =>
        updateNutritionUserFoodInState(s, editingUserFoodId, {
          name,
          ...macros,
          ...(servingLabel ? { servingLabel } : {}),
        }),
      );
      setEditingUserFoodId(null);
      setManualOpen(false);
      resetManualDraft();
      return;
    }

    if (editingLoggedItemId) {
      const existing = editItem && editItem.id === editingLoggedItemId ? editItem : null;
      const row = buildNutritionLoggedItem(macros, name, {
        id: editingLoggedItemId,
        loggedAtMs: existing?.loggedAtMs ?? Date.now(),
        ...(servingLabel ? { servingLabel } : {}),
        ...(existing?.source?.trim() ? { source: existing.source.trim() } : {}),
        ...(existing?.externalId?.trim() ? { externalId: existing.externalId.trim() } : {}),
      });
      setState((s) => updateNutritionLoggedItem(s, dateKey, editingLoggedItemId, row));
      setEditingLoggedItemId(null);
      setManualOpen(false);
      resetManualDraft();
      requestClose();
      return;
    }

    const row = buildNutritionLoggedItem(macros, name, {
      loggedAtMs: Date.now(),
      ...(servingLabel ? { servingLabel } : {}),
    });
    setState((s) => {
      const withLog = appendNutritionLoggedItem(s, dateKey, row);
      return appendNutritionUserFoodToState(withLog, nutritionUserFoodFromLoggedItem(row));
    });
    afterFoodLogged(row.id);
  }

  function resetManualDraft() {
    setDraftName("");
    setDraftCal("");
    setDraftP("");
    setDraftC("");
    setDraftF("");
    setDraftServing("");
  }

  function openCreateMeal() {
    resetMealEditor();
    setMealEditorOpen(true);
    setTab("myMeals");
  }

  function openEditMeal(meal: NutritionMeal) {
    setEditingMealId(meal.id);
    setMealDraftName(meal.name);
    setMealDraftItems(meal.items.map((item) => ({ ...item })));
    setMealEditorOpen(true);
    setTab("myMeals");
  }

  function saveMealDraft() {
    const name = mealDraftName.trim();
    if (!name || mealDraftItems.length === 0) return;
    if (editingMealId) {
      setState((s) => updateNutritionMeal(s, editingMealId, { name, items: mealDraftItems }));
    } else {
      setState((s) =>
        appendNutritionMeal(s, {
          id: newNutritionItemId(),
          name,
          items: mealDraftItems,
        }),
      );
    }
    resetMealEditor();
  }

  function logSavedMeal(meal: NutritionMeal) {
    const row = buildLoggedItemFromMeal(meal);
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    afterFoodLogged(row.id);
  }

  function deleteSavedMeal(meal: NutritionMeal) {
    setPendingDelete({ kind: "meal", meal });
  }

  function confirmPendingDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "userFood") {
      setState((s) => removeNutritionUserFoodFromState(s, pendingDelete.food.id));
    } else if (pendingDelete.kind === "meal") {
      setState((s) => removeNutritionMeal(s, pendingDelete.meal.id));
    } else {
      setMealDraftItems((prev) => prev.filter((item) => item.id !== pendingDelete.itemId));
    }
    setPendingDelete(null);
  }

  function addMealIngredientFromManual() {
    const name = mealIngredientName.trim() || "Food";
    const item: NutritionMealItem = {
      id: newNutritionItemId(),
      name,
      cal: parseBoundedMacro(mealIngredientCal, "cal"),
      p: parseBoundedMacro(mealIngredientP, "p"),
      c: parseBoundedMacro(mealIngredientC, "c"),
      f: parseBoundedMacro(mealIngredientF, "f"),
      ...(mealIngredientServing.trim() ? { servingLabel: mealIngredientServing.trim() } : {}),
    };
    setMealDraftItems((prev) => [...prev, item]);
    setMealIngredientManualOpen(false);
    resetMealIngredientDraft();
  }

  function addMealIngredientFromUserFood(food: NutritionUserFood) {
    setMealDraftItems((prev) => [...prev, mealItemFromUserFood(food)]);
    setMealAddMyFoodsOpen(false);
  }

  function addMealIngredientFromPreset(preset: NutritionPreset) {
    setMealDraftItems((prev) => [...prev, mealItemFromPreset(preset)]);
    setMealAddFavoritesOpen(false);
  }

  function openEditUserFood(food: NutritionUserFood) {
    setEditingUserFoodId(food.id);
    setDraftName(food.name);
    setDraftCal(String(food.cal));
    setDraftP(String(food.p));
    setDraftC(String(food.c));
    setDraftF(String(food.f));
    setDraftServing(food.servingLabel ?? "");
    setManualOpen(true);
  }

  function logUserFood(food: NutritionUserFood) {
    const row = buildNutritionLoggedItem(food, food.name, {
      loggedAtMs: Date.now(),
      ...(food.servingLabel?.trim() ? { servingLabel: food.servingLabel.trim() } : {}),
      ...(food.source?.trim() ? { source: food.source.trim() } : {}),
      ...(food.externalId?.trim() ? { externalId: food.externalId.trim() } : {}),
    });
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    afterFoodLogged(row.id);
  }

  function logFavoritePreset(preset: NutritionPreset) {
    const row = buildNutritionLoggedItem(preset, preset.name, {
      loggedAtMs: Date.now(),
      ...(preset.servingLabel?.trim() ? { servingLabel: preset.servingLabel.trim() } : {}),
    });
    setState((s) => {
      const withRow = appendNutritionLoggedItem(s, dateKey, row);
      if (withRow === s) return s;
      return {
        ...withRow,
        nutritionPresets: touchNutritionPresetById(withRow.nutritionPresets, preset.id),
      };
    });
    afterFoodLogged(row.id);
  }

  function relogItem(item: NutritionLoggedItem) {
    const row = buildNutritionLoggedItem(
      { cal: item.cal, p: item.p, c: item.c, f: item.f },
      item.name.trim() || "Food",
      {
        loggedAtMs: Date.now(),
        ...(item.servingLabel?.trim() ? { servingLabel: item.servingLabel.trim() } : {}),
        ...(item.source?.trim() ? { source: item.source.trim() } : {}),
        ...(item.externalId?.trim() ? { externalId: item.externalId.trim() } : {}),
      },
    );
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    afterFoodLogged(row.id);
  }

  function openPicker(food: FoodSearchResult, context: PickerContext = "log") {
    const { measurements } = buildPickerMeasurements(food);
    const defaultMeasurement = measurements[0] ?? null;
    setPickerContext(context);
    setPickerCurated(null);
    setPickerFood(food);
    setPickerMeasurementId(defaultMeasurement?.id ?? "100g");
    setPickerQuantity(defaultMeasurement ? String(defaultMeasurement.defaultQuantity) : "100");
  }

  function openCuratedPicker(curated: CuratedFood, context: PickerContext = "log") {
    const food = curatedToSearchResult(curated);
    const { measurements } = buildPickerMeasurements(food, curated);
    const defaultMeasurement = measurements[0] ?? null;
    setPickerContext(context);
    setPickerCurated(curated);
    setPickerFood(food);
    setPickerMeasurementId(defaultMeasurement?.id ?? "100g");
    setPickerQuantity(defaultMeasurement ? String(defaultMeasurement.defaultQuantity) : "100");
  }

  function selectPickerMeasurement(measurement: FoodMeasurement) {
    setPickerMeasurementId(measurement.id);
    setPickerQuantity(String(measurement.defaultQuantity));
  }

  function logPickerAndClose() {
    if (!pickerFood || !pickerMeasurement) return;
    const macros = scaleMacros(pickerFood, pickerMultiplier);
    const servingLabel = pickerServingLabel(pickerMeasurement, pickerQuantityNum, pickerFixedLabels);

    if (pickerContext === "mealIngredient") {
      setMealDraftItems((prev) => [
        ...prev,
        {
          id: newNutritionItemId(),
          name: pickerFood.name,
          ...macros,
          servingLabel,
          source: pickerFood.source,
          externalId: pickerFood.externalId,
        },
      ]);
      setPickerFood(null);
      setPickerCurated(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      setPickerContext("log");
      setMealAddSearchOpen(false);
      setSearch("");
      setApiResults([]);
      return;
    }

    if (editingLoggedItemId) {
      const existing = editItem && editItem.id === editingLoggedItemId ? editItem : null;
      const row = buildNutritionLoggedItem(macros, pickerFood.name, {
        id: editingLoggedItemId,
        loggedAtMs: existing?.loggedAtMs ?? Date.now(),
        servingLabel,
        source: pickerFood.source,
        externalId: pickerFood.externalId,
      });
      setState((s) => updateNutritionLoggedItem(s, dateKey, editingLoggedItemId, row));
      setEditingLoggedItemId(null);
      setPickerFood(null);
      setPickerCurated(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      requestClose();
      return;
    }

    const row = buildNutritionLoggedItem(macros, pickerFood.name, {
      loggedAtMs: Date.now(),
      servingLabel,
      source: pickerFood.source,
      externalId: pickerFood.externalId,
    });
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    afterFoodLogged(row.id);
  }

  function savePickerToMyFoods() {
    if (!pickerFood || !pickerMeasurement) return;
    const macros = scaleMacros(pickerFood, pickerMultiplier);
    setState((s) =>
      appendNutritionUserFoodToState(s, {
        id: newNutritionItemId(),
        name: pickerFood.name,
        ...macros,
        servingLabel: pickerServingLabel(pickerMeasurement, pickerQuantityNum, pickerFixedLabels),
        source: pickerFood.source,
        externalId: pickerFood.externalId,
      }),
    );
    setPickerFood(null);
    setPickerCurated(null);
    setPickerMeasurementId("g");
    setPickerQuantity("");
    setTab("myFoods");
  }

  function toggleFavorite(input: { name: string; cal: number; p: number; c: number; f: number; servingLabel?: string }) {
    setState((s) => toggleNutritionFavoriteInState(s, input));
  }

  function isFavorite(input: { name: string; cal: number; p: number; c: number; f: number }) {
    return isNutritionFavorite(state.nutritionPresets ?? [], input.name, input);
  }

  const favoriteButtonStyle = (active: boolean) =>
    ({
      flexShrink: 0,
      width: 36,
      height: 36,
      borderRadius: 10,
      border: "none",
      background: "transparent",
      color: active ? "#facc15" : "var(--text-ghost)",
      fontSize: 18,
      lineHeight: 1,
      display: "grid",
      placeItems: "center",
    }) as const;

  function renderFavoriteButton(
    input: { name: string; cal: number; p: number; c: number; f: number; servingLabel?: string },
    label: string,
  ) {
    const active = isFavorite(input);
    return (
      <button
        type="button"
        className="tap"
        aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
        aria-pressed={active}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(input);
        }}
        style={favoriteButtonStyle(active)}
      >
        {active ? "★" : "☆"}
      </button>
    );
  }

  async function handleBarcodeScan(code: string) {
    const addingToMeal = mealEditorOpen && !mealIngredientManualOpen;
    setScannerOpen(false);
    setBarcodeLookupLoading(true);
    setBarcodeFeedback(null);
    try {
      const food = await lookupFoodByBarcode(code);
      if (!food) {
        setBarcodeFeedback("Product not found.");
        return;
      }
      submitCommunityFoodFromBarcodeScan(code, food);
      if (addingToMeal) {
        setMealAddSearchOpen(false);
        setMealAddMyFoodsOpen(false);
        setMealAddFavoritesOpen(false);
        openPicker(food, "mealIngredient");
        return;
      }
      if (dayLogAtCapacity) {
        setBarcodeFeedback("Daily log limit reached. Remove an entry to add more.");
        return;
      }
      logFoodSearchResultWithDefaultServing(food, dateKey, setState, undefined, afterFoodLogged);
    } catch {
      setBarcodeFeedback("Product not found.");
    } finally {
      setBarcodeLookupLoading(false);
    }
  }

  function retrySearch() {
    const q = search.trim();
    if (q.length < MIN_SEARCH_LEN) return;
    setSearchError(null);
    setSearchLoading(true);
    const seq = ++searchSeq.current;
    void (async () => {
      try {
        const results = await searchFoods(q);
        if (seq !== searchSeq.current) return;
        setApiResults(results);
      } catch (e) {
        if (seq !== searchSeq.current) return;
        setSearchError(e instanceof FoodSearchError ? e.message : "Search failed. Try again.");
      } finally {
        if (seq === searchSeq.current) setSearchLoading(false);
      }
    })();
  }

  const tabs: LogFoodTab[] = ["all", "myFoods", "myMeals", "saved"];

  const showScanButton = !pickerFood && !manualOpen && (!mealEditorOpen || !mealIngredientManualOpen);

  const tabButtonStyle = (active: boolean) =>
    ({
      flex: 1,
      padding: "10px 6px",
      border: "none",
      borderBottom: active ? "2px solid var(--pos, #4ade80)" : "2px solid transparent",
      marginBottom: -1,
      background: "transparent",
      fontWeight: active ? 600 : 500,
      fontSize: 13,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      color: active ? "var(--text-primary)" : "var(--text-faint-soft)",
      whiteSpace: "nowrap",
    }) as const;

  const foodRowStyle = {
    display: "flex",
    alignItems: "center" as const,
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid var(--divider-subtle)",
    cursor: "pointer" as const,
    width: "100%",
    background: "transparent",
    borderLeft: "none",
    borderRight: "none",
    borderTop: "none",
    textAlign: "left" as const,
  };

  return (
    <FullScreenOverlay open={visible} zIndex={250} motionVariant="page" style={{ background: "var(--bg, #07080c)" }}>
      <div
        role="presentation"
        className="screen page-transition"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px 8px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "0.5px solid var(--divider-subtle)",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={handleBack}
          aria-label={
            pickerFood
              ? "Back"
              : mealEditorOpen
                ? "Back from meal editor"
                : manualOpen
                  ? "Back"
                  : editingLoggedItemId
                    ? "Close edit food"
                    : "Close log food"
          }
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "0.5px solid var(--border)",
            background: "var(--surface-3)",
            color: "var(--text-primary)",
            fontSize: 20,
            lineHeight: 1,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <h1
          style={{
            margin: 0,
            flex: 1,
            minWidth: 0,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          {pickerFood
            ? pickerContext === "mealIngredient"
              ? "Add ingredient"
              : editingLoggedItemId
                ? "Edit serving"
                : "Choose serving"
            : mealEditorOpen
              ? editingMealId
                ? "Edit meal"
                : "Create meal"
              : editingLoggedItemId
                ? "Edit food"
                : "Log Food"}
        </h1>
        {showScanButton ? (
          <button
            type="button"
            className="tap"
            onClick={() => setScannerOpen(true)}
            aria-label="Barcode"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              border: "0.5px solid color-mix(in srgb, var(--primary) 35%, var(--border))",
              background: "var(--primary)",
              color: "var(--primary-fg)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--text-primary) 14%, transparent)",
            }}
          >
            <IconScan size={17} stroke={2.25} />
            Barcode
          </button>
        ) : null}
      </div>

      {pickerFood ? (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px", WebkitOverflowScrolling: "touch" }}>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                    {displayFoodName(pickerFood.name, pickerFood.source)}
                  </div>
                  {pickerFood.brand ? (
                    <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
                      {pickerFood.brand}
                    </div>
                  ) : null}
                </div>
                {pickerMacros
                  ? renderFavoriteButton(
                      {
                        name: pickerFood.name,
                        ...pickerMacros,
                        servingLabel: pickerServingLabel(pickerMeasurement!, pickerQuantityNum, pickerFixedLabels),
                      },
                      pickerFood.name,
                    )
                  : null}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-ghost)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Unit
              </div>
              <div
                role="tablist"
                aria-label="Serving unit"
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {pickerMeasurements.map((m) => {
                  const active = pickerMeasurement?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="tap card"
                      onClick={() => selectPickerMeasurement(m)}
                      style={{
                        flexShrink: 0,
                        padding: "14px 16px",
                        borderColor: active ? "var(--text-primary)" : undefined,
                        fontWeight: 600,
                        fontSize: 13,
                        letterSpacing: "-0.02em",
                        color: active ? "var(--text-primary)" : "var(--text-faint-soft)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-ghost)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Number of servings
              </div>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    ref={pickerQuantityInputRef}
                    aria-label="Number of servings"
                    value={pickerQuantity}
                    onChange={(e) => setPickerQuantity(clampServingQuantityInput(e.target.value))}
                    onFocus={(e) => moveInputCursorToEnd(e.currentTarget)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 0, flex: 1, fontVariantNumeric: "tabular-nums" }}
                  />
                  {pickerMeasurement?.unitSuffix ? (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-faint-soft)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {pickerMeasurement.unitSuffix}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {pickerMacros ? (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-ghost)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  This serving
                </div>
                <div className="card" style={{ padding: "18px 20px", marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                    <FitText
                      className="stat-big"
                      maxFontSize={32}
                      minFontSize={14}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      <AnimatedNumberFlip value={String(pickerMacros.cal)} />
                    </FitText>
                    <span className="unit" style={{ flexShrink: 0 }}>
                      cal
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {(
                    [
                      { label: "Protein", value: pickerMacros.p },
                      { label: "Carbs", value: pickerMacros.c },
                      { label: "Fat", value: pickerMacros.f },
                    ] as const
                  ).map((macro) => (
                    <div
                      key={macro.label}
                      className="card"
                      style={{ padding: "12px 10px", minWidth: 0, overflow: "hidden" }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: PICKER_MACRO_COLORS[macro.label],
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {macro.label}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <FitText
                          maxFontSize={17}
                          minFontSize={10}
                          style={{
                            fontWeight: 700,
                            color: PICKER_MACRO_COLORS[macro.label],
                            letterSpacing: "-0.02em",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <AnimatedNumberFlip value={formatMacroGrams(macro.value)} />
                          <span
                            style={{
                              marginLeft: 5,
                              fontSize: "0.65em",
                              fontWeight: 500,
                              color: "var(--text-ghost)",
                            }}
                          >
                            g
                          </span>
                        </FitText>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
              borderTop: "0.5px solid var(--divider-subtle)",
              background: "rgba(7,8,12,0.94)",
              backdropFilter: "blur(8px)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <PrimaryButton
              block
              onClick={logPickerAndClose}
              disabled={
                !pickerMeasurement ||
                !parseQuantityInput(pickerQuantity) ||
                (dayLogAtCapacity && pickerContext === "log" && !editingLoggedItemId)
              }
              style={{ fontWeight: 700 }}
            >
              {pickerContext === "mealIngredient"
                ? "Add to meal"
                : editingLoggedItemId
                  ? "Save changes"
                  : "Log food"}
            </PrimaryButton>
            {pickerContext !== "mealIngredient" && !editingLoggedItemId ? (
            <button
              type="button"
              className="tap"
              onClick={savePickerToMyFoods}
              disabled={!pickerMeasurement || !parseQuantityInput(pickerQuantity)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "0.5px solid var(--sheet-panel-border)",
                background: "transparent",
                color: "var(--text-soft)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Save to My foods
            </button>
            ) : null}
          </div>
        </>
      ) : mealEditorOpen ? (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px", WebkitOverflowScrolling: "touch" }}>
            {barcodeFeedback ? (
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--neg)", lineHeight: 1.5 }}>{barcodeFeedback}</p>
            ) : null}
            {barcodeLookupLoading ? <FoodSearchSkeletonList variant="plain" /> : null}
            {mealIngredientManualOpen ? (
              <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Ingredient name
                  <input
                    placeholder="e.g. Greek yogurt"
                    aria-label="Ingredient name"
                    value={mealIngredientName}
                    onChange={(e) => setMealIngredientName(e.target.value)}
                    className="input"
                    style={{ marginTop: 8 }}
                  />
                </label>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Calories (cal)
                  <input
                    placeholder="0"
                    aria-label="Ingredient calories"
                    value={mealIngredientCal}
                    onChange={(e) => setMealIngredientCal(e.target.value)}
                    onBlur={() => blurMacroInput("cal", mealIngredientCal, setMealIngredientCal)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {(
                    [
                      { label: "Protein (g)", key: "p", value: mealIngredientP, set: setMealIngredientP },
                      { label: "Carbs (g)", key: "c", value: mealIngredientC, set: setMealIngredientC },
                      { label: "Fat (g)", key: "f", value: mealIngredientF, set: setMealIngredientF },
                    ] as const
                  ).map((field) => (
                    <label key={field.key} style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {field.label}
                      <input
                        placeholder="0"
                        aria-label={field.label}
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        onBlur={() => blurMacroInput(field.key, field.value, field.set)}
                        inputMode="decimal"
                        className="input"
                        style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                      />
                    </label>
                  ))}
                </div>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Serving (optional)
                  <input
                    placeholder="e.g. 1 cup"
                    aria-label="Ingredient serving"
                    value={mealIngredientServing}
                    onChange={(e) => setMealIngredientServing(e.target.value)}
                    className="input"
                    style={{ marginTop: 8 }}
                  />
                </label>
              </div>
            ) : mealAddSearchOpen ? (
              <>
                <input
                  aria-label="Search foods for meal"
                  placeholder="Search foods to add"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                  style={{ width: "100%", marginBottom: 16, fontSize: 15, borderRadius: 12 }}
                />
                {searchActive ? (
                  searchLoading ? (
                    <FoodSearchSkeletonList variant="plain" />
                  ) : searchError ? (
                    <p style={{ margin: 0, fontSize: 14, color: "rgba(255,180,180,0.9)" }}>{searchError}</p>
                  ) : filteredCurated.length === 0 && apiResults.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)" }}>No results. Try another search.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {filteredCurated.length > 0 ? (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginBottom: 10 }}>
                            Common Foods
                          </div>
                          {filteredCurated.map((curated) => {
                            const macros = curatedDefaultServingMacros(curated);
                            return (
                              <button
                                key={curated.id}
                                type="button"
                                className="tap between"
                                style={foodRowStyle}
                                onClick={() => openCuratedPicker(curated, "mealIngredient")}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{curated.name}</div>
                                  <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                                    {macros.cal} cal · {formatGramsInLabel(curated.defaultServing.label)}
                                  </div>
                                </div>
                                <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-ghost)" }}>›</span>
                              </button>
                            );
                          })}
                        </>
                      ) : null}
                      {apiResults.length > 0 ? (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginTop: filteredCurated.length > 0 ? 16 : 0, marginBottom: 10 }}>
                            More Results
                          </div>
                          {apiResults.map((food) => (
                            <button
                              key={food.id}
                              type="button"
                              className="tap between"
                              style={foodRowStyle}
                              onClick={() => openPicker(food, "mealIngredient")}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{displayFoodName(food.name, food.source)}</div>
                                <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                                  {Math.round(Number(food.cal) || 0)} cal · {formatGramsInLabel(food.defaultServing)}
                                </div>
                              </div>
                              <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-ghost)" }}>›</span>
                            </button>
                          ))}
                        </>
                      ) : null}
                    </div>
                  )
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)" }}>Type at least 2 characters to search.</p>
                )}
              </>
            ) : mealAddMyFoodsOpen ? (
              userFoods.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)" }}>No saved foods yet. Add foods in My foods first.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {userFoods.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      className="tap"
                      style={foodRowStyle}
                      onClick={() => addMealIngredientFromUserFood(food)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{food.name}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                          {Math.round(Number(food.cal) || 0)} cal · {food.servingLabel?.trim() || DEFAULT_SERVING}
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 600, color: "var(--pos, #4ade80)" }}>Add</span>
                    </button>
                  ))}
                </div>
              )
            ) : mealAddFavoritesOpen ? (
              favoritePresets.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)" }}>No favorite foods yet. Star foods while logging to save them here.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {favoritePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="tap"
                      style={foodRowStyle}
                      onClick={() => addMealIngredientFromPreset(preset)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{preset.name.trim() || "Food"}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                          {Math.round(Number(preset.cal) || 0)} cal · {preset.servingLabel?.trim() || `${Math.round(Number(preset.p) || 0)}g protein`}
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 600, color: "var(--pos, #4ade80)" }}>Add</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <>
                <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Meal name
                    <input
                      placeholder="e.g. Meal prep lunch"
                      aria-label="Meal name"
                      value={mealDraftName}
                      onChange={(e) => setMealDraftName(e.target.value)}
                      className="input"
                      style={{ marginTop: 8 }}
                    />
                  </label>
                  <div style={{ fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(mealDraftMacros.cal)} cal · {Math.round(mealDraftMacros.p)}g protein · {mealDraftItems.length} ingredient{mealDraftItems.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginBottom: 10 }}>
                  Ingredients
                </div>
                {mealDraftItems.length === 0 ? (
                  <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--text-faint-soft)" }}>Add at least one ingredient below.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16 }}>
                    {mealDraftItems.map((item) => (
                      <div
                        key={item.id}
                        className="between"
                        style={{ alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--divider-subtle)" }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(Number(item.cal) || 0)} cal · {item.servingLabel?.trim() || DEFAULT_SERVING}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => setPendingDelete({ kind: "mealDraftItem", itemId: item.id, name: item.name.trim() || "this ingredient" })}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,160,160,0.85)", background: "none", border: "none", padding: "8px" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button type="button" className="tap" onClick={() => { setMealAddSearchOpen(true); setMealAddMyFoodsOpen(false); setMealAddFavoritesOpen(false); setMealIngredientManualOpen(false); }} style={{ padding: "12px 14px", borderRadius: 12, border: "0.5px solid var(--sheet-panel-border)", background: "var(--surface-3)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                    Add from search
                  </button>
                  <button type="button" className="tap" onClick={() => { setMealAddMyFoodsOpen(true); setMealAddSearchOpen(false); setMealAddFavoritesOpen(false); setMealIngredientManualOpen(false); }} style={{ padding: "12px 14px", borderRadius: 12, border: "0.5px solid var(--sheet-panel-border)", background: "var(--surface-3)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                    Add from My foods
                  </button>
                  <button type="button" className="tap" onClick={() => { setMealAddFavoritesOpen(true); setMealAddSearchOpen(false); setMealAddMyFoodsOpen(false); setMealIngredientManualOpen(false); }} style={{ padding: "12px 14px", borderRadius: 12, border: "0.5px solid var(--sheet-panel-border)", background: "var(--surface-3)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                    Add from Favorite foods
                  </button>
                  <button type="button" className="tap" onClick={() => { setMealIngredientManualOpen(true); setMealAddSearchOpen(false); setMealAddMyFoodsOpen(false); setMealAddFavoritesOpen(false); }} style={{ padding: "12px 14px", borderRadius: 12, border: "0.5px solid var(--sheet-panel-border)", background: "var(--surface-3)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                    Add manually
                  </button>
                </div>
              </>
            )}
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
              borderTop: "0.5px solid var(--divider-subtle)",
              background: "rgba(7,8,12,0.94)",
              backdropFilter: "blur(8px)",
            }}
          >
            {mealIngredientManualOpen ? (
              <PrimaryButton block onClick={addMealIngredientFromManual} style={{ fontWeight: 700 }}>
                Add ingredient
              </PrimaryButton>
            ) : mealAddSearchOpen || mealAddMyFoodsOpen || mealAddFavoritesOpen ? null : (
              <PrimaryButton
                block
                onClick={saveMealDraft}
                disabled={!mealDraftName.trim() || mealDraftItems.length === 0}
                style={{ fontWeight: 700 }}
              >
                {editingMealId ? "Save meal" : "Create meal"}
              </PrimaryButton>
            )}
          </div>
        </>
      ) : manualOpen ? (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px", WebkitOverflowScrolling: "touch" }}>
            <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Manual food
                </div>
                {renderFavoriteButton(
                  {
                    name: draftName.trim() || "Food",
                    cal: parseBoundedMacro(draftCal, "cal"),
                    p: parseBoundedMacro(draftP, "p"),
                    c: parseBoundedMacro(draftC, "c"),
                    f: parseBoundedMacro(draftF, "f"),
                    servingLabel: draftServing.trim() || undefined,
                  },
                  draftName.trim() || "food",
                )}
              </div>
              <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Name
                <input
                  placeholder="e.g. Greek yogurt"
                  aria-label="Food name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="input"
                  style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                />
              </label>
              <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Calories (cal)
                <input
                  placeholder="0"
                  aria-label="Calories"
                  value={draftCal}
                  onChange={(e) => setDraftCal(e.target.value)}
                  onBlur={() => blurMacroInput("cal", draftCal, setDraftCal)}
                  inputMode="decimal"
                  className="input"
                  style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Protein (g)
                  <input placeholder="0" aria-label="Protein grams" value={draftP} onChange={(e) => setDraftP(e.target.value)} onBlur={() => blurMacroInput("p", draftP, setDraftP)} inputMode="decimal" className="input" style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }} />
                </label>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Carbs (g)
                  <input placeholder="0" aria-label="Carbs grams" value={draftC} onChange={(e) => setDraftC(e.target.value)} onBlur={() => blurMacroInput("c", draftC, setDraftC)} inputMode="decimal" className="input" style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }} />
                </label>
                <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Fat (g)
                  <input placeholder="0" aria-label="Fat grams" value={draftF} onChange={(e) => setDraftF(e.target.value)} onBlur={() => blurMacroInput("f", draftF, setDraftF)} inputMode="decimal" className="input" style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }} />
                </label>
              </div>
              <label style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Serving (optional)
                <input placeholder="e.g. 1 cup" aria-label="Serving label" value={draftServing} onChange={(e) => setDraftServing(e.target.value)} className="input" style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }} />
              </label>
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
              borderTop: "0.5px solid var(--divider-subtle)",
              background: "rgba(7,8,12,0.94)",
              backdropFilter: "blur(8px)",
            }}
          >
            <PrimaryButton block onClick={logManualAndClose} style={{ fontWeight: 700 }}>
              {editingUserFoodId ? "Save food" : editingLoggedItemId ? "Save changes" : "Log food"}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: `12px 16px ${foodAddedToast.visible ? 24 : 108}px`,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              role="tablist"
              aria-label="Food sources"
              style={{
                display: "flex",
                gap: 0,
                marginBottom: 16,
                borderBottom: "1px solid var(--divider-subtle)",
              }}
            >
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className="tap"
                  style={tabButtonStyle(tab === t)}
                  onClick={() => setTab(t)}
                >
                  {tabLabel(t)}
                </button>
              ))}
            </div>

            <ScreenTransition activeKey={tab} variant="fade" style={{ flex: "none", minHeight: 0 }}>
              {(activeTab) => (
                <>
            {activeTab === "all" ? (
              <>
                <input
                  ref={searchInputRef}
                  aria-label="Search foods"
                  placeholder="Search foods (e.g. chicken breast)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={focusSearchInput}
                  enterKeyHint="search"
                  autoComplete="off"
                  className="input"
                  style={searchInputStyle}
                />

                {barcodeFeedback ? (
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--neg)", lineHeight: 1.5 }}>{barcodeFeedback}</p>
                ) : null}

                {barcodeLookupLoading ? <FoodSearchSkeletonList variant="card" /> : null}

                {searchActive ? (
                  <>
                    {searchLoading ? (
                      <FoodSearchSkeletonList variant="card" />
                    ) : searchError ? (
                      <div style={{ marginTop: 4 }}>
                        <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,180,180,0.9)", lineHeight: 1.5 }}>{searchError}</p>
                        <button type="button" className="tap" onClick={retrySearch} style={{ fontSize: 14, fontWeight: 600, color: "var(--pos, #4ade80)", background: "none", border: "none", padding: 0 }}>
                          Retry search
                        </button>
                      </div>
                    ) : filteredCurated.length === 0 && apiResults.length === 0 ? (
                      <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 400, lineHeight: 1.5 }}>
                        No results. Try a different search or use Manual Add.
                      </p>
                    ) : (
                      <>
                        {filteredCurated.length > 0 ? (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginBottom: 10 }}>
                              Common Foods
                            </div>
                            {filteredCurated.map((curated) => {
                              const macros = curatedDefaultServingMacros(curated);
                              return (
                                <div key={curated.id} className="card" style={foodItemCardStyle}>
                                  <button
                                    type="button"
                                    className="tap between"
                                    style={{ ...foodRowStyle, borderBottom: "none" }}
                                    onClick={() => openCuratedPicker(curated)}
                                  >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{curated.name}</div>
                                      <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                        {macros.cal} cal · {formatGramsInLabel(curated.defaultServing.label)}
                                      </div>
                                    </div>
                                    {renderFavoriteButton(
                                      {
                                        name: curated.name,
                                        ...macros,
                                        servingLabel: curated.defaultServing.label,
                                      },
                                      curated.name,
                                    )}
                                    <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-ghost)" }}>›</span>
                                  </button>
                                </div>
                              );
                            })}
                          </>
                        ) : null}
                        {apiResults.length > 0 ? (
                          <>
                            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginTop: filteredCurated.length > 0 ? 16 : 0, marginBottom: 10 }}>
                              More Results
                            </div>
                            {apiResults.map((food) => (
                              <div key={food.id} className="card" style={foodItemCardStyle}>
                                <button
                                  type="button"
                                  className="tap between"
                                  style={{ ...foodRowStyle, borderBottom: "none" }}
                                  onClick={() => openPicker(food)}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{displayFoodName(food.name, food.source)}</div>
                                    <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(Number(food.cal) || 0)} cal · {formatGramsInLabel(food.defaultServing)}
                                      {food.brand ? ` · ${food.brand}` : ""}
                                    </div>
                                  </div>
                                  {renderFavoriteButton(
                                    {
                                      name: displayFoodName(food.name, food.source),
                                      cal: Number(food.cal) || 0,
                                      p: Number(food.p) || 0,
                                      c: Number(food.c) || 0,
                                      f: Number(food.f) || 0,
                                      servingLabel: food.defaultServing,
                                    },
                                    food.name,
                                  )}
                                  <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-ghost)" }}>›</span>
                                </button>
                              </div>
                            ))}
                          </>
                        ) : null}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-ghost)", marginBottom: 10 }}>
                      Recently logged
                    </div>

                    {filteredRecent.length === 0 ? (
                      <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 400, lineHeight: 1.5 }}>
                        Nothing logged recently. Search above or use Manual Add.
                      </p>
                    ) : (
                      filteredRecent.map((it) => (
                        <div
                          key={`${it.id}-${it.name}`}
                          data-recent-item-id={it.id}
                          className={`card between${highlightItemId === it.id ? " food-log-recent-item--highlight" : ""}`}
                          style={{
                            ...foodItemCardStyle,
                            alignItems: "center",
                            gap: 12,
                            padding: "4px 14px",
                          }}
                        >
                          <button
                            type="button"
                            className="tap"
                            style={{ ...foodRowStyle, flex: 1, padding: 0, borderBottom: "none" }}
                            aria-label={`Edit and log ${it.name.trim() || "food"}`}
                            onClick={() => openRecentItemForLog(it)}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                {displayFoodName(it.name.trim() || "Food", it.source)}
                              </div>
                              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                {Math.round(Number(it.cal) || 0)} cal · {formatGramsInLabel(it.servingLabel?.trim() || DEFAULT_SERVING)}
                              </div>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-ghost)" }}>›</span>
                          </button>
                          {renderFavoriteButton(
                            {
                              name: it.name.trim() || "Food",
                              cal: Number(it.cal) || 0,
                              p: Number(it.p) || 0,
                              c: Number(it.c) || 0,
                              f: Number(it.f) || 0,
                              servingLabel: it.servingLabel?.trim(),
                            },
                            it.name.trim() || "food",
                          )}
                          <button
                            type="button"
                            className="tap"
                            aria-label={`Log again ${it.name.trim() || "food"}`}
                            onClick={() => relogItem(it)}
                            style={addButtonStyle}
                          >
                            +
                          </button>
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            ) : activeTab === "myFoods" ? (
              <>
                {userFoods.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 400, lineHeight: 1.5 }}>
                    No saved foods yet. Manual Add or search and tap Save to My foods.
                  </p>
                ) : (
                  <div className="card" style={foodListCardStyle}>
                    {userFoods.map((food, idx) => (
                      <div
                        key={food.id}
                        className="between"
                        style={{
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom: idx === userFoods.length - 1 ? "none" : "1px solid var(--divider-subtle)",
                        }}
                      >
                        <button
                          type="button"
                          className="tap"
                          style={{ ...foodRowStyle, flex: 1, padding: 0, borderBottom: "none" }}
                          onClick={() => logUserFood(food)}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                              {food.name}
                            </div>
                            <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                              {Math.round(Number(food.cal) || 0)} cal · {food.servingLabel?.trim() || DEFAULT_SERVING}
                            </div>
                          </div>
                        </button>
                        {renderFavoriteButton(
                          {
                            name: food.name,
                            cal: Number(food.cal) || 0,
                            p: Number(food.p) || 0,
                            c: Number(food.c) || 0,
                            f: Number(food.f) || 0,
                            servingLabel: food.servingLabel?.trim(),
                          },
                          food.name,
                        )}
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Edit ${food.name}`}
                          onClick={() => openEditUserFood(food)}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "var(--text-muted-soft)", background: "none", border: "none", padding: "8px" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Delete ${food.name}`}
                          onClick={() => setPendingDelete({ kind: "userFood", food })}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,160,160,0.85)", background: "none", border: "none", padding: "8px" }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === "saved" ? (
              <>
                {favoritePresets.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 400, lineHeight: 1.5 }}>
                    Tap the star on any food to save it here for one-tap logging.
                  </p>
                ) : (
                  <div className="card" style={foodListCardStyle}>
                    {favoritePresets.map((preset, idx) => (
                      <div
                        key={preset.id}
                        className="between"
                        style={{
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom: idx === favoritePresets.length - 1 ? "none" : "1px solid var(--divider-subtle)",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                            {preset.name.trim() || "Food"}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(Number(preset.cal) || 0)} cal · {preset.servingLabel?.trim() || `${Math.round(Number(preset.p) || 0)}g protein`}
                          </div>
                        </div>
                        {renderFavoriteButton(
                          {
                            name: preset.name.trim() || "Food",
                            cal: Number(preset.cal) || 0,
                            p: Number(preset.p) || 0,
                            c: Number(preset.c) || 0,
                            f: Number(preset.f) || 0,
                            servingLabel: preset.servingLabel?.trim(),
                          },
                          preset.name.trim() || "food",
                        )}
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Log ${preset.name.trim() || "food"}`}
                          onClick={() => logFavoritePreset(preset)}
                          style={addButtonStyle}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeTab === "myMeals" ? (
              <>
                {savedMeals.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-faint-soft)", fontWeight: 400, lineHeight: 1.5 }}>
                    Save meals you eat often (chicken and rice, overnight oats, whatever you prep). Log the whole meal in one tap instead of each ingredient.
                  </p>
                ) : (
                  <div className="card" style={foodListCardStyle}>
                    {savedMeals.map((meal, idx) => {
                      const mealMacros = sumMealMacros(meal.items);
                      const servingLabel = formatMealServingLabel(meal.items);
                      return (
                        <div
                          key={meal.id}
                          className="between"
                          style={{
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 0",
                            borderBottom: idx === savedMeals.length - 1 ? "none" : "1px solid var(--divider-subtle)",
                          }}
                        >
                          <button
                            type="button"
                            className="tap"
                            style={{ ...foodRowStyle, flex: 1, padding: 0, borderBottom: "none" }}
                            onClick={() => logSavedMeal(meal)}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                {meal.name}
                              </div>
                              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                {Math.round(mealMacros.cal)} cal · {Math.round(mealMacros.p)}g protein
                                {servingLabel ? ` · ${servingLabel}` : ""}
                              </div>
                            </div>
                          </button>
                          {renderFavoriteButton(
                            {
                              name: meal.name,
                              cal: mealMacros.cal,
                              p: mealMacros.p,
                              c: mealMacros.c,
                              f: mealMacros.f,
                              servingLabel: servingLabel ?? undefined,
                            },
                            meal.name,
                          )}
                          <button
                            type="button"
                            className="tap"
                            aria-label={`Edit ${meal.name}`}
                            onClick={() => openEditMeal(meal)}
                            style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "var(--text-muted-soft)", background: "none", border: "none", padding: "8px" }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="tap"
                            aria-label={`Delete ${meal.name}`}
                            onClick={() => deleteSavedMeal(meal)}
                            style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,160,160,0.85)", background: "none", border: "none", padding: "8px" }}
                          >
                            Delete
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
                </>
              )}
            </ScreenTransition>
          </div>

          <div
            className="log-food-bottom-chrome"
            style={{
              paddingBottom: `calc(14px + env(safe-area-inset-bottom, 0px) + ${keyboardBottom}px)`,
            }}
          >
            <FoodAddedToast
              visible={foodAddedToast.visible}
              onView={handleViewLoggedFood}
              onUndo={handleUndoLoggedFood}
            />
            <div className="log-food-bottom-chrome__actions">
              <PrimaryButton
                block
                onClick={() => (tab === "myMeals" ? openCreateMeal() : setManualOpen(true))}
                style={{ fontWeight: 700 }}
              >
                {tab === "myMeals" ? "Create meal" : "Manual Add"}
              </PrimaryButton>
            </div>
          </div>
        </>
      )}
      </div>
      {scannerOpen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
          <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setScannerOpen(false)} />
        </div>
      ) : null}
      {pendingDelete ? (
        <DeleteConfirmSheet
          title={
            pendingDelete.kind === "userFood"
              ? "Delete food?"
              : pendingDelete.kind === "meal"
                ? "Delete meal?"
                : "Remove ingredient?"
          }
          cancelLabel={
            pendingDelete.kind === "mealDraftItem"
              ? "Keep ingredient"
              : pendingDelete.kind === "meal"
                ? "Keep meal"
                : "Keep food"
          }
          confirmLabel={
            pendingDelete.kind === "mealDraftItem"
              ? "Remove ingredient"
              : pendingDelete.kind === "meal"
                ? "Delete meal"
                : "Delete food"
          }
          zIndex={1300}
          message={
            pendingDelete.kind === "userFood" ? (
              <>
                Delete <strong style={{ color: "var(--text-primary)" }}>{pendingDelete.food.name.trim() || "this food"}</strong> from
                My foods? Past logs will stay in your history.
              </>
            ) : pendingDelete.kind === "meal" ? (
              <>
                Delete <strong style={{ color: "var(--text-primary)" }}>{pendingDelete.meal.name.trim() || "this meal"}</strong> from
                My meals? Past logs will stay in your history.
              </>
            ) : (
              <>
                Remove <strong style={{ color: "var(--text-primary)" }}>{pendingDelete.name}</strong> from this meal?
              </>
            )
          }
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmPendingDelete}
        />
      ) : null}

    </FullScreenOverlay>
  );
}
