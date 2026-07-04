"use client";

import { useEffect, useState } from "react";

import { FutureYouPhone, PlanPhone } from "./PhoneMockups";

const DESKTOP_ACTIVE_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(66px) rotate(3.5deg) scale(1)",
  filter: "drop-shadow(0 48px 80px rgba(23, 21, 14, 0.34))",
  zIndex: 3,
};

const DESKTOP_BACK_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(-150px) rotate(-6deg) scale(0.86)",
  filter: "drop-shadow(0 26px 55px rgba(23, 21, 14, 0.24)) brightness(0.96)",
  zIndex: 1,
};

/** Tighter stack so both phones fit narrow viewports without clipping. */
const MOBILE_ACTIVE_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(14px) rotate(2.5deg) scale(0.76)",
  filter: "drop-shadow(0 24px 40px rgba(23, 21, 14, 0.28))",
  zIndex: 3,
};

const MOBILE_BACK_STYLE: React.CSSProperties = {
  transform: "translate(-50%, -50%) translateX(-48px) rotate(-5deg) scale(0.63)",
  filter: "drop-shadow(0 14px 28px rgba(23, 21, 14, 0.18)) brightness(0.96)",
  zIndex: 1,
};

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function useIsMobileHero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export function HeroPhones() {
  const isMobile = useIsMobileHero();
  const [front, setFront] = useState<"future" | "plan">("future");
  const planActive = front === "plan";

  const activeStyle = isMobile ? MOBILE_ACTIVE_STYLE : DESKTOP_ACTIVE_STYLE;
  const backStyle = isMobile ? MOBILE_BACK_STYLE : DESKTOP_BACK_STYLE;
  const toggleFront = () => setFront((current) => (current === "plan" ? "future" : "plan"));

  return (
    <div className="relative mx-auto w-full min-w-0 flex-1 basis-[320px] max-md:flex max-md:justify-center md:min-h-[600px] md:min-w-[320px] md:basis-[420px]">
      <div className="relative h-[460px] w-full max-w-[320px] md:h-[600px] md:max-w-none">
        <PlanPhone
          style={planActive ? activeStyle : backStyle}
          onClick={toggleFront}
          compactLayout={isMobile}
        />
        <FutureYouPhone
          style={planActive ? backStyle : activeStyle}
          onClick={toggleFront}
          compactLayout={isMobile}
        />
      </div>
    </div>
  );
}

export function RevealPhone() {
  return (
    <div className="relative mx-auto flex min-h-[580px] w-full max-w-[360px] flex-1 basis-[360px] items-center justify-center">
      <FutureYouPhone
        style={{
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 48px 80px rgba(0, 0, 0, 0.45))",
          zIndex: 3,
        }}
      />
    </div>
  );
}
