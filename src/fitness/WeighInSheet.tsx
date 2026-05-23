import { useEffect, useRef, useState } from "react";

import { buildCoachContext, getWeighInReaction } from "./coachEngine";
import { compressImageToJpegDataUrl } from "./imageCompress";
import { localDateKey } from "./dailyPlan";
import {
  formatWeightFromLbs,
  isValidWeighInLbs,
  parseWeightToLbs,
  weightUnitLabel,
} from "./unitPreferences";
import { BottomSheet } from "./motion";
import type { AppState, UnitPreferences, WeightEntry } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  existing: WeightEntry | undefined;
  unitPreferences: UnitPreferences;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
};

export function WeighInSheet({ open, onClose, dateKey, existing, unitPreferences, setState }: Props) {
  const wUnit = unitPreferences.weightUnit;
  const [weightDraft, setWeightDraft] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setWeightDraft(
      existing ? formatWeightFromLbs(existing.weightLbs, wUnit, wUnit === "kg" ? 1 : 1) : "",
    );
    setPhotoPreview(existing?.photoDataUrl ?? null);
  }, [open, dateKey, existing?.weightLbs, existing?.photoDataUrl, wUnit]);

  async function onPickPhoto(f: File) {
    try {
      const url = await compressImageToJpegDataUrl(f);
      setPhotoPreview(url);
    } catch {
      /* ignore */
    }
  }

  function save() {
    const display = parseFloat(weightDraft);
    const lbs = parseWeightToLbs(display, wUnit);
    if (!isValidWeighInLbs(lbs)) return;
    const loggedAtIso = new Date().toISOString();
    setState((s) => {
      const withoutDay = s.weightLog.filter((e) => e.dateKey !== dateKey);
      const draft: WeightEntry = {
        dateKey,
        weightLbs: lbs,
        loggedAtIso,
        photoDataUrl: photoPreview ?? undefined,
      };
      const ctx = buildCoachContext({ ...s, weightLog: withoutDay }, dateKey, new Date());
      const reaction = getWeighInReaction(ctx, draft);
      const entry: WeightEntry = {
        ...draft,
        ...(reaction?.message ? { coachMessage: reaction.message } : {}),
        ...(reaction?.macroNudge?.deltaCal != null
          ? {
              macroNudge: {
                deltaCal: reaction.macroNudge.deltaCal,
                reason: reaction.macroNudge.reason,
              },
            }
          : {}),
      };
      const nextLog = [...withoutDay, entry].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      return { ...s, weightLog: nextLog };
    });
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      zIndex={190}
      ariaLabel="Weigh in"
      backdropStyle={{
        background: "rgba(0,0,0,0.78)",
        alignItems: "stretch",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: 10,
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      }}
      panelStyle={{
        padding: 18,
        borderRadius: 16,
        marginBottom: 8,
        border: "0.5px solid rgba(255,255,255,0.14)",
        background: "var(--card)",
        width: "100%",
        maxWidth: "100%",
      }}
    >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 8,
          }}
        >
          Weigh-in
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", fontWeight: 400 }}>
          Morning scale, post-bathroom, before food. Optional progress photo, same stance and lighting when you can.
        </p>
        <div className="between" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label htmlFor="wi-weight-sheet" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em" }}>
              Weight ({weightUnitLabel(wUnit)})
            </label>
            <input
              id="wi-weight-sheet"
              type="number"
              inputMode="decimal"
              className="input"
              style={{ marginTop: 6, fontSize: 18, fontWeight: 600 }}
              placeholder={wUnit === "kg" ? "78.2" : "172.4"}
              value={weightDraft}
              onChange={(e) => setWeightDraft(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && onPickPhoto(e.target.files[0])}
            />
            <button
              type="button"
              className="tap"
              onClick={() => fileRef.current?.click()}
              style={{
                border: "0.5px solid var(--border)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {photoPreview ? "Change photo" : "Add progress photo"}
            </button>
            {photoPreview ? (
              <button
                type="button"
                className="tap"
                onClick={() => setPhotoPreview(null)}
                style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
        {photoPreview ? (
          <div style={{ marginTop: 14, borderRadius: 12, overflow: "hidden", border: "0.5px solid var(--border)", maxHeight: 220 }}>
            <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ) : null}
        <button
          type="button"
          className="tap"
          onClick={save}
          style={{
            marginTop: 16,
            width: "100%",
            background: "#ffffff",
            color: "#000",
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {existing ? "Update weigh-in" : "Save weigh-in"}
        </button>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 10,
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Cancel
        </button>
    </BottomSheet>
  );
}

/** Today’s calendar key for weigh-in (local). */
export function weighInDateKeyToday(): string {
  return localDateKey(new Date());
}
