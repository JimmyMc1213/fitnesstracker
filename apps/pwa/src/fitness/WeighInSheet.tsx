import { useEffect, useRef, useState } from "react";

import { buildCoachContext, getWeighInReaction } from "./coachEngine";
import { buildHabitsForDateKey } from "./data";
import { markWeighInHabitDone } from "./habits";
import { compressImageToJpegDataUrl } from "./imageCompress";
import { localDateKey } from "./dailyPlan";
import {
  formatWeightFromLbs,
  isValidWeighInLbs,
  parseWeightToLbs,
  weightUnitLabel,
} from "./unitPreferences";
import { CenterDialog, bottomSheetPanelTheme } from "./motion";
import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import type { AppState, UnitPreferences, WeightEntry } from "./types";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  maxHeight: "min(82vh, 560px)",
  overflowY: "auto",
  padding: 20,
} as const;

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
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setWeightDraft(
      existing ? formatWeightFromLbs(existing.weightLbs, wUnit, wUnit === "kg" ? 1 : 1) : "",
    );
    setPhotoPreview(existing?.photoDataUrl ?? null);
    setConfirmRemovePhoto(false);
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
      const habitsDoneByDay = markWeighInHabitDone(s.habitsDoneByDay, dateKey);
      const todayKey = localDateKey(new Date());
      const habits =
        dateKey === todayKey
          ? buildHabitsForDateKey(s.habitTemplates, habitsDoneByDay, dateKey, { weightLogged: true })
          : s.habits;
      return { ...s, weightLog: nextLog, habitsDoneByDay, habits };
    });
    onClose();
  }

  return (
    <>
    <CenterDialog
      open={open}
      onClose={onClose}
      zIndex={1100}
      ariaLabel="Weigh in"
      panelStyle={panelStyle}
    >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-faint-soft)",
            marginBottom: 8,
          }}
        >
          Weigh-in
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "var(--text-muted-soft)", fontWeight: 400 }}>
          Morning scale, post-bathroom, before food. Optional progress photo, same stance and lighting when you can.
        </p>
        <div className="between" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <label htmlFor="wi-weight-sheet" style={{ fontSize: 10, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>
              Weight ({weightUnitLabel(wUnit)})
            </label>
            <input
              id="wi-weight-sheet"
              type="number"
              inputMode="decimal"
              className="input"
              style={{ fontSize: 18, fontWeight: 600 }}
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
                color: "var(--text-primary)",
              }}
            >
              {photoPreview ? "Change photo" : "Add progress photo"}
            </button>
            {photoPreview ? (
              <button
                type="button"
                className="tap"
                onClick={() => setConfirmRemovePhoto(true)}
                style={{ fontSize: 11, color: "var(--text-faint-soft)", fontWeight: 500 }}
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
            background: "var(--primary)",
            color: "var(--primary-fg)",
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
            color: "var(--text-faint-soft)",
          }}
        >
          Cancel
        </button>
    </CenterDialog>
      {confirmRemovePhoto ? (
        <DeleteConfirmSheet
          title="Remove photo?"
          cancelLabel="Keep photo"
          confirmLabel="Remove photo"
          zIndex={1200}
          message="Remove the progress photo from this weigh-in?"
          onCancel={() => setConfirmRemovePhoto(false)}
          onConfirm={() => {
            setPhotoPreview(null);
            setConfirmRemovePhoto(false);
          }}
        />
      ) : null}
    </>
  );
}

/** Today’s calendar key for weigh-in (local). */
export function weighInDateKeyToday(): string {
  return localDateKey(new Date());
}
