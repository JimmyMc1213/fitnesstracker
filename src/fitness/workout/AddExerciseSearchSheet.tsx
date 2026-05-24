import { useMemo, useState, type CSSProperties } from "react";

import { EXERCISE_DB } from "../data";
import { IconPlus, IconSearch } from "../icons";
import { PrimaryButton } from "../shared";
import type { CustomExerciseTemplate } from "../types";

const createInputStyle: CSSProperties = {
  background: "#1A1A1A",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text-primary)",
  fontFamily: "var(--ui)",
  fontSize: 14,
  fontWeight: 500,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

export function AddExerciseSearchSheet({
  customExercises,
  onAddExercise,
  onSaveCustomAndAdd,
  onClose,
}: {
  customExercises: CustomExerciseTemplate[];
  onAddExercise: (name: string, label?: string) => void;
  onSaveCustomAndAdd: (name: string, label: string) => void;
  onClose: () => void;
}) {
  const [exQuery, setExQuery] = useState("");
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [draftExName, setDraftExName] = useState("");
  const [draftExLabel, setDraftExLabel] = useState("");

  const qLow = exQuery.trim().toLowerCase();
  const filteredBuiltin = useMemo(
    () => EXERCISE_DB.filter((n) => !qLow || n.toLowerCase().includes(qLow)),
    [qLow],
  );
  const filteredCustom = useMemo(
    () =>
      customExercises.filter(
        (c) => !qLow || c.name.toLowerCase().includes(qLow) || c.label.toLowerCase().includes(qLow),
      ),
    [customExercises, qLow],
  );

  function handleClose() {
    setExQuery("");
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel("");
    onClose();
  }

  function handleAdd(name: string, label?: string) {
    onAddExercise(name, label);
    setExQuery("");
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel("");
  }

  function handleSaveCustomAndAdd() {
    const n = draftExName.trim();
    if (!n) return;
    onSaveCustomAndAdd(n, draftExLabel.trim());
    setExQuery("");
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel("");
  }

  function closeCreateCard() {
    setShowCreateCard(false);
    setDraftExName("");
    setDraftExLabel("");
  }

  return (
    <div className="card" style={{ padding: 12, marginTop: 16 }}>
      <div style={{ position: "relative" }}>
        <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)" }} />
        <input
          autoFocus
          className="input"
          style={{ paddingLeft: 36, background: "#1A1A1A" }}
          placeholder="Search exercises..."
          value={exQuery}
          onChange={(e) => setExQuery(e.target.value)}
        />
      </div>

      {showCreateCard ? (
        <div
          className="card"
          style={{
            marginTop: 12,
            padding: 14,
            background: "var(--surface-1)",
            border: "0.5px solid rgba(10,132,255,0.35)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              autoFocus
              value={draftExName}
              onChange={(e) => setDraftExName(e.target.value)}
              placeholder="Exercise name"
              style={createInputStyle}
            />
            <input
              value={draftExLabel}
              onChange={(e) => setDraftExLabel(e.target.value)}
              placeholder="Label (optional)"
              style={createInputStyle}
            />
            <PrimaryButton
              block
              onClick={handleSaveCustomAndAdd}
              disabled={!draftExName.trim()}
              style={{ borderRadius: 10, padding: 12, fontSize: 14 }}
            >
              Save to my list & add to workout
            </PrimaryButton>
            <button
              type="button"
              className="tap"
              onClick={closeCreateCard}
              style={{
                width: "100%",
                color: "var(--text-ghost)",
                fontSize: 12,
                padding: 6,
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="tap"
          onClick={() => setShowCreateCard(true)}
          style={{
            marginTop: 12,
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
      )}

      <div style={{ marginTop: 10, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column" }}>
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
                onClick={() => handleAdd(c.name, c.label)}
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  borderBottom: "0.5px solid var(--border)",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", color: "var(--text-primary)" }}>{c.name}</span>
                  {c.label ? (
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 500 }}>{c.label}</span>
                  ) : null}
                </span>
                <IconPlus size={14} stroke={2} style={{ color: "var(--text-primary)", flexShrink: 0 }} />
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
            {filteredBuiltin.map((n) => (
              <button
                key={n}
                type="button"
                className="tap"
                onClick={() => handleAdd(n)}
                style={{
                  padding: "12px 8px",
                  textAlign: "left",
                  borderBottom: "0.5px solid var(--border)",
                  fontSize: 13,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{n}</span>
                <IconPlus size={14} stroke={2} style={{ color: "var(--text-primary)" }} />
              </button>
            ))}
          </>
        ) : null}
        {filteredCustom.length === 0 && filteredBuiltin.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>No matches</div>
        ) : null}
      </div>
      <button
        type="button"
        className="tap"
        onClick={handleClose}
        style={{
          marginTop: 8,
          width: "100%",
          color: "var(--text-ghost)",
          fontSize: 12,
          padding: 6,
          fontWeight: 500,
        }}
      >
        Done
      </button>
    </div>
  );
}
