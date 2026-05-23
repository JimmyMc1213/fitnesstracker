import { useMemo } from "react";

import { buildCoachContext } from "./coachEngine";
import { localDateKey } from "./dailyPlan";
import { buildMacroPaceSnapshot } from "./macroPace";
import {
  PROTEIN_QUICK_ADD_PRESETS,
  QUICK_ADD_CHIP_STYLE,
  appendNutritionLoggedItem,
  appendNutritionPresetToDay,
  buildNutritionLoggedItem,
  topProteinPresetsForQuickLog,
} from "./nutritionLog";
import { effectiveNutritionTotalsForDateKey } from "./nutritionTotals";
import { MacroBar } from "./shared";
import type { AppState, NutritionPreset } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onOpenFullLog?: () => void;
};

function formatPresetLine(preset: NutritionPreset): string {
  const p = Math.round(Number(preset.p) || 0);
  const cal = Math.round(Number(preset.cal) || 0);
  if (cal > 0) return `${p}g protein · ${cal} kcal`;
  return `${p}g protein`;
}

export function HomeFuelQuickLogSheet({ open, onClose, dateKey, state, setState, onOpenFullLog }: Props) {
  const targets = state.nutritionTargets;
  const totals = effectiveNutritionTotalsForDateKey(
    state.nutritionManualByDay,
    state.nutritionItemsByDay,
    dateKey,
  );
  const coachCtx = useMemo(() => buildCoachContext(state, dateKey), [state, dateKey]);
  const macroPace = useMemo(() => buildMacroPaceSnapshot(coachCtx), [coachCtx]);
  const showMacroPace = targets.p > 0;
  const favorites = useMemo(
    () => topProteinPresetsForQuickLog(state.nutritionPresets),
    [state.nutritionPresets],
  );

  if (!open) return null;

  function logQuickPreset(preset: (typeof PROTEIN_QUICK_ADD_PRESETS)[number]) {
    const row = buildNutritionLoggedItem(preset, preset.label.replace(/^\+/, "Quick add "));
    setState((s) => appendNutritionLoggedItem(s, dateKey, row));
    onClose();
  }

  function logFavorite(preset: NutritionPreset) {
    setState((s) => appendNutritionPresetToDay(s, dateKey, preset));
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 190,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 10,
      }}
      onClick={onClose}
    >
      <div
        className="card page-transition"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: 18,
          borderRadius: 16,
          marginBottom: 8,
          border: "0.5px solid rgba(255,255,255,0.14)",
          background: "var(--card)",
          maxHeight: "min(85dvh, 640px)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(120,200,255,0.9)",
            marginBottom: 8,
          }}
        >
          Quick log fuel
        </div>

        <MacroBar label="Protein" value={totals.p} target={targets.p} />

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

        <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Quick add
        </div>
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

        {favorites.length > 0 ? (
          <>
            <div style={{ marginTop: 18, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Saved favorites
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {favorites.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="tap"
                  onClick={() => logFavorite(preset)}
                  aria-label={`Log ${preset.name.trim() || "saved food"}`}
                  style={{
                    ...QUICK_ADD_CHIP_STYLE,
                    borderRadius: 12,
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {preset.name.trim() || "Saved food"}
                  </span>
                  <span style={{ flexShrink: 0, fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                    {formatPresetLine(preset)}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {onOpenFullLog ? (
          <button
            type="button"
            className="tap"
            onClick={() => {
              onClose();
              onOpenFullLog();
            }}
            style={{
              width: "100%",
              marginTop: 18,
              padding: "12px 16px",
              borderRadius: 12,
              border: "0.5px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Open full Nutrition log
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Today-only guard for Home quick-log entry points. */
export function canOpenHomeFuelQuickLog(dateKey: string, now = new Date()): boolean {
  return dateKey === localDateKey(now);
}
