import { useEffect, useMemo, useRef, useState } from "react";

import { catalogExercisesForEquipment } from "./exerciseCatalog";
import { ExerciseResultRow, exerciseSearchListStyle, exerciseSearchSectionHeaderStyle } from "./ExerciseSearchResultRow";
import { IconSearch } from "./icons";
import { CenterDialog, KEYBOARD_OPEN_THRESHOLD, bottomSheetPanelTheme, exerciseSearchDialogPanelStyle, useKeyboardViewport } from "./motion";
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
  const listRef = useRef<HTMLDivElement>(null);
  const { keyboardBottom } = useKeyboardViewport();
  const keyboardOpen = keyboardBottom >= KEYBOARD_OPEN_THRESHOLD;
  const qLow = query.trim().toLowerCase();

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

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [query]);

  function pick(name: string, label?: string) {
    onSelect(name, label?.trim() || undefined);
    onClose();
  }

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1100}
      keyboardAware
      ariaLabelledBy="exercise-swap-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
        ...exerciseSearchDialogPanelStyle,
      }}
    >
      <div
        id="exercise-swap-title"
        style={{ flexShrink: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}
      >
        Swap exercise
      </div>
      <div style={{ flexShrink: 0, fontSize: 13, color: "var(--text-muted-soft)", marginBottom: keyboardOpen ? 10 : 6, fontWeight: 500 }}>
        {currentName}
        {currentLabel ? ` · ${currentLabel}` : ""}
      </div>
      {!keyboardOpen ? (
        <p style={{ flexShrink: 0, margin: "0 0 12px", fontSize: 12, color: "var(--text-faint-soft)", lineHeight: 1.45 }}>
          Sets, targets, and logged reps stay on this row. Your saved workout is not changed.
        </p>
      ) : null}

      <div style={{ flexShrink: 0, position: "relative", marginBottom: 10 }}>
        <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)", pointerEvents: "none" }} />
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

      <div ref={listRef} style={exerciseSearchListStyle}>
        {filteredCustom.length > 0 ? (
          <>
            <div style={exerciseSearchSectionHeaderStyle}>Your exercises</div>
            {filteredCustom.map((c) => (
              <ExerciseResultRow key={c.id} name={c.name} label={c.label} onPick={() => pick(c.name, c.label)} />
            ))}
          </>
        ) : null}
        {filteredBuiltin.length > 0 ? (
          <>
            <div style={exerciseSearchSectionHeaderStyle}>Catalog</div>
            {filteredBuiltin.map((c) => (
              <ExerciseResultRow key={`${c.name}-${c.label}`} name={c.name} label={c.label} onPick={() => pick(c.name, c.label)} />
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
          flexShrink: 0,
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
    </CenterDialog>
  );
}
