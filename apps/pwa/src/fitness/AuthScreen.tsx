import { useState, type ReactNode } from "react";

import { useFitnessSync } from "./FitnessSyncContext";
import { GymmySplashMark } from "./GymmySplashMark";
import { PasswordInput } from "./PasswordInput";

type View = "signup" | "signin-form";

type AuthScreenProps = {
  initialView?: "signup" | "signin-form";
  fromWelcome?: boolean;
  externalError?: string | null;
  onGetStarted?: () => void;
  onBackToWelcome?: () => void;
  onSignInSuccess?: () => void;
};

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function AuthDivider() {
  return (
    <div className="auth-screen__divider" aria-hidden>
      <span className="auth-screen__divider-line" />
      <span className="auth-screen__divider-text">or continue with</span>
      <span className="auth-screen__divider-line" />
    </div>
  );
}

function AppleSignInPlaceholder() {
  return (
    <button
      type="button"
      className="tap onboarding-oauth-btn onboarding-oauth-btn--apple"
      disabled
      aria-label="Continue with Apple, coming soon"
    >
      <AppleIcon />
      Continue with Apple
    </button>
  );
}

function AuthFormShell({
  viewKey,
  title,
  fields,
  messages,
  primaryLabel,
  primaryLoadingLabel,
  onPrimary,
  primaryDisabled,
  toggleLabel,
  toggleActionLabel,
  onToggle,
  onBack,
}: {
  viewKey: string;
  title: string;
  fields: ReactNode;
  messages?: ReactNode;
  primaryLabel: string;
  primaryLoadingLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  toggleLabel: string;
  toggleActionLabel: string;
  onToggle: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="auth-screen">
      <div key={viewKey} className="auth-screen__panel auth-screen__panel--form motion-step">
        {onBack ? (
          <button type="button" className="auth-screen__back tap" onClick={onBack}>
            Back
          </button>
        ) : null}
        <GymmySplashMark instant className="auth-screen__logo" />
        <h1 className="auth-screen__title">{title}</h1>

        <div className="auth-screen__body">
          <div className="auth-screen__form">{fields}</div>
          <AuthDivider />
          <AppleSignInPlaceholder />
          {messages}
        </div>

        <div className="auth-screen__footer">
          <button type="button" className="tap onboarding-continue" onClick={onPrimary} disabled={primaryDisabled}>
            {primaryDisabled ? primaryLoadingLabel : primaryLabel}
          </button>
          <button type="button" className="auth-screen__toggle tap" onClick={onToggle}>
            {toggleLabel} <strong>{toggleActionLabel}</strong>
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthScreen({
  initialView = "signup",
  fromWelcome = false,
  externalError = null,
  onGetStarted,
  onBackToWelcome,
  onSignInSuccess,
}: AuthScreenProps) {
  const sync = useFitnessSync();
  const [view, setView] = useState<View>(initialView);
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
    else onSignInSuccess?.();
  };

  const backToWelcome = fromWelcome ? onBackToWelcome : undefined;

  if (view === "signup") {
    return (
      <AuthFormShell
        viewKey="signup"
        title="Create your account"
        onBack={backToWelcome}
        fields={
          <>
            <input
              className="onboarding-input-pill"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-label="Name"
            />
            <input
              className="onboarding-input-pill"
              placeholder="Email"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-label="Email"
            />
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              aria-label="Password"
            />
          </>
        }
        messages={
          <>
            {error ? <p className="auth-screen__error">{error}</p> : null}
            {info ? <p className="auth-screen__info">{info}</p> : null}
          </>
        }
        primaryLabel="Create Account"
        primaryLoadingLabel="Creating…"
        onPrimary={() => void handleSignUp()}
        primaryDisabled={loading}
        toggleLabel="Already have an account?"
        toggleActionLabel="Sign in"
        onToggle={() => {
          setError(null);
          setInfo(null);
          setView("signin-form");
        }}
      />
    );
  }

  return (
    <AuthFormShell
      viewKey="signin-form"
      title="Welcome back"
      onBack={backToWelcome}
      fields={
        <>
          <input
            className="onboarding-input-pill"
            placeholder="Email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-label="Email"
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-label="Password"
          />
        </>
      }
      messages={error || externalError ? <p className="auth-screen__error">{error ?? externalError}</p> : null}
      primaryLabel="Sign In"
      primaryLoadingLabel="Signing in…"
      onPrimary={() => void handleSignIn()}
      primaryDisabled={loading}
      toggleLabel={fromWelcome ? "New to Gymmy?" : "Don't have an account?"}
      toggleActionLabel={fromWelcome ? "Get Started" : "Sign up"}
      onToggle={() => {
        if (fromWelcome) {
          onGetStarted?.();
          return;
        }
        setError(null);
        setInfo(null);
        setView("signup");
      }}
    />
  );
}
