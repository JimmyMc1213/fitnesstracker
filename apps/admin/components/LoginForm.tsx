"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserSupabase, isBrowserAuthConfigured } from "../lib/supabase-browser";

type LoginFormProps = {
  authConfigured?: boolean;
  devBypass?: boolean;
  supabaseConfigured?: boolean;
};

export function LoginForm({
  authConfigured: authConfiguredProp,
  devBypass = false,
  supabaseConfigured = false,
}: LoginFormProps = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const denied = params.get("denied") === "1";
  const from = params.get("from");
  const authConfigured = authConfiguredProp ?? isBrowserAuthConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing_in" | "error">("idle");
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("signing_in");
    setMessage("");
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const redirectTo = from && from.startsWith("/") ? from : "/";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not sign in.");
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
        Sign in with your allowlisted email and password. Access is restricted to{" "}
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
      ) : (
        <form onSubmit={signIn}>
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
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: "inherit" }}
            />
          </div>
          {status === "error" && (
            <p className="down" style={{ fontSize: 12.5, fontWeight: 600, margin: "0 0 12px" }}>
              {message}
            </p>
          )}
          <button type="submit" className="btn dark" style={{ width: "100%", justifyContent: "center" }} disabled={status === "signing_in"}>
            <i className="ph ph-sign-in" />
            {status === "signing_in" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
