import { useState, type CSSProperties } from "react";

import { useFitnessSync } from "./FitnessSyncContext";

type View = "landing" | "signin" | "signup";

export function AuthScreen() {
  const sync = useFitnessSync();
  const [view, setView] = useState<View>("landing");
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
    logo: { fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 },
    sub: { fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 48 },
    card: {
      width: "100%",
      maxWidth: 380,
      background: "#1a1a1a",
      borderRadius: 20,
      padding: "28px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    title: { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 },
    input: {
      background: "#2a2a2a",
      border: "none",
      borderRadius: 12,
      padding: "14px 16px",
      fontSize: 16,
      color: "#fff",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    btn: {
      background: "#fff",
      color: "#000",
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
      color: "rgba(255,255,255,0.5)",
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
        <div style={s.logo}>Fit Coach</div>
        <div style={s.sub}>Your personal training companion</div>
        <button
          style={{ ...s.landingBtn, background: "#fff", color: "#000", border: "none" }}
          type="button"
          onClick={() => setView("signup")}
        >
          Create Account
        </button>
        <button
          style={{
            ...s.landingBtn,
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
          type="button"
          onClick={() => setView("signin")}
        >
          Sign In
        </button>
      </div>
    );

  if (view === "signup")
    return (
      <div className="auth-screen">
        <div style={s.card}>
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
              setView("signin");
            }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    );

  return (
    <div className="auth-screen">
      <div style={s.card}>
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
        {error ? <div style={s.error}>{error}</div> : null}
        <button style={s.btn} type="button" onClick={() => void handleSignIn()} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
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
      </div>
    </div>
  );
}
