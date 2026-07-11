"use client";

import { useEffect, useState } from "react";

const APP_SCHEME = "newyouai://auth/callback";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_ON = "#14110c";

export default function AuthCallbackPage() {
  const [target, setTarget] = useState<string | null>(null);
  const [status, setStatus] = useState("Sending you back to the app.");
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const deepLink = APP_SCHEME + search + hash;
    setTarget(deepLink);

    if (hash.includes("access_token") || hash.includes("error=") || search.includes("code=")) {
      window.location.replace(deepLink);
      const timeoutId = window.setTimeout(() => {
        setShowButton(true);
        setStatus("If New You did not open automatically, tap Open New You to continue in the app.");
      }, 1800);
      return () => window.clearTimeout(timeoutId);
    }

    setStatus("This link is only used to finish sign-in or password reset in the New You app.");
    setShowButton(true);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          Opening New You…
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.72)" }}>{status}</p>
        {showButton && target ? (
          <a
            href={target}
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "12px 20px",
              borderRadius: 999,
              background: BRAND_GOLD,
              color: BRAND_GOLD_ON,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Open New You
          </a>
        ) : null}
      </div>
    </main>
  );
}
