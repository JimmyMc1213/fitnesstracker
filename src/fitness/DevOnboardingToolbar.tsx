import { useState } from "react";

import {
  isDevPreviewOnboardingStored,
  isOnboardingPreviewToolsActive,
  setDevPreviewOnboardingStored,
} from "./devPreviewOnboarding";

export function DevOnboardingToolbar({
  onboardingOpen,
  onOpenOnboarding,
  onCloseOnboarding,
}: {
  onboardingOpen: boolean;
  onOpenOnboarding: () => void;
  onCloseOnboarding: () => void;
}) {
  const [persistOnReload, setPersistOnReload] = useState(isDevPreviewOnboardingStored);

  if (!isOnboardingPreviewToolsActive()) return null;

  function togglePersist() {
    const next = !persistOnReload;
    setPersistOnReload(next);
    setDevPreviewOnboardingStored(next);
  }

  return (
    <div
      aria-label="Developer onboarding tools"
      style={{
        position: "fixed",
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <label
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "rgba(18, 18, 22, 0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.72)",
          fontSize: 11,
          lineHeight: 1,
          boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
        }}
      >
        <input type="checkbox" checked={persistOnReload} onChange={togglePersist} />
        Open on reload
      </label>

      <button
        type="button"
        onClick={onboardingOpen ? onCloseOnboarding : onOpenOnboarding}
        style={{
          pointerEvents: "auto",
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.16)",
          background: onboardingOpen ? "rgba(255, 92, 92, 0.18)" : "rgba(56, 189, 248, 0.18)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
          cursor: "pointer",
        }}
      >
        {onboardingOpen ? "Leave onboarding" : "Open onboarding"}
      </button>
    </div>
  );
}
