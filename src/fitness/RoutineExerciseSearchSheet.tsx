import { useEffect, useMemo, useRef, useState } from "react";

import { CustomExerciseCreateForm } from "./CustomExerciseCreateForm";
import { catalogExercisesForEquipment } from "./exerciseCatalog";
import type { ExerciseEquipmentLabel } from "./exerciseLabels";
import { IconSearch } from "./icons";
import { CenterDialog, bottomSheetPanelTheme, useExerciseSearchDialogPanelStyle } from "./motion";
import { ExerciseResultRow, exerciseSearchListStyle, exerciseSearchSectionHeaderStyle } from "./ExerciseSearchResultRow";
import type { CustomExerciseTemplate, EquipmentSetup } from "./types";

type RoutineExerciseSearchSheetProps = {
  open?: boolean;
  title?: string;
  equipmentSetup: EquipmentSetup;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onSaveCustomAndAdd?: (name: string, label: string) => void;
  onClose: () => void;
  /** When false, picking an exercise keeps the sheet open (e.g. add many during a workout). */
  closeOnSelect?: boolean;
  closeLabel?: string;
};

export function RoutineExerciseSearchSheet({
  open = true,
  title = "Choose exercise",
  equipmentSetup,
  customExercises,
  onSelect,
  onSaveCustomAndAdd,
  onClose,
  closeOnSelect = true,
  closeLabel = "Cancel",
}: RoutineExerciseSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState<ExerciseEquipmentLabel | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchPanelStyle = useExerciseSearchDialogPanelStyle();
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

  function resetDraft() {
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel(null);
  }

  function pick(name: string, label?: string) {
    onSelect(name, label?.trim() || undefined);
    setQuery("");
    resetDraft();
    if (closeOnSelect) onClose();
  }

  function handleSaveCustomAndAdd() {
    const n = draftExName.trim();
    if (!n || !draftExLabel || !onSaveCustomAndAdd) return;
    onSaveCustomAndAdd(n, draftExLabel);
    setQuery("");
    resetDraft();
    if (closeOnSelect) onClose();
  }

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1100}
      keyboardAware
      ariaLabelledBy="routine-exercise-search-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
        ...searchPanelStyle,
      }}
    >
      <div
        id="routine-exercise-search-title"
        style={{ flexShrink: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 12 }}
      >
        {title}
      </div>

      <div style={{ flexShrink: 0, position: "relative", marginBottom: 10 }}>
        <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)", pointerEvents: "none" }} />
        <input
          className="input"
          style={{ paddingLeft: 36 }}
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
          inputMode="search"
          enterKeyHint="search"
        />
      </div>

      {onSaveCustomAndAdd ? (
        showCreateCard ? (
          <div
            className="card"
            style={{
              flexShrink: 0,
              marginBottom: 10,
              padding: 14,
              background: "var(--surface-1)",
              border: "0.5px solid rgba(10,132,255,0.35)",
            }}
          >
            <CustomExerciseCreateForm
              name={draftExName}
              selectedLabel={draftExLabel}
              saveButtonLabel="Save to my list & add to workout"
              onNameChange={setDraftExName}
              onLabelChange={setDraftExLabel}
              onSave={handleSaveCustomAndAdd}
              onCancel={resetDraft}
            />
          </div>
        ) : (
          <button
            type="button"
            className="tap"
            onClick={() => setShowCreateCard(true)}
            style={{
              flexShrink: 0,
              marginBottom: 10,
              width: "100%",
              background: "rgba(10,132,255,0.2)",
              border: "0.5px solid rgba(10,132,255,0.45)",
              borderRadius: 12,
              padding: 14,
              color: "#6EB7FF",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Create new
          </button>
        )
      ) : null}

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
        {closeLabel}
      </button>
    </CenterDialog>
  );
}
