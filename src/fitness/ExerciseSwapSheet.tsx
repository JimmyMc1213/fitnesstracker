import { useMemo, useState } from "react";

import { catalogExercisesForEquipment } from "./exerciseCatalog";
import { IconSearch } from "./icons";
import { BottomSheet, bottomSheetPanelTheme, useKeyboardViewport } from "./motion";
import type { CustomExerciseTemplate, EquipmentSetup } from "./types";

type ExerciseSwapSheetProps = {
  open?: boolean;
  equipmentSetup: EquipmentSetup;
  currentName: string;
  currentLabel?: string;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onClose: () => void;
};

export function ExerciseSwapSheet({
  open = true,
  equipmentSetup,
  currentName,
  currentLabel,
  customExercises,
  onSelect,
  onClose,
}: ExerciseSwapSheetProps) {
  const [query, setQuery] = useState("");
  const { keyboardBottom, visibleHeight } = useKeyboardViewport();
  const qLow = query.trim().toLowerCase();
  const keyboardOpen = keyboardBottom > 0;
  const sheetMaxHeight = keyboardOpen
    ? Math.max(220, visibleHeight - 24)
    : Math.min(640, visibleHeight * 0.85);

  const catalogExercises = useMemo(() => catalogExercisesForEquipment(equipmentSetup), [equipmentSetup]);
  const filteredBuiltin = useMemo(
    () =>
      catalogExercises.filter(
        (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
      ),
    [catalogExercises, qLow],
  );
  const filteredCustom = useMemo(
    () =>
      customExercises.filter(
        (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
      ),
    [customExercises, qLow],
  );

  function pick(name: string, label?: string) {
    onSelect(name, label?.trim() || undefined);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="exercise-swap-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: sheetMaxHeight,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflow: "hidden",
      }}
    >
        <div id="exercise-swap-title" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}>
          Swap exercise
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginBottom: 6, fontWeight: 500 }}>
          {currentName}
          {currentLabel ? ` · ${currentLabel}` : ""}
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
          Sets, targets, and logged reps stay on this row. Your saved workout is not changed.
        </p>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)" }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search replacement exercise"
            inputMode="search"
            enterKeyHint="search"
          />
        </div>

        <div style={{ flex: 1, minHeight: 120, overflowY: "auto", WebkitOverflowScrolling: "touch", display: "flex", flexDirection: "column" }}>
          {filteredCustom.length > 0 ? (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  padding: "8px 8px 6px",
                }}
              >
                Your exercises
              </div>
              {filteredCustom.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="tap"
                  onClick={() => pick(c.name, c.label)}
                  style={{
                    padding: "12px 8px",
                    textAlign: "left",
                    borderBottom: "0.5px solid var(--border)",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "block",
                    width: "100%",
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ display: "block" }}>{c.name}</span>
                  {c.label ? (
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 500 }}>
                      {c.label}
                    </span>
                  ) : null}
                </button>
              ))}
            </>
          ) : null}
          {filteredBuiltin.length > 0 ? (
            <>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-ghost)",
                  padding: "8px 8px 6px",
                }}
              >
                Catalog
              </div>
              {filteredBuiltin.map((c) => (
                <button
                  key={`${c.name}-${c.label}`}
                  type="button"
                  className="tap"
                  onClick={() => pick(c.name, c.label)}
                  style={{
                    padding: "12px 8px",
                    textAlign: "left",
                    borderBottom: "0.5px solid var(--border)",
                    fontSize: 13,
                    fontWeight: 500,
                    width: "100%",
                    background: "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ display: "block" }}>{c.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 500 }}>
                    {c.label}
                  </span>
                </button>
              ))}
            </>
          ) : null}
          {filteredCustom.length === 0 && filteredBuiltin.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
              No matches
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{
            marginTop: 12,
            width: "100%",
            color: "var(--text-ghost)",
            fontSize: 13,
            padding: 10,
            fontWeight: 500,
            background: "none",
            border: "none",
          }}
        >
          Cancel
        </button>
    </BottomSheet>
  );
}
