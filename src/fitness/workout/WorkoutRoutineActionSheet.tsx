import type { ReactNode } from "react";

import { CenterDialog, CONFIRM_DESTRUCTIVE_COLOR, bottomSheetPanelTheme } from "../motion";
import { IconCopy, IconPencil, IconTrash } from "../icons";
import type { WorkoutRoutineTemplate } from "../types";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 320,
  padding: "16px 12px 12px",
} as const;

type WorkoutRoutineActionSheetProps = {
  open?: boolean;
  template: WorkoutRoutineTemplate;
  onEdit: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
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
        color: destructive ? CONFIRM_DESTRUCTIVE_COLOR : "var(--text-primary)",
        fontSize: 15,
        fontWeight: 600,
        textAlign: "left",
      }}
    >
      <span style={{ color: destructive ? CONFIRM_DESTRUCTIVE_COLOR : "var(--accent)", display: "grid", placeItems: "center" }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export function WorkoutRoutineActionSheet({
  open = true,
  template,
  onEdit,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
}: WorkoutRoutineActionSheetProps) {
  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1300}
      ariaLabelledBy="routine-action-title"
      panelStyle={panelStyle}
    >
      <div
        id="routine-action-title"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-ghost)",
          margin: "4px 8px 8px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {template.name}
      </div>
      <ActionRow
        label="Edit"
        icon={<IconPencil size={18} stroke={1.75} />}
        onClick={() => {
          onEdit();
          onClose();
        }}
      />
      <ActionRow
        label="Rename"
        icon={<IconPencil size={18} stroke={1.75} />}
        onClick={() => {
          onRename();
          onClose();
        }}
      />
      <ActionRow
        label="Duplicate"
        icon={<IconCopy size={18} stroke={1.75} />}
        onClick={() => {
          onDuplicate();
          onClose();
        }}
      />
      <ActionRow
        label="Delete"
        icon={<IconTrash size={18} stroke={1.75} />}
        destructive
        onClick={() => {
          onDelete();
          onClose();
        }}
      />
    </CenterDialog>
  );
}
