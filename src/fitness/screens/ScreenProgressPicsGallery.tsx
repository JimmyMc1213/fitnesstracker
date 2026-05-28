import { useMemo, useRef, useState } from "react";

import { compressImageToJpegDataUrl } from "../imageCompress";
import { localDateKey } from "../dailyPlan";
import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { IconLock, IconLockOpen, IconPlus, IconTrash } from "../icons";
import { CenterDialog, FullScreenOverlay, bottomSheetPanelTheme } from "../motion";
import {
  collectProgressPicGalleryItems,
  formatProgressPicDate,
  newProgressPicId,
  type ProgressPicGalleryItem,
} from "../progressPics";
import {
  hashProgressPicsPin,
  isValidProgressPicsPin,
  verifyProgressPicsPin,
} from "../progressPicsPin";
import { ScreenHeader } from "../shared";
import type { ScreenProps } from "../types";

type Props = ScreenProps & {
  onBack: () => void;
};

type PinSheetMode = "unlock" | "create" | "confirm-create" | "change" | "confirm-change" | "remove";

const panelStyle = {
  ...bottomSheetPanelTheme,
  width: "100%",
  maxWidth: 440,
  padding: 20,
} as const;

function PinInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: 10, color: "var(--text-ghost)", fontWeight: 500, letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        className="input"
        style={{ marginTop: 6, fontSize: 22, fontWeight: 600, letterSpacing: "0.35em", textAlign: "center" }}
        placeholder="••••"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
      {error ? (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--danger, #e5484d)", fontWeight: 500 }}>{error}</p>
      ) : null}
    </div>
  );
}

