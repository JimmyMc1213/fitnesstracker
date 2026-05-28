import type { ReactNode } from "react";

import { CenterDialog, bottomSheetPanelTheme } from "../motion";
import { IconBolt, IconBook, IconTrash } from "../icons";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 320,
  padding: "16px 12px 12px",
} as const;

type WorkoutHistorySessionActionSheetProps = {
  open?: boolean;
  sessionTitle: string;
  onStart: () => void;
  onSave: () => void;
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

export function WorkoutHistorySessionActionSheet({
  open = true,
  sessionTitle,
  onStart,
  onSave,
  onDelete,
  onClose,
}: WorkoutHistorySessionActionSheetProps) {
  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1300}
      ariaLabelledBy="history-session-action-title"
      panelStyle={panelStyle}
    >
      <div
        id="history-session-action-title"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-ghost)",
          margin: "4px 8px 8px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {sessionTitle}
      </div>
      <ActionRow
        label="Start workout"
        icon={<IconBolt size={18} stroke={1.75} />}
        onClick={() => {
          onClose();
          queueMicrotask(() => onStart());
        }}
      />
      <ActionRow
        label="Save workout"
        icon={<IconBook size={18} stroke={1.75} />}
        onClick={() => {
          onClose();
          queueMicrotask(() => onSave());
        }}
      />
      <ActionRow
        label="Delete workout"
        icon={<IconTrash size={18} stroke={1.75} />}
        destructive
        onClick={() => {
          onClose();
          queueMicrotask(() => onDelete());
        }}
      />
    </CenterDialog>
  );
}
