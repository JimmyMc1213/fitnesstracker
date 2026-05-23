import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import {
  appendNutritionLoggedItem,
  buildNutritionLoggedItem,
  getRecentlyLoggedFoods,
} from "./nutritionLog";
import { PrimaryButton } from "./shared";
import type { AppState, NutritionLoggedItem } from "./types";

function parseMacro(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

type LogFoodTab = "all" | "myFoods" | "myMeals" | "saved";

const DEFAULT_SERVING = "1 serving";

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
      return "Saved foods";
    default:
      return t;
  }
}

export function LogFoodScreen({ open, onClose, dateKey, state, setState }: Props) {
  const [tab, setTab] = useState<LogFoodTab>("all");
  const [search, setSearch] = useState("");
  const [manualOpen, setManualOpen] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftCal, setDraftCal] = useState("");
  const [draftP, setDraftP] = useState("");
  const [draftC, setDraftC] = useState("");
  const [draftF, setDraftF] = useState("");
  const [draftServing, setDraftServing] = useState("");

  const recentlyLogged = useMemo(() => getRecentlyLoggedFoods(state.nutritionItemsByDay), [state.nutritionItemsByDay]);

  const filteredRecent = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return recentlyLogged;
    return recentlyLogged.filter((it) => (it.name || "").toLowerCase().includes(q));
  }, [recentlyLogged, search]);

  if (!open) return null;

  function handleBack() {
    if (manualOpen) {
      setManualOpen(false);
      return;
    }
    onClose();
  }

  function logManualAndClose() {
    const row = buildNutritionLoggedItem(
      {
        cal: parseMacro(draftCal),
        p: parseMacro(draftP),
        c: parseMacro(draftC),
        f: parseMacro(draftF),
      },
      draftName.trim() || "Food",
      {
        loggedAtMs: Date.now(),
        ...(draftServing.trim() ? { servingLabel: draftServing.trim() } : {}),
      },
    );
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    setManualOpen(false);
    setDraftName("");
    setDraftCal("");
    setDraftP("");
    setDraftC("");
    setDraftF("");
    setDraftServing("");
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

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg, #07080c)",
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
          aria-label={manualOpen ? "Back" : "Close log food"}
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>Log Food</h1>
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
              Log food
            </PrimaryButton>
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
                  aria-label="Describe what you ate"
                  placeholder="Describe what you ate"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input"
                  style={{
                    width: "100%",
                    marginBottom: 20,
                    fontSize: 15,
                    borderRadius: 12,
                  }}
                />

                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  Recently logged
                </div>

                {filteredRecent.length === 0 ? (
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "rgba(255,255,255,0.42)", fontWeight: 400, lineHeight: 1.5 }}>
                    Nothing logged recently. Use Manual Add to create your first entry.
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
  );
}
