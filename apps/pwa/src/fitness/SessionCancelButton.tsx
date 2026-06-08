export function SessionCancelButton({ onClick, label = "Cancel" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      className="tap"
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "0.5px solid var(--workout-danger-border)",
        background: "var(--workout-danger-bg)",
        color: "var(--workout-danger-fg)",
        fontSize: 13,
        fontWeight: 600,
        minHeight: 0,
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
