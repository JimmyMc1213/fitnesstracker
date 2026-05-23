import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { scaleMacros } from "./foodSearchMacros";
import {
  buildMeasurements,
  computeServingMultiplier,
  formatServingLabel,
  getBaseGrams,
  parseQuantityInput,
} from "./foodMeasurements";
import { FoodSearchError, searchFoods } from "./foodSearchService";
import type { FoodMeasurement, FoodSearchResult } from "./foodSearchTypes";
import {
  appendNutritionLoggedItem,
  appendNutritionPresetToDay,
  appendNutritionUserFoodToState,
  buildNutritionLoggedItem,
  getRecentlyLoggedFoods,
  newNutritionItemId,
  nutritionUserFoodFromLoggedItem,
  removeNutritionPresetFromState,
  removeNutritionUserFoodFromState,
  updateNutritionUserFoodInState,
} from "./nutritionLog";
import { PrimaryButton } from "./shared";
import { FullScreenOverlay } from "./motion";
import type { AppState, NutritionLoggedItem, NutritionPreset, NutritionUserFood } from "./types";

function parseMacro(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type LogFoodTab = "all" | "myFoods" | "myMeals" | "saved";

const DEFAULT_SERVING = "1 serving";
const MIN_SEARCH_LEN = 2;
const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
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

export function LogFoodScreen({ open, onClose, dateKey, state, setState }: Props) {
  const [tab, setTab] = useState<LogFoodTab>("all");
  const [search, setSearch] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [pickerFood, setPickerFood] = useState<FoodSearchResult | null>(null);
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

  const userFoods = state.nutritionUserFoods ?? [];
  const favoritePresets = state.nutritionPresets ?? [];

  const recentlyLogged = useMemo(() => getRecentlyLoggedFoods(state.nutritionItemsByDay), [state.nutritionItemsByDay]);

  const pickerMeasurements = useMemo(
    () => (pickerFood ? buildMeasurements(pickerFood) : []),
    [pickerFood],
  );

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

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || q.length >= MIN_SEARCH_LEN) return recentlyLogged;
    return recentlyLogged.filter((it) => (it.name || "").toLowerCase().includes(q));
  }, [recentlyLogged, search]);

  const searchActive = tab === "all" && search.trim().length >= MIN_SEARCH_LEN;

  useEffect(() => {
    if (!open || tab !== "all") return;
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
  }, [open, tab, search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setManualOpen(false);
      setPickerFood(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      setApiResults([]);
      setSearchLoading(false);
      setSearchError(null);
      setEditingUserFoodId(null);
    }
  }, [open]);

  function handleBack() {
    if (manualOpen) {
      setManualOpen(false);
      setEditingUserFoodId(null);
      resetManualDraft();
      return;
    }
    if (pickerFood) {
      setPickerFood(null);
      setPickerMeasurementId("g");
      setPickerQuantity("");
      return;
    }
    onClose();
  }

  function logManualAndClose() {
    const macros = {
      cal: parseMacro(draftCal),
      p: parseMacro(draftP),
      c: parseMacro(draftC),
      f: parseMacro(draftF),
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

    const row = buildNutritionLoggedItem(macros, name, {
      loggedAtMs: Date.now(),
      ...(servingLabel ? { servingLabel } : {}),
    });
    setState((s) => {
      const withLog = appendNutritionLoggedItem(s, dateKey, row);
      return appendNutritionUserFoodToState(withLog, nutritionUserFoodFromLoggedItem(row));
    });
    setManualOpen(false);
    resetManualDraft();
    onClose();
  }

  function resetManualDraft() {
    setDraftName("");
    setDraftCal("");
    setDraftP("");
    setDraftC("");
    setDraftF("");
    setDraftServing("");
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
    onClose();
  }

  function logFavoritePreset(preset: NutritionPreset) {
    setState((s) => appendNutritionPresetToDay(s, dateKey, preset));
    onClose();
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
    onClose();
  }

  function openPicker(food: FoodSearchResult) {
    const measurements = buildMeasurements(food);
    const defaultMeasurement = measurements.find((m) => m.id === "g") ?? measurements[0] ?? null;
    setPickerFood(food);
    setPickerMeasurementId(defaultMeasurement?.id ?? "g");
    setPickerQuantity(defaultMeasurement ? String(defaultMeasurement.defaultQuantity) : "100");
  }

  function selectPickerMeasurement(measurement: FoodMeasurement) {
    setPickerMeasurementId(measurement.id);
    setPickerQuantity(String(measurement.defaultQuantity));
  }

  function logPickerAndClose() {
    if (!pickerFood || !pickerMeasurement) return;
    const macros = scaleMacros(pickerFood, pickerMultiplier);
    const row = buildNutritionLoggedItem(macros, pickerFood.name, {
      loggedAtMs: Date.now(),
      servingLabel: formatServingLabel(pickerMeasurement, pickerQuantityNum),
      source: pickerFood.source,
      externalId: pickerFood.externalId,
    });
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    setPickerFood(null);
    setPickerMeasurementId("g");
    setPickerQuantity("");
    onClose();
  }

  function savePickerToMyFoods() {
    if (!pickerFood || !pickerMeasurement) return;
    const macros = scaleMacros(pickerFood, pickerMultiplier);
    setState((s) =>
      appendNutritionUserFoodToState(s, {
        id: newNutritionItemId(),
        name: pickerFood.name,
        ...macros,
        servingLabel: formatServingLabel(pickerMeasurement, pickerQuantityNum),
        source: pickerFood.source,
        externalId: pickerFood.externalId,
      }),
    );
    setPickerFood(null);
    setPickerMeasurementId("g");
    setPickerQuantity("");
    setTab("myFoods");
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

  const pill = (active: boolean) =>
    ({
      flex: 1,
      padding: "8px 10px",
      borderRadius: 10,
      border: "none",
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      background: active ? "rgba(255,255,255,0.18)" : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.45)",
      whiteSpace: "nowrap",
    }) as const;

  const unitPill = (active: boolean) =>
    ({
      flexShrink: 0,
      padding: "8px 14px",
      borderRadius: 10,
      border: "none",
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      background: active ? "rgba(255,255,255,0.18)" : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.45)",
      whiteSpace: "nowrap",
    }) as const;

  const foodRowStyle = {
    display: "flex",
    alignItems: "center" as const,
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer" as const,
    width: "100%",
    background: "transparent",
    border: "none",
    textAlign: "left" as const,
  };

  return (
    <FullScreenOverlay open={open} zIndex={250} style={{ background: "var(--bg, #07080c)" }}>
      <div
        role="presentation"
        className="screen"
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
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={handleBack}
          aria-label={manualOpen || pickerFood ? "Back" : "Close log food"}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "0.5px solid var(--border)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontSize: 20,
            lineHeight: 1,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          {pickerFood ? "Choose serving" : "Log Food"}
        </h1>
      </div>

      {manualOpen ? (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px", WebkitOverflowScrolling: "touch" }}>
            <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Calories (kcal)
                <input
                  placeholder="0"
                  aria-label="Calories"
                  value={draftCal}
                  onChange={(e) => setDraftCal(e.target.value)}
                  inputMode="decimal"
                  className="input"
                  style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Protein (g)
                  <input
                    placeholder="0"
                    aria-label="Protein grams"
                    value={draftP}
                    onChange={(e) => setDraftP(e.target.value)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                  />
                </label>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Carbs (g)
                  <input
                    placeholder="0"
                    aria-label="Carbs grams"
                    value={draftC}
                    onChange={(e) => setDraftC(e.target.value)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                  />
                </label>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Fat (g)
                  <input
                    placeholder="0"
                    aria-label="Fat grams"
                    value={draftF}
                    onChange={(e) => setDraftF(e.target.value)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                  />
                </label>
              </div>
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Serving (optional)
                <input
                  placeholder="e.g. 1 cup"
                  aria-label="Serving label"
                  value={draftServing}
                  onChange={(e) => setDraftServing(e.target.value)}
                  className="input"
                  style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                />
              </label>
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
              background: "rgba(7,8,12,0.94)",
              backdropFilter: "blur(8px)",
            }}
          >
            <PrimaryButton block onClick={logManualAndClose} style={{ fontWeight: 700 }}>
              {editingUserFoodId ? "Save food" : "Log food"}
            </PrimaryButton>
          </div>
        </>
      ) : pickerFood ? (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 100px", WebkitOverflowScrolling: "touch" }}>
            <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                  {pickerFood.name}
                </div>
                {pickerFood.brand ? (
                  <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    {pickerFood.brand}
                  </div>
                ) : null}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
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
                    gap: 4,
                    padding: 4,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
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
                        className="tap"
                        onClick={() => selectPickerMeasurement(m)}
                        style={unitPill(active)}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Amount
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <input
                    aria-label="Serving amount"
                    value={pickerQuantity}
                    onChange={(e) => setPickerQuantity(e.target.value)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 0, fontVariantNumeric: "tabular-nums" }}
                  />
                  {pickerMeasurement?.unitSuffix ? (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.45)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {pickerMeasurement.unitSuffix}
                    </span>
                  ) : null}
                </div>
              </label>
            </div>

            {pickerMacros ? (
              <div className="card" style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  This serving
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span
                    className="stat-big"
                    style={{ fontSize: 28, fontVariantNumeric: "tabular-nums" }}
                  >
                    {pickerMacros.cal}
                  </span>
                  <span className="unit">kcal</span>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  {(
                    [
                      { label: "Protein", value: pickerMacros.p },
                      { label: "Carbs", value: pickerMacros.c },
                      { label: "Fat", value: pickerMacros.f },
                    ] as const
                  ).map((macro) => (
                    <div key={macro.label}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>{macro.label}</div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: "-0.02em",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {macro.value}
                        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>g</span>
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
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
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
              disabled={!pickerMeasurement || !parseQuantityInput(pickerQuantity)}
              style={{ fontWeight: 700 }}
            >
              Log food
            </PrimaryButton>
            <button
              type="button"
              className="tap"
              onClick={savePickerToMyFoods}
              disabled={!pickerMeasurement || !parseQuantityInput(pickerQuantity)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "0.5px solid rgba(255,255,255,0.14)",
                background: "transparent",
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Save to My foods
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 108px", WebkitOverflowScrolling: "touch" }}>
            <div
              role="tablist"
              aria-label="Food sources"
              style={{
                display: "flex",
                gap: 4,
                padding: 4,
                marginBottom: 16,
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className="tap"
                  style={pill(tab === t)}
                  onClick={() => setTab(t)}
                >
                  {tabLabel(t)}
                </button>
              ))}
            </div>

            {tab === "all" ? (
              <>
                <input
                  aria-label="Search foods"
                  placeholder="Search foods (e.g. chicken breast)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    fontSize: 15,
                    borderRadius: 12,
                  }}
                />

                {searchActive ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                      Results
                    </div>
                    {searchLoading ? (
                      <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                        Searching…
                      </p>
                    ) : searchError ? (
                      <div style={{ marginTop: 4 }}>
                        <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,180,180,0.9)", lineHeight: 1.5 }}>{searchError}</p>
                        <button type="button" className="tap" onClick={retrySearch} style={{ fontSize: 14, fontWeight: 600, color: "var(--pos, #4ade80)", background: "none", border: "none", padding: 0 }}>
                          Retry search
                        </button>
                      </div>
                    ) : apiResults.length === 0 ? (
                      <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                        No results. Try a different search or use Manual Add.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 24 }}>
                        {apiResults.map((food) => (
                          <button
                            key={food.id}
                            type="button"
                            className="tap between"
                            style={foodRowStyle}
                            onClick={() => openPicker(food)}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{food.name}</div>
                              <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.42)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                {Math.round(Number(food.cal) || 0)} kcal · {food.defaultServing}
                                {food.brand ? ` · ${food.brand}` : ""}
                              </div>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 18, color: "rgba(255,255,255,0.35)" }}>›</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                      Recently logged
                    </div>

                    {filteredRecent.length === 0 ? (
                      <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                        Nothing logged recently. Search above or use Manual Add.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {filteredRecent.map((it) => (
                          <div
                            key={`${it.id}-${it.name}`}
                            className="between"
                            style={{
                              alignItems: "center",
                              gap: 12,
                              padding: "14px 0",
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                                {it.name.trim() || "Food"}
                              </div>
                              <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.42)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                                {Math.round(Number(it.cal) || 0)} kcal · {it.servingLabel?.trim() || DEFAULT_SERVING}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="tap"
                              aria-label={`Log again ${it.name.trim() || "food"}`}
                              onClick={() => relogItem(it)}
                              style={{
                                flexShrink: 0,
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                border: "0.5px solid rgba(255,255,255,0.14)",
                                background: "rgba(120,200,255,0.14)",
                                color: "rgba(200,235,255,0.95)",
                                fontSize: 22,
                                fontWeight: 600,
                                lineHeight: 1,
                              }}
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : tab === "myFoods" ? (
              <>
                {userFoods.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                    No saved foods yet. Manual Add or search and tap Save to My foods.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {userFoods.map((food) => (
                      <div
                        key={food.id}
                        className="between"
                        style={{
                          alignItems: "center",
                          gap: 12,
                          padding: "14px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <button
                          type="button"
                          className="tap"
                          style={{ ...foodRowStyle, flex: 1, padding: 0, borderBottom: "none" }}
                          onClick={() => logUserFood(food)}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                              {food.name}
                            </div>
                            <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.42)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                              {Math.round(Number(food.cal) || 0)} kcal · {food.servingLabel?.trim() || DEFAULT_SERVING}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Edit ${food.name}`}
                          onClick={() => openEditUserFood(food)}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", background: "none", border: "none", padding: "8px" }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Delete ${food.name}`}
                          onClick={() => setState((s) => removeNutritionUserFoodFromState(s, food.id))}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,160,160,0.85)", background: "none", border: "none", padding: "8px" }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "saved" ? (
              <>
                {favoritePresets.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                    Favorite foods appear here after you log something. Tap + to log again anytime.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {favoritePresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="between"
                        style={{
                          alignItems: "center",
                          gap: 12,
                          padding: "14px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                            {preset.name.trim() || "Food"}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.42)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(Number(preset.cal) || 0)} kcal · {Math.round(Number(preset.p) || 0)}g protein
                          </div>
                        </div>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Log ${preset.name.trim() || "food"}`}
                          onClick={() => logFavoritePreset(preset)}
                          style={{
                            flexShrink: 0,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            border: "0.5px solid rgba(255,255,255,0.14)",
                            background: "rgba(120,200,255,0.14)",
                            color: "rgba(200,235,255,0.95)",
                            fontSize: 22,
                            fontWeight: 600,
                            lineHeight: 1,
                          }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="tap"
                          aria-label={`Remove ${preset.name.trim() || "food"} from favorites`}
                          onClick={() => setState((s) => removeNutritionPresetFromState(s, preset.id))}
                          style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: "rgba(255,160,160,0.85)", background: "none", border: "none", padding: "8px" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : tab === "myMeals" ? (
              <div
                className="card"
                style={{
                  padding: "28px 18px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                My meals (meal prep) coming in a future update.
              </div>
            ) : (
              <div
                className="card"
                style={{
                  padding: "28px 18px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {tabLabel(tab)} will show here once synced.
              </div>
            )}
          </div>

          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px calc(14px + env(safe-area-inset-bottom))",
              borderTop: "0.5px solid rgba(255,255,255,0.08)",
              background: "rgba(7,8,12,0.94)",
              backdropFilter: "blur(8px)",
            }}
          >
            <PrimaryButton block onClick={() => setManualOpen(true)} style={{ fontWeight: 700 }}>
              Manual Add
            </PrimaryButton>
          </div>
        </>
      )}
      </div>
    </FullScreenOverlay>
  );
}
