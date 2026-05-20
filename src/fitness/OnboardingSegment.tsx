import type { CSSProperties, ReactNode } from "react";

export function OnboardingSegment({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    flex: 1,
    padding: "12px 10px",
    borderRadius: 10,
    border: selected ? "1.5px solid #fff" : "0.5px solid var(--border)",
    background: selected ? "rgba(255,255,255,0.12)" : "#1A1A1A",
    color: "#fff",
    fontSize: 13,
    fontWeight: selected ? 700 : 500,
    cursor: "pointer",
    textAlign: "center",
    lineHeight: 1.3,
  };
  return (
    <button type="button" className="tap" style={style} onClick={onClick}>
      {children}
    </button>
  );
}