export function ScreenProgressPicsGallery({ state, setState, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [unlocked, setUnlocked] = useState(() => !state.progressPicsLock);
  const [viewerItem, setViewerItem] = useState<ProgressPicGalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgressPicGalleryItem | null>(null);
  const [pinSheet, setPinSheet] = useState<PinSheetMode | null>(null);
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirmDraft, setPinConfirmDraft] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [lockMenuOpen, setLockMenuOpen] = useState(false);

  const lockConfig = state.progressPicsLock;
  const isLocked = Boolean(lockConfig);
  const showGallery = !isLocked || unlocked;

  const items = useMemo(
    () => collectProgressPicGalleryItems(state.progressPics, state.weightLog),
    [state.progressPics, state.weightLog],
  );

  function closePinSheet() {
    setPinSheet(null);
    setPinDraft("");
    setPinConfirmDraft("");
    setPinError(null);
  }

  async function onPickPhoto(f: File) {
    try {
      const photoDataUrl = await compressImageToJpegDataUrl(f);
      const dateKey = localDateKey(new Date());
      const entry = {
        id: newProgressPicId(),
        dateKey,
        photoDataUrl,
        addedAtIso: new Date().toISOString(),
      };
      setState((s) => ({ ...s, progressPics: [...(s.progressPics ?? []), entry] }));
    } catch {
      /* ignore */
    }
  }

  function removeItem(item: ProgressPicGalleryItem) {
    setState((s) => {
      if (item.source === "gallery" && item.galleryId) {
        return { ...s, progressPics: (s.progressPics ?? []).filter((p) => p.id !== item.galleryId) };
      }
      if (item.source === "weigh-in" && item.weighInDateKey) {
        const weightLog = s.weightLog.map((e) =>
          e.dateKey === item.weighInDateKey ? { ...e, photoDataUrl: undefined } : e,
        );
        return { ...s, weightLog };
      }
      return s;
    });
    setViewerItem(null);
    setDeleteTarget(null);
  }

  function openUnlock() {
    setPinDraft("");
    setPinConfirmDraft("");
    setPinError(null);
    setPinSheet("unlock");
  }

  function handleUnlockSubmit() {
    if (!lockConfig) return;
    if (!verifyProgressPicsPin(pinDraft, lockConfig.pinHash)) {
      setPinError("Incorrect code. Try again.");
      return;
    }
    setUnlocked(true);
    closePinSheet();
  }

  function handleCreatePinSubmit() {
    if (!isValidProgressPicsPin(pinDraft)) {
      setPinError("Enter a 4-digit code.");
      return;
    }
    setPinConfirmDraft("");
    setPinError(null);
    setPinSheet("confirm-create");
  }

  function handleConfirmCreateSubmit() {
    if (pinDraft !== pinConfirmDraft) {
      setPinError("Codes don't match. Try again.");
      return;
    }
    setState((s) => ({
      ...s,
      progressPicsLock: { pinHash: hashProgressPicsPin(pinDraft) },
    }));
    setUnlocked(false);
    closePinSheet();
    setLockMenuOpen(false);
  }

  function handleChangePinSubmit() {
    if (!lockConfig) return;
    if (!verifyProgressPicsPin(pinDraft, lockConfig.pinHash)) {
      setPinError("Current code is incorrect.");
      return;
    }
    setPinDraft("");
    setPinConfirmDraft("");
    setPinError(null);
    setPinSheet("confirm-change");
  }

  function handleConfirmChangeSubmit() {
    if (!isValidProgressPicsPin(pinConfirmDraft)) {
      setPinError("Enter a 4-digit code.");
      return;
    }
    setState((s) => ({
      ...s,
      progressPicsLock: { pinHash: hashProgressPicsPin(pinConfirmDraft) },
    }));
    closePinSheet();
    setLockMenuOpen(false);
  }

  function handleRemoveLockSubmit() {
    if (!lockConfig) return;
    if (!verifyProgressPicsPin(pinDraft, lockConfig.pinHash)) {
      setPinError("Incorrect code. Try again.");
      return;
    }
    setState((s) => ({ ...s, progressPicsLock: null }));
    setUnlocked(true);
    closePinSheet();
    setLockMenuOpen(false);
  }

  const displayItems = isLocked && !unlocked ? items.slice(0, 9) : items;

  return (
    <>
      <div className="fullscreen-page__body">
        <div className="fullscreen-page__scroll">
        <div className="between" style={{ alignItems: "center", marginBottom: 4 }}>
          <button
            type="button"
            className="tap"
            onClick={onBack}
            aria-label="Back to progress"
            style={{ color: "var(--accent)", fontSize: 15, fontWeight: 600, padding: 8, marginLeft: -8 }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showGallery ? (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onPickPhoto(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="tap"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    border: "none",
                    padding: "8px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "transparent",
                  }}
                >
                  <IconPlus size={13} stroke={2.5} />
                  Add
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="tap"
              aria-label={isLocked && !unlocked ? "Unlock gallery settings" : "Gallery lock settings"}
              onClick={() => setLockMenuOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "0.5px solid var(--border)",
                color: isLocked && !unlocked ? "var(--accent)" : "var(--text-tertiary)",
                background: "transparent",
              }}
            >
              {isLocked && !unlocked ? (
                <IconLock size={16} stroke={2} />
              ) : (
                <IconLockOpen size={16} stroke={2} />
              )}
            </button>
          </div>
        </div>

        <ScreenHeader eyebrow="PROGRESS" title="Progress pics" />

        <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-faint-soft)", fontWeight: 500 }}>
          {items.length > 0
            ? `${items.length} photo${items.length === 1 ? "" : "s"} · weigh-in photos included`
            : "Add photos to track visual changes over time."}
        </p>

        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", minHeight: items.length === 0 && showGallery ? 120 : 160 }}>
          <div
            style={{
              filter: isLocked && !unlocked ? "blur(14px)" : undefined,
              transform: isLocked && !unlocked ? "scale(1.04)" : undefined,
              pointerEvents: isLocked && !unlocked ? "none" : undefined,
              userSelect: isLocked && !unlocked ? "none" : undefined,
            }}
          >
            {displayItems.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {displayItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="tap"
                    onClick={() => showGallery && setViewerItem(item)}
                    style={{
                      position: "relative",
                      aspectRatio: "3 / 4",
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "0.5px solid var(--border)",
                      padding: 0,
                      background: "var(--surface-raised, var(--card))",
                    }}
                  >
                    <img
                      src={item.photoDataUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "4px 6px",
                        fontSize: 9,
                        fontWeight: 600,
                        color: "#fff",
                        background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                        textAlign: "left",
                      }}
                    >
                      {formatProgressPicDate(item.dateKey)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: 28, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-ghost)", lineHeight: 1.5 }}>
                  {showGallery ? "No photos yet. Tap Add to upload your first progress pic." : "Your gallery is locked."}
                </p>
              </div>
            )}
          </div>

          {isLocked && !unlocked ? (
            <button
              type="button"
              className="tap"
              onClick={openUnlock}
              aria-label="Unlock progress pics"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "rgba(0,0,0,0.12)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "var(--card)",
                  border: "0.5px solid var(--border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}
              >
                Click to unlock
              </span>
            </button>
          ) : null}
        </div>

        <div style={{ height: 24 }} />
        </div>
      </div>

      <FullScreenOverlay open={viewerItem != null && showGallery} zIndex={140} motionVariant="fade">
        {viewerItem ? (
          <div
            style={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              background: "var(--bg)",
              padding: "max(12px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))",
            }}
          >
            <div className="between" style={{ alignItems: "center", marginBottom: 12 }}>
              <button
                type="button"
                className="tap"
                onClick={() => setViewerItem(null)}
                style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)", border: "none", background: "transparent", padding: 8 }}
              >
                Done
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                {formatProgressPicDate(viewerItem.dateKey)}
              </span>
              <button
                type="button"
                className="tap"
                aria-label="Delete photo"
                onClick={() => setDeleteTarget(viewerItem)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: "0.5px solid var(--border)",
                  color: "var(--text-tertiary)",
                  background: "transparent",
                }}
              >
                <IconTrash size={16} stroke={2} />
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
              <img
                src={viewerItem.photoDataUrl}
                alt=""
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }}
              />
            </div>
            {viewerItem.source === "weigh-in" ? (
              <p style={{ margin: "12px 0 0", fontSize: 11, textAlign: "center", color: "var(--text-ghost)" }}>
                From weigh-in · deleting removes the photo from that entry
              </p>
            ) : null}
            {items.length > 1 ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  marginTop: 16,
                  paddingBottom: 4,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="tap"
                    onClick={() => setViewerItem(item)}
                    style={{
                      flexShrink: 0,
                      width: 56,
                      height: 74,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: item.key === viewerItem.key ? "2px solid var(--accent)" : "0.5px solid var(--border)",
                      padding: 0,
                      opacity: item.key === viewerItem.key ? 1 : 0.7,
                    }}
                  >
                    <img src={item.photoDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </FullScreenOverlay>

      {deleteTarget ? (
        <DeleteConfirmSheet
          title="Delete photo?"
          cancelLabel="Keep photo"
          confirmLabel="Delete photo"
          zIndex={1500}
          message={
            deleteTarget.source === "weigh-in"
              ? "Remove this progress photo from your weigh-in?"
              : "Remove this photo from your gallery?"
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => removeItem(deleteTarget)}
        />
      ) : null}

      <CenterDialog
        open={lockMenuOpen}
        onClose={() => setLockMenuOpen(false)}
        zIndex={1100}
        ariaLabel="Progress pics privacy"
        panelStyle={panelStyle}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint-soft)", marginBottom: 8 }}>
          Privacy
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "var(--text-muted-soft)" }}>
          Lock hides your gallery behind a 4-digit code you choose. You can still open the gallery from Progress, but photos stay blurred until you unlock.
        </p>
        {!isLocked ? (
          <button
            type="button"
            className="tap"
            onClick={() => {
              setLockMenuOpen(false);
              setPinDraft("");
              setPinConfirmDraft("");
              setPinError(null);
              setPinSheet("create");
            }}
            style={{
              width: "100%",
              background: "var(--primary)",
              color: "var(--primary-fg)",
              borderRadius: 12,
              padding: 14,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Set 4-digit lock
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {unlocked ? (
              <button
                type="button"
                className="tap"
                onClick={() => {
                  setUnlocked(false);
                  setLockMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "0.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                Lock now
              </button>
            ) : null}
            <button
              type="button"
              className="tap"
              onClick={() => {
                setLockMenuOpen(false);
                setPinDraft("");
                setPinError(null);
                setPinSheet("change");
              }}
              style={{
                width: "100%",
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                border: "0.5px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Change code
            </button>
            <button
              type="button"
              className="tap"
              onClick={() => {
                setLockMenuOpen(false);
                setPinDraft("");
                setPinError(null);
                setPinSheet("remove");
              }}
              style={{
                width: "100%",
                padding: 14,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-faint-soft)",
                background: "transparent",
              }}
            >
              Remove lock
            </button>
          </div>
        )}
        <button
          type="button"
          className="tap"
          onClick={() => setLockMenuOpen(false)}
          style={{ marginTop: 12, width: "100%", padding: 10, fontSize: 13, fontWeight: 600, color: "var(--text-faint-soft)" }}
        >
          Cancel
        </button>
      </CenterDialog>

      <CenterDialog
        open={pinSheet != null}
        onClose={closePinSheet}
        zIndex={1150}
        ariaLabel="Progress pics code"
        panelStyle={panelStyle}
      >
        {pinSheet === "unlock" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Unlock progress pics</div>
            <PinInput id="pp-unlock" label="4-digit code" value={pinDraft} onChange={setPinDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleUnlockSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Unlock
            </button>
          </>
        ) : null}
        {pinSheet === "create" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Create your code</div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted-soft)" }}>You'll enter this to unlock your gallery.</p>
            <PinInput id="pp-create" label="4-digit code" value={pinDraft} onChange={setPinDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleCreatePinSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Continue
            </button>
          </>
        ) : null}
        {pinSheet === "confirm-create" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Confirm your code</div>
            <PinInput id="pp-confirm-create" label="Re-enter code" value={pinConfirmDraft} onChange={setPinConfirmDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleConfirmCreateSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Enable lock
            </button>
          </>
        ) : null}
        {pinSheet === "change" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Current code</div>
            <PinInput id="pp-change-old" label="4-digit code" value={pinDraft} onChange={setPinDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleChangePinSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Continue
            </button>
          </>
        ) : null}
        {pinSheet === "confirm-change" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>New code</div>
            <PinInput id="pp-change-new" label="4-digit code" value={pinConfirmDraft} onChange={setPinConfirmDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleConfirmChangeSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Save new code
            </button>
          </>
        ) : null}
        {pinSheet === "remove" ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Remove lock?</div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted-soft)" }}>Enter your code to turn off the gallery lock.</p>
            <PinInput id="pp-remove" label="4-digit code" value={pinDraft} onChange={setPinDraft} error={pinError ?? undefined} />
            <button
              type="button"
              className="tap"
              onClick={handleRemoveLockSubmit}
              style={{ marginTop: 16, width: "100%", background: "var(--primary)", color: "var(--primary-fg)", borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600 }}
            >
              Remove lock
            </button>
          </>
        ) : null}
        <button type="button" className="tap" onClick={closePinSheet} style={{ marginTop: 10, width: "100%", padding: 10, fontSize: 13, fontWeight: 600, color: "var(--text-faint-soft)" }}>
          Cancel
        </button>
      </CenterDialog>
    </>
  );
}
