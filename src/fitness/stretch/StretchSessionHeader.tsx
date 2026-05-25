import { SessionCancelButton } from "../SessionCancelButton";
import { PrimaryButton } from "../shared";
import { METADATA_SIZE, TITLE_SIZE } from "../workoutUiTokens";

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function StretchSessionHeader({
  elapsedSec,
  onFinish,
  onCancel,
  startedAt,
  moveCount,
}: {
  elapsedSec: number;
  onFinish: () => void;
  onCancel: () => void;
  startedAt: string;
  moveCount: number;
}) {
  return (
    <div style={{ paddingTop: 8 }}>
      <div className="between" style={{ alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden>
            ⏱
          </span>
          <span
            style={{
              fontSize: TITLE_SIZE,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            {formatElapsed(elapsedSec)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <SessionCancelButton onClick={onCancel} />
          <PrimaryButton
            onClick={onFinish}
            style={{
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 700,
              minHeight: 0,
            }}
          >
            Finish routine
          </PrimaryButton>
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          marginBottom: 4,
          fontSize: TITLE_SIZE,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
        }}
      >
        Mobility routine
      </div>
      <div style={{ fontSize: METADATA_SIZE, color: "var(--text-ghost)", fontWeight: 500, marginBottom: 10 }}>
        Started {startedAt} · {moveCount} move{moveCount === 1 ? "" : "s"}
      </div>
    </div>
  );
}
