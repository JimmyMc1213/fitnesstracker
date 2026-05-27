import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { MAX_NUTRITION_ITEMS_PER_DAY, removeNutritionLoggedItem } from "./nutritionLog";
import { SwipeToDelete } from "./SwipeToDelete";
import type { AppState, NutritionLoggedItem } from "./types";
import { formatServing, toTitleCase } from "./utils/foodDisplay";

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

function isCatalogFoodSource(source?: string): boolean {
  const s = source?.trim().toLowerCase();
  return s === "usda" || s === "off" || s === "curated";
}

function displayFoodName(item: NutritionLoggedItem): string {
  const name = item.name.trim() || "Food";
  return isCatalogFoodSource(item.source) ? toTitleCase(name) : name;
}

function displayServingLabel(label: string): string {
  return label.replace(/([\d.]+)\s*g\b/gi, (_, numStr) => {
    const grams = parseFloat(numStr);
    return Number.isFinite(grams) ? formatServing(grams) : `${numStr}g`;
  });
}

type SwipeableFoodLogRowProps = {
  item: NutritionLoggedItem;
  onEdit: (item: NutritionLoggedItem) => void;
  onRemove: () => void;
  isOpen: boolean;
  onOpen: (itemId: string) => void;
  onClose: () => void;
};

function SwipeableFoodLogRow({
  item,
  onEdit,
  onRemove,
  isOpen,
  onOpen,
  onClose,
}: SwipeableFoodLogRowProps) {
  const displayName = displayFoodName(item);

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      <SwipeToDelete
        deleteLabel={`Delete ${displayName}`}
        onDelete={onRemove}
        isOpen={isOpen}
        onOpen={() => onOpen(item.id)}
        onClose={onClose}
        onTap={() => onEdit(item)}
        borderRadius={16}
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
            padding: "14px 16px",
            background: "var(--card-gradient-bg)",
            cursor: "pointer",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {displayName}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-faint-soft)",
                fontWeight: 500,
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.round(Number(item.cal) || 0)} kcal · P {Math.round(Number(item.p) || 0)}g
              {item.servingLabel?.trim() ? ` · ${displayServingLabel(item.servingLabel.trim())}` : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-ghost)", fontWeight: 500, marginTop: 2 }}>
              {formatLoggedTime(item.loggedAtMs)}
            </div>
          </div>
        </div>
      </SwipeToDelete>
    </div>
  );
}

export function TodayFoodLogCard({ items, onRemove, onEdit }: Props) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => {
    const ta = typeof a.loggedAtMs === "number" ? a.loggedAtMs : 0;
    const tb = typeof b.loggedAtMs === "number" ? b.loggedAtMs : 0;
    return tb - ta;
  });

  const atDailyCap = sorted.length >= MAX_NUTRITION_ITEMS_PER_DAY;

  useEffect(() => {
    if (openItemId && !sorted.some((item) => item.id === openItemId)) {
      setOpenItemId(null);
    }
  }, [openItemId, sorted]);

  return (
    <div style={{ marginTop: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-faint-soft)",
          marginBottom: 10,
        }}
      >
        Recently logged
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ padding: "18px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-faint-soft)", lineHeight: 1.5, fontWeight: 400 }}>
            Tap the + to add food.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((item) => (
            <SwipeableFoodLogRow
              key={item.id}
              item={item}
              onEdit={onEdit}
              onRemove={() => {
                setOpenItemId(null);
                onRemove(item.id);
              }}
              isOpen={openItemId === item.id}
              onOpen={setOpenItemId}
              onClose={() => setOpenItemId(null)}
            />
          ))}
          {atDailyCap ? (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                lineHeight: 1.45,
                color: "var(--text-faint-soft)",
                fontWeight: 500,
              }}
            >
              Daily log limit reached ({MAX_NUTRITION_ITEMS_PER_DAY} items). Remove an entry to add more.
            </p>
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
