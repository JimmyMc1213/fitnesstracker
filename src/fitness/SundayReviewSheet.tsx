import { useEffect, useState } from "react";

import { refreshDailyTasksForTargets } from "./nutritionPipeline";
import {
  MIN_WEIGH_INS_PER_WEEK,
  commitSundayReviewApproval,
  commitSundayReviewSkip,
  previewTargetsAfterCalorieDelta,
  type SundayReviewPreview,
} from "./weeklyAdjustment";
import type { AppState, MacroTotals } from "./types";

type Props = {
  preview: SundayReviewPreview;
  nutritionTargets: MacroTotals;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  /** When set (e.g. dev preview Sunday), used for commit timestamps so Skip/Approve work off-Sunday. */
  reviewClock?: Date;
};

export function SundayReviewSheet({ preview, nutritionTargets, setState, reviewClock }: Props) {
  const commitAt = reviewClock ?? new Date();
  const [customDelta, setCustomDelta] = useState(String(preview.recommendedTotalDelta));

  useEffect(() => {
    setCustomDelta(String(preview.recommendedTotalDelta));
  }, [preview.thisSundayKey, preview.recommendedTotalDelta]);

  const parsed = parseFloat(customDelta);
  const deltaNum = Number.isFinite(parsed) ? Math.round(parsed) : 0;
  const projected = previewTargetsAfterCalorieDelta(nutritionTargets, deltaNum);

  function skip() {
    setState((s) => commitSundayReviewSkip(s, commitAt));
  }

  function approve() {
    if (!preview.ready) return;
    setState((s) => refreshDailyTasksForTargets(commitSundayReviewApproval(s, commitAt, deltaNum, preview)));
  }

  function rowList(rows: SundayReviewPreview["currDays"]) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => (
          <div key={r.dateKey} className="between" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>
            <span style={{ color: "rgba(255,255,255,0.45)" }}>{r.label}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.weightLbs != null ? `${r.weightLbs.toFixed(1)} lbs` : "—"}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 10,
      }}
    >
      <div
        className="card"
        style={{
          maxHeight: "88%",
          overflowY: "auto",
          padding: 18,
          borderRadius: 16,
          marginBottom: 8,
          border: "0.5px solid rgba(255,255,255,0.14)",
          background: "var(--card)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
          Sunday fuel review
        </div>
        <h2 style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Week ending {preview.thisSundayKey}</h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Each Sunday we compare your <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>average weight</strong> from this
          Mon–Sun week to the prior week. Approve a calorie change (carbs follow) or skip — nothing updates until you approve.
        </p>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.55)" }}>Previous week ({preview.prevRange.mon} → {preview.prevRange.sun})</div>
        {rowList(preview.prevDays)}
        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
          {preview.distinctPrev}/{MIN_WEIGH_INS_PER_WEEK} days · avg{" "}
          {preview.avgPrev != null ? `${preview.avgPrev.toFixed(2)} lbs` : "—"}
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, margin: "20px 0 8px", color: "rgba(255,255,255,0.55)" }}>This week ({preview.currRange.mon} → {preview.currRange.sun})</div>
        {rowList(preview.currDays)}
        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>
          {preview.distinctCurr}/{MIN_WEIGH_INS_PER_WEEK} days · avg{" "}
          {preview.avgCurr != null ? `${preview.avgCurr.toFixed(2)} lbs` : "—"}
        </div>

        {preview.ready && preview.weeklyLoss !== null ? (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "0.5px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>Average change (prev − this)</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {preview.weeklyLoss.toFixed(2)} lb/wk
            </div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              Recommended:{" "}
              <strong style={{ color: "#fff" }}>
                {preview.recommendedTotalDelta >= 0 ? "+" : ""}
                {preview.recommendedTotalDelta} kcal/day
              </strong>{" "}
              (~{preview.recommendedTotalDelta >= 0 ? "+" : ""}
              {Math.round(preview.recommendedTotalDelta / 4)}g carbs), protein & fat unchanged.
            </div>
            <label style={{ display: "block", marginTop: 14 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Adjust kcal change (then approve)</span>
              <input
                type="number"
                className="input"
                style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}
                value={customDelta}
                onChange={(e) => setCustomDelta(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="tap"
              onClick={() => setCustomDelta(String(preview.recommendedTotalDelta))}
              style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}
            >
              Reset to recommended
            </button>
            <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>
              After: {nutritionTargets.cal} → {projected.cal} kcal · {nutritionTargets.c}g → {projected.c}g carbs
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "rgba(255,100,100,0.08)", border: "0.5px solid rgba(255,100,100,0.2)" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
              Need <strong style={{ color: "#fff" }}>{MIN_WEIGH_INS_PER_WEEK} different days</strong> with weigh-ins in{" "}
              <strong style={{ color: "#fff" }}>both</strong> weeks to recommend a change. Close this and try again when logs are complete, or dismiss for today.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {preview.ready ? (
            <button
              type="button"
              className="tap"
              onClick={approve}
              style={{
                width: "100%",
                background: "#fff",
                color: "#000",
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Approve {deltaNum >= 0 ? "+" : ""}
              {deltaNum} kcal/day
            </button>
          ) : null}
          <button
            type="button"
            className="tap"
            onClick={skip}
            style={{
              width: "100%",
              border: "0.5px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              background: "transparent",
            }}
          >
            {preview.ready ? "Not now — skip (no change)" : "Dismiss for this Sunday"}
          </button>
        </div>
      </div>
    </div>
  );
}
