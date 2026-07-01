"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { createBrowserSupabase, isBrowserAuthConfigured } from "../lib/supabase-browser";

type LoginFormProps = {
  authConfigured?: boolean;
  devBypass?: boolean;
  supabaseConfigured?: boolean;
  /** Staff dashboard origin — always admin.newyouai.app in production, not app.newyouai.app. */
  adminSiteUrl?: string;
};

export function LoginForm({
  authConfigured: authConfiguredProp,
  devBypass = false,
  supabaseConfigured = false,
  adminSiteUrl = "https://admin.newyouai.app",
}: LoginFormProps = {}) {
  const params = useSearchParams();
  const denied = params.get("denied") === "1";
  const authConfigured = authConfiguredProp ?? isBrowserAuthConfigured();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    try {
      const supabase = createBrowserSupabase();
      // Always redirect back to this origin (admin.newyouai.app in prod, :3001 locally).
      const redirectBase = window.location.origin.replace(/\/$/, "");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${redirectBase}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send the magic link.");
    }
  }

  return (
    <div className="card" style={{ width: "100%", maxWidth: 420, padding: 28 }}>
      <div className="brand" style={{ padding: "0 0 20px" }}>
        <div className="blogo">N</div>
        <div>
          <div className="bname" style={{ color: "var(--ink)" }}>
            New You AI
          </div>
          <div className="bsub" style={{ color: "var(--lab)" }}>
            Admin
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Staff sign in</h1>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 20px" }}>
        Enter your allowlisted email and we&apos;ll send a magic link. Access is restricted to{" "}
        <code className="mono">ADMIN_ALLOWED_EMAILS</code>.
      </p>

      {denied && (
        <div className="jsonbar" style={{ background: "#f8ecea", borderColor: "#e7cdc7", color: "#a8493c" }}>
          <i className="ph ph-prohibit" />
          That account isn&apos;t on the admin allowlist.
        </div>
      )}

      {devBypass ? (
        <div className="demobar">
          <i className="ph ph-info" />
          Dev mode — no allowlist set. Dashboard uses {supabaseConfigured ? "live Supabase data" : "empty states until SUPABASE_SERVICE_ROLE_KEY is set"}.
          <Link href="/" className="btn dark sm" style={{ marginLeft: "auto" }}>
            Open dashboard
          </Link>
        </div>
      ) : !authConfigured ? (
        <div className="demobar">
          <i className="ph ph-info" />
          Supabase auth env not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </div>
      ) : status === "sent" ? (
        <div className="demobar" style={{ background: "#eaf3ec", borderColor: "#cfe3d4", color: "#3c7a4e" }}>
          <i className="ph ph-paper-plane-tilt" />
          Check {email} for a sign-in link.
        </div>
      ) : (
        <form onSubmit={sendLink}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@newyouai.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: "inherit" }}
            />
          </div>
          {status === "error" && (
            <p className="down" style={{ fontSize: 12.5, fontWeight: 600, margin: "0 0 12px" }}>
              {message}
            </p>
          )}
          <button type="submit" className="btn dark" style={{ width: "100%", justifyContent: "center" }} disabled={status === "sending"}>
            <i className="ph ph-paper-plane-tilt" />
            {status === "sending" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}
    </div>
  );
}
