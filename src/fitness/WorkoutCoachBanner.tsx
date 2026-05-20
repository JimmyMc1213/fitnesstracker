import { useState, type ReactNode } from "react";

import { IconChevD } from "./icons";

export type CoachSection = {
  id: string;
  label: string;
  content: ReactNode;
};

type WorkoutCoachBannerProps = {
  sections: CoachSection[];
  defaultOpen?: boolean;
};

const COACH_BLUE = "#0A84FF";

export function WorkoutCoachBanner({ sections, defaultOpen = false }: WorkoutCoachBannerProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (sections.length === 0) return null;

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: "0.5px solid rgba(10,132,255,0.35)",
        background: "rgba(10,132,255,0.08)",
      }}
    >
      <button
        type="button"
        className="tap"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Hide coach" : "Show coach"}
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
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: COACH_BLUE,
              boxShadow: "0 0 0 3px rgba(10,132,255,0.18)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(110,183,255,0.95)",
            }}
          >
            Coach
          </span>
        </span>
        <span
          style={{
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(110,183,255,0.9)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s ease",
          }}
        >
          <IconChevD size={16} stroke={2} />
        </span>
      </button>
      {open ? (
        <div style={{ padding: "4px 14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
          {sections.map((s, i) => (
            <div
              key={s.id}
              style={{
                paddingTop: i === 0 ? 6 : 12,
                borderTop: i === 0 ? "none" : "0.5px solid rgba(10,132,255,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {s.content}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
