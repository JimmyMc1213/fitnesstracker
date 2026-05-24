import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { SwipeToDelete } from "./SwipeToDelete";
import { removeNutritionLoggedItem } from "./nutritionLog";
import type { AppState, NutritionLoggedItem } from "./types";

type Props = {
  dateKey: string;
  items: NutritionLoggedItem[];
  onRemove: (itemId: string) => void;
  onEdit: (item: NutritionLoggedItem) => void;
};

function formatLoggedTime(ms: number | undefined): string {
  const t = typeof ms === "number" && ms > 0 ? ms : Date.now();
  return new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

type SwipeableFoodLogRowProps = {
  item: NutritionLoggedItem;
  showDivider: boolean;
  onEdit: (item: NutritionLoggedItem) => void;
  onRemove: (itemId: string) => void;
  isOpen: boolean;
  onOpen: (itemId: string) => void;
  onClose: () => void;
};

function SwipeableFoodLogRow({
  item,
  showDivider,
  onEdit,
  onRemove,
  isOpen,
  onOpen,
  onClose,
}: SwipeableFoodLogRowProps) {
  const displayName = item.name.trim() || "Food";

  return (
    <div
      style={{
        marginBottom: showDivider ? 12 : 0,
        borderBottom: showDivider ? "1px solid rgba(255,255,255,0.06)" : undefined,
        paddingBottom: showDivider ? 12 : 0,
      }}
    >
      <SwipeToDelete
        deleteLabel={`Delete ${displayName}`}
        onDelete={() => onRemove(item.id)}
        isOpen={isOpen}
        onOpen={() => onOpen(item.id)}
        onClose={onClose}
        onTap={() => onEdit(item)}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Edit ${displayName}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEdit(item);
            }
          }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            padding: "2px 0",
            background: "var(--card)",
            cursor: "pointer",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
              {displayName}
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
        </div>
      </SwipeToDelete>
    </div>
  );
}

export function TodayFoodLogCard({ items, onRemove, onEdit }: Props) {
  const [showEarlier, setShowEarlier] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

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
    if (openItemId && !sorted.some((item) => item.id === openItemId)) {
      setOpenItemId(null);
    }
  }, [openItemId, sorted]);

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
          {visible.map((item, idx) => (
            <SwipeableFoodLogRow
              key={item.id}
              item={item}
              showDivider={idx < visible.length - 1}
              onEdit={onEdit}
              onRemove={onRemove}
              isOpen={openItemId === item.id}
              onOpen={setOpenItemId}
              onClose={() => setOpenItemId(null)}
            />
          ))}
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
): { onRemove: (itemId: string) => void } {
  return {
    onRemove: (itemId) => setState((s) => removeNutritionLoggedItem(s, dateKey, itemId)),
  };
}
