import { BottomSheet, bottomSheetPanelTheme } from "../motion";
import {
  SET_KIND_LABELS,
  SET_KIND_SHORT,
  WORKOUT_SET_KINDS,
  setKindStyle,
} from "../workoutSetKind";
import type { WorkoutSetKind } from "../types";

export function SetKindPickerSheet({
  open = true,
  selected,
  onSelect,
  onClose,
}: {
  open?: boolean;
  selected: WorkoutSetKind;
  onSelect: (kind: WorkoutSetKind) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1300}
      ariaLabelledBy="set-kind-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: "12px 12px 20px",
      }}
    >
      <div id="set-kind-title" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-ghost)", margin: "4px 8px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Set type
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {WORKOUT_SET_KINDS.map((kind) => {
          const active = kind === selected;
          const badge = kind === "working" ? "#" : SET_KIND_SHORT[kind];
          const badgeStyle = setKindStyle(kind === "working" ? undefined : kind);
          return (
            <button
              key={kind}
              type="button"
              className="tap"
              onClick={() => {
                onSelect(kind);
                onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                border: active ? "0.5px solid var(--border-strong)" : "0.5px solid transparent",
                background: active ? "var(--surface-selected)" : "transparent",
                color: "var(--text-primary)",
                fontSize: 15,
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  ...(kind === "working"
                    ? {
                        background: "var(--surface-2)",
                        color: "var(--text-muted-soft)",
                        border: "0.5px solid var(--border)",
                      }
                    : badgeStyle),
                }}
              >
                {badge}
              </span>
              {SET_KIND_LABELS[kind]}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
