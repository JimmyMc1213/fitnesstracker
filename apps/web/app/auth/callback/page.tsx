"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const APP_SCHEME = "newyouai://auth/callback";
const BRAND_GOLD = "#c9a876";
const BRAND_GOLD_ON = "#14110c";

type CallbackState =
  | { kind: "loading" }
  | { kind: "error"; title: string; message: string }
  | { kind: "bridge"; target: string; status: string; showButton: boolean };

function readHashParams(hash: string): Record<string, string> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return {};
  return Object.fromEntries(new URLSearchParams(raw).entries());
}

function mapAuthCallbackError(params: Record<string, string>): { title: string; message: string } | null {
  const code = params.error_code ?? params.error ?? "";
  const description = params.error_description?.replace(/\+/g, " ");

  if (code === "otp_expired" || description?.toLowerCase().includes("expired")) {
    return {
      title: "This reset link expired",
      message: "Request a new password reset from the New You app sign-in screen and use the latest email.",
    };
  }

  if (params.error === "access_denied" || code === "access_denied") {
    return {
      title: "Sign-in link unavailable",
      message: description ?? "This link is no longer valid. Try again from the New You app.",
    };
  }

  if (params.error) {
    return {
      title: "Could not finish sign-in",
      message: description ?? "This link is no longer valid. Try again from the New You app.",
    };
  }

  return null;
}

export default function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>({ kind: "loading" });

  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const hashParams = readHashParams(hash);
    const authError = mapAuthCallbackError(hashParams);

    if (authError) {
      setState({ kind: "error", ...authError });
      return;
    }

    const deepLink = APP_SCHEME + search + hash;
    const hasSession =
      hash.includes("access_token") || hash.includes("refresh_token") || search.includes("code=");

    if (hasSession) {
      window.location.replace(deepLink);
      const timeoutId = window.setTimeout(() => {
        setState({
          kind: "bridge",
          target: deepLink,
          status: "If New You did not open automatically, tap Open New You to continue in the app.",
          showButton: true,
        });
      }, 1800);
      return () => window.clearTimeout(timeoutId);
    }

    setState({
      kind: "bridge",
      target: deepLink,
      status: "This link is only used to finish sign-in or password reset in the New You app.",
      showButton: true,
    });
  }, []);

  const shell = (content: React.ReactNode) => (
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
      <div style={{ maxWidth: 420 }}>{content}</div>
    </main>
  );

  if (state.kind === "loading") {
    return shell(
      <>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          Opening New You…
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.72)" }}>
          Sending you back to the app.
        </p>
      </>,
    );
  }

  if (state.kind === "error") {
    return shell(
      <>
        <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          {state.title}
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.72)" }}>{state.message}</p>
        <Link
          href="/"
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
          Back to newyouai.app
        </Link>
      </>,
    );
  }

  return shell(
    <>
      <h1 style={{ margin: "0 0 12px", fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
        Opening New You…
      </h1>
      <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.72)" }}>{state.status}</p>
      {state.showButton ? (
        <a
          href={state.target}
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
    </>,
  );
}
