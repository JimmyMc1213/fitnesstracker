import { useEffect, useRef } from "react";

const SPLASH_DURATION_MS = 1400;

function GymmyLogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="5" y="32" width="13" height="36" rx="6" fill="currentColor" />
      <rect x="19" y="37" width="10" height="26" rx="5" fill="currentColor" />
      <rect x="29" y="45" width="42" height="10" rx="5" fill="currentColor" />
      <rect x="71" y="37" width="10" height="26" rx="5" fill="currentColor" />
      <rect x="82" y="32" width="13" height="36" rx="6" fill="currentColor" />
    </svg>
  );
}

type AppSplashScreenProps = {
  onComplete: () => void;
};

export function AppSplashScreen({ onComplete }: AppSplashScreenProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const id = window.setTimeout(() => onCompleteRef.current(), SPLASH_DURATION_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="app-splash-screen" role="status" aria-label="Loading Gymmy">
      <div className="app-splash-screen__mark motion-splash-mark">
        <GymmyLogoMark size={34} />
        <span className="app-splash-screen__wordmark">Gymmy</span>
      </div>
    </div>
  );
}
