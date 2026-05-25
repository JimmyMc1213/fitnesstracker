import { useState } from "react";

import { IconCheck, IconChevR } from "../icons";
import type { StretchBlock } from "../stretchRoutine";
import { CARD_PADDING, METADATA_SIZE, labelStyle } from "../workoutUiTokens";

export function StretchBlockCard({
  block,
  blockIndex,
  isDone,
  onToggleDone,
}: {
  block: StretchBlock;
  blockIndex: number;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: CARD_PADDING,
        borderColor: isDone ? "rgba(196,181,253,0.35)" : "var(--border)",
        opacity: isDone ? 0.88 : 1,
      }}
    >
      <div className="between" style={{ alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ ...labelStyle, color: "var(--text-ghost)", marginBottom: 6 }}>Move {blockIndex + 1}</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: isDone ? "var(--text-muted-soft)" : "var(--text-primary)",
              textDecoration: isDone ? "line-through" : "none",
              lineHeight: 1.25,
            }}
          >
            {block.title}
          </div>
          {block.minutes ? (
            <div style={{ fontSize: METADATA_SIZE, color: "rgba(196,181,253,0.9)", marginTop: 8, fontWeight: 500 }}>
              {block.minutes}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="tap"
          aria-label={isDone ? `Mark ${block.title} incomplete` : `Mark ${block.title} complete`}
          onClick={onToggleDone}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: isDone ? "0.5px solid var(--primary)" : "0.5px solid var(--border)",
            background: isDone ? "var(--primary)" : "var(--surface-2)",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          {isDone ? <IconCheck size={16} stroke={2.8} style={{ color: "var(--primary-fg)" }} /> : null}
        </button>
      </div>

      <button
        type="button"
        className="tap"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "10px 12px",
          borderRadius: 10,
          border: "0.5px solid var(--border)",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          color: "var(--text-soft)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {expanded ? "Hide cues" : "View cues"}
        <IconChevR
          size={16}
          stroke={2}
          style={{
            color: "var(--text-whisper)",
            flexShrink: 0,
            transform: expanded ? "rotate(90deg)" : "none",
            transition: "transform .2s ease",
          }}
        />
      </button>

      {expanded ? (
        <ul
          style={{
            margin: "12px 0 0",
            paddingLeft: 18,
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--text-soft)",
            fontWeight: 400,
          }}
        >
          {block.cues.map((cue, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              {cue}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
