import { useState, type CSSProperties, type ReactNode } from "react";

type Variant = "default" | "blue";

const VARIANT_STYLES: Record<
  Variant,
  { border: string; background: string; label: string; toggle: string }
> = {
  default: {
    border: "var(--border)",
    background: "rgba(255,255,255,0.05)",
    label: "rgba(255,255,255,0.35)",
    toggle: "rgba(255,255,255,0.45)",
  },
  blue: {
    border: "rgba(10,132,255,0.35)",
    background: "rgba(10,132,255,0.08)",
    label: "rgba(10,132,255,0.75)",
    toggle: "rgba(10,132,255,0.9)",
  },
};

type CollapsibleTextCardProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: Variant;
  style?: CSSProperties;
};

export function CollapsibleTextCard({
  title,
  children,
  defaultOpen = false,
  variant = "default",
  style,
}: CollapsibleTextCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const accent = VARIANT_STYLES[variant];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: accent.border, background: accent.background, ...style }}>
      <button
        type="button"
        className="tap"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "12px 14px",
          border: "none",
          background: open ? "rgba(255,255,255,0.04)" : "transparent",
          color: "#fff",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accent.label,
          }}
        >
          {title}
        </span>
        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: accent.toggle }}>
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? <div style={{ padding: "0 14px 14px" }}>{children}</div> : null}
    </div>
  );
}
