import { useState, type CSSProperties } from "react";

import { useFitnessSync } from "./FitnessSyncContext";

type View = "landing" | "signin" | "signin-form" | "signup";

type AuthScreenProps = {
  initialView?: "landing" | "signin" | "signup";
  /** Welcome-screen sign in: hide create-account path; offer Get Started instead. */
  fromWelcome?: boolean;
  externalError?: string | null;
  onGetStarted?: () => void;
};

export function AuthScreen({
  initialView = "landing",
  fromWelcome = false,
  externalError = null,
  onGetStarted,
}: AuthScreenProps) {
  const sync = useFitnessSync();
  const [view, setView] = useState<View>(
    fromWelcome && initialView === "signin" ? "signin-form" : initialView,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setInfo(null);
    if (!name || !email || !password) return setError("Fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    const r = await sync.signUpWithEmail(email, password, name);
    setLoading(false);
    if (r.error) setError(r.error);
    else if (r.needsConfirmation) setInfo("Check your inbox and click the confirmation link, then come back and sign in.");
  };

  const handleSignIn = async () => {
    setError(null);
    if (!email || !password) return setError("Fill in all fields.");
    setLoading(true);
    const r = await sync.signInWithPassword(email, password);
    setLoading(false);
    if (r.error) setError(r.error);
  };

  const s: Record<string, CSSProperties> = {
    logo: { fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 },
    sub: { fontSize: 14, color: "var(--text-ghost)", marginBottom: 48 },
    card: {
      width: "100%",
      maxWidth: 380,
      background: "var(--card-2)",
      borderRadius: 20,
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    title: { fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 },
    input: {
      background: "#2a2a2a",
      border: "none",
      borderRadius: 12,
      padding: "14px 16px",
      fontSize: 16,
      color: "var(--text-primary)",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    btn: {
      background: "var(--primary)",
      color: "var(--primary-fg)",
      border: "none",
      borderRadius: 12,
      padding: "15px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 4,
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted-soft)",
      border: "none",
      fontSize: 14,
      cursor: "pointer",
      padding: "8px 0",
      textAlign: "center",
    },
    error: { color: "#ff4d4d", fontSize: 13, textAlign: "center" },
    info: { color: "rgba(120,200,255,0.95)", fontSize: 13, textAlign: "center" as const, lineHeight: 1.5 },
    landingBtn: {
      width: "100%",
      maxWidth: 380,
      padding: "15px",
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      marginBottom: 12,
    },
  };

  if (view === "landing")
    return (
      <div className="auth-screen">
        <div key="landing" className="motion-step" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={s.logo}>Fit Coach</div>
        <div style={s.sub}>Your personal training companion</div>
        <button
          style={{ ...s.landingBtn, background: "var(--primary)", color: "var(--primary-fg)", border: "none" }}
          type="button"
          onClick={() => setView("signup")}
        >
          Create Account
        </button>
        <button
          style={{
            ...s.landingBtn,
            background: "transparent",
            color: "var(--text-primary)",
            border: "1px solid var(--border-strong)",
          }}
          type="button"
          onClick={() => setView("signin")}
        >
          Sign In
        </button>
        </div>
      </div>
    );

  if (view === "signin")
    return (
      <div className="auth-screen">
        <div key="signin" className="motion-step" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={s.logo}>Gymmy</div>
          <div style={s.sub}>Sign in to pick up where you left off</div>
          <button
            style={{ ...s.landingBtn, background: "var(--primary)", color: "var(--primary-fg)", border: "none" }}
            type="button"
            onClick={() => setView("signup")}
          >
            Sign in with App
          </button>
          <button
            style={{
              ...s.landingBtn,
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-strong)",
            }}
            type="button"
            onClick={() => setView("signup")}
          >
            Sign in with Gymmy
          </button>
          {externalError ? <div style={{ ...s.error, maxWidth: 380, marginTop: 4 }}>{externalError}</div> : null}
          {fromWelcome ? (
            <button style={{ ...s.ghost, marginTop: 8 }} type="button" onClick={onGetStarted}>
              New to Gymmy? <strong>Get Started</strong>
            </button>
          ) : null}
        </div>
      </div>
    );

  if (view === "signup")
    return (
      <div className="auth-screen">
        <div key="signup" className="motion-step" style={s.card}>
          <div style={s.title}>Create Account</div>
          <input
            style={s.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            style={s.input}
            placeholder="Email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            style={s.input}
            placeholder="Password"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error ? <div style={s.error}>{error}</div> : null}
          {info ? <div style={s.info}>{info}</div> : null}
          <button style={s.btn} type="button" onClick={() => void handleSignUp()} disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </button>
          <button
            style={s.ghost}
            type="button"
            onClick={() => {
              setError(null);
              setInfo(null);
              setView("signin-form");
            }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );

  return (
    <div className="auth-screen">
      <div key="signin-form" className="motion-step" style={s.card}>
        <div style={s.title}>Sign In</div>
        <input
          style={s.input}
          placeholder="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          style={s.input}
          placeholder="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error || externalError ? <div style={s.error}>{error ?? externalError}</div> : null}
        <button style={s.btn} type="button" onClick={() => void handleSignIn()} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        {fromWelcome ? (
          <button style={s.ghost} type="button" onClick={onGetStarted}>
            New to Gymmy? <strong>Get Started</strong>
          </button>
        ) : (
          <button
            style={s.ghost}
            type="button"
            onClick={() => {
              setError(null);
              setInfo(null);
              setView("signup");
            }}
          >
            Don&apos;t have an account? Create one
          </button>
        )}
        <button
          style={{ ...s.ghost, marginTop: -4 }}
          type="button"
          onClick={() => {
            setError(null);
            setView("signin");
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
