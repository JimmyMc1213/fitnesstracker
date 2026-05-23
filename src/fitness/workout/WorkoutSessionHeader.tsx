import { IconPencil } from "../icons";
import { PrimaryButton } from "../shared";
import { COACH_BLUE, METADATA_SIZE, TITLE_SIZE } from "../workoutUiTokens";

const ACCENT_BLUE = COACH_BLUE;

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function WorkoutSessionHeader({
  elapsedSec,
  sessionEditMode,
  onToggleSessionEditMode,
  onFinishWorkout,
  sessionTitle,
  onSessionTitleChange,
  startedAt,
  splitDay,
  exerciseCount,
}: {
  elapsedSec: number;
  sessionEditMode: boolean;
  onToggleSessionEditMode: () => void;
  onFinishWorkout: () => void;
  sessionTitle: string;
  onSessionTitleChange: (text: string) => void;
  startedAt: string;
  splitDay?: string;
  exerciseCount: number;
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
          <button
            type="button"
            className="tap"
            aria-pressed={sessionEditMode}
            aria-label="Remove exercises from workout"
            title="Remove exercises from workout"
            onClick={onToggleSessionEditMode}
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              padding: 0,
              borderRadius: 10,
              border: sessionEditMode ? `0.5px solid ${ACCENT_BLUE}` : "0.5px solid var(--border)",
              background: sessionEditMode ? "rgba(10,132,255,0.12)" : "transparent",
              color: sessionEditMode ? ACCENT_BLUE : "rgba(255,255,255,0.5)",
            }}
          >
            <IconPencil size={18} stroke={1.75} />
          </button>
          <PrimaryButton onClick={onFinishWorkout} style={{ borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, minHeight: 0 }}>
            Finish workout
          </PrimaryButton>
        </div>
      </div>

      <input
        value={sessionTitle}
        onChange={(e) => onSessionTitleChange(e.target.value)}
        placeholder="Workout name"
        style={{
          marginTop: 6,
          marginBottom: 4,
          width: "100%",
          fontSize: TITLE_SIZE,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          background: "transparent",
          border: "none",
          padding: "6px 0",
          color: "#fff",
          outline: "none",
          fontFamily: "var(--ui)",
        }}
      />
      <div style={{ fontSize: METADATA_SIZE, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginBottom: 10 }}>
        Started {startedAt}
        {splitDay ? ` · ${splitDay}` : ""} · {exerciseCount} exercise{exerciseCount === 1 ? "" : "s"}
      </div>
    </div>
  );
}
