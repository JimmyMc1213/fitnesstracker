import type { ReactNode } from "react";

import { BottomSheet, bottomSheetPanelTheme } from "../motion";
import { IconClock, IconPencil, IconTrash } from "../icons";

type ExerciseActionSheetProps = {
  open?: boolean;
  exerciseName: string;
  onEditNote: () => void;
  onEditRest: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onClose: () => void;
};

function ActionRow({
  label,
  icon,
  destructive,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 14px",
        borderRadius: 12,
        border: "none",
        background: "transparent",
        color: destructive ? "var(--workout-danger-fg)" : "var(--text-primary)",
        fontSize: 15,
        fontWeight: 600,
        textAlign: "left",
      }}
    >
      <span style={{ color: destructive ? "var(--workout-danger-fg)" : "var(--accent)", display: "grid", placeItems: "center" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export function ExerciseActionSheet({
  open = true,
  exerciseName,
  onEditNote,
  onEditRest,
  onReplace,
  onRemove,
  onClose,
}: ExerciseActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1300}
      ariaLabelledBy="exercise-action-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        padding: "12px 12px 20px",
      }}
    >
      <div
        id="exercise-action-title"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-ghost)",
          margin: "4px 8px 8px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {exerciseName}
      </div>
      <ActionRow label="Add note" icon={<IconPencil size={18} stroke={1.75} />} onClick={() => { onEditNote(); onClose(); }} />
      <ActionRow label="Rest timer" icon={<IconClock size={18} stroke={1.75} />} onClick={() => { onEditRest(); onClose(); }} />
      <ActionRow label="Replace exercise" icon={<IconPencil size={18} stroke={1.75} />} onClick={() => { onReplace(); onClose(); }} />
      <ActionRow
        label="Remove exercise"
        icon={<IconTrash size={18} stroke={1.75} />}
        destructive
        onClick={() => {
          onRemove();
          onClose();
        }}
      />
    </BottomSheet>
  );
}
