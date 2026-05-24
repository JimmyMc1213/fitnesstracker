import { useMemo, useState } from "react";

import { CustomExerciseCreateForm } from "./CustomExerciseCreateForm";
import { catalogExercisesForEquipment } from "./exerciseCatalog";
import type { ExerciseEquipmentLabel } from "./exerciseLabels";
import { IconSearch } from "./icons";
import { BottomSheet, bottomSheetPanelTheme } from "./motion";
import type { CustomExerciseTemplate, EquipmentSetup } from "./types";

type RoutineExerciseSearchSheetProps = {
  open?: boolean;
  title?: string;
  equipmentSetup: EquipmentSetup;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onSaveCustomAndAdd?: (name: string, label: string) => void;
  onClose: () => void;
};

export function RoutineExerciseSearchSheet({
  open = true,
  title = "Choose exercise",
  equipmentSetup,
  customExercises,
  onSelect,
  onSaveCustomAndAdd,
  onClose,
}: RoutineExerciseSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState<ExerciseEquipmentLabel | null>(null);
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

  function resetDraft() {
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel(null);
  }

  function pick(name: string, label?: string) {
    onSelect(name, label?.trim() || undefined);
    setQuery("");
    resetDraft();
    onClose();
  }

  function handleSaveCustomAndAdd() {
    const n = draftExName.trim();
    if (!n || !draftExLabel || !onSaveCustomAndAdd) return;
    onSaveCustomAndAdd(n, draftExLabel);
    setQuery("");
    resetDraft();
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabelledBy="routine-exercise-search-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 560px)",
        display: "flex",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <div
        id="routine-exercise-search-title"
        style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 12 }}
      >
        {title}
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)" }} />
        <input
          autoFocus
          className="input"
          style={{ paddingLeft: 36 }}
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      {onSaveCustomAndAdd ? (
        showCreateCard ? (
          <div
            className="card"
            style={{
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

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
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
