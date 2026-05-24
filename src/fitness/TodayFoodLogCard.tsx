import { useEffect, useRef, useState, type Dispatch, type MouseEvent, type PointerEvent, type SetStateAction } from "react";

import { IconTrash } from "./icons";
import { removeNutritionLoggedItem } from "./nutritionLog";
import type { AppState, NutritionLoggedItem } from "./types";

type Props = {
  dateKey: string;
  items: NutritionLoggedItem[];
  onRemove: (itemId: string) => void;
  onEdit: (item: NutritionLoggedItem) => void;
};

const REVEAL_WIDTH = 72;
const SWIPE_START_PX = 10;
const DELETE_THRESHOLD = REVEAL_WIDTH * 0.85;
const SNAP_OPEN_THRESHOLD = REVEAL_WIDTH * 0.35;

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
  const [revealed, setRevealed] = useState(false);
  const [pressing, setPressing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const swipingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  function clampOffset(value: number): number {
    return Math.min(0, Math.max(-REVEAL_WIDTH, value));
  }

  function applyOffset(value: number, animate: boolean) {
    const next = clampOffset(value);
    offsetRef.current = next;
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = animate
      ? "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    el.style.transform = `translate3d(${next}px, 0, 0)`;
    setRevealed(next < -4);
  }

  useEffect(() => {
    applyOffset(isOpen ? -REVEAL_WIDTH : 0, true);
  }, [isOpen]);

  function settleOffset(current: number) {
    if (current <= -DELETE_THRESHOLD) {
      onRemove(item.id);
      return;
    }
    if (current <= -SNAP_OPEN_THRESHOLD) {
      applyOffset(-REVEAL_WIDTH, true);
      onOpen(item.id);
      return;
    }
    applyOffset(0, true);
    onClose();
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipingRef.current = false;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startOffsetRef.current = isOpen ? -REVEAL_WIDTH : offsetRef.current;
    setPressing(true);
    applyOffset(startOffsetRef.current, false);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!swipingRef.current) {
      if (Math.abs(dx) < SWIPE_START_PX) return;
      if (Math.abs(dx) <= Math.abs(dy) * 1.15) return;
      swipingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    applyOffset(startOffsetRef.current + dx, false);
  }

  function finishPointer(e: PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return;
    setPressing(false);
    pointerIdRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (!swipingRef.current) {
      if (isOpen || offsetRef.current < -4) {
        applyOffset(0, true);
        onClose();
        return;
      }
      onEdit(item);
      return;
    }

    swipingRef.current = false;
    settleOffset(offsetRef.current);
  }

  function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onRemove(item.id);
  }

  const displayName = item.name.trim() || "Food";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: showDivider ? 12 : 0,
        borderBottom: showDivider ? "1px solid rgba(255,255,255,0.06)" : undefined,
        paddingBottom: showDivider ? 12 : 0,
        touchAction: "pan-y",
      }}
    >
      <button
        type="button"
        aria-label={`Delete ${displayName}`}
        onClick={handleDeleteClick}
        tabIndex={revealed ? 0 : -1}
        style={{
          position: "absolute",
          inset: "0 0 0 auto",
          width: REVEAL_WIDTH,
          display: "grid",
          placeItems: "center",
          border: "none",
          borderRadius: 12,
          background: "rgba(255, 85, 85, 0.18)",
          color: "#FF6961",
          cursor: "pointer",
          opacity: revealed ? 1 : 0,
          pointerEvents: revealed ? "auto" : "none",
          transition: "opacity 0.18s ease",
        }}
      >
        <IconTrash size={20} stroke={1.75} />
      </button>

      <div
        ref={contentRef}
        role="button"
        tabIndex={0}
        aria-label={`Edit ${displayName}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEdit(item);
          }
        }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          padding: "2px 0",
          background: "var(--card)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          cursor: "pointer",
          opacity: pressing ? 0.88 : 1,
          transition: "opacity 0.12s ease",
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
