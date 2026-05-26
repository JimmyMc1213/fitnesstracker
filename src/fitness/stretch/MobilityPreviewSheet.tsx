import { PrimaryButton } from "../shared";
import { STRETCH_BLOCKS, STRETCH_INTRO } from "../stretchRoutine";
import { BottomSheet, bottomSheetPanelTheme } from "../motion";
import { labelStyle, MOBILITY_ACCENT, MOBILITY_BG, MOBILITY_BORDER } from "../workoutUiTokens";

type MobilityPreviewSheetProps = {
  open?: boolean;
  doneCount?: number;
  onClose: () => void;
  onStart: () => void;
};

export function MobilityPreviewSheet({
  open = true,
  doneCount = 0,
  onClose,
  onStart,
}: MobilityPreviewSheetProps) {
  const totalMoves = STRETCH_BLOCKS.length;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={1000}
      ariaLabelledBy="mobility-preview-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        width: "100%",
        maxWidth: 440,
        maxHeight: "min(78vh, 520px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 16px 0", flexShrink: 0 }}>
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-ghost)",
              marginBottom: 4,
            }}
          >
            Recovery
          </div>
          <div
            id="mobility-preview-title"
            style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "var(--text-primary)" }}
          >
            Mobility routine
          </div>
        </div>

        <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.45, color: "var(--text-muted-soft)", fontWeight: 400 }}>
          ~15–20 min · low-back care & gentle mobility
        </p>

        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-ghost)",
            fontVariantNumeric: "tabular-nums",
            marginBottom: 12,
          }}
        >
          {totalMoves} move{totalMoves === 1 ? "" : "s"}
          {doneCount > 0 ? ` · ${doneCount}/${totalMoves} logged today` : ""}
        </div>

        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: `0.5px solid ${MOBILITY_BORDER}`,
            background: MOBILITY_BG,
          }}
        >
          <div style={{ ...labelStyle, color: MOBILITY_ACCENT, marginBottom: 6 }}>Coach note</div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.45, color: "var(--text-soft)" }}>{STRETCH_INTRO}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STRETCH_BLOCKS.map((block, i) => (
            <div
              key={block.id}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                background: "var(--surface-1)",
                border: "0.5px solid var(--border)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-ghost)",
                  fontVariantNumeric: "tabular-nums",
                  minWidth: 18,
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {block.title}
                </div>
                {block.minutes ? (
                  <div style={{ marginTop: 2, fontSize: 12, color: "var(--text-faint-soft)", fontWeight: 500 }}>{block.minutes}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px 16px", flexShrink: 0, borderTop: "0.5px solid var(--border)" }}>
        <PrimaryButton block onClick={onStart} style={{ fontWeight: 700 }}>
          Start mobility routine
        </PrimaryButton>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-ghost)",
            background: "transparent",
            border: "none",
          }}
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
}
