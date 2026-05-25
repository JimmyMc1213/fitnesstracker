import { useMemo, useState } from "react";

import { availableHabitsToAdd, createCustomHabitTemplate, type HabitDefinition } from "./habits";
import { habitIconComponent } from "./habitIcons";
import { IconSearch } from "./icons";
import { BottomSheet, bottomSheetPanelTheme, useKeyboardAwareSheetSizing } from "./motion";
import type { HabitTemplate } from "./types";
import { sanitizeUserText } from "./userText";

type Props = {
  open: boolean;
  currentTemplates: HabitTemplate[];
  onAdd: (template: HabitTemplate) => void;
  onClose: () => void;
};

export function AddHabitSheet({ open, currentTemplates, onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const { panelStyle: keyboardPanelStyle } = useKeyboardAwareSheetSizing();

  const available = useMemo(
    () => availableHabitsToAdd(currentTemplates, query),
    [currentTemplates, query],
  );

  const showCustomRow =
    !showCustomForm &&
    (!query.trim() || "custom habit".includes(query.trim().toLowerCase()) || "custom".includes(query.trim().toLowerCase()));

  function reset() {
    setQuery("");
    setShowCustomForm(false);
    setCustomName("");
    setCustomDescription("");
  }

  function pick(def: HabitDefinition) {
    onAdd({
      id: def.id,
      name: def.name,
      icon: def.icon === "droplet" ? "drop" : def.icon,
      subtitle: def.subtitle,
      type: def.type,
      ...(def.action ? { action: def.action } : {}),
    });
    reset();
    onClose();
  }

  function saveCustom() {
    const name = sanitizeUserText(customName).trim();
    if (!name) return;
    const subtitle = sanitizeUserText(customDescription).trim();
    onAdd(createCustomHabitTemplate(name, subtitle || undefined));
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      zIndex={1100}
      ariaLabelledBy="add-habit-sheet-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: 20,
        ...keyboardPanelStyle,
      }}
    >
      <div
        id="add-habit-sheet-title"
        style={{ flexShrink: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 12 }}
      >
        Add habit
      </div>

      {!showCustomForm ? (
        <>
          <div style={{ flexShrink: 0, position: "relative", marginBottom: 10 }}>
            <IconSearch size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-ghost)", pointerEvents: "none" }} />
            <input
              className="input"
              placeholder="Search habits"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
              aria-label="Search habits"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "min(50vh, 360px)", overflowY: "auto" }}>
            {available.map((habit) => {
              const IconComp = habitIconComponent(habit.icon);
              return (
                <button
                  key={habit.id}
                  type="button"
                  className="tap card"
                  onClick={() => pick(habit)}
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    textAlign: "left",
                    borderColor: "var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--surface-2)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--text-ghost)",
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={16} stroke={1.6} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>{habit.name}</div>
                    {habit.subtitle ? (
                      <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 400 }}>{habit.subtitle}</div>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {showCustomRow ? (
              <button
                type="button"
                className="tap card"
                onClick={() => setShowCustomForm(true)}
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  textAlign: "left",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--surface-2)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-ghost)",
                    flexShrink: 0,
                  }}
                >
                  {(() => {
                    const IconComp = habitIconComponent("bolt");
                    return <IconComp size={16} stroke={1.6} />;
                  })()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>Custom habit</div>
                  <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 400 }}>Name your own habit</div>
                </div>
              </button>
            ) : null}

            {available.length === 0 && !showCustomRow ? (
              <p style={{ margin: "8px 0", fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>No matching habits to add.</p>
            ) : null}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Habit name
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={customName}
              maxLength={40}
              onChange={(e) => setCustomName(sanitizeUserText(e.target.value))}
              placeholder="e.g. Meditate"
              aria-label="Habit name"
            />
          </label>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Description (optional)
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={customDescription}
              maxLength={80}
              onChange={(e) => setCustomDescription(sanitizeUserText(e.target.value))}
              placeholder="Why this matters"
              aria-label="Habit description"
            />
          </label>
          <button
            type="button"
            className="tap"
            onClick={saveCustom}
            disabled={!customName.trim()}
            style={{
              marginTop: 4,
              width: "100%",
              background: customName.trim() ? "var(--primary)" : "var(--surface-3)",
              color: customName.trim() ? "var(--primary-fg)" : "var(--text-ghost)",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Add custom habit
          </button>
          <button
            type="button"
            className="tap"
            onClick={() => setShowCustomForm(false)}
            style={{ width: "100%", padding: 10, fontSize: 13, fontWeight: 600, color: "var(--text-faint-soft)" }}
          >
            Back
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
