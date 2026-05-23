import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { buildCoachContext } from "../coachEngine";
import { localDateKey } from "../dailyPlan";
import { applyStreakEligibility } from "../dailyStreak";
import { buildMacroPaceSnapshot } from "../macroPace";
import {
  PROTEIN_QUICK_ADD_PRESETS,
  QUICK_ADD_CHIP_STYLE,
  appendNutritionLoggedItem,
  appendNutritionPresetToDay,
  buildNutritionLoggedItem,
} from "../nutritionLog";
import { effectiveNutritionTotalsForDateKey, manualTotalsForDateKey } from "../nutritionTotals";
import { MacroBar, MacroRing, PrimaryButton, ScreenHeader, SectionLabel } from "../shared";
import { WaterTrackerCard } from "../WaterTrackerCard";
import { appendWaterLogEntry, removeWaterLogEntry } from "../waterIntake";
import type { MacroTotals, NutritionLoggedItem, NutritionPreset, ScreenProps } from "../types";

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
 * Nutrition tab: hero macro rings, coached pace copy, quick-add presets, saved foods, whole-day totals fallback.
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

  const coachCtx = useMemo(() => buildCoachContext(state, todayKey), [state, todayKey]);
  const macroPace = useMemo(() => buildMacroPaceSnapshot(coachCtx), [coachCtx]);
  const kcalLeft = Math.max(0, T.cal - totals.cal);

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

  function logQuickPreset(preset: (typeof PROTEIN_QUICK_ADD_PRESETS)[number]) {
    const row = buildNutritionLoggedItem(preset, preset.label.replace(/^\+/, "Quick add "));
    setState((s) => appendNutritionLoggedItem(s, todayKey, row));
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

    const row = buildNutritionLoggedItem({ cal, p, c, f }, nameTrim);
    setState((s) => appendNutritionLoggedItem(s, todayKey, row));

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
    setState((s) => appendNutritionPresetToDay(s, todayKey, preset));
  }

  function forgetPreset(presetId: string) {
    setState((s) => ({
      ...s,
      nutritionPresets: s.nutritionPresets.filter((x) => x.id !== presetId),
    }));
  }

  const presets = state.nutritionPresets;
  const waterEntries = state.waterLogByDay[todayKey] ?? [];
  const showMacroPace = T.p > 0;

  return (
    <div className="screen" style={{ height: "100%", position: "relative" }}>
      <div key={segment} className="page-transition">
        <ScreenHeader
          eyebrow={new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).replace(",", "").toUpperCase()}
          title="Nutrition"
        />

        <div className="card" style={{ padding: 18, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <MacroRing value={totals.cal} target={T.cal} size={132} stroke={6} animate={true} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ marginBottom: 2 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.25)",
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Today
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 500,
                    marginTop: 4,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {kcalLeft} kcal left
                </div>
              </div>
              <MacroBar label="Protein" value={totals.p} target={T.p} />
              <MacroBar label="Carbs" value={totals.c} target={T.c} />
              <MacroBar label="Fat" value={totals.f} target={T.f} />
            </div>
          </div>
          {showMacroPace ? (
            <p
              style={{
                margin: "14px 0 0",
                paddingTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                fontSize: 13,
                lineHeight: 1.5,
                color: macroPace.status === "behind" ? "rgba(255,200,120,0.95)" : "rgba(255,255,255,0.52)",
                fontWeight: 500,
              }}
            >
              {macroPace.hint}
            </p>
          ) : null}
        </div>

        <WaterTrackerCard
          dateKey={todayKey}
          targetOz={state.waterDailyTargetOz}
          entries={waterEntries}
          readOnly={false}
          isToday
          onAddOz={(oz) => setState((s) => appendWaterLogEntry(s, todayKey, oz))}
          onRemoveEntry={(entryId) => setState((s) => removeWaterLogEntry(s, todayKey, entryId))}
        />

        <SegmentTabs value={segment} onChange={setSegment} />

        {segment === "saved" ? (
          <>
            <SectionLabel>Saved foods</SectionLabel>
            <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
              Tap a row to log it again. Remove deletes it from this list only.
            </p>

            {presets.length === 0 ? (
              <div className="card" style={{ padding: "22px 18px", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                Nothing saved yet. Add items on Today, they&apos;ll show up here automatically.
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
            <SectionLabel>Quick add</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {PROTEIN_QUICK_ADD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="tap"
                  style={QUICK_ADD_CHIP_STYLE}
                  aria-label={`Log ${preset.label}`}
                  onClick={() => logQuickPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {todayItems.length > 0 ? (
              <>
                <SectionLabel>Today&apos;s log</SectionLabel>
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
              </>
            ) : null}

            <SectionLabel>{todayItems.length > 0 ? "Add custom item" : "Log food"}</SectionLabel>
            <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, marginTop: todayItems.length ? 0 : 0 }}>
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
                    placeholder="-"
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
                    placeholder="-"
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
                    placeholder="-"
                    aria-label="Item fat grams"
                    value={draftF}
                    onChange={(e) => setDraftF(e.target.value)}
                    inputMode="decimal"
                    className="input"
                    style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
                  />
                </label>
              </div>
              <PrimaryButton block onClick={addItem} style={{ marginTop: 4, fontWeight: 700 }}>
                Add item
              </PrimaryButton>
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
