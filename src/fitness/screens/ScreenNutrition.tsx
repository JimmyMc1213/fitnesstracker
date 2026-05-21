import { useEffect, useState, type ChangeEvent } from "react";

import { localDateKey } from "../dailyPlan";
import { applyStreakEligibility } from "../dailyStreak";
import {
  effectiveNutritionTotalsForDateKey,
  manualTotalsForDateKey,
  touchNutritionPresetById,
  upsertNutritionPresetList,
} from "../nutritionTotals";
import { JIMMY_QUICK_ADD_PRESET_IDS, refreshStateAfterJimmySeed } from "../jimmy-seed-data";
import { isJimmySummerPlanTemplates } from "../jimmyWeekly";
import { MacroBar, ScreenHeader, SectionLabel } from "../shared";
import type { MacroTotals, NutritionLoggedItem, NutritionPreset, ScreenProps } from "../types";

function newNutritionItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseMacro(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function formatNutritionMacrosLine(m: MacroTotals): string {
  const cal = Number(m.cal) || 0;
  const p = Number(m.p) || 0;
  const c = Number(m.c) || 0;
  const f = Number(m.f) || 0;
  if (cal <= 0 && p <= 0 && c <= 0 && f <= 0) return "No macros saved";
  return `${Math.round(cal)} kcal · P ${Math.round(p * 10) / 10} · C ${Math.round(c * 10) / 10} · F ${Math.round(f * 10) / 10}`;
}

type NutritionScreenSegment = "today" | "saved";

function SegmentTabs({
  value,
  onChange,
}: {
  value: NutritionScreenSegment;
  onChange: (v: NutritionScreenSegment) => void;
}) {
  const pill = (active: boolean) =>
    ({
      flex: 1,
      padding: "10px 12px",
      borderRadius: 10,
      border: "none",
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: "-0.02em",
      cursor: "pointer",
      background: active ? "rgba(255,255,255,0.18)" : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.45)",
    }) as const;

  return (
    <div
      role="tablist"
      aria-label="Nutrition sections"
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        marginTop: 18,
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
      }}
    >
      <button type="button" role="tab" aria-selected={value === "today"} style={pill(value === "today")} className="tap" onClick={() => onChange("today")}>
        Today
      </button>
      <button type="button" role="tab" aria-selected={value === "saved"} style={pill(value === "saved")} className="tap" onClick={() => onChange("saved")}>
        Saved
      </button>
    </div>
  );
}

/**
 * Nutrition tab: log fuel as individual rows, saved presets for one-tap re-add, or whole-day totals when no rows yet.
 */
