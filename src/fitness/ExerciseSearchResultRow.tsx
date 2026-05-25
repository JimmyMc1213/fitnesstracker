const resultButtonStyle = {
  padding: "12px 8px",
  textAlign: "left" as const,
  borderBottom: "0.5px solid var(--border)",
  fontSize: 13,
  fontWeight: 500,
  display: "flex" as const,
  alignItems: "center" as const,
  gap: 10,
  width: "100%",
  background: "transparent",
  color: "var(--text-primary)",
};

export function ExerciseResultRow({ name, label, onPick }: { name: string; label?: string; onPick: () => void }) {
  return (
    <button type="button" className="tap" onClick={onPick} style={resultButtonStyle}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        {label ? (
          <span style={{ display: "block", fontSize: 11, color: "var(--text-ghost)", marginTop: 3, fontWeight: 500 }}>
            {label}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export const exerciseSearchSectionHeaderStyle = {
  position: "sticky" as const,
  top: 0,
  zIndex: 1,
  background: "var(--card)",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--text-ghost)",
  padding: "8px 8px 6px",
};

export const exerciseSearchListStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto" as const,
  WebkitOverflowScrolling: "touch" as const,
  display: "flex",
  flexDirection: "column" as const,
};
