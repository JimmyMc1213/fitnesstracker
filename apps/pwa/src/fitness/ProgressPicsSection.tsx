import { useMemo } from "react";

import { IconChevR } from "./icons";
import { collectProgressPicGalleryItems, formatProgressPicDate } from "./progressPics";
import type { AppState } from "./types";

type Props = {
  state: AppState;
  onOpenGallery: () => void;
};

/** Tappable entry on Progress — opens the full gallery page. */
export function ProgressPicsSection({ state, onOpenGallery }: Props) {
  const isLocked = Boolean(state.progressPicsLock);
  const items = useMemo(
    () => collectProgressPicGalleryItems(state.progressPics, state.weightLog),
    [state.progressPics, state.weightLog],
  );
  const previewItems = items.slice(0, 3);

  return (
    <button
      type="button"
      className="tap card"
      onClick={onOpenGallery}
      aria-label={isLocked ? "Open locked progress pics gallery" : "Open progress pics gallery"}
      style={{
        display: "block",
        width: "100%",
        marginTop: 12,
        padding: 18,
        textAlign: "left",
        border: "0.5px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <div className="between" style={{ alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "var(--text-whisper)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Progress pics
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
          {items.length > 0 ? `${items.length} photo${items.length === 1 ? "" : "s"}` : "Open gallery"}
          <IconChevR size={14} stroke={2.2} />
        </span>
      </div>

      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", minHeight: previewItems.length > 0 ? 88 : 56 }}>
        <div
          style={{
            filter: isLocked ? "blur(14px)" : undefined,
            transform: isLocked ? "scale(1.04)" : undefined,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {previewItems.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {previewItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    aspectRatio: "3 / 4",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "0.5px solid var(--border)",
                    background: "var(--surface-raised, var(--card))",
                  }}
                >
                  <img
                    src={item.photoDataUrl}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--text-tertiary)", fontWeight: 400 }}>
              Store progress photos and compare changes over time.
            </p>
          )}
        </div>

        {isLocked ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.1)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                padding: "8px 14px",
                borderRadius: 999,
                background: "var(--card)",
                border: "0.5px solid var(--border)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
              }}
            >
              Click to unlock
            </span>
          </div>
        ) : null}
      </div>

      {!isLocked && items.length > 0 ? (
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--text-ghost)", fontWeight: 500 }}>
          Latest · {formatProgressPicDate(items[0]!.dateKey)}
        </p>
      ) : null}
    </button>
  );
}
