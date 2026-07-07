import { ScreenHeader } from "../shared";
import { SundayCheckInHistoryList } from "../SundayCheckInHistorySection";
import type { ScreenProps } from "../types";

const ACCENT_GOLD = "var(--ob-gold)";

type Props = ScreenProps & {
  onBack: () => void;
};

export function ScreenSundayCheckInHistory({ state, onBack }: Props) {
  const history = state.sundayCheckInHistory ?? [];
  const count = history.length;

  return (
    <div className="screen page-transition" style={{ flex: 1, minHeight: 0 }}>
      <div className="between" style={{ alignItems: "center", marginBottom: 8, marginTop: 4 }}>
        <button
          type="button"
          className="tap"
          onClick={onBack}
          aria-label="Back to progress"
          style={{ color: ACCENT_GOLD, fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
        >
          ← Back
        </button>
      </div>

      <ScreenHeader eyebrow="PROGRESS" title="Weekly check-ins" />

      <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
        {count > 0
          ? `${count} saved recap${count === 1 ? "" : "s"} · newest first`
          : "Complete a Sunday check-in to see recaps here."}
      </p>

      {count === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-ghost)", lineHeight: 1.5 }}>
            No check-ins saved yet.
          </p>
        </div>
      ) : (
        <SundayCheckInHistoryList history={history} unitPreferences={state.unitPreferences} />
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
