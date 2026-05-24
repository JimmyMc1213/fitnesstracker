import { useMemo, useState } from "react";

import { EXERCISE_DB } from "./data";
import { IconSearch } from "./icons";
import { BottomSheet } from "./motion";
import type { CustomExerciseTemplate } from "./types";

type ExerciseSwapSheetProps = {
  open?: boolean;
  currentName: string;
  currentLabel?: string;
  customExercises: CustomExerciseTemplate[];
  onSelect: (name: string, label?: string) => void;
  onClose: () => void;
};

export function ExerciseSwapSheet({
  open = true,
  currentName,
  currentLabel,
  customExercises,
  onSelect,
  onClose,
}: ExerciseSwapSheetProps) {
  const [query, setQuery] = useState("");
  const qLow = query.trim().toLowerCase();

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
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 560px)",
        display: "flex",
        flexDirection: "column",
        background: "#121212",
        borderColor: "var(--border)",
        padding: 20,
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
          Sets, targets, and logged reps stay on this row. Your saved routine is not changed.
        </p>

        <div style={{ position: "relative", marginBottom: 10 }}>
          <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)" }} />
          <input
            autoFocus
            className="input"
            style={{ paddingLeft: 36, background: "#1A1A1A" }}
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search replacement exercise"
          />
        </div>

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
              {filteredBuiltin.map((n) => (
                <button
                  key={n}
                  type="button"
                  className="tap"
                  onClick={() => pick(n)}
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
                  {n}
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
