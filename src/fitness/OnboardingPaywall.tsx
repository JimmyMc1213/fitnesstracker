type Props = {
  onSelectTier: (tier: "free" | "pro") => void;
};

export function OnboardingPaywall({ onSelectTier }: Props) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px 32px",
        background: "var(--bg)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px", lineHeight: 1.15 }}>
          Unlock your full coaching experience
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.55)" }}>
          Pro unlocks AI coaching, My Meals, and deeper accountability. Free still gets your plan, logging, and progress tracking.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card" style={{ padding: 18, borderColor: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Monthly</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>$9.99/mo</div>
          </div>
          <div className="card" style={{ padding: 18, borderColor: "rgba(74,222,128,0.35)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Annual</div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(74,222,128,0.15)",
                  color: "rgba(74,222,128,0.95)",
                }}
              >
                Save 33%
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>$79.99/yr</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button
          type="button"
          className="tap"
          onClick={() => onSelectTier("pro")}
          style={{
            padding: 16,
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            background: "#fff",
            color: "#000",
          }}
        >
          Start 7-day free trial
        </button>
        <button
          type="button"
          className="tap"
          onClick={() => onSelectTier("free")}
          style={{
            padding: 14,
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            border: "0.5px solid var(--border)",
            background: "transparent",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Continue with free
        </button>
      </div>
    </div>
  );
}
