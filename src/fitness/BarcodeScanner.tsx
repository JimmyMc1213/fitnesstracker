import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BarcodeFormat,
  BrowserCodeReader,
  BrowserMultiFormatOneDReader as BrowserBarcodeReader,
  type IScannerControls,
} from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

import { IconX } from "./icons";

type BarcodeScannerProps = {
  onScan: (code: string) => void;
  onClose: () => void;
};

const BARCODE_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
] as const;

const SCAN_ATTEMPT_INTERVAL_MS = 300;

function createBarcodeReaderHints() {
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [...BARCODE_FORMATS]);
  return hints;
}

function stopVideoStream(video: HTMLVideoElement | null) {
  if (!video) return;
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  BrowserCodeReader.cleanVideoSource(video);
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserBarcodeReader | null>(null);
  const scannedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const [error, setError] = useState<string | null>(null);

  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    readerRef.current = null;
    stopVideoStream(videoRef.current);
    BrowserCodeReader.releaseAllStreams();
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onCloseRef.current();
  }, [stopCamera]);

  useEffect(() => {
    scannedRef.current = false;
    setError(null);

    const reader = new BrowserBarcodeReader(createBarcodeReaderHints(), {
      delayBetweenScanAttempts: SCAN_ATTEMPT_INTERVAL_MS,
    });
    readerRef.current = reader;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const onDecode: Parameters<BrowserBarcodeReader["decodeFromVideoDevice"]>[2] = (result) => {
      if (cancelled || scannedRef.current || !result) return;
      scannedRef.current = true;
      const code = result.getText();
      stopCamera();
      onScanRef.current(code);
    };

    const startScan = async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(
          null as unknown as string | undefined,
          video,
          onDecode,
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (fallbackErr) {
        if (!cancelled) {
          setError(fallbackErr instanceof Error ? fallbackErr.message : "Unable to access camera");
        }
      }
    };

    void startScan();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden", zIndex: 40 }}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.35)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={handleClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
            border: "0.5px solid var(--border)",
            display: "grid",
            placeItems: "center",
            color: "var(--text-primary)",
          }}
          aria-label="Cancel"
        >
          <IconX size={18} />
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Scan barcode</div>
        <div style={{ width: 36 }} aria-hidden />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 260,
          height: 160,
          pointerEvents: "none",
        }}
      >
        {[
          { top: 0, left: 0, lines: ["t", "l"] as const },
          { top: 0, right: 0, lines: ["t", "r"] as const },
          { bottom: 0, left: 0, lines: ["b", "l"] as const },
          { bottom: 0, right: 0, lines: ["b", "r"] as const },
        ].map((corner, i) => {
          const { lines, ...pos } = corner;
          const box: CSSProperties = { position: "absolute", width: 28, height: 28, ...pos };
          const showT = (lines as readonly string[]).includes("t");
          const showL = (lines as readonly string[]).includes("l");
          const showB = (lines as readonly string[]).includes("b");
          const showR = (lines as readonly string[]).includes("r");
          return (
            <div key={i} style={box}>
              {showT && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    [showL ? "left" : "right"]: 0,
                    width: 28,
                    height: 2,
                    background: "var(--primary)",
                  }}
                />
              )}
              {showL && (
                <div
                  style={{
                    position: "absolute",
                    [showT ? "top" : "bottom"]: 0,
                    left: 0,
                    width: 2,
                    height: 28,
                    background: "var(--primary)",
                  }}
                />
              )}
              {showB && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    [showL ? "left" : "right"]: 0,
                    width: 28,
                    height: 2,
                    background: "var(--primary)",
                  }}
                />
              )}
              {showR && (
                <div
                  style={{
                    position: "absolute",
                    [showT ? "top" : "bottom"]: 0,
                    right: 0,
                    width: 2,
                    height: 28,
                    background: "var(--primary)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: "58%", textAlign: "center", padding: "0 32px" }}>
        {error ? (
          <>
            <div style={{ fontSize: 11, color: "var(--neg)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Camera unavailable
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginTop: 8, fontWeight: 400 }}>{error}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Searching…
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted-soft)", marginTop: 8, fontWeight: 400 }}>
              Center the barcode inside the frame
            </div>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px 20px 36px",
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 50%)",
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={handleClose}
          style={{
            width: "100%",
            background: "rgba(20,20,20,0.85)",
            backdropFilter: "blur(10px)",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            padding: 14,
            color: "var(--text-primary)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