export function ScreenNutrition({ state, setState }: ScreenProps) {
  const T = state.nutritionTargets;
  const todayKey = localDateKey(new Date());
  const todayItems = state.nutritionItemsByDay[todayKey] ?? [];
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    todayKey,
  );

  const [segment, setSegment] = useState<NutritionScreenSegment>("today");

  const [calIn, setCalIn] = useState(String(totals.cal));
  const [pIn, setPIn] = useState(String(totals.p));
  const [cIn, setCIn] = useState(String(totals.c));
  const [fIn, setFIn] = useState(String(totals.f));

  const [draftName, setDraftName] = useState("");
  const [draftCal, setDraftCal] = useState("");
  const [draftP, setDraftP] = useState("");
  const [draftC, setDraftC] = useState("");
  const [draftF, setDraftF] = useState("");

  useEffect(() => {
    if (todayItems.length > 0) return;
    const t = manualTotalsForDateKey(state.nutritionManualByDay, todayKey);
    setCalIn(String(t.cal));
    setPIn(String(t.p));
    setCIn(String(t.c));
    setFIn(String(t.f));
  }, [state.nutritionManualByDay, todayKey, todayItems.length]);

  function commitManualTotals(patch: Partial<MacroTotals>) {
    setState((s) => {
      const prev = manualTotalsForDateKey(s.nutritionManualByDay, todayKey);
      const next: MacroTotals = { ...prev, ...patch };
      return applyStreakEligibility(
        {
          ...s,
          nutritionManualByDay: { ...s.nutritionManualByDay, [todayKey]: next },
        },
        todayKey,
      );
    });
  }

  function manualFieldProps(
    key: keyof MacroTotals,
    raw: string,
    setRaw: (v: string) => void,
  ) {
    return {
      value: raw,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setRaw(v);
        if (v === "" || v === "-") return;
        const n = parseFloat(v);
        if (Number.isFinite(n) && n >= 0) commitManualTotals({ [key]: n } as Partial<MacroTotals>);
      },
      onBlur: () => {
        const n = parseFloat(raw);
        const val = Number.isFinite(n) && n >= 0 ? n : 0;
        setRaw(String(val));
        commitManualTotals({ [key]: val } as Partial<MacroTotals>);
      },
      inputMode: "decimal" as const,
      className: "input",
      style: {
        marginTop: 8,
        fontVariantNumeric: "tabular-nums" as const,
      },
    };
  }

  function patchTodayItems(updater: (prev: NutritionLoggedItem[]) => NutritionLoggedItem[]) {
    setState((s) => {
      const prev = s.nutritionItemsByDay[todayKey] ?? [];
      const nextList = updater(prev);
      const nutritionItemsByDay = { ...s.nutritionItemsByDay };
      if (nextList.length === 0) delete nutritionItemsByDay[todayKey];
      else nutritionItemsByDay[todayKey] = nextList;
      return applyStreakEligibility({ ...s, nutritionItemsByDay }, todayKey);
    });
  }

  function addItem() {
    const cal = parseMacro(draftCal);
    const p = parseMacro(draftP);
    const c = parseMacro(draftC);
    const f = parseMacro(draftF);
    const nameTrim = draftName.trim();
    const hasName = nameTrim.length > 0;
    const hasMacros = cal > 0 || p > 0 || c > 0 || f > 0;
    if (!hasName && !hasMacros) return;

    const row: NutritionLoggedItem = {
      id: newNutritionItemId(),
      name: nameTrim,
      cal,
      p,
      c,
      f,
    };

    setState((s) => {
      const prev = s.nutritionItemsByDay[todayKey] ?? [];
      return applyStreakEligibility(
        {
          ...s,
          nutritionItemsByDay: { ...s.nutritionItemsByDay, [todayKey]: [...prev, row] },
          nutritionPresets: upsertNutritionPresetList(s.nutritionPresets, row),
        },
        todayKey,
      );
    });

    setDraftName("");
    setDraftCal("");
    setDraftP("");
    setDraftC("");
    setDraftF("");
  }

  function removeItem(id: string) {
    patchTodayItems((prev) => prev.filter((x) => x.id !== id));
  }

  function addPresetToToday(preset: NutritionPreset) {
    const row: NutritionLoggedItem = {
      id: newNutritionItemId(),
      name: preset.name,
      cal: preset.cal,
      p: preset.p,
      c: preset.c,
      f: preset.f,
    };
    setState((s) => {
      const prev = s.nutritionItemsByDay[todayKey] ?? [];
      return applyStreakEligibility(
        {
          ...s,
          nutritionItemsByDay: { ...s.nutritionItemsByDay, [todayKey]: [...prev, row] },
          nutritionPresets: touchNutritionPresetById(s.nutritionPresets, preset.id),
        },
        todayKey,
      );
    });
  }

  function forgetPreset(presetId: string) {
    setState((s) => ({
      ...s,
      nutritionPresets: s.nutritionPresets.filter((x) => x.id !== presetId),
    }));
  }

  const presets = state.nutritionPresets;
  const jimmyLoaded = isJimmySummerPlanTemplates(state.workoutTemplates);

  return (
    <div className="screen" style={{ height: "100%", position: "relative" }}>
      <div key={segment} className="page-transition">
      <ScreenHeader
        eyebrow={new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "").toUpperCase()}
        title="Nutrition"
      />

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(totals.cal)}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            / {T.cal} kcal
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            {Math.max(0, Math.round(T.cal - totals.cal))} left
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <MacroBar label="Protein" value={totals.p} target={T.p} />
          <MacroBar label="Carbs" value={totals.c} target={T.c} />
          <MacroBar label="Fat" value={totals.f} target={T.f} />
        </div>
      </div>

      {!jimmyLoaded ? (
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: 16,
            borderColor: "rgba(10,132,255,0.38)",
            background: "rgba(10,132,255,0.07)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Summer plan not loaded</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
            Nutrition targets and Saved meal presets stay on the default program until you load Jimmy&apos;s summer plan (same for the Workout tab).
          </p>
          <button
            type="button"
            className="tap"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm(
                  "Load Jimmy’s summer plan? Replaces workouts, Saved nutrition presets, habits, macros, and goal range. Logs stay.",
                )
              )
                return;
              setState(refreshStateAfterJimmySeed());
            }}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              background: "#0A84FF",
              color: "#fff",
            }}
          >
            Load Jimmy&apos;s summer plan
          </button>
        </div>
      ) : (
        <>
          <SectionLabel>Summer plan · Quick add</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            {JIMMY_QUICK_ADD_PRESET_IDS.map((pid) => {
              const preset = state.nutritionPresets.find((p) => p.id === pid);
              if (!preset) return null;
              const short = preset.name.length > 24 ? `${preset.name.slice(0, 22)}…` : preset.name;
              return (
                <button
                  key={pid}
                  type="button"
                  className="tap"
                  onClick={() => addPresetToToday(preset)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "0.5px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {short}
                </button>
              );
            })}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.45 }}>
            One tap adds to today. Open Saved for full list, macros, and portion notes.
          </p>
        </>
      )}

      <SegmentTabs value={segment} onChange={setSegment} />

      {segment === "saved" ? (
        <>
          <SectionLabel>Saved foods</SectionLabel>
          <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
            Everything you add on Today is stored here (including labels with blank macros). Tap a row to log it again; Remove deletes it from this list only.
          </p>

          {presets.length === 0 ? (
            <div className="card" style={{ padding: "22px 18px", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              {jimmyLoaded
                ? "Nothing saved yet. Add items on Today — they&apos;ll show up here automatically."
                : "Nothing here yet. Load Jimmy’s summer plan from the banner on Today (or Workout) to import meal presets, or add foods on Today."}
            </div>
          ) : (
            <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {presets.map((preset, idx) => (
                <div
                  key={preset.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    paddingBottom: idx < presets.length - 1 ? 12 : 0,
                    borderBottom: idx < presets.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                  }}
                >
                  <button
                    type="button"
                    className="tap"
                    onClick={() => addPresetToToday(preset)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: "left",
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                      {preset.name.trim() ? preset.name : "Unnamed"}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.42)",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatNutritionMacrosLine(preset)}
                    </div>
                    {preset.notes?.trim() ? (
                      <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.45, color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>
                        {preset.notes.trim()}
                      </div>
                    ) : null}
                    <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "rgba(120,200,255,0.9)", letterSpacing: "0.02em" }}>
                      Tap to add to today
                    </div>
                  </button>
                  <button
                    type="button"
                    className="tap"
                    aria-label={`Remove ${preset.name.trim() || "saved item"} from saved`}
                    onClick={() => forgetPreset(preset.id)}
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.35)",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ height: 24 }} />
        </>
      ) : (
        <>
          <SectionLabel>Today&apos;s items</SectionLabel>
          <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
            Add meals or snacks one at a time — each entry is saved under Saved for next time. When you have no rows yet, you can still enter a whole-day total below.
          </p>

          {todayItems.length > 0 ? (
            <div className="card" style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {todayItems.map((it, idx) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    paddingBottom: idx < todayItems.length - 1 ? 12 : 0,
                    borderBottom:
                      idx < todayItems.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                      {it.name.trim() ? it.name : "Item"}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.42)",
                        fontWeight: 500,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatNutritionMacrosLine(it)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="tap"
                    aria-label={`Remove ${it.name.trim() || "item"} from today`}
                    onClick={() => removeItem(it.id)}
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,120,120,0.95)",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(255,80,80,0.12)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, marginTop: todayItems.length ? 14 : 0 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Add item
            </div>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Label (optional)
              <input
                placeholder="e.g. Minute rice, shake…"
                aria-label="Item label"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="input"
                style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              />
            </label>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Calories (kcal)
              <input
                placeholder="Optional"
                aria-label="Item calories"
                value={draftCal}
                onChange={(e) => setDraftCal(e.target.value)}
                inputMode="decimal"
                className="input"
                style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              />
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Protein (g)
                <input
                  placeholder="—"
                  aria-label="Item protein grams"
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
                  placeholder="—"
                  aria-label="Item carbs grams"
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
                  placeholder="—"
                  aria-label="Item fat grams"
                  value={draftF}
                  onChange={(e) => setDraftF(e.target.value)}
                  inputMode="decimal"
                  className="input"
                  style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                />
              </label>
            </div>
            <button
              type="button"
              className="tap"
              onClick={addItem}
              style={{
                marginTop: 4,
                padding: "12px 16px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "-0.02em",
                border: "none",
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
              }}
            >
              Add item
            </button>
          </div>

          {todayItems.length === 0 ? (
            <>
              <SectionLabel>Whole-day totals</SectionLabel>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
                Prefer one number from another app? Enter combined macros here until you add rows above.
              </p>

              <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Calories (kcal)
                  <input placeholder="0" aria-label="Calories eaten today" {...manualFieldProps("cal", calIn, setCalIn)} />
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Protein (g)
                    <input placeholder="0" aria-label="Protein grams" {...manualFieldProps("p", pIn, setPIn)} />
                  </label>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Carbs (g)
                    <input placeholder="0" aria-label="Carbs grams" {...manualFieldProps("c", cIn, setCIn)} />
                  </label>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Fat (g)
                    <input placeholder="0" aria-label="Fat grams" {...manualFieldProps("f", fIn, setFIn)} />
                  </label>
                </div>
              </div>
            </>
          ) : null}

          <div style={{ height: 24 }} />
        </>
      )}
      </div>
    </div>
  );
}
