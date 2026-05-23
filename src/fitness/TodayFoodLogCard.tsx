import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";

import {
  buildNutritionLoggedItem,
  removeNutritionLoggedItem,
  updateNutritionLoggedItem,
} from "./nutritionLog";
import { IconPencil, IconTrash } from "./icons";
import type { AppState, NutritionLoggedItem } from "./types";

type Props = {
  dateKey: string;
  items: NutritionLoggedItem[];
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, row: NutritionLoggedItem) => void;
};

function formatLoggedTime(ms: number | undefined): string {
  const t = typeof ms === "number" && ms > 0 ? ms : Date.now();
  return new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function parseMacro(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function TodayFoodLogCard({ items, onRemove, onUpdate }: Props) {
  const [showEarlier, setShowEarlier] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftCal, setDraftCal] = useState("");
  const [draftP, setDraftP] = useState("");
  const [draftC, setDraftC] = useState("");
  const [draftF, setDraftF] = useState("");
  const [draftServing, setDraftServing] = useState("");

  const sorted = [...items].sort((a, b) => {
    const ta = typeof a.loggedAtMs === "number" ? a.loggedAtMs : 0;
    const tb = typeof b.loggedAtMs === "number" ? b.loggedAtMs : 0;
    return tb - ta;
  });

  const earlierCount = Math.max(0, sorted.length - 1);
  const visible = showEarlier ? sorted : sorted.slice(0, 1);

  useEffect(() => {
    if (sorted.length <= 1) setShowEarlier(false);
  }, [sorted.length]);

  useEffect(() => {
    if (editingId && !sorted.some((it) => it.id === editingId)) setEditingId(null);
  }, [editingId, sorted]);

  function startEdit(item: NutritionLoggedItem) {
    setEditingId(item.id);
    setDraftName(item.name || "");
    setDraftCal(String(Math.round(Number(item.cal) || 0)));
    setDraftP(String(Number(item.p) || 0));
    setDraftC(String(Number(item.c) || 0));
    setDraftF(String(Number(item.f) || 0));
    setDraftServing(item.servingLabel?.trim() ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function saveEdit(e: FormEvent, item: NutritionLoggedItem) {
    e.preventDefault();
    const row = buildNutritionLoggedItem(
      {
        cal: parseMacro(draftCal),
        p: parseMacro(draftP),
        c: parseMacro(draftC),
        f: parseMacro(draftF),
      },
      draftName.trim() || "Food",
      {
        id: item.id,
        loggedAtMs: item.loggedAtMs ?? Date.now(),
        ...(draftServing.trim() ? { servingLabel: draftServing.trim() } : {}),
        ...(item.source?.trim() ? { source: item.source.trim() } : {}),
        ...(item.externalId?.trim() ? { externalId: item.externalId.trim() } : {}),
      },
    );
    onUpdate(item.id, row);
    setEditingId(null);
  }

  function renderRow(item: NutritionLoggedItem, showDivider: boolean) {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <form
          key={item.id}
          onSubmit={(e) => saveEdit(e, item)}
          style={{
            paddingBottom: showDivider ? 12 : 0,
            marginBottom: showDivider ? 12 : 0,
            borderBottom: showDivider ? "1px solid rgba(255,255,255,0.06)" : undefined,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <input
            aria-label="Food name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="input"
            placeholder="Name"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              aria-label="Calories"
              value={draftCal}
              onChange={(e) => setDraftCal(e.target.value)}
              className="input"
              inputMode="decimal"
              placeholder="kcal"
            />
            <input
              aria-label="Protein grams"
              value={draftP}
              onChange={(e) => setDraftP(e.target.value)}
              className="input"
              inputMode="decimal"
              placeholder="Protein (g)"
            />
            <input
              aria-label="Carbs grams"
              value={draftC}
              onChange={(e) => setDraftC(e.target.value)}
              className="input"
              inputMode="decimal"
              placeholder="Carbs (g)"
            />
            <input
              aria-label="Fat grams"
              value={draftF}
              onChange={(e) => setDraftF(e.target.value)}
              className="input"
              inputMode="decimal"
              placeholder="Fat (g)"
            />
          </div>
          <input
            aria-label="Serving"
            value={draftServing}
            onChange={(e) => setDraftServing(e.target.value)}
            className="input"
            placeholder="Serving (optional)"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="tap"
              onClick={cancelEdit}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "0.5px solid rgba(255,255,255,0.14)",
                background: "transparent",
                color: "rgba(255,255,255,0.65)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tap"
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "var(--pos, #4ade80)",
                color: "#07080c",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Save
            </button>
          </div>
        </form>
      );
    }

    return (
      <div
        key={item.id}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          paddingBottom: showDivider ? 12 : 0,
          marginBottom: showDivider ? 12 : 0,
          borderBottom: showDivider ? "1px solid rgba(255,255,255,0.06)" : undefined,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
            {item.name.trim() || "Food"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.42)",
              fontWeight: 500,
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(Number(item.cal) || 0)} kcal · P {Math.round(Number(item.p) || 0)}g
            {item.servingLabel?.trim() ? ` · ${item.servingLabel.trim()}` : ""}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, marginTop: 2 }}>
            {formatLoggedTime(item.loggedAtMs)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <button
            type="button"
            className="tap"
            aria-label={`Edit ${item.name.trim() || "food"}`}
            onClick={() => startEdit(item)}
            style={{
              display: "grid",
              placeItems: "center",
              width: 36,
              height: 36,
              padding: 0,
              border: "none",
              borderRadius: 10,
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <IconPencil size={18} stroke={1.75} />
          </button>
          <button
            type="button"
            className="tap"
            aria-label={`Remove ${item.name.trim() || "food"}`}
            onClick={() => onRemove(item.id)}
            style={{
              display: "grid",
              placeItems: "center",
              width: 36,
              height: 36,
              padding: 0,
              border: "none",
              borderRadius: 10,
              background: "transparent",
              color: "#FF6961",
            }}
          >
            <IconTrash size={18} stroke={1.75} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 18, marginTop: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 14,
        }}
      >
        Food · Today
      </div>

      {sorted.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.5, fontWeight: 400 }}>
          Nothing logged yet. Tap + to add food.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {visible.map((item, idx) => renderRow(item, idx < visible.length - 1))}
          {earlierCount > 0 ? (
            <button
              type="button"
              className="tap"
              onClick={() => setShowEarlier((v) => !v)}
              aria-expanded={showEarlier}
              style={{
                marginTop: 4,
                padding: 0,
                border: "none",
                background: "none",
                textAlign: "left",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--pos, #4ade80)",
              }}
            >
              {showEarlier
                ? "Hide earlier entries"
                : `Show ${earlierCount} earlier ${earlierCount === 1 ? "entry" : "entries"}`}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function todayFoodLogHandlers(
  setState: Dispatch<SetStateAction<AppState>>,
  dateKey: string,
): { onRemove: (itemId: string) => void; onUpdate: (itemId: string, row: NutritionLoggedItem) => void } {
  return {
    onRemove: (itemId) => setState((s) => removeNutritionLoggedItem(s, dateKey, itemId)),
    onUpdate: (itemId, row) => setState((s) => updateNutritionLoggedItem(s, dateKey, itemId, row)),
  };
}
